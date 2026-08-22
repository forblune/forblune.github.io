import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { md } from "./md.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://forblune.github.io";
const BUILT = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

// 한 항목이 한 페이지다. alt 는 같은 내용의 반대 언어판 —
// hreflang 과 상단 언어 전환이 같은 값에서 나오므로 한쪽만 고쳐도 어긋나지 않는다.
const PAGES = {
  "index.md": {
    out: "index.html", path: "/", lang: "ko", alt: "/en/index.html",
    title: "김건희 · Geonhee Kim — 웹을 만들고 조용히 망가진 곳을 찾습니다",
    desc: "만든 것이 지금 열리는지, 그리고 무엇이 아닌지까지 같은 표에 적어 둡니다. 운영 중인 사이트 8곳과 실측 근거로 정리한 문제 7건.",
  },
  "resume.md": {
    out: "resume.html", path: "/resume.html", lang: "ko", alt: "/en/resume.html", print: true,
    title: "이력서 — 김건희 · Geonhee Kim",
    desc: "반응형 웹과 소규모 운영 도구. 운영 중인 사이트 8곳과 실측 근거로 정리한 문제 해결 사례.",
  },
  "checks.md": {
    out: "checks.html", path: "/checks.html", lang: "ko", alt: "/en/checks.html",
    title: "판별 절차 — 김건희 · Geonhee Kim",
    desc: "400과 405로 경계 만들기, 해시로 정본 판정하기, 어절 쪼개짐 측정하기. 각 절차가 확정한 것과 못 잡는 것까지.",
  },
  "problems.md": {
    out: "problems.html", path: "/problems.html", lang: "ko", alt: "/en/problems.html",
    title: "해결하는 문제 7건 — 김건희 · Geonhee Kim",
    desc: "운영 중인 사이트에서 나온 7건. 숫자는 전부 직접 측정한 값이고, 그중 2건은 제가 낸 사고입니다.",
  },
  "en/index.md": {
    out: "en/index.html", path: "/en/index.html", lang: "en", alt: "/",
    title: "Geonhee Kim — I build for the web and find the parts that broke quietly",
    desc: "Whether what I built is up right now, and what it is not, in the same table. Eight live sites and seven problems written up from measurements.",
  },
  "en/resume.md": {
    out: "en/resume.html", path: "/en/resume.html", lang: "en", alt: "/resume.html", print: true,
    title: "Résumé — Geonhee Kim",
    desc: "Responsive web and small operations tools. Eight live sites and problem write-ups backed by measurements.",
  },
  "en/checks.md": {
    out: "en/checks.html", path: "/en/checks.html", lang: "en", alt: "/checks.html",
    title: "Procedures — Geonhee Kim",
    desc: "Drawing the boundary with 400 and 405, deciding the source of truth with hashes, counting broken word wraps. What each one settled, and what it does not catch.",
  },
  "en/problems.md": {
    out: "en/problems.html", path: "/en/problems.html", lang: "en", alt: "/problems.html",
    title: "Seven problems I solve — Geonhee Kim",
    desc: "Seven cases from sites that are live. Every number is measured, and two of the seven are incidents I caused.",
  },
};

const CSS = readFileSync(join(ROOT, "build", "style.css"), "utf8");
const PRINT_CSS = readFileSync(join(ROOT, "build", "print.css"), "utf8");

// 상단 한 줄로 홈과 반대 언어판을 같이 준다. 한국어판에는 지금까지 뒤로 갈 링크가
// 아예 없었다 — 영문판을 붙이면서 양쪽 다 채운다.
const nav = (m) => {
  const home = m.lang === "en" ? "/en/index.html" : "/";
  const items = [];
  if (m.path !== home) items.push(`<a href="${home}">${m.lang === "en" ? "Home" : "홈"}</a>`);
  items.push(`<a href="${m.alt}" hreflang="${m.lang === "en" ? "ko" : "en"}">${m.lang === "en" ? "한국어" : "English"}</a>`);
  return `<nav class="lang">${items.join(" · ")}</nav>`;
};

