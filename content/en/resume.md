# Geonhee Kim

**Web development · Computer vision · Operations automation**

[geonhee@forblune.com](mailto:geonhee@forblune.com) · [github.com/forblune](https://github.com/forblune) · [forblune.github.io](https://forblune.github.io)

---

## Summary

I write down whether what I built **is up right now**, and **what it is not**, in the same table. I train computer vision models and ship them as far as an app, I build and run responsive sites, and I find **the places where something already running broke quietly** with evidence anyone can reproduce. Every number below is one I measured myself. I do not present self-initiated work as paid client work.

---

## Selected projects

**RePET Vision — automatic sorting of clear PET bottles** · Sep 2025 · Gangwon AI Idea Competition
Two-class object detection, clear and coloured PET. 700 images collected through Roboflow, augmented to **1,726** (train 1,539 / val 126 / test 61), YOLOv8n · 640px · 40 epochs · batch 16. **mAP50 approx. 91% · mAP50-95 approx. 52%.**
Built through to an Android Studio app with live camera recognition and confidence display. Attached an economic case using Gangneung city recycling rates, 330 → 538 KRW/kg.

**K2J — smoking detection on CCTV** · Jul 2025 · CKU summer AI project
Single-class detection on park CCTV footage. YOLOv5 · PyTorch · 640px · 50 epochs.
**mAP@0.5 approx. 0.97 · mAP@0.5:0.95 approx. 0.68 · Precision approx. 0.90 · Recall approx. 0.98.**
I owned the progress record, wrote the video boundary-correction code, and built the frame-interval feature.

**MindHub — mental health care platform** · Jun 2026 to present
Patient daily records → AI clinical summary → handoff to the clinician, and CBT homework prescribed back the other way. React · Supabase · Kakao login · Solar (Upstage) LLM.
Scoped deliberately as **recording, summarising and handoff, not diagnosis.**

**Eight live sites** — addresses and boundaries are tabulated at [forblune.github.io](https://forblune.github.io/en/index.html).
Web Care (pricing, refunds, enquiry, checkout), Style Gallery (8 directions, 24 pages, 8 in English, single-file HTML with no framework), Mellow Room · OpsFlow · ClientFlow · ServiceOS (self-initiated demos, fictional data). All of them respond right now.

---

## Problems solved

Cases from sites that are live. **One of the four below is an incident I caused, and I wrote that into the document as it happened.**

**Enquiries were not arriving and the page looked fine** — a static-only deploy dropped the server function, and the enquiry API returned **405 for about four hours.** Separating `400` (bad request) from `405` (path exists, method gone) settled "since when, and because of what." After recovery I froze deploy verification into a procedure — check the deployment URL, not the domain, because a CDN cache will return 200 for a file that is already deleted.

**Nobody knew where the current version was** — the source of a live site was in no git repository. Hashing eight local candidates against live gave **0 matches.** I fixed the live output as canonical and made the deploy one-directional.

**Someone else's outage became our outage** — a free external image service was hotlinked directly, so half the page turned into grey boxes during their incident. **243 external hotlinks → 0**, with 234 files selected as CC0 and moved to self-hosting.

**The real cause of "it looks AI-generated"** — usually the fundamentals rather than the content. I quantified Korean breaking mid-word using `Intl.Segmenter` and `Range.getClientRects()`, applied it across every live site and 25 example pages, and brought it to **0.**

---

## Awards

| Date | Award |
|---|---|
| Feb 2024 | **Grand Prize, 2024 CKU pre-university bootcamp, "Building a chatbot with generative AI"** · hosted by Catholic Kwandong University · **team 4 leader** · three-day team build (MIT App Inventor) |
| Jul 2024 | **Encouragement Award, 22nd Next-Generation Global Business School** · hosted by World-OKTA · 1–6 Jul 2024 · team presentation `smart WALK` |
| 2025 | **Encouragement Award, academic conference presentation on space logistics** · sole presenter, "Earth–Moon–Mars three-stage sustainable deep space logistics" |

---

## Business and operations

**Open-market advertising operations** · Jan–Mar 2025 — managed ad groups for **around 1,700 products** across Gmarket, Auction and 11st. Improved ROAS through ad on/off decisions, category matching, and keyword and daily-budget adjustment, and made the calls on restructuring the catalogue.

**Naver Smart Store, sole operator** · Oct 2024 to present — ran the full cycle under my own business registration: sourcing, listing, orders, shipping, exchanges and customer service, and settlement.

**Other** — NYPC Code Battle entrant (Jul 2025, competitive algorithm strategy) · RowCraft (May 2026 to present, a solo data-cleaning business on Fiverr, with an SOP built on pandas and rapidfuzz plus a Slack bot) · BTCUSDT paper-trading bot running continuously on a Raspberry Pi · water purifier lever designed and 3D printed from scratch · Raspberry Pi 5 and Arduino sensor work.

---

## How I work

I do not fix by guessing. I build **a reproducible boundary** that settles the cause first. Code compiling and code working for a user are different things, so I confirm the fix on the real screen. I leave why it happened and how to check it in the repository, so the same incident does not happen twice. **I write down my own mistakes too** — hiding them costs the credibility of everything else I report.

---

## Education and skills

| | |
|---|---|
| **Education** | **Catholic Kwandong University, Air Transport and Logistics** · enrolled Mar 2024 · Baekyang High School (gifted programme, 115 hours of mathematics and science) |
| **Training** | **ICT Innovation Square Capital Region — Vibe Coding web project course**, completed · 1–22 Jun 2026 (80 hours) · National IT Industry Promotion Agency (NIPA)<br>CKU AI Academy advanced specialisation (computer vision, NLP, multimodal) · Jun–Jul 2025 |
| **Computer vision** | YOLOv5/v8 · Roboflow · OpenCV · PyTorch · Google Colab |
| **Web and app** | HTML · CSS · JavaScript · TypeScript · React · Supabase · Android Studio |
| **Deploy and infrastructure** | Cloudflare Workers/Pages · D1 · GitHub Actions · Git · Raspberry Pi |
| **Quality** | Responsive layout · browser QA · accessibility fundamentals · Korean typography |
