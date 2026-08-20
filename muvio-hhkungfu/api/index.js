const cheerio = require("cheerio");

const BASE = "https://hhkungfu.ee";
const UA = "Mozilla/5.0 (Android 14) AppleWebKit/537.36 Chrome/124 Safari/537.36";
const TTL = 60 * 1000;
const cache = new Map();
const MANIFEST = require("../manifest.json");

function cleanTitle(s = "") {
  return s.replace(/\s+/g, " ")
    .replace(/^FULL HD\s*4K?\s*/i, "")
    .replace(/^Trailer\s*/i, "")
    .trim();
}

function absUrl(raw, base = BASE) {
  if (!raw) return null;
  let s = String(raw).trim().replace(/^["']|["']$/g, "").replace(/&amp;/g, "&");
  if (!s || /^(javascript|data|mailto|tel):/i.test(s)) return null;
  try { return new URL(s, base).href; } catch { return null; }
}

function b64e(s) { return Buffer.from(s, "utf8").toString("base64url"); }
function b64d(s) { return Buffer.from(s, "base64url").toString("utf8"); }
function idFor(kind, url) { return `hhk:${kind}:${b64e(url)}`; }
function decodeId(id) {
  const m = /^hhk:(m|e):(.+)$/.exec(id || "");
  if (!m) return null;
  try { return {kind: m[1], url: b64d(m[2])}; } catch { return null; }
}

async function getHtml(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.time < TTL) return hit.html;
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Referer": BASE + "/"
    },
    redirect: "follow"
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  const html = await r.text();
  cache.set(url, {time: Date.now(), html});
  return html;
}

function cardList(html) {
  const $ = cheerio.load(html);
  const seen = new Set(), out = [];
  $("a[href]").each((_, a) => {
    const href = absUrl($(a).attr("href"));
    if (!href || !href.startsWith(BASE) || href === BASE + "/") return;
    if (/\/(watch-|category\/|tag\/|author\/|page\/|feed|contact|lich-chieu)/i.test(href)) return;
    const img = $(a).find("img").first();
    const poster = absUrl(img.attr("data-src") || img.attr("data-lazy-src") || img.attr("src"), href);
    const title = cleanTitle($(a).text());
    const key = href.split("#")[0].replace(/\/$/, "");
    if (!poster || title.length < 2 || title.length > 180 || seen.has(key)) return;
    seen.add(key);
    out.push({id: idFor("m", key), type: "series", name: title, poster, posterShape: "poster"});
  });
  return out.slice(0, 100);
}

async function catalog(cat, search) {
  let url = BASE + "/";
  if (search) url = BASE + "/?s=" + encodeURIComponent(search);
  else if (cat && cat !== "latest")
    url = cat === "hoan-thanh" ? BASE + "/hoan-thanh" : BASE + "/category/" + encodeURIComponent(cat);
  return cardList(await getHtml(url));
}

function episodeInfo(label, href) {
  const text = String(label || "").replace(/\s+/g, " ").trim();
  const n = /(?:Tập|Tap)\s*([0-9]+)/i.exec(text) || /tap-([0-9]+)/i.exec(href);
  if (!n) return null;
  const ep = Number(n[1]);
  return Number.isFinite(ep) ? {ep, dubbed: /thuyết minh/i.test(text)} : null;
}

async function metaFor(id) {
  const decoded = decodeId(id);
  if (!decoded) return null;
  const url = decoded.url, html = await getHtml(url), $ = cheerio.load(html);
  const name = cleanTitle($("h1").first().text().trim() || $('meta[property="og:title"]').attr("content") || "HHKUNGFU");
  const poster = absUrl($('meta[property="og:image"]').attr("content"), url);
  const description = $(".description, .desc, .content-description, .film-description, [class*='description'], [class*='synopsis']")
    .first().text().replace(/\s+/g, " ").trim() || undefined;
  const genres = $("a[href*='/category/'], a[href*='/the-loai/']").map((_,e)=>$(e).text().trim()).get().filter(Boolean);

  const eps = [], seen = new Set();
  $("a[href*='/watch-']").each((_, a) => {
    const href = absUrl($(a).attr("href"), url);
    const info = href && episodeInfo($(a).text(), href);
    if (!info || seen.has(href)) return;
    seen.add(href);
    eps.push({id:idFor("e", href), title:`Tập ${info.ep}${info.dubbed ? " [Thuyết minh]" : " [Vietsub]"}`, season:1, episode:info.ep});
  });
  eps.sort((a,b)=>a.episode-b.episode);

  if (eps.length) return {meta:{id,type:"series",name,poster,background:poster,description,genres,videos:eps}};
  return {meta:{id,type:"movie",name,poster,background:poster,description,genres,videos:[{id,title:name,season:1,episode:1}]}};
}

