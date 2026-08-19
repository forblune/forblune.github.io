import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { md } from "./md.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://forblune.github.io";
const BUILT = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

const PAGES = {
  "index.md": {
    out: "index.html",
    path: "/",
    title: "김건희 · Geonhee Kim — 웹을 만들고 조용히 망가진 곳을 찾습니다",
    desc: "만든 것이 지금 열리는지, 그리고 무엇이 아닌지까지 같은 표에 적어 둡니다. 운영 중인 사이트 8곳과 실측 근거로 정리한 문제 7건.",
  },
  "resume.md": {
    out: "resume.html",
    path: "/resume.html",
    title: "이력서 — 김건희 · Geonhee Kim",
    desc: "반응형 웹과 소규모 운영 도구. 운영 중인 사이트 8곳과 실측 근거로 정리한 문제 해결 사례.",
    print: true,
  },
  "problems.md": {
    out: "problems.html",
    path: "/problems.html",
    title: "해결하는 문제 7건 — 김건희 · Geonhee Kim",
    desc: "운영 중인 사이트에서 나온 7건. 숫자는 전부 직접 측정한 값이고, 그중 2건은 제가 낸 사고입니다.",
  },
};

const CSS = readFileSync(join(ROOT, "build", "style.css"), "utf8");
const PRINT_CSS = readFileSync(join(ROOT, "build", "print.css"), "utf8");

const page = (body, m) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${m.title}</title>
<link rel="canonical" href="${SITE}${m.path}">
<meta name="description" content="${m.desc}">
<meta property="og:type" content="website">
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
${body}
</main>
<footer>
  <p>${BUILT} 작성. 프레임워크 없이 마크다운에서 만들었고, 이 사이트의 소스는
  <a href="https://github.com/forblune/forblune.github.io">같은 저장소</a>에 있습니다.</p>
</footer>
</body>
</html>
`;

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

// 404 는 GitHub Pages 가 자동으로 쓴다. 반드시 빌드 산출물이어야 한다 —
// 손으로 복사해두면 다음 빌드에 참조가 썩는다(실제로 그렇게 백지가 됐다).
writeFileSync(join(ROOT, "404.html"), page(
  `<h1>404</h1><p>이 주소에는 페이지가 없습니다.</p><p><a href="/">처음으로</a></p>`,
  { title: "페이지를 찾을 수 없음", desc: "이 주소에는 페이지가 없습니다.", path: "/404.html" }
).replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex, follow">'), "utf8");

writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, "utf8");
writeFileSync(join(ROOT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <lastmod>${BUILT}</lastmod>\n  </url>`).join("\n")}
</urlset>
`, "utf8");

console.log(`build — ${written.length}개 페이지 + 404 + robots + sitemap (${BUILT})`);
