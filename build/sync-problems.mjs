// 「해결하는 문제」의 정본은 공개 저장소 forblune/forblune 의
// docs/PROBLEMS_I_SOLVE.md 다. 두 곳에 본문을 복제하면 다음 수정 때 갈라지므로
// 빌드 전에 정본에서 가져온다. 정본이 없으면 조용히 넘어가지 않고 멈춘다.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.env.PROBLEMS_SRC ||
  join(homedir(), "forblune-github-profile", "docs", "PROBLEMS_I_SOLVE.md");

if (!existsSync(SRC)) {
  console.error(`sync-problems: 정본을 찾지 못했다 — ${SRC}`);
  console.error("  PROBLEMS_SRC 로 경로를 지정하거나 forblune/forblune 를 클론할 것.");
  process.exit(1);
}

const note = `<!-- 이 파일은 사본이다. 정본은 forblune/forblune 의 docs/PROBLEMS_I_SOLVE.md 이며,
     build/sync-problems.mjs 가 거기서 가져온다. 여기를 직접 고치면 다음 동기화에 사라진다. -->\n`;
const body = readFileSync(SRC, "utf8");
const out = join(ROOT, "content", "problems.md");
const prev = existsSync(out) ? readFileSync(out, "utf8") : "";
writeFileSync(out, note + body, "utf8");
console.log(`sync-problems — ${body.split("\n").length}줄${prev === note + body ? " (변화 없음)" : " (갱신됨)"}`);
