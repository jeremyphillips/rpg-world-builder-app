# Organization taxonomy discovery

**Status:** Research digest (corpus v0.1 frozen)  
**Do not start here for the shipped model** — read
[`organizations-classification.md`](../../apps/dashboard/docs/organizations-classification.md) or
[`organization-taxonomy.md`](../roadmap/organization-taxonomy.md) first.

This file is an **index and digest** of the 150-concept organization taxonomy investigation
(Phases 1–8). It is not a condensed replay of every phase. The full frozen record — corpus table,
150-row mapping matrix, gap taxonomy, preset candidate report, and phase-by-phase evidence — lives
unchanged in the archive:

**[`archive/organization-taxonomy-discovery-v0.1.md`](./archive/organization-taxonomy-discovery-v0.1.md)**
(~2,020 lines; do not rewrite in place)

Companion pattern: [`building-taxonomy-discovery.md`](./building-taxonomy-discovery.md).

| Document                                                                                               | Role                                              |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| [`organization-taxonomy.md`](../roadmap/organization-taxonomy.md)                                      | Planning authority, current counts, deferred work |
| [`organization-taxonomy-evidence.md`](../analysis/organization-taxonomy-evidence.md)                   | Reusable semantic gates                           |
| [`organizations-classification.md`](../../apps/dashboard/docs/organizations-classification.md)         | Shipped runtime model                             |
| [`archive/organization-taxonomy-discovery-v0.1.md`](./archive/organization-taxonomy-discovery-v0.1.md) | Frozen Phases 1–8 evidence                        |

Interactive review of the corpus lives in the Cursor canvas
`organization-taxonomy-discovery.canvas.tsx` (IDE-local).

---

## Purpose

Pressure-test whether a **small, stable classification model** (domain + optional form + missions)
could represent a broad library of familiar organization concepts **without** cataloging every
famous noun as production vocabulary.

**Success is not 150 production presets.** The likely end state is a stable semantic model that can
_express_ a broad corpus, with authoring presets as ephemeral projections onto that model.

A concept counts as **covered** when the model can express it (domain, optional form, missions,
unset values, and the authored name) — even if it never becomes a canonical id.

---

## Method

```text
audit the shipped model (Phase 1)
→ freeze 150 familiar organization concepts (Phase 2)
→ map against existing domain / form / activities only (Phase 3)
→ classify pressure: missing, overloaded, wrong dimension, … (Phase 4)
→ quantify coverage (Phase 5)
→ recommend smallest coherent refinements (Phase 6)
→ identify preset-layer concepts (Phase 7)
→ settle outcomes and remaining questions (Phase 8)
```

### Rules in force during discovery

- No changes to organization vocab registries, schemas, fixtures, or presets while mapping.
- Do not invent production vocabulary during mapping — missing values are written `—`.
- Readability **groups** are a coverage device, not a second taxonomy.
- **Evidence bar for a new vocab value:** several materially different concepts, not one preset.

### Audit-time model (Phase 1 snapshot)

Discovery mapped against **domain + form + activities** (14 activity ids at audit time). Subsequent
product passes split activities into **Functions + Practices**, added forms such as `force` and
`office`, and expanded presets. Current shipped ids live in contracts and the roadmap — not in this
digest.

For the audit-time ownership table and rejected-form tests, see archive Phase 1.

---

## Corpus metadata (v0.1)

**150 concepts** — familiar organization nouns an RPG author would recognize and choose directly.
Mundane and fantasy mixed. Wording variants excluded (no “city watch” + “town watch”).

**Groups** (readability / coverage quotas only — not persisted taxonomy):

| Group                                  |   Count | Quota role                                     |
| -------------------------------------- | ------: | ---------------------------------------------- |
| Government / administrative            |      12 | State machinery vs court vs council            |
| Political / revolutionary              |       8 | Influence vs governing                         |
| Military / martial                     |      12 | Standing, irregular, specialist, fantasy force |
| Policing / security / intelligence     |       8 | Civic, clandestine, commercial, faith-policing |
| Religious                              |      12 | Parish through cult                            |
| Commercial / trade                     |      14 | Operating firms vs membership trade bodies     |
| Financial                              |       6 | Bank vs petty credit vs state mint             |
| Occupational / guild                   |      10 | Craft, labor, profession                       |
| Industrial / production                |       6 | Scale production vs craft guild                |
| Academic / scholarly                   |      10 | Teaching, research, magical study              |
| Medical                                |       5 | Care vs profession vs emergency                |
| Charitable / civic / social / cultural |      12 | Mutual aid, kinship, culture                   |
| Criminal / clandestine                 |      12 | Guild through crew, classic underworld         |
| Mercenary / adventuring / exploratory  |       8 | Hired force vs freelance vs expedition         |
| Transportation / shipping              |       6 | Sea, river, road, post                         |
| Agriculture / resource extraction      |       5 | Grow, harvest, extract                         |
| Secret societies                       |       4 | Concealment, informal magical fellowship       |
| **Total**                              | **150** |                                                |

