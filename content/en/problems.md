<!-- English edition. The canonical source is forblune/forblune docs/PROBLEMS_I_SOLVE.md,
     mirrored to content/problems.md by build/sync-problems.mjs. This file is written by hand;
     if the Korean source changes, update this one too. -->
# Problems I solve

A portfolio usually shows **what someone built.** What a company actually buys is **which problem goes away.** This document connects the two.

Every case below came from a site that is live, and every number is measured. None of it is an estimate or an illustration.

---

## 1. Finding the path to revenue that quietly broke

### The symptom, in the words a company actually uses

> "The ads are running but no enquiries come in."
> "We used to get them. It has gone quiet lately."

### What is really happening

When an enquiry form dies, **the page still looks fine.** The visitor sees "Something went wrong" and leaves. Nobody tells the company. The ad spend keeps going out.

On 2026-08-18 this happened on the live site `webcare.forblune.com`. A static-only deploy dropped the server function entirely, and the enquiry API returned **405** for about four hours. The page looked normal the whole time.

### How I found it

I sent the same request at each deployment to narrow the boundary.

```
deploy from 2 days ago   POST /api/lead → 400   (function alive, rejecting a bad body)
deploy from today        POST /api/lead → 405   (function missing)
```

The difference between `400` and `405` alone settles "since when, and because of what." I build **a reproducible boundary** before digging through logs.

### What I did

- Restored the lost server function and put it back in the deploy path
- Froze post-deploy verification into a procedure: `POST /api/lead` returning **400 is healthy, 405 means the deploy failed**
- Verify against the **deployment URL**, not the custom domain. CDN caching keeps the domain returning 200 for things that are already gone

### What the company gets

Lead loss measured **in minutes instead of hours.** And if the same incident recurs, the deploy catches it immediately.

---

## 2. Ending the structure where nobody finds out

### The symptom

> "We get a notification when an enquiry comes in, right?"

### What is really happening

After fixing the incident above I found something larger. **There were no notifications at all.** Enquiries were saved to the database and nobody knew until a person went and looked. I searched every branch in the repository and there was not one line of mail-sending code.

Meanwhile the page was promising this:

> "Someone will get back to you shortly."

An enquiry could sit unattended for days. The moment you turn ads on, that becomes a direct loss.

### What I did

I added mail notifications, designed so that **the notification cannot eat the enquiry.**

- The notification is sent **after the save completes.** If mail fails, the enquiry is already stored
- It does not block the response. The user is not waiting on an email
- Failures are **always logged.** A notification that dies silently is the worst kind
- Replying directly to the received mail reaches the person who enquired

The design paid for itself immediately. The first configuration had a wrong API key and sending failed — **the enquiry saved correctly**, and `lead_notify_failed <id> 401` in the log settled the cause in five minutes.

### What the company gets

**The cost of finding out late** is larger than the outage itself. This removes that gap.

---

## 3. Ending "nobody knows which one is current"

### The symptom

> "Where is that file?"
> "I fixed it, and then the deploy brought the old version back."

### What is really happening

The source of a live site was **in no git repository anywhere.**

There were eight local candidates — the repo itself, a build output, `v3`, `v5`, `v6`, `v6 2`, `v6-v2`, and a recovery copy. I hashed all of them against live.

```
8 candidates  →  matching live: 0
```

Files had been uploaded directly with no git integration, so there was no history. In that state, **anything anyone fixes can vanish on the next deploy.** It had already happened once: an old build overwrote the final version.

### What I did

- Downloaded the live output, verified it by hash, and **pinned it into the repository as canonical**
- Wrote the canonical rule, the deploy command, and the pre- and post-deploy checks into a README in the same folder
- Made the deploy pipeline **one-directional and scripted**

The guards I put in the deploy script:

| Guard | The incident it prevents |
| --- | --- |
| Dry run by default, `--apply` required | Unintended immediate publish |
| Verify the target repository origin | Overwriting the wrong repository |
| Abort if the target has uncommitted changes | Destroying someone else's work |
| Abort on build failure | Shipping a stale build |
| **Show the delete count and require typing `yes`** | Mass deletion |

The last one came out of a real incident. Two repositories had diverged in both directions on the same day, I nearly ran a sync without knowing, and **nine files were about to be deleted.**

### What the company gets

Handover becomes possible. When the person changes, nobody starts from "where is the real copy?"

---

## 4. A crawled copy is not a copy of the site

### The symptom

> "We moved it over exactly. Why does it not work?"

### What is really happening

A copy made by crawling a site is **missing everything that is not visible.**

- Server code — the cause of incident 1 above
- Assets that only exist in meta tags, such as `og:image`. Nothing links to them, so a crawler never sees them
- Unlinked pages that only appear in `sitemap.xml`
- Files referenced inside CSS `url()`
- Convention files such as `robots.txt`, `favicon.ico` and `site.webmanifest`

On the same day, this method **deleted a 511 KB `og:image`.** It was the share preview for eight pages. What made it worse was that **the domain was returning 200** — CDN caching again. The 404 only showed up against the deployment URL.

### What I did

Restored the files from the previous deployment, and wrote the pre-deploy checklist and **"verify against the deployment URL, not the domain"** into the documentation.

