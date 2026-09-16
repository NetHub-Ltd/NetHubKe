# Agent Operating Instructions — NetHubKe

> **Mandatory for all AI agents working on this repository.**

## 1. Load Skills & Trackers First

Before proposing or implementing anything:

1. Read this file completely.
2. Read `.trackers/repo-state.md`, `.trackers/task.md`, `.trackers/rollback.md`.
3. **Complete the SSO Platform progress check (section 2)** — non-optional until the program umbrella is closed.

---

## 2. SSO Platform Program — Mandatory Progress Check (Non-Optional)

> **Until the SSO platform program is fully complete, every AI agent session on this repository MUST check and report program progress before doing other work.**

This is **not optional**. It applies to every agent, every session, regardless of the user’s stated task (unless the user explicitly prioritizes a production hotfix and still receives a one-line program status).

### 2.1 Program identity

| Item | Value |
|------|--------|
| **Goal** | Keycloak = IdP; NetHubKe = multi-product token AS + central console (services, billing, SSO launch hop); product apps (Tawala, …) trust NetHubKe JWKS |
| **Project board** | https://github.com/orgs/NetHub-Ltd/projects/4 |
| **Umbrella issue** | https://github.com/NetHub-Ltd/NetHubKe/issues/57 |
| **Milestones** | **N0 → N10** (GitHub milestones on this repo) |
| **Work issues** | #40–#56 (and any linked follow-ups on the board) |
| **Design reference** | `NetHubKe_SSO_Platform_Audit_and_Dashboard_Redesign.pdf` (project artifacts) |
| **Database** | **Postgres only** (no SQLite) |
| **Cache** | Redis for JWKS, active kid, entitlements, rate limits |

### 2.2 Required actions at session start

Before implementing **any** feature, fix, or refactor, the agent **must**:

1. Open or query **Project #4** and/or issues **#40–#57**.
2. Determine:
   - Which milestone is **current** (first incomplete **N0 → N10** in order)
   - Which issues in that milestone are open vs closed
   - Whether feature flags for later milestones have been enabled early (they must not be, without explicit approval)
3. **Report a short status block** to the user, for example:

```text
SSO program: N2 in progress — #44 open, #45 open. Exchange flag still off. Next: signing_keys + JWKS.
```

4. **Refuse to skip milestones.** Work proceeds **N0 → N1 → … → N10** unless the user explicitly reprioritizes **within** the approved program (e.g. docs in parallel). Agents must **not**:
   - Jump to Billing UI (N8) or Launch hop (N7) before managed keys (N2) and generic exchange (N3) exist
   - Put product private keys or long-lived product secrets in the frontend
   - Introduce a second IdP login UI that bypasses Keycloak
   - Use SQLite or non-Postgres primary stores
   - Add per-request introspection hops from product apps into NetHub on hot paths (products verify JWTs locally via JWKS)
   - Create cashier/staff rows for Tawala (or other product floor users) in the NetHub database

5. If the user’s request conflicts with the above, the agent must **decline**, explain the dependency order, and point at the board.

### 2.3 Non-blocking / flags rule

New AS and console paths ship **behind flags default off** (or docs-only) until the matching milestone’s acceptance criteria are met on staging. Existing Keycloak login + `/users/sync` + Profile must keep working unless a milestone explicitly replaces them.

### 2.4 Every push / PR rule

- Topic branches; PRs target **`dev`** (not `master`/`main` unless user directs).
- PR description must name the **milestone (N#)** and **issue number(s)**.
- Do not merge work that is unrelated to the current program milestone without calling out drift and getting confirmation.
- Update `.trackers/task.md` and `repo-state.md` on every meaningful state change.

### 2.5 When the program is “fully done”

Only when:

- [ ] N0–N10 acceptance criteria met
- [ ] Umbrella #57 closed
- [ ] Project board shows program complete
- [ ] Success criteria: one login, see services, launch Tawala via exchange, view billing, federated logout — on Postgres + Redis

After that, this section may be reduced in a dedicated docs PR. **Until then, agents must keep checking progress every session.**

---

## 3. Engineer Mode Defaults

- Propose before large implementation; wait for approval when the user requires it.
- Prefer small PRs aligned to a single issue/milestone.
- Verify lint/tests/build for touched packages (`apps/backend`, `apps/frontend`).
- No secrets in git; private signing material only on NetHubKe (DB/KMS), never in product frontends.

---

## 4. Session Start Checklist

```
[ ] Read AGENTS.md (this file)
[ ] SSO program progress check (section 2) — mandatory until #57 closed
[ ] Report short N0–N10 status to the user
[ ] Read .trackers/repo-state.md, task.md, rollback.md
[ ] Confirm work maps to current milestone / open issue
[ ] PR target = dev; cite milestone + issue in PR body
[ ] Update trackers after changes
```

---

**Last updated:** 2026-09-16  
**Program board:** https://github.com/orgs/NetHub-Ltd/projects/4  
**Umbrella:** #57
