# forblune.github.io — 배포 미러 (직접 수정하지 말 것)

이 저장소는 **빌드 산출물만** 담는다. 소스는 여기 없다.

```
forblune-portfolio  (정본)  ──npm run build──>  dist/  ──sync 스크립트──>  이 저장소
```

## 고칠 일이 생기면

**여기서 고치지 말고 [forblune-portfolio](https://github.com/forblune/forblune-portfolio)
에서 고친다.** 그다음:

```bash
cd ~/forblune-portfolio
bash scripts/sync-github-io.sh          # 무엇이 바뀌는지 먼저 본다
bash scripts/sync-github-io.sh --apply  # 반영
git -C ~/forblune.github.io add -A
git -C ~/forblune.github.io commit -m "deploy: sync from forblune-portfolio"
git -C ~/forblune.github.io push
```

## 왜 이 경고가 있나

2026-08-18 에 두 저장소가 **양방향으로 갈라져 있었다.** 각자에만 있는 파일이
있었는데 한쪽이 정본이라고 착각하고 `rsync --delete` 를 돌릴 뻔했고,
이 저장소의 파일 9개가 지워질 뻔했다.

여기를 직접 고치면 다음 동기화 때 그 수정이 조용히 사라진다.
동기화 스크립트는 방향이 하나뿐이고, 삭제가 생기면 확인을 요구한다.
