# Geonhee Kim

I build for the web, and **I find the parts that broke quietly.**

I write down whether the thing I built **is up right now** — and **what it is not** — in the same table.

[Résumé PDF](/resume.pdf) · [GitHub](https://github.com/forblune) · [geonhee@forblune.com](mailto:geonhee@forblune.com?subject=%5BHiring%5D%20Enquiry)

---

## What is up right now

Every address below responds as you read this. Each row says **what you can check** and **where the boundary is.**

| Project | What you can check | Boundary |
|---|---|---|
| [Web Care](https://webcare.forblune.com) | Responsive service pages, pricing and refund policy, enquiry intake, checkout | My own service site. No paying customers yet |
| [Style Gallery](https://gallery.forblune.com) | 24 pages across 8 directions, 8 of them in English | Self-initiated. Fictional brands |
| [Mellow Room](https://mellowroom.forblune.com) | Korean and English booking flow, schedule view, operator view | Self-initiated demo. Fictional data |
| [OpsFlow](https://opsflow.forblune.com) | CSV import, validation rules, KPI view, cleaned CSV export | Self-initiated demo. Fictional data |
| [ClientFlow](https://clientflow.forblune.com) | Search, pipeline stages, lead detail, next action | Self-initiated demo. Fictional data |
| [ServiceOS](https://serviceos.forblune.com) | Quote, project, invoice, issue and audit views | Self-initiated demo. Fictional data |
| [MindHub](https://mindhub.forblune.com) | Care-record flow and the pre-visit summary concept | Prototype. Fictional patient data. **Not a diagnostic tool** |
| [GapProof](https://gapproof.forblune.com) | Turning experience into sourced statements | Prototype. Career-research work |

**I do not present self-initiated work as paid client work.**

---

## Problems I solve

**Seven cases**, all from sites that are live. Every number is one I measured myself.

**Two of the seven are incidents I caused.** How they happened and how I found them are written down with the rest.

- Ads are running but no enquiries arrive → the enquiry API returned **405 for about four hours** while the page looked perfectly fine
- Photos show up broken → external image hotlinks **243 → 0**, everything moved to self-hosting
- Nobody knows where the current version is → **0 of 8 local copies matched live**
- Something feels off and nobody can say what → measured Korean word-level line breaking instead of eyeballing it

[Read all seven](/en/problems.html)

---

## I ran my own checks on this site

What I sell is **finding the things that look fine and are dead.** So **this site has to pass that bar first.**

These are the results of checking this site before I rebuilt it. All measured, with the values after the fix in the same table.

| Check | Before | After |
|---|---|---|
| Body words before JS runs | **0** — only `<div id="root">` | Real body text |
| Sub-path responses | `/problems` and the rest, **all 404** | 200 |
| Assets the 404 page references | **both 404** → a blank page in a 404 state | Alive |
| `canonical` | pointed at **someone else's domain**, opting itself out of indexing | Its own address |
| `robots.txt` and `sitemap.xml` | **both 404** | Real files |
| Résumé file | **404** — it did not exist | Present |
| Commit author name | **two different ones mixed together** | One |

One cause explained all of it. This site was a **build-output mirror** of another site, and GitHub Pages has no SPA fallback, so every sub-path was dead. I cut the mirror and republished it as static pages.

> I leave the "before" column in. Without this table, the claims above cannot be checked.

---

## Procedures

Written as **procedures someone else can repeat**, not as adjectives.
Each one says what it actually settled, and **what it does not catch.**

- **Draw the boundary with 400 and 405** — separating "there is no such path" from "the path exists but the method is gone" settles "since when, and because of what" in two lines
- **Decide the source of truth with hashes** — you can have eight copies and none of them match live
- **Count broken Korean word wraps** — measure the layout failure with `Intl.Segmenter`, not with your eyes

[Read all three](/en/checks.html)

---

## Forblune

I also take web build and repair work under the name `Forblune` — [portfolio.forblune.com](https://portfolio.forblune.com)
