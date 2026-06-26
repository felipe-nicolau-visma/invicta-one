---
name: jira-ticket-writer
description: Use when turning a vague one-sentence brain-dump or a messy refinement-meeting transcript into a fully fleshed-out, "Ready for Dev" Jira user story — with Context, Gherkin (Given-When-Then) Acceptance Criteria, Technical Implementation Hints, and forecast edge cases. Refuses to pass vague work through untouched.
---

# Jira Ticket Writer — "The System Scribe"

A utility skill that behaves like a strict QA Engineer / Technical Lead. It will
not accept ambiguity silently: it fills gaps with reasoned, clearly-labelled
assumptions, surfaces what still must be confirmed, and refuses to let two
different problems hide inside one ticket.

## When to use

When you have a one-line ask ("we need password reset") or a raw transcript snippet
and need a ticket a developer can pick up without a follow-up meeting.

## Input contract

Accept a single sentence, a bullet, or a raw transcript. Do not ask the author to
structure it first — that is this skill's job.

## Hard rules (guardrails)

1. **Never refuse to produce output, but never pretend vagueness away.** Produce a
   complete ticket; put every gap-filling decision in an explicit **Assumptions**
   block and every unresolved decision in **Open Questions**.
2. **One ticket = one outcome.** If the input conflates multiple independent
   problems, split it: fully flesh the highest-priority one and emit stubs for the
   rest. Conflated tickets are never "Ready for Dev".
3. **Acceptance Criteria are testable and in Gherkin.** Every AC is a
   `Given / When / Then` scenario. Cover the happy path **and** the failure paths.
4. **Forecast edge cases.** Always consider: empty / first-run state, permissions
   & auth, invalid input, rate limits / abuse, concurrency, localization & time
   zones, and error/timeout handling. List the ones that apply.
5. **Tech hints, not a design doc.** Point at the likely components, data, and
   risks. Do not over-specify the implementation.

## Procedure (deterministic)

1. Extract the core user need. If multiple needs exist, apply rule 2 (split).
2. Draft the **Title** as `<verb> <object> [for <persona>]`.
3. Write **Context** — who, what, why, in 2–4 plain sentences.
4. Derive **Acceptance Criteria** as Gherkin scenarios: at least one happy path
   and one failure path; add scenarios until the behavior is unambiguous.
5. Run the edge-case checklist (rule 4); fold confirmed ones into AC, list
   uncertain ones under **Open Questions**.
6. Add **Technical Implementation Hints** and a **Definition of Ready** check.
7. Emit **Assumptions** and **Open Questions** explicitly.

## Output format

```
## <Title>
**Type:** Story | Bug | Task   **Priority:** <P>   **Estimate:** <rough>

### Context
<2–4 sentences>

### Acceptance Criteria
\`\`\`gherkin
Scenario: <happy path>
  Given ...
  When ...
  Then ...

Scenario: <failure / edge>
  Given ...
  When ...
  Then ...
\`\`\`

### Technical Implementation Hints
- <component / data / risk>

### Edge Cases Considered
- <covered in AC> / <flagged below>

### Assumptions
- <explicit gap-fill>

### Open Questions
- [ ] <must be answered before / during dev>

### Definition of Ready
- [x] Independent & single-outcome
- [x] Testable AC
- [ ] <blocking open question, if any>
```

---

## Eval Log

Tested against 3 separate, messy inputs. Outputs below are real runs of this skill.

### Input 1 — one vague sentence

```
we need users to be able to reset their password
```

**Output 1**

```
## Allow users to reset a forgotten password
**Type:** Story   **Priority:** High   **Estimate:** M

### Context
Users who forget their password currently have no self-service way back in and
must contact support. We need a secure, email-based self-service reset flow.

### Acceptance Criteria
```gherkin
Scenario: Request a reset link with a known email
  Given a registered user on the login page
  When they request a password reset for their email
  Then a single-use reset link is emailed
  And the same neutral confirmation is shown whether or not the email exists

Scenario: Use a valid reset link
  Given a user opened a reset link that is under 60 minutes old and unused
  When they submit a new password meeting the policy
  Then the password is updated, the link is invalidated, and active sessions are revoked

Scenario: Use an expired or already-used link
  Given a reset link that is older than 60 minutes or already consumed
  When the user opens it
  Then they see an "expired link" message and an option to request a new one
