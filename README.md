# forblune.github.io — 개인 포트폴리오

채용 담당자를 대상으로 한 **개인 포트폴리오**입니다.
`portfolio.forblune.com`(외주 클라이언트 대상 스튜디오 사이트)과 **역할이 다르고 내용도 다릅니다.**

## 2026-08-18 이전에는 미러였습니다

이 저장소는 `forblune-portfolio` 빌드 산출물의 미러였습니다. 그 상태에서 실측한 결과:

```
body 본문 단어 수                    0        (<div id="root"> 뿐)
/problems /projects /about …        404      GitHub Pages 엔 SPA 폴백이 없다
404 페이지가 참조하는 에셋           404      → 404 상태의 백지
canonical                           남의 도메인
robots.txt · sitemap.xml            404
```

미러를 끊고 자체 소스를 가진 정적 사이트로 다시 만들었습니다.
`forblune-portfolio/scripts/sync-github-io.sh` 는 퇴역했습니다.

## 구조

```
content/*.md      원고 (정본)
build/md.mjs      의존성 없는 마크다운 변환기
build/build.mjs   HTML · 404 · robots · sitemap 생성
build/style.css   스타일
*.html            산출물 (GitHub Pages 가 루트에서 서빙)
```

프레임워크도 외부 의존성도 없습니다. 이 사이트가 주장하는 것이
"프레임워크 없이 직접 만들고 검증한다"이므로 빌드 도구도 같은 기준을 따릅니다.

## 빌드

```bash
node build/build.mjs
```

`content/problems.md` 는 **사본**입니다. 정본은 공개 저장소 `forblune/forblune` 의
`docs/PROBLEMS_I_SOLVE.md` 이고, `build/sync-problems.mjs` 가 가져옵니다.
두 곳에 본문을 복제하면 다음 수정 때 갈라지므로 이 파일을 직접 고치지 마세요.

## 배포 후 확인

```bash
for p in / /problems.html /robots.txt /sitemap.xml /no-such-zz; do
  printf "%-18s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://forblune.github.io$p")"
done
# 없는 경로는 404 여야 한다. 200 이면 폴백이 켜진 것이다.
```

기준 문서: 노션 「검색 색인·크롤 기준 v1」 · 「시각디자인 기준 v1」 · 「AI 티 제거 기준」