const foot = (lang) => lang === "en"
  ? `Written ${BUILT}. Built from markdown with no framework; the source of this site lives in
  <a href="https://github.com/forblune/forblune.github.io">the same repository</a>.`
  : `${BUILT} 작성. 프레임워크 없이 마크다운에서 만들었고, 이 사이트의 소스는
  <a href="https://github.com/forblune/forblune.github.io">같은 저장소</a>에 있습니다.`;

const page = (body, m) => `<!doctype html>
<html lang="${m.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${m.title}</title>
<link rel="canonical" href="${SITE}${m.path}">
${m.alt ? `<link rel="alternate" hreflang="${m.lang}" href="${SITE}${m.path}">
<link rel="alternate" hreflang="${m.lang === "en" ? "ko" : "en"}" href="${SITE}${m.alt}">
<link rel="alternate" hreflang="x-default" href="${SITE}${m.lang === "ko" ? m.path : m.alt}">` : ""}
<meta name="description" content="${m.desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${m.lang === "en" ? "en_US" : "ko_KR"}">
<meta property="og:title" content="${m.title}">
<meta property="og:description" content="${m.desc}">
<meta property="og:url" content="${SITE}${m.path}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${m.title}">
<meta name="twitter:description" content="${m.desc}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${CSS}${m.print ? PRINT_CSS : ""}</style>
</head>
<body>
<main>
${m.alt ? nav(m) : ""}
${body}
</main>
<footer>
  <p>${foot(m.lang)}</p>
</footer>
</body>
</html>
`;

mkdirSync(join(ROOT, "en"), { recursive: true });

const written = [];
for (const [src, m] of Object.entries(PAGES)) {
  try {
    const body = md(readFileSync(join(ROOT, "content", src), "utf8"));
    if (!body.trim()) { console.error(`build: ${src} 가 비었다`); process.exit(1); }
    // 원고의 마크업이 본문 글자로 새 나가는 것을 막는다.
    // 실제로 두 번 샜다 — HTML 주석과 <sub> 태그가 화면에 그대로 찍혔다.
    for (const bad of [/&lt;!--/, /&lt;sub/, /&lt;\/?br/]) {
      if (bad.test(body)) {
        console.error(`build: 원문이 본문으로 샜다 — ${src} ${bad}`);
        process.exit(1);
      }
    }
    writeFileSync(join(ROOT, m.out), page(body, m), "utf8");
    written.push(m.path);
  } catch (e) {
    console.error(`build: ${src} 실패 — ${e.message}`);
    process.exit(1);
  }
}

// 언어판이 서로를 가리키는지 빌드에서 확인한다. 한쪽만 고치고 나머지를 잊는 것이
// 이 구조에서 제일 나기 쉬운 사고다.
for (const [src, m] of Object.entries(PAGES)) {
  if (!written.includes(m.alt)) {
    console.error(`build: ${src} 의 alt(${m.alt}) 가 만들어진 페이지에 없다`);
    process.exit(1);
  }
}

// 404 는 GitHub Pages 가 자동으로 쓴다. 반드시 빌드 산출물이어야 한다 —
// 손으로 복사해두면 다음 빌드에 참조가 썩는다(실제로 그렇게 백지가 됐다).
// 어느 언어에서 오는지 모르므로 두 줄 다 적는다.
writeFileSync(join(ROOT, "404.html"), page(
  `<h1>404</h1><p>이 주소에는 페이지가 없습니다. There is no page at this address.</p>
<p><a href="/">처음으로</a> · <a href="/en/index.html">Home</a></p>`,
  { title: "페이지를 찾을 수 없음 — Not found", desc: "이 주소에는 페이지가 없습니다.", path: "/404.html", lang: "ko" }
).replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex, follow">'), "utf8");

writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, "utf8");
writeFileSync(join(ROOT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <lastmod>${BUILT}</lastmod>\n  </url>`).join("\n")}
</urlset>
`, "utf8");

const ko = written.filter((p) => !p.startsWith("/en/")).length;
console.log(`build — ${written.length}개 페이지 (ko ${ko} / en ${written.length - ko}) + 404 + robots + sitemap (${BUILT})`);