### Required contrast families

Explicit semantic stress tests — full id lists and per-concept rows are in archive Phase 2 only.

| Family              | Concepts tested (sample)                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `religious_family`  | church, temple organization, religious order, monastery, missionary society, cult           |
| `military_security` | army, navy, militia, mercenary company, royal guard, city watch, knightly order             |
| `commercial_family` | bank, trading company, merchant house, merchant guild, shipping company, market association |
| `academic_family`   | academy, university, scholarly society, mage college, research institute, guild of scholars |
| `criminal_family`   | thieves guild, gang, smuggling ring, criminal syndicate, pirate crew, assassins order       |
| `government_family` | government ministry, city council, royal court, bureaucracy                                 |

---

## Headline coverage results (Phase 5)

Denominator: **150 concepts**. Form optional — omitted form is honest absence. Activities
multi-valued at audit time.

### Fit (mapping quality against audit-time vocab)

| Fit               | Count | Share |
| ----------------- | ----: | ----: |
| `clean`           |     9 |    6% |
| `acceptable`      |   117 |   78% |
| `awkward`         |    24 |   16% |
| `unrepresentable` |     0 |    0% |

**84%** map without strain (`clean` + `acceptable`). Zero unrepresentable. `other` domain unused.

Awkward concentration (not diffuse):

- **9 of 24** — missing **force** family (8 military + `pirate_crew`)
- **4 of 24** — teaching institutions on **`association`** escape hatch
- Remainder — one-off least-wrong domains or unnamed distinctive work

Confidence: 75 high, 74 medium, 1 low (`succession_cabal`) — low-confidence rows do not drive vocab.

### Domain (healthy)

All ten shipped domains used except `other`. No concept required a new sphere. Largest buckets:
commercial (33), government (21), occupational (20) — reflect corpus composition, not dump-category
failure.

### Form pressure

**46 concepts (31%) omitted form** — concentrated in government (16) and military (11). That omitted
mass is the **force / office** evidence, not authors forgetting form.

`association` overload: **4** teaching-institution stretches (academy family), not 30.

### Activity / mission pressure (audit-time)

**62 concepts (41%)** had ≥1 activity. Commercial, community, political, and criminal domains were
mostly activity-empty — the **trade / production / transport / administration** hole.

**81% of concepts (122/150)** share a domain/form/activities signature with at least one other —
argument for preset-layer famous nouns, not 122 new ids.

Full domain/form/activity tables, signature collapse buckets, and the 150-row matrix: archive
Phases 3 and 5.

---

## Conclusions that survived the audit

Phase 5 distilled four durable findings. Phase 6 turned them into one **high-confidence vocabulary
package**. Phase 8 confirmed both.

### Four pressure findings (Phase 5)

1. **Domain is healthy** — ten domains held; no new sphere proven; do not multi-value domain.
2. **`force` and `office` are the meaningful form holes** — armed hosts and appointed institutions
   lack a constitution; omitted form is honest, not missing domain.
3. **Activities need reusable missions** — not craft catalogs; narrow trades stay narrow or move to
   practices later.
4. **Most familiar nouns belong at the preset layer** — 81 adjacent names (navy, temple, university,
   merchant house, …) share signatures with strong starting points.

### High-confidence package (Phase 6)

Implement **together** (two forms + four missions at audit-time; later split into Functions +
Practices):

| Rank | Proposed id      | Dimension | Core would-use | Role                                 |
| ---- | ---------------- | --------- | -------------: | ------------------------------------ |
| High | `force`          | Form      |              9 | Armed/crewed host constitution       |
| High | `office`         | Form      |             12 | Appointed/statutory institution      |
| High | `trade`          | Mission   |             10 | Operating-firm commerce              |
| High | `production`     | Mission   |              7 | Making/extracting ≠ trade            |
| High | `transport`      | Mission   |              6 | Moving people/goods/messages         |
| High | `administration` | Mission   |              7 | Government work; pairs with `office` |

Medium candidates (`care`, `policing`, `advocacy`, clandestine trait) and low candidates (`court`,
`crew`, `college`, `theft`, …) were **not** part of this package. Definitions and overlap analysis:
archive Phase 6.

### Phase 8 outcome answers (six brief questions)

| #   | Question                                                  | Answer                                                                                                  |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Does domain + form + missions provide a clean foundation? | **Yes**, with two form holes and sparse missions. Zero unrepresentable. 84% clean+acceptable.           |
| 2   | Poorly defined or overloaded dimensions?                  | **Form and mission grain**, not domain.                                                                 |
| 3   | Strong repeated vocabulary evidence?                      | **`force`, `office`, `trade`, `production`, `transport`, `administration`**. Not a new domain.          |
| 4   | Missing independent dimension?                            | **Not proven.** Clandestine strongest candidate; not admitted.                                          |
| 5   | Preset-layer distinctions?                                | **81 adjacent names** — famous nouns sharing signatures.                                                |
| 6   | Smallest coherent model?                                  | Keep ten domains; add the high-confidence package; grow presets; absorb rest as “start from X, rename.” |