function collectCandidates(html, pageUrl) {
  const $ = cheerio.load(html), urls = new Set(), add = raw => {
    const u = absUrl(raw, pageUrl); if (u) urls.add(u);
  };
  $("video[src], video source[src], source[src]").each((_,e)=>add($(e).attr("src")));
  $("iframe[src], [data-video], [data-src], [data-url], [data-embed]").each((_,e)=>{
    add($(e).attr("src") || $(e).attr("data-video") || $(e).attr("data-src") || $(e).attr("data-url") || $(e).attr("data-embed"));
  });
  $("a[href],button,[onclick]").each((_,e)=>{
    const text = ($(e).text() || "") + " " + Object.values(e.attribs || {}).join(" ");
    if (!/(1080P|2160P|4K|V1|V2|server|source)/i.test(text)) return;
    add($(e).attr("href")); add($(e).attr("data-url")); add($(e).attr("data-video")); add($(e).attr("data-src"));
    for (const m of (( $(e).attr("onclick") || "").matchAll(/https?:\/\/[^\s"'()<>]+/gi))) add(m[0]);
  });
  $("script:not([src])").each((_,e)=>{
    for (const m of (( $(e).html() || "").matchAll(/https?:\/\/[^\s"'<>]+/gi))) {
      const u = m[0].replace(/[),;]+$/,"");
      if (/\.(m3u8|mp4|webm|mkv)(\?|$)/i.test(u) || /(?:embed|player|stream)/i.test(u)) add(u);
    }
  });
  return [...urls];
}

function isDirect(u) { return /\.(m3u8|mp4|webm|mkv)(\?|$)/i.test(u); }

async function streamFor(id) {
  const decoded = decodeId(id);
  if (!decoded) return {streams:[]};
  const pageUrl = decoded.url, html = await getHtml(pageUrl);
  let candidates = collectCandidates(html, pageUrl), streams = [], seen = new Set();

  for (const u of [...candidates]) {
    if (streams.length >= 12) break;
    if (!isDirect(u)) {
      try {
        const child = await getHtml(u);
        for (const x of collectCandidates(child, u)) candidates.push(x);
      } catch {}
    }
  }

  for (const u of candidates) {
    if (!isDirect(u) || seen.has(u)) continue;
    seen.add(u);
    const quality = /2160|4k/i.test(u) ? "4K" : /1440/i.test(u) ? "1440p" :
      /1080/i.test(u) ? "1080p" : /720/i.test(u) ? "720p" : /480/i.test(u) ? "480p" : "Auto";
    streams.push({name:`HHKUNGFU ${quality}`, title:`Nguồn HHKUNGFU • ${quality}`, url:u, behaviorHints:{notWebReady:false}});
  }

  if (!streams.length) {
    const fallback = candidates.find(u=>/^https?:/i.test(u));
    if (fallback) streams.push({name:"HHKUNGFU", title:"Mở nguồn ngoài", externalUrl:fallback, behaviorHints:{notWebReady:false}});
  }
  return {streams};
}

function send(res, obj, status=200) {
  res.statusCode=status;
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Cache-Control","public, max-age=60");
  res.end(JSON.stringify(obj));
}

module.exports = async (req,res) => {
  try {
    const path=(req.url||"/").split("?")[0];
    if (path==="/" || path==="/manifest.json") return send(res,MANIFEST);

    const c=/^\/catalog\/(movie|series)\/([^/]+)(?:\/([^/]+))?\.json$/i.exec(path);
    if (c) {
      const cat=decodeURIComponent(c[2]), extra=c[3] ? decodeURIComponent(c[3]) : "";
      const search=extra.startsWith("search=") ? decodeURIComponent(extra.slice(7)) : "";
      return send(res,{metas:await catalog(cat,search)});
    }

    const m=/^\/meta\/(movie|series)\/(.+)\.json$/i.exec(path);
    if (m) return send(res,(await metaFor(decodeURIComponent(m[2]))) || {meta:null});

    const s=/^\/stream\/(movie|series)\/(.+)\.json$/i.exec(path);
    if (s) return send(res,await streamFor(decodeURIComponent(s[2])));

    return send(res,{error:"Not found"},404);
  } catch(e) {
    console.error(e);
    return send(res,{error:String(e.message||e)},500);
  }
};
