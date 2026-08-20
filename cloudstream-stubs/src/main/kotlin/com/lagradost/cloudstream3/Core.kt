package com.lagradost.cloudstream3

import android.content.Context
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import com.lagradost.cloudstream3.utils.ExtractorLink

open class Plugin {
    open fun load(context: Context) {}
    protected fun registerMainAPI(api: MainAPI) {}
}

open class MainAPI {
    open var mainUrl: String = ""
    open var name: String = ""
    open var lang: String = ""
    open val hasMainPage: Boolean = false
    open val hasChromecastSupport: Boolean = false
    open val supportedTypes: Set<TvType> = emptySet()

    protected val app: CloudStreamHttpClient = CloudStreamHttpClient()

    open suspend fun getMainPage(page: Int, request: MainPageRequest): HomePageResponse =
        HomePageResponse(request.name, emptyList(), false)

    open suspend fun search(query: String): List<SearchResponse> = emptyList()
    open suspend fun load(url: String): LoadResponse? = null

    open suspend fun loadLinks(
        data: String,
        isCasting: Boolean,
        subtitleCallback: (SubtitleFile) -> Unit,
        callback: (ExtractorLink) -> Unit
    ): Boolean = false

    fun fixUrl(url: String): String {
        if (url.startsWith("//")) return "https:$url"
        if (url.startsWith("http://") || url.startsWith("https://")) return url
        if (url.startsWith("/")) return mainUrl.trimEnd('/') + url
        return mainUrl.trimEnd('/') + "/" + url
    }

    fun fixUrlNull(url: String): String? =
        url.takeIf { it.isNotBlank() }?.let { fixUrl(it) }

    fun newHomePageResponse(name: String, results: List<SearchResponse>, hasNext: Boolean) =
        HomePageResponse(name, results, hasNext)

    fun newAnimeSearchResponse(title: String, url: String, type: TvType, init: SearchResponse.() -> Unit = {}): SearchResponse =
        SearchResponse(title, url, type).apply(init)

    fun newMovieLoadResponse(title: String, url: String, type: TvType, data: String, init: MovieLoadResponse.() -> Unit = {}): MovieLoadResponse =
        MovieLoadResponse(title, url, type, data).apply(init)

    fun newAnimeLoadResponse(title: String, url: String, type: TvType, init: AnimeLoadResponse.() -> Unit = {}): AnimeLoadResponse =
        AnimeLoadResponse(title, url, type).apply(init)

    fun emitSubtitle(file: SubtitleFile) {}
}

class CloudStreamHttpClient {
    suspend fun get(url: String): HttpResponse {
        val doc: Document = Jsoup.connect(url).get()
        return HttpResponse(doc)
    }
}

class HttpResponse(val document: Document)

enum class TvType { Anime, AnimeMovie, TvSeries, Movie }

enum class DubStatus { Subbed, Dubbed }

data class MainPageRequest(val name: String = "", val data: String = "")

class HomePageResponse(
    val name: String,
    val results: List<SearchResponse>,
    val hasNext: Boolean
)

open class SearchResponse(
    var name: String,
    var url: String,
    var type: TvType
) {
    var posterUrl: String? = null
}

open class LoadResponse(
    var name: String,
    var url: String,
    var type: TvType
)

class MovieLoadResponse(
    name: String,
    url: String,
    type: TvType,
    val data: String
) : LoadResponse(name, url, type) {
    var posterUrl: String? = null
    var plot: String? = null
    var tags: List<String>? = null
}

class AnimeLoadResponse(
    name: String,
    url: String,
    type: TvType
) : LoadResponse(name, url, type) {
    var posterUrl: String? = null
    var plot: String? = null
    var tags: List<String>? = null
    private val episodes = mutableListOf<Episode>()
    fun addEpisodes(status: DubStatus, list: List<Episode>) { episodes += list }
}

class Episode(val data: String) {
    var name: String = ""
    var episode: Int? = null
    var season: Int? = null
    companion object {
        operator fun invoke(data: String, init: Episode.() -> Unit): Episode =
            Episode(data).apply(init)
    }
}

class SubtitleFile