### What the company gets

It stops things from **quietly disappearing** during a migration, a rebuild, or a change of vendor. The asset nobody noticed was missing is the most expensive one.

---

## 5. Not letting someone else's outage become ours

### The symptom

> "The photos look broken. They were fine yesterday."

### What is really happening

A design showcase site was **hotlinking** every photo directly from a free external image service. When that service had an outage, more than half the images became grey boxes. Nothing in our code changed and the site broke anyway.

```
external hotlinks   243 across 24 pages   →  0
self-hosted         234 files / 217 unique photos / all CC0 (commercial use allowed)
external image dependency   0
```

### Traps caught during selection

You cannot take a free image API at face value. Two things actually caught me out.

- **Flat scans** — an image that is only a background reads on screen as a solid grey box. This was the real cause behind "the photos look unfilled"
- **Museum collection photography** — it passes as a photograph but does not fit a website example at all. I filtered these by the photographing institution's name

### What the company gets

**You do not bet the site on something you cannot control.** A free external resource is guaranteed exactly as much as you paid for it.

---

## 6. Finding the real cause of "this looks AI-generated"

### The symptom

> "Something feels off and I cannot say what."
> "Someone told us it looks careless."

### What is really happening

Usually it is not the content, it is **the fundamentals.** The most common one is Korean breaking mid-word at the end of a line. It gets worse the narrower the screen.

> 저희는 사이트를 점검하고 개선<br>합니다

Before the reader judges the content, they feel **"nobody proofread this."** And that impression carries straight into whether they enquire.

The cause is one line. Korean does not break at word boundaries by default.

```css
word-break: keep-all;        /* break only between words */
overflow-wrap: break-word;   /* exception only for unbreakable long tokens like URLs */
```

Using `overflow-wrap: anywhere` overrides `keep-all` and the text breaks again. You have to know about this to see it.

I found and fixed this on all four live sites, and applied it across all **25 showcase pages.**

### Caught alongside it

| Defect | Why it matters |
| --- | --- |
| A required field with no indication on screen | The user fails without knowing why and leaves |
| Every error collapsed into one message | Nobody knows what was actually wrong |
| System dark mode producing unintended colours | The brand falls apart |
| Input fields as empty white boxes | Nobody knows what to put in them |

The required-field problem was causing real loss. The server enforced the field, the screen did not mark it, so a user who left it blank **saw only "Something went wrong" with no way to know why.** I moved the check before submission so it says what to fill in.

### What the company gets

**Conversion.** Good content still does not get an enquiry if the impression is that nobody proofread it.

---

## 7. Checking whether something basic is missing

### The symptom

> "Someone said the address on our business card does not open."

### What is really happening

All nine subdomains were alive and **only the root domain was dead.** There was no web record in DNS at all, so it could not be reached.

Mail worked, so nobody noticed. Anyone typing the company address from a business card, an email signature, or a search result found nothing.

### What I did

Sent the root and `www` to the main site as a **301 permanent redirect**, preserving path and query.

```
forblune.com/            → portfolio.forblune.com/
www.forblune.com/        → portfolio.forblune.com/
forblune.com/a/b?x=1     → portfolio.forblune.com/a/b?x=1
```

### The judgement call that mattered here

When attaching domain authentication for outbound mail, I used **a subdomain rather than the root.**

The root already carried Google Workspace mail configuration — MX and SPF. Slotting a new sending service into the root SPF **can break receipt of the company mail currently in use.** Separating it onto a subdomain removes that risk.

After the work I verified the integrity of the mail records — MX, SPF and DMARC.

### What the company gets

**You do not break something else on the way to fixing one thing.** That is the whole job when you touch a system that is already running.

---

## In one line each

| What the company experiences | What I do |
| --- | --- |
| Enquiries stop and nobody knows why | Find the broken path with a reproducible boundary, restore it, and block recurrence in the deploy procedure |
| Outages discovered late | Add notification and logging structures where failure cannot die silently |
| Nobody knows where the current version is | Establish the source of truth, pin it in the repository, make the deploy one-directional |
| Something disappears during a migration or rebuild | A checklist that includes the assets a crawler never sees |
| Someone else's outage stops us | Remove external dependencies and replace them with resources we control |
| Being told it "looks AI-generated" | Find and fix the fundamentals that erode trust |
| Something basic is missing | Fill in what is absent without breaking what is alive |

---

## How I work

**I do not fix by guessing.** I first build a reproducible boundary that settles the cause. Is it `400` or `405`. Does the hash match or not. I touch the code after that is settled.

**I verify what I fixed.** Code compiling and code working for a user are different things. I submit the form on the real screen, all the way through, and check that the row landed in the database.

**I make sure the same incident cannot happen twice.** I do not stop at the fix. Why it happened and how to check it go into the repository. The next person should not have to be me.

**I write down my own mistakes.** Cases 1 and 4 above are **incidents I caused.** I found them, established the cause, prevented recurrence, and left the record. Nobody avoids incidents entirely. What is needed is someone who does not hide them and blocks them with a system instead.

---

<sub>Every number in these cases is a measurement taken on 2026-08-18. The verification commands and evidence remain in the commit messages and `docs/` of each repository.</sub>
