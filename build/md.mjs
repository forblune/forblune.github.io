// 의존성 없는 최소 마크다운 변환기.
// 이 사이트가 주장하는 것이 "프레임워크 없이 직접 만들고 검증한다"이므로
// 빌드 도구도 같은 기준을 따른다. 지원 범위를 좁게 두고, 못 다루는 문법은
// 조용히 뭉개지 말고 원문 그대로 내보낸다.
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, h) =>
      `<a href="${h}"${/^https?:/.test(h) && !h.includes("forblune") ? ' rel="noreferrer"' : ""}>${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*]+)\*/g, "$1<em>$2</em>");
}

export function md(src) {
  const out = [];
  const lines = src.split("\n");
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];

    if (!l.trim()) { i++; continue; }

    // 표
    if (l.trim().startsWith("|") && (lines[i + 1] || "").includes("---")) {
      const row = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = row(l);
      i += 2;
      const body = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) body.push(row(lines[i++]));
      out.push(
        `<div class="tablewrap"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead>` +
        `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      );
      continue;
    }

    // 코드 블록
    if (l.startsWith("```")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }

    // 인용
    if (l.startsWith("> ")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith("> ")) buf.push(lines[i++].slice(2));
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // 목록
    if (/^[-*] /.test(l)) {
      const buf = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) buf.push(lines[i++].slice(2));
      out.push(`<ul>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\d+\. /.test(l)) {
      const buf = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) buf.push(lines[i++].replace(/^\d+\. /, ""));
      out.push(`<ol>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ol>`);
      continue;
    }

    // 제목
    const h = l.match(/^(#{1,4}) (.+)$/);
    if (h) {
      const lv = h[1].length;
      const id = h[2].toLowerCase().replace(/[^\w가-힣]+/g, "-").replace(/^-|-$/g, "");
      out.push(`<h${lv} id="${id}">${inline(h[2])}</h${lv}>`);
      i++;
      continue;
    }

    if (l.trim() === "---") { out.push("<hr>"); i++; continue; }

    // 문단
    // 첫 줄은 무조건 소비한다. 안 그러면 `**굵게**` 처럼 목록 문법과 첫 글자가
    // 겹치는 줄에서 i 가 늘지 않아 무한 루프가 된다 (실제로 걸렸다).
    const buf = [lines[i++]];
    while (i < lines.length && lines[i].trim() && !/^([-*+] |\d+\. |#{1,6} |> |\||```)/.test(lines[i]))
      buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}
