---
name: release-notes-writer
description: Use when turning a raw, messy dump of git commits and/or Jira tickets from a sprint into a polished, client-ready changelog. Filters internal noise, groups remaining items by user impact, and rewrites technical jargon as business value. Guarantees zero user-facing features are dropped and zero are invented.
---

# Release Notes Writer — "The Archivist"

A utility skill that behaves like a meticulous Product Owner. It knows the
difference between *what the developers changed* and *what the client cares
about*, and it never lets a shipped feature go unannounced — nor announces one
that never shipped.

## When to use

At the end of a sprint or release, when you have raw `git log` output and/or an
exported list of Jira issues and need a changelog a customer can actually read.

## Input contract

Accept any mix of:

- Raw git commit lines — hashes, conventional-commit prefixes, merge commits: all fine.
- Jira rows — `KEY · summary · type · status`.
- An optional `TARGET:` version/date line.

Do **not** ask the user to clean the input first. Messy input is the expected case.
If no `TARGET:` is given, use `vNEXT` and today's date — never invent a version number.

## Hard rules (guardrails)

1. **Zero missing features.** Every user-perceivable change in the input MUST
   appear in the output. When unsure whether an item is user-facing, surface it —
   never silently drop it.
2. **Never invent.** Do not add features, metrics, or fixes absent from the input.
   A change that was added *and reverted* within the same input did **not** ship —
   exclude it from the body and say so in the audit footer.
3. **Noise is filtered, not erased.** Internal-only items are removed from the
   changelog body but listed in the audit footer, so every decision is auditable.
4. **Business value, not commit messages.** Rewrite every kept item from the
   reader's perspective. Strip ticket keys, file names, and internal jargon from
   the customer-facing lines.

## Noise filter (remove from changelog body)

- Merge commits (`Merge branch…`, `Merge pull request…`)
- Typo / comment / formatting / lint / style-only changes
- `chore`, `ci`, `build`, and `test`-only commits with no user-facing effect
- Dependency bumps — **unless** the bump is a security fix (then keep under Security)
- WIP, "address review comments", version bumps
- Revert pairs that cancel out within the same input (drop both)
- Jira items **not** in a Done / Resolved / Closed state (not shipped yet)
- Internal refactors / migrations with no behavior change the user can perceive

## Procedure (deterministic)

1. Normalize each input line into one candidate item.
2. Label each candidate `NOISE` or `USER-FACING` using the noise filter.
   Tie-breaker: ambiguous → `USER-FACING`.
3. De-duplicate items describing the same change (e.g. a commit and its Jira ticket).
4. Bucket `USER-FACING` items into the buckets below, **emitting only buckets that have content**, in this order:
   - `### 🚀 New` — new capabilities
   - `### ✨ Improved` — enhancements / performance
   - `### 🐛 Fixed` — bugs a user could hit
   - `### 🔒 Security` — security-relevant changes
   - `### ⚠️ Breaking & Deprecations` — anything requiring user action
5. Rewrite each item benefit-first, one line, no internal identifiers.
6. Emit the changelog, then the audit footer.

## Output format

```
## <version> — <date>

### 🚀 New
- <benefit-first line>

### ✨ Improved
- <benefit-first line>

<only the buckets that have items>

---
Audit: <K> user-facing items published · <N> internal items filtered.
Filtered: <short labels>. <dedupe / reverted-feature notes>
```

---

## Eval Log

Tested against 3 separate, messy inputs. Outputs below are real runs of this skill.

### Input 1 — typical messy sprint (with a reverted feature trap)

```
TARGET: v2.4.0 — 2026-06-26
a1b2c3 feat: add CSV export to invoice list (INV-204)
d4e5f6 Merge branch 'main' into feature/csv-export
99aa11 fix typo in readme
22bb33 fix: invoice list crashed when customer name had emoji (INV-219)
44cc55 chore: bump eslint 8.1->8.2
66dd77 perf: invoice list query N+1 removed, ~3x faster on 10k rows (INV-230)
88ee99 wip
aabbcc feat: dark mode for dashboard (INV-241)
ddeeff revert: dark mode for dashboard (INV-241)
112233 security: patch XSS in comment field (SEC-12)
445566 style: run prettier
778899 docs: update contributing guide
INV-250 · Add Portuguese (pt-PT) localization · Story · Done
INV-251 · Refactor auth module · Task · In Progress
```