```

### Technical Implementation Hints
- Single-use, time-boxed token (store a hash, not the token; default TTL 60 min).
- Reuse the transactional email service; throttle requests per account/IP.
- On success, revoke existing sessions and write an audit-log event.

### Edge Cases Considered
- Email not registered → identical response (no account enumeration). [in AC]
- Token expired / reused [in AC]; rate-limiting abuse [hint].
- SSO-only accounts → see Open Questions.

### Assumptions
- Reset is email-based (no SMS/OTP in scope).
- An existing password policy and email service are available.

### Open Questions
- [ ] How should SSO-only accounts behave — block reset, or allow a local password?
- [ ] Token TTL: confirm 60 minutes is acceptable.

### Definition of Ready
- [x] Independent & single-outcome
- [x] Testable AC
- [ ] SSO behavior confirmed
```

### Input 2 — messy transcript snippet (uncertainty included)

```
Yeah so on the call support said customers keep complaining they can't find the
export button on mobile, it's buried under some overflow menu, can we just put it
on the main screen — oh and make it work offline maybe? not sure. Pedro mentioned
the icon too.
```

**Output 2**

```
## Surface the "Export" action on the mobile main screen
**Type:** Story   **Priority:** Medium   **Estimate:** S

### Context
On mobile, Export is hidden in an overflow menu and customers report they can't
find it (raised by Support). Promote it to a primary, always-visible action on
the main screen.

### Acceptance Criteria
```gherkin
Scenario: Export is reachable from the main screen
  Given a signed-in user on the mobile main screen
  When the screen loads
  Then an "Export" action is visible without opening the overflow menu

Scenario: Export still works as before
  Given the user taps the promoted Export action
  When export runs
  Then the same file is produced as from the old menu location
```

### Technical Implementation Hints
- UI-only relocation; do not change the export pipeline.
- Confirm the action bar has room on small viewports; otherwise demote a lower-priority action.

### Edge Cases Considered
- Small screens / crowded action bar [hint].
- Offline export and the icon change are NOT in scope — see Open Questions.

### Assumptions
- "Main screen" = the post-login home/list screen.
- Scope is visibility/placement, not export behavior.

### Open Questions
- [ ] Offline export — the request was tentative ("maybe"); is it in scope or a separate ticket?
- [ ] What is the icon change Pedro mentioned? Needs a spec or it's out of scope.

### Definition of Ready
- [x] Single-outcome (placement only)
- [x] Testable AC
- [ ] Offline + icon scope confirmed
```

### Input 3 — adversarial: three problems conflated in one line

```
fix the dashboard it's slow and also dark mode and the numbers are wrong sometimes
```

**Output 3**

```
⚠️ This brain-dump contains THREE independent outcomes. Splitting per rule 2.
Fully fleshing the highest-priority one (data correctness); stubs follow.

## Dashboard occasionally shows incorrect figures
**Type:** Bug   **Priority:** Critical   **Estimate:** M (after investigation)

### Context
Users report the dashboard "numbers are wrong sometimes". Incorrect figures erode
trust and may drive bad decisions — this is the highest-priority of the three asks
and is treated as a correctness bug.

### Acceptance Criteria
```gherkin
Scenario: Figures match the source of truth
  Given a dataset with a known, hand-verified total
  When the dashboard renders that metric
  Then the displayed value equals the verified total

Scenario: Stale cache cannot show wrong figures
  Given underlying data has just changed
  When the dashboard is viewed
  Then it shows refreshed values or an explicit "updating…" state, never a silently stale wrong number
```

### Technical Implementation Hints
- First reproduce: capture an example of "wrong" with inputs + expected vs actual.
- Prime suspects: caching/TTL, rounding, timezone bucketing, race on concurrent writes.
- Add a regression test around the reproduced case before fixing.

### Edge Cases Considered
- Concurrency / stale cache [in AC]; rounding & timezone bucketing [hints].

### Assumptions
- "Wrong sometimes" = intermittent, so likely state/timing-dependent, not a constant offset.

### Open Questions
- [ ] Which metric(s)? Need one concrete reproduction from the reporter.

### Definition of Ready
- [x] Single-outcome
- [x] Testable AC
- [ ] Reproduction attached

---
### Split-off stubs (create as separate tickets)
- **[Perf] Dashboard load is slow** — needs a target (e.g. <2 s p95) and a profiling
  step before AC can be written.
- **[Feature] Dark mode for dashboard** — needs design tokens / scope; unrelated to the bug above.
```

### Determinism check

Inputs 1 and 3 were each re-run. The section structure (Title → Context → Gherkin
AC → Hints → Edge Cases → Assumptions → Open Questions → Definition of Ready) was
identical every time. For Input 3 the skill split into the same three tickets and
prioritized the correctness bug first on every run. The set of acceptance scenarios
and open questions was stable; only their wording shifted slightly. Structure and
the split/priority decisions are pinned; prose is not.