Subsequent product passes shipped this package (plus preset expansion and the functions/practices
split). Current counts: [`organization-taxonomy.md`](../roadmap/organization-taxonomy.md).

---

## Settled — do not reopen (Phase 8)

Treat as constraints unless the reopen rule below fires.

- Do **not** add a domain or multi-value domain.
- Do **not** promote army, church, bank, or academy to **forms** (familiar nouns stay presets).
- Do **not** add craft-specific mission/practice siblings without separate cross-preset evidence.
- Do **not** add geographic scope, parent-org, or membership-vs-institution fields.
- Do **not** add `court` or `crew` forms — fold into `office` / `force`.
- Do **not** add crime-catalog activities (`theft`, …).
- **Navy** stays adjacent to army; **temple** to church; **university** to academy — even after
  `force`.
- **`congregation`** earns its keep as church-vs-order contrast — do not generalize in the same pass
  as `force`/`office`.
- **Clandestine** is not part of the high-confidence taxonomy package.

Full rationale: archive Phase 8 “Settled — do not reopen.”

---

## Rejected directions (and why)

| Direction                              | Verdict  | Why                                                                     |
| -------------------------------------- | -------- | ----------------------------------------------------------------------- |
| New domain                             | Rejected | No concept required one; `other` unused                                 |
| Multi-valued domain                    | Rejected | 37 secondaries; every concept kept an honest primary                    |
| Army/church/bank/academy as forms      | Rejected | Form admission tests; identity belongs in presets                       |
| Craft activity per trade               | Rejected | Catalog trap; narrow values only with preset evidence                   |
| `theft` and crime-catalog activities   | Rejected | Opens fencing, extortion, assassination, …                              |
| Geographic scope field                 | Rejected | Failed independent-dimension bar                                        |
| Parent/subordinate org field           | Rejected | Relationship graph, not classification                                  |
| Membership vs institution field        | Rejected | Form already separates membership bodies                                |
| Clandestine visibility field (v1)      | Rejected | No consumer needs filter independent of domain                          |
| `college` / generic `institution` form | Deferred | Collides with `office`; one teaching family                             |
| Domain/form/mission allowlist          | Rejected | Would block honest cross-domain forms (`force` on criminal pirate crew) |

Gap taxonomy detail: archive Phase 4.

---

## Taxonomy research still open (reopen conditions)

These are **classification research** questions — not product implementation choices. Product
decisions arising from discovery (preset picker growth, overview facets, test unlocks) live in
[`organization-taxonomy.md`](../roadmap/organization-taxonomy.md).

| Topic                                         | Evidence today                                                                      | Reopen when                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Clandestine dimension**                     | Crosses domains; ownership unsolved (field vs overlay vs preset)                    | A concrete downstream consumer must filter “hidden” independently of domain      |
| **`college` / teaching form**                 | Academy family (4) on `association`; `institution` collides with `office`           | More than the academy-family four need the same constitution distinction         |
| **`policing` mission vs `defense` euphemism** | City watch / marshals share force signature awkwardly                               | Several materially different presets need policing distinct from warfare/defense |
| **Mixed mission grain**                       | `blacksmithing`, `brewing`, `banking`, `smuggling` unusually narrow beside missions | Deliberate audit chooses alias, retire, or practice-layer move — not one preset  |
| **Medium missions** (`care`, `advocacy`, …)   | Political/community domains activity-empty at audit                                 | Repeated cross-preset pressure after functions/practices split                   |

**Stopping rule:** Do not open a new taxonomy investigation from an isolated awkward example. Reopen
only when production authoring cannot honestly express a needed concept, several materially different
presets require the same missing distinction, or a concrete downstream consumer requires that
distinction.

---

## Where to go next

| Need                                                            | Read                                                                                                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shipped model and authoring                                     | [`organizations-classification.md`](../../apps/dashboard/docs/organizations-classification.md)                                                                      |
| Current counts, deferred presets, implementation follow-through | [`organization-taxonomy.md`](../roadmap/organization-taxonomy.md)                                                                                                   |
| Admission gates for new Functions/Practices                     | [`organization-taxonomy-evidence.md`](../analysis/organization-taxonomy-evidence.md)                                                                                |
| Full 150-concept table + 150-row matrix + Phases 1–8 verbatim   | [`archive/organization-taxonomy-discovery-v0.1.md`](./archive/organization-taxonomy-discovery-v0.1.md)                                                              |
| Preset discovery disposition ledger                             | [`organization-preset-coverage.fixture.ts`](../../apps/dashboard/src/features/content/organizations/lib/__tests__/fixtures/organization-preset-coverage.fixture.ts) |

**Do not summarize away the archive.** When this digest and the archive disagree on historical
counts or audit-time vocabulary, the archive wins for research provenance; contracts tests win for
what ships today.
