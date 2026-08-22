# Procedures

Written as **procedures someone else can repeat**, not as adjectives.
For each one I write down what it actually settled, and what it does not catch.

---

## 1. Draw the boundary with 400 and 405

### When to use it

"It worked yesterday and it does not work today." When there are several candidate causes, this is what I use to **cut the search space in half** before digging through logs.

### The procedure

A status code does not only say "it failed." It says **how far the request got.**

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST https://<host>/api/<path> \
  -H 'Content-Type: application/json' -d '{}'
```

| Response | What it means | Where to look next |
|---|---|---|
| `400` | The path exists and the handler ran. The body was rejected for not matching the schema | Request body, validation rules |
| `405` | **The path exists but that method does not.** The handler is missing from the deployment | Build output, bundler config |
| `404` | The path itself does not exist | Routing, file layout |
| `200` | It arrived and was processed. If there is still no result, the problem is further down | Storage, notifications |

I send an empty body `{}` on purpose. **A healthy endpoint must reject it**, so the way it rejects becomes the diagnosis.

### What it settled

A live site had a report that enquiries were not coming through. The page looked fine. I sent the same request at two deployments.

```
deploy from 2 days ago   POST /api/lead → 400   handler alive
deploy from today        POST /api/lead → 405   handler gone
```

Two lines settled "since when, and because of what." A static-only deploy had dropped the server function entirely, and intake had been down for **about four hours**. After the fix I froze the verification into the deploy procedure — `400` means healthy, `405` means the deploy failed.

### What this does not catch

- **Measuring on the custom domain lies to you.** CDN caching keeps returning `200` for things that are already gone. Measure against the deployment URL, or wait 20 to 30 seconds and look again. This fooled me four times in one day.
- `200` does not mean success. With SPA fallback on, **paths that do not exist also return 200** — a soft 404. This is where "`/sitemap.xml` returns 200 but the body is HTML" comes from.
- A status code only tells you the request arrived. Storage or notifications failing silently is a separate check.

---

## 2. Decide the source of truth with hashes

### When to use it

"Where is that file?" / "I fixed it, then the deploy brought the old one back."
When there are several copies, **you cannot tell by looking which one is live.**

### The procedure

Hash what you pull from live and hash the local candidates the same way. Do not compare by eye.

```bash
LIVE=$(curl -s "https://<host>/?cb=$RANDOM" | shasum -a 256 | cut -d' ' -f1)
for f in <candidate1> <candidate2> <candidate3>; do
  printf '%-40s %s\n' "$f" \
    "$([ "$(shasum -a 256 "$f" | cut -d' ' -f1)" = "$LIVE" ] && echo match || echo differs)"
done
```

Always add the cache buster. Without it, **a cached old response matches an old copy** and you reach the wrong conclusion.

### What it settled

The source of a live site was in no git repository anywhere. I compared eight local candidates against live.

```
8 candidates  →  matching live: 0
```

**None of them was the source of truth.** Files had been uploaded directly with no git integration, so no history existed. In that state, anything anyone fixes can disappear on the next deploy. I verified the live output by hash, pinned it into the repository as the canonical copy, and made the deploy one-directional.

### What this does not catch

- **A crawled copy is not a copy of the site.** Even with a matching hash you are missing server code, assets that only appear in meta tags such as `og:image`, unlinked pages that only exist in `sitemap.xml`, and files referenced inside CSS `url()`.
- If the response contains a timestamp or a nonce, the hash changes every time. Strip those fields before comparing.
- It only tells you that nothing matches. **Deciding which copy becomes the source of truth is a human call.**

---

## 3. Count broken word wraps

### When to use it

"Something feels off and I cannot say what."
Usually it is not the content, it is the fundamentals. The most common one is **Korean breaking mid-word at the end of a line.**

> 저희는 사이트를 점검하고 개선
> 합니다

Before the reader judges the content, they feel **"nobody proofread this."**

### Why it happens

The browser default `word-break: normal` **treats CJK as breakable at any syllable.** Latin script only breaks at spaces; Korean breaks between any two characters.

```css
body { word-break: keep-all; overflow-wrap: break-word; }
```

`overflow-wrap: break-word` is the escape hatch for unbreakable long tokens such as URLs. **Using `anywhere` overrides `keep-all` and the text breaks again.**

### The procedure

Do not count by eye. Split the text into words with `Intl.Segmenter`, then check whether each word's `getClientRects()` spans two lines. If it does, it is broken.

```javascript
(() => {
  const seg = new Intl.Segmenter('ko', { granularity: 'word' });
  let checked = 0, broken = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    const t = n.nodeValue;
    if (!t || !/[가-힣]/.test(t)) continue;
    const p = n.parentElement;
    if (!p || !p.offsetParent) continue;
    const r0 = p.getBoundingClientRect();
    if (r0.right < 0 || r0.width <= 1) continue;      // skip offscreen and honeypots
    for (const s of seg.segment(t)) {
      if (!s.isWordLike || !/[가-힣]/.test(s.segment) || s.segment.length < 2) continue;
      checked++;
      const r = document.createRange();
      r.setStart(n, s.index);
      r.setEnd(n, s.index + s.segment.length);
      if (r.getClientRects().length > 1) broken.push(s.segment);
    }
  }
  return { checked, broken };
})()
```

It passes only at **0 across all four widths — 390, 768, 1280 and 1440px.** Narrow screens expose it first.

### What it settled

I found and cleared this to zero across four live sites and 25 showcase pages. Pages that declared `keep-all` had zero; pages without it always had some. There were no exceptions.

### What this does not catch

- **Counting offscreen elements produces false positives.** Bot traps are hidden at `left:-9999px` and 1px wide, and inside a 1px box every word wraps. The `r0.right < 0 || r0.width <= 1` guard above filters them. Without that condition I once reported "2 broken" that were not real.
- **A static scan misses some of it.** Eight English pages showed "0 Korean in body text", but pressing the add-to-cart button put a Korean product name in the basket. The value lived in a `data-*` attribute and JavaScript wrote it to the screen. **Some defects only appear when you actually click.**
- Even at zero breakage, **a two-line heading that leaves a single word on the last line** is a separate check — `text-wrap: balance`.

---

## What all three taught me

**When a measurement reports a failure, suspect the instrument first.** Using these three procedures I produced wrong verdicts several times, and most of them were faults in **how I was measuring**, not in the code or the site.

- Forgot an element's own padding, so the spacing ratio came out under threshold
- Measured horizontally arranged elements by vertical gap
- `line-height: normal` turned into `NaN` by `parseFloat`, so line height read as zero
- Compared `<?xml ` cut by `head -c 6` against `'<?xml'`, so everything came out mismatched
- Used `elementFromPoint`, which takes viewport coordinates, on offscreen elements

**Before reporting a result, I check once more how that number was produced.**