**Output 1**

```
## v2.4.0 — 2026-06-26

### 🚀 New
- Export your invoice list to CSV.
- The app is now available in Portuguese (Portugal).

### ✨ Improved
- The invoice list loads roughly 3× faster on large accounts.

### 🐛 Fixed
- Fixed a crash when a customer's name contained emoji.

### 🔒 Security
- Closed a cross-site-scripting vulnerability in the comment field.

---
Audit: 5 user-facing items published · 9 internal items filtered.
Filtered: merge commit, readme typo, eslint bump, wip, prettier, docs, auth refactor (not yet shipped). Note: "dark mode" was added (aabbcc) then reverted (ddeeff) in the same window — it did not ship, so it is intentionally not announced.
```

### Input 2 — release with a breaking change and a security dep-bump

```
TARGET: v3.0.0 — 2026-06-26
- fix: don't send duplicate welcome emails (GROW-88)
- Merge pull request #412 from acme/hotfix
- chore: update copyright year
- feat: bulk-archive for old projects (PM-12)
- fix: timezone wrong on exported reports for users in UTC+13 (RPT-9)
- refactor: extract PdfBuilder class
- feat!: remove legacy v1 API (BREAK-3)
- bump lodash 4.17.20 -> 4.17.21 (CVE-2021-23337 prototype pollution)
- test: add coverage for PdfBuilder
- ci: cache node_modules
```

**Output 2**

```
## v3.0.0 — 2026-06-26

### 🚀 New
- Bulk-archive old projects in a single action.

### 🐛 Fixed
- Welcome emails are no longer sent twice.
- Exported reports now show the correct time for users in far-eastern time zones (UTC+13).

### 🔒 Security
- Updated a third-party library to remove a known prototype-pollution vulnerability.

### ⚠️ Breaking & Deprecations
- The legacy v1 API has been removed. Migrate to v2 before upgrading.

---
Audit: 5 user-facing items published · 5 internal items filtered.
Filtered: merge PR, copyright bump, PdfBuilder refactor, PdfBuilder tests, CI cache. Note: the lodash bump is kept because it carries a CVE; routine bumps would be filtered.
```

### Input 3 — adversarial: almost all noise, one buried feature, a commit/Jira duplicate

```
TARGET: (none)
e1 Merge branch 'develop'
e2 chore: tidy imports
e3 fix: typo in error message
e4 style: reformat with black
e5 feat: customers can now download their data as a GDPR export (PRIV-7)
e6 ci: bump runner image
e7 docs: add architecture diagram
PRIV-7 · Self-service GDPR data export · Story · Done
OPS-3  · Migrate logging to new vendor · Task · Done
```

**Output 3**

```
## vNEXT — 2026-06-26

### 🚀 New
- Download a complete export of your personal data (GDPR self-service).

---
Audit: 1 user-facing item published · 7 internal items filtered.
Filtered: merge, tidy imports, typo, black reformat, CI runner bump, docs diagram, logging-vendor migration (internal-only, even though Done). Note: commit e5 and Jira PRIV-7 describe the same change — merged into one entry.
```

### Determinism check

Input 1 was re-run three times. On every pass the bucketing was identical
(5 published / 9 filtered), the revert pair was excluded, and the not-yet-shipped
auth refactor was filtered. Only the surface wording of the customer-facing lines
varied within a few words. The **decisions** — noise vs. user-facing, dedupe,
reverted-feature exclusion, "Done but internal" exclusion (OPS-3) — were stable
across runs. That decision-level stability is the skill's determinism guarantee;
prose phrasing is not pinned (and should not be).
