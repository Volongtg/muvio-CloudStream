package com.lagradost.cloudstream3.utils

import com.lagradost.cloudstream3.SubtitleFile

class ExtractorLink(
    val source: String,
    val name: String,
    val url: String,
    val referer: String,
    val quality: Int,
    val isM3u8: Boolean = false
)

enum class QualityValue(val value: Int) { Unknown(0), P480(480), P720(720), P1080(1080), P1440(1440), P2160(2160) }

object Qualities {
    val Unknown = QualityValue.Unknown
    val P480 = QualityValue.P480
    val P720 = QualityValue.P720
    val P1080 = QualityValue.P1080
    val P1440 = QualityValue.P1440
    val P2160 = QualityValue.P2160
}

fun loadExtractor(
    url: String,
    referer: String,
    subtitleCallback: (SubtitleFile) -> Unit,
    callback: (ExtractorLink) -> Unit
) {}
