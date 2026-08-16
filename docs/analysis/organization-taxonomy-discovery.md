# Organization Taxonomy Discovery

> **Status:** Analysis complete — Phases 1–8. Pass A vocabulary shipped (matrix v0.2).
> **Planning authority:** None  
> **Runtime classification:** `[organization.ts](../../packages/contracts/src/rpg/content/organization.ts)`,
> `[organization-domain.ts](../../packages/contracts/src/rpg/vocab/organization-domain.ts)`,
> `[organization-form.ts](../../packages/contracts/src/rpg/vocab/organization-form.ts)`,
> `[organization-activity.ts](../../packages/contracts/src/rpg/vocab/organization-activity.ts)`,
> `[organization-authoring-preset.ts](../../packages/contracts/src/rpg/vocab/organization-authoring-preset.ts)`
>
> **Frozen evidence set — corpus v0.1 (150 concepts).** Phases 1–8 below are
> discovery evidence. They must not be rewritten in place. Pass A (vocab +
> army recipe + matrix v0.2) is recorded after Phase 8. It does not reopen
> the corpus or rewrite v0.1 mappings.

Working artifact for pressure-testing organization classification before expanding
production vocabulary or `ORGANIZATION_AUTHORING_PRESETS`. Companion pattern:
`[building-taxonomy-discovery.md](./building-taxonomy-discovery.md)`.

| Phase                                | Status                     |
| ------------------------------------ | -------------------------- |
| 1 — Current model audit              | **Done**                   |
| 2 — Corpus collection (150)          | **Done — corpus v0.1**     |
| 3 — Map corpus to existing vocab     | **Done — matrix v0.1**     |
| 4 — Gap taxonomy                     | **Done — taxonomy v0.1**   |
| 5 — Coverage and vocabulary pressure | **Done — coverage v0.1**   |
| 6 — Candidate refinements            | **Done — candidates v0.1** |
| 7 — Preset candidate report          | **Done — presets v0.1**    |
| 8 — Open questions                   | **Done — questions v0.1**  |

## Success definition

**Success is not 150 production presets.** The likely end state is a small,
stable semantic model that can represent a broad familiar-organization corpus,
with authoring presets as ephemeral projections onto that model.

A concept the model can _express_ (via domain, optional form, activities, unset
values, and the authored name) counts as covered even if it never becomes a
canonical id.

## Method

```text
audit the shipped model
→ freeze 150 familiar organization concepts
→ map against existing domain / form / activities only
→ classify pressure (missing, overloaded, wrong dimension, …)
→ quantify coverage
→ recommend the smallest coherent refinements
→ identify which concepts belong at the preset layer
```

Rules in force during discovery:

- No changes to organization vocab registries, schemas, fixtures, or
  `ORGANIZATION_AUTHORING_PRESETS`.
- Do not invent production vocabulary while mapping. Missing values are written
  `—`.
- Readability groups are a coverage device, not a second taxonomy.
- Evidence bar for a new vocab value: several materially different concepts, not
  one preset.

Interactive review of this corpus lives in the Cursor canvas
`organization-taxonomy-discovery.canvas.tsx` (IDE-local; this markdown is the
git-durable archive).

---

# Phase 1 — Current model audit

Audit-time snapshot. Form/activity counts and the rejected-`force` test below
are what discovery found. Pass A updated production vocabulary afterward;
current ids live in contracts and in the Pass A section.

## Ownership

SSOT is `@rpg/contracts`. Closed vocabularies follow the two-layer
`*_TERM` / `*_ENTRIES` pattern.

| Concern                    | Owner                                                                                                                                  | Notes                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Content type term          | `[content-type-terms.ts](../../packages/contracts/src/rpg/content/lib/content-type-terms.ts)`                                          | “A campaign-authored group, institution, faction, or association.”                                                                       |
| Publish/draft body         | `[organization.ts](../../packages/contracts/src/rpg/content/organization.ts)`                                                          | Domain required on publish; form optional; activities unique array default `[]`.                                                         |
| Domain vocab               | `[organization-domain.ts](../../packages/contracts/src/rpg/vocab/organization-domain.ts)`                                              | 10 ids. Alias `professional` → `occupational` (discovery only; id is not accepted).                                                      |
| Form vocab                 | `[organization-form.ts](../../packages/contracts/src/rpg/vocab/organization-form.ts)`                                                  | 7 ids. Tests reject `army`, `bank`, `church`, `academy`, `house`, `force`.                                                               |
| Activity vocab             | `[organization-activity.ts](../../packages/contracts/src/rpg/vocab/organization-activity.ts)`                                          | 14 ids. Tests reject `advocacy`.                                                                                                         |
| Classification entry shape | `[organization-classification-entry.ts](../../packages/contracts/src/rpg/vocab/organization-classification-entry.ts)`                  | `GameTermEntry` + optional `aliases` / `searchTerms` + five `memberTitles`.                                                              |
| Discovery projection       | `[organization-classification-discovery.ts](../../packages/contracts/src/rpg/vocab/organization-classification-discovery.ts)`          | Concatenates domain + form + activity discovery terms.                                                                                   |
| Authoring presets          | `[organization-authoring-preset.ts](../../packages/contracts/src/rpg/vocab/organization-authoring-preset.ts)`                          | Six recipes. `applyOrganizationAuthoringPreset` returns editable defaults; no preset id.                                                 |
| Member-title composition   | `[organization-member-title.ts](../../packages/contracts/src/rpg/vocab/organization-member-title.ts)`                                  | Activities, then form, then domain, interleaved by local rank.                                                                           |
| Location connections       | `[organization-location-connection.ts](../../packages/contracts/src/rpg/vocab/location/organization-location-connection.ts)`           | Relationship kinds, not organization classification.                                                                                     |
| Persistence                | `[homebrew-organization.model.ts](../../apps/api/src/features/content/organizations/homebrew-organization.model.ts)`                   | Mongoose enums from the same `*_IDS` arrays.                                                                                             |
| Authoring UI               | `[organization-form-projection.ts](../../apps/dashboard/src/features/content/lib/forms/organization-form-projection.ts)`               | Preset select + domain chips + optional form + activity chips.                                                                           |
| Overview / filter          | `[organizations-overview-columns.tsx](../../apps/dashboard/src/features/content/organizations/lib/organizations-overview-columns.tsx)` | Domain column and Domain filter only.                                                                                                    |
| Detail display             | `[organization-display.ts](../../apps/dashboard/src/features/content/organizations/lib/organization-display.ts)`                       | Stats: Domain, optional Form, Activities. No preset.                                                                                     |
| Global search              | `[project-content-document.ts](../../apps/api/src/features/global-search/lib/project-content-document.ts)`                             | Secondary = domain label; keywords include classification discovery text.                                                                |
| Catalog                    | none                                                                                                                                   | `bundledContent: 'none'` — `[content-type-integration-manifest.ts](../../tools/content-types/src/content-type-integration-manifest.ts)`. |
| Historical V1              | `[organization-content-type-plan.md](../roadmap/organization-content-type-plan.md)`                                                    | `organizationKind` + kind-scoped subtypes. Replaced by domain / form / activities.                                                       |

Presets are **not** a persisted axis. Form-only `authoringPresetId` is stripped
on create (`[buildOrganizationCreateInput](../../apps/dashboard/src/features/content/lib/forms/organization-form-projection.ts)`).
Building evidence states the same rule for location presets
(`[building-taxonomy-evidence.md](./building-taxonomy-evidence.md)`).

## Schema and validation

Publish-complete body (`[organization.ts](../../packages/contracts/src/rpg/content/organization.ts)`):

```ts
{
  name: string
  imageKey?: string
  description?: string
  organizationDomain: OrganizationDomain   // required
  organizationForm?: OrganizationForm      // optional
  activities: OrganizationActivity[]       // default []; unique
  connections: { locations: ... }          // default empty
}
```

Drafts may omit `organizationDomain`. Blank draft names normalize to
`Untitled Organization`. `organizationForm: null` on update `$unset`s the stored
form. Domain and form are independent: changing domain does not clear form
(`[organization-classification-write.test.ts](../../apps/api/src/features/content/organizations/organization-classification-write.test.ts)`).
There is no pair allowlist between domain, form, and activities.

## Vocabulary inventories

### Domain — “The primary institutional or social sphere in which an organization operates.”

| Id             | Label        | Intended coverage (from description)                                     |
| -------------- | ------------ | ------------------------------------------------------------------------ |
| `government`   | Government   | Public governing, administrative, legislative, or judicial authority     |
| `political`    | Political    | Political influence, representation, advocacy, or change                 |
| `religious`    | Religious    | Faith, worship, ministry, doctrine, or sacred stewardship                |
| `military`     | Military     | Armed command, defense, or warfare                                       |
| `criminal`     | Criminal     | Illicit enterprise or activity                                           |
| `commercial`   | Commercial   | Produce, trade, finance, or operate for economic exchange                |
| `occupational` | Occupational | Serve, regulate, represent, or develop a trade or professional community |
| `academic`     | Academic     | Education, research, scholarship, or knowledge stewardship               |
| `community`    | Community    | Kinship, locality, mutual aid, civic participation, or fellowship        |
| `other`        | Other        | No useful established domain match                                       |

Single-valued. Required on publish. `other` is an explicit residual, not a
hidden domain. V1 called this `organizationKind` and used `professional` where
the runtime now uses `occupational` (alias retained for discovery).

### Form — “How an organization is constituted independently of its domain or activities.”

| Id             | Label        | Intended coverage (from description)                                         | Discovery extras        |
| -------------- | ------------ | ---------------------------------------------------------------------------- | ----------------------- |
| `association`  | Association  | Membership body organized around a shared purpose or constituency            | membership organization |
| `congregation` | Congregation | Gathered membership body organized around shared **religious** practice      | faith community         |
| `company`      | Company      | Constituted as an operating enterprise                                       | business, enterprise    |
| `cooperative`  | Cooperative  | Jointly owned or governed by participating members                           | co-op                   |
| `guild`        | Guild        | Membership body that governs or supports a shared practice or trade          | brotherhood, trade body |
| `network`      | Network      | Distributed organization coordinated through connected participants or cells | ring, syndicate         |
| `order`        | Order        | Structured membership body organized around a rule, calling, or discipline   | brotherhood, society    |

Optional. The form test file names the set “reusable and narrow” and **rejects**
familiar nouns `army`, `bank`, `church`, `academy` as form ids. That is a locked
product decision: those words are presets, not forms.

`congregation` is the only form whose definition is domain-specific (religious
practice). `network` discovery terms include `syndicate`, which is also a
familiar criminal-organization noun.

### Activity — “Sustained work, trade, mission, or practice performed by an organization.”

| Id               | Label          | Grain                     |
| ---------------- | -------------- | ------------------------- |
| `blacksmithing`  | Blacksmithing  | Trade / production        |
| `brewing`        | Brewing        | Trade / production        |
| `worship`        | Worship        | Institutional mission     |
| `ministry`       | Ministry       | Institutional mission     |
| `warfare`        | Warfare        | Institutional mission     |
| `defense`        | Defense        | Institutional mission     |
| `banking`        | Banking        | Institutional / financial |
| `finance`        | Finance        | Institutional / financial |
| `education`      | Education      | Institutional mission     |
| `training`       | Training       | Institutional mission     |
| `research`       | Research       | Institutional mission     |
| `standards`      | Standards      | Occupational governance   |
| `apprenticeship` | Apprenticeship | Occupational formation    |
| `smuggling`      | Smuggling      | Illicit practice          |

Multi-valued, ordered, unique. Empty is valid. Grain is mixed: two craft trades
sit beside institutional missions. Building evidence already defers
“Apothecary Organization activity” to this audit
(`[building-taxonomy-evidence.md](./building-taxonomy-evidence.md)`).

## Authoring presets (production, unchanged)

Presets are recipes. Selecting one writes domain / optional form / activities,
then clears `authoringPresetId`. Army omits form because no current form is
considered honest (“omits an equivocal form from the Army recipe”).

| Id               | Label          | Domain         | Form           | Activities                                |
| ---------------- | -------------- | -------------- | -------------- | ----------------------------------------- |
| `church`         | Church         | `religious`    | `congregation` | `worship`, `ministry`                     |
| `army`           | Army           | `military`     | —              | `warfare`, `defense`                      |
| `bank`           | Bank           | `commercial`   | `company`      | `banking`, `finance`                      |
| `academy`        | Academy        | `academic`     | `association`  | `education`, `training`, `research`       |
| `craft_guild`    | Craft guild    | `occupational` | `guild`        | `standards`, `apprenticeship`, `training` |
| `smuggling_ring` | Smuggling ring | `criminal`     | `network`      | `smuggling`                               |

UI label: “Start from familiar type”. Same field set is reused under
`operatorOrganization.*` when creating an organization from a building flow.

## Authoring UI, display, search

- Create/edit: preset select → description → Domain chips (single, required) →
  Form select (optional disclosure) → Activities chips (multi).
- Overview: Domain column + Domain filter. Form and activities are not overview
  facets.
- Detail stats: Domain, Form if set, Activities if non-empty. Preset is never
  shown.
- Search secondary line is the domain label. Keyword field concatenates
  classification discovery terms (labels, aliases, searchTerms).

## Member titles (downstream consumer)

Each domain, form, and activity entry owns a five-slot title list. Suggestions
interleave by rank: activities first, then form, then domain. Titles are
presentation, not a fourth classification axis — but they will feel wrong if
form/activity values are used as escape hatches.

## Related fields that are not classification

These exist and must not be treated as missing organization-type dimensions
without corpus evidence:

- Location connections (`owns`, `operator`, `headquarters`, `governs`, …) —
  place relationships.
- Character memberships (`organizationId` + optional `title`) — person
  relationships.
- Draft/publish and campaign availability — authoring state.
- Name, slug, description, image.

Not present: org–org parent/subordinate, secrecy/clandestine flag, geographic
scope, official vs private, membership-vs-institution flag.

## Records, fixtures, seeds

There is **no** `@rpg/catalog` organization seed. Runtime records are
campaign-authored. Tests expose intended semantics only as stubs:

| Example                    | Domain         | Form          | Activities                 | Role                                      |
| -------------------------- | -------------- | ------------- | -------------------------- | ----------------------------------------- |
| The Lantern Guild          | `occupational` | —             | `[]`                       | Publish-minimum                           |
| Crown of Lankhmar          | `government`   | `association` | `[]`                       | Optional form independent of domain       |
| Ember Works                | `commercial`   | —             | `blacksmithing`, `brewing` | Ordered unique activities                 |
| Red Dragon Brewing Company | `commercial`   | `company`     | `brewing`                  | Enterprise + trade activity               |
| Dockside Exchange          | `criminal`     | `network`     | `smuggling`                | Preset projection without preset identity |
| Ironroot Smiths            | `commercial`   | —             | `blacksmithing`            | Trade activity on commercial domain       |

These are not a semantic corpus. Character-builder tests also use
`occupational` as a default domain.

## Apparent responsibility of each dimension

The implementation **does** follow the intended split, with the caveats below.

| Dimension        | Shipped responsibility                                                      | Matches the intended table? |
| ---------------- | --------------------------------------------------------------------------- | --------------------------- |
| Domain           | Single primary sphere; required to publish; overview/search facet           | Yes                         |
| Form             | Optional constitution; independent of domain; explicitly not familiar nouns | Yes, with one leak          |
| Activities       | What the organization does; multi; may be empty                             | Yes, grain is inconsistent  |
| Authoring preset | Familiar shorthand; ephemeral; stripped on persist                          | Yes                         |

Caveats (observations, not Phase 4 conclusions):

1. `**congregation` is domain-tinged.\*\* Every other form claims domain
   independence; this one is defined as religious practice.
2. **Activity grain is mixed.** `blacksmithing` / `brewing` are trades;
   `worship` / `warfare` / `banking` are missions. Building taxonomy already
   treats practitioner nouns as organization-activity debt.
3. **Army has no honest form.** The preset omits form rather than misuse
   `association`, `company`, `order`, or `network`.
4. **Academy already uses `association`.** That may be an escape hatch; the
   corpus must test whether `association` absorbs unrelated structures.
5. `**network` discovery includes `syndicate`.\*\* Mapping must not treat
   “syndicate” as automatically `network` without noting overload.
6. `**other` exists\*\* so residual domains need not invent a sphere. Using it as
   a hide-the-gap bucket would be a mapping failure, not a feature.
7. **V1 subtypes were retired.** Do not recreate a kind-scoped subtype enum
   inside form or as a parallel taxonomy.

Cross-type: Organization is the institution; Building Form/Facility is premises.
“Temple” as a building is not the same object as “Temple organization.”

---

# Phase 2 — Frozen corpus v0.1 (150)

Exactly 150 familiar organization concepts an RPG author would reasonably
recognize and choose directly. Mundane and fantasy are mixed. Wording variants
are excluded (no “city watch” + “town watch”).

Groups are **readability / coverage quotas only**. They are not a proposed
taxonomy and must not be persisted.

### Group quotas

| Group                                  | Count | Quota role                                     |
| -------------------------------------- | ----- | ---------------------------------------------- |
| Government / administrative            | 12    | State machinery vs court vs council            |
| Political / revolutionary              | 8     | Influence and change vs governing              |
| Military / martial                     | 12    | Standing, irregular, specialist, fantasy force |
| Policing / security / intelligence     | 8     | Civic, clandestine, commercial, faith-policing |
| Religious                              | 12    | Parish through cult, plus nature/multi-deity   |
| Commercial / trade                     | 14    | Operating firms vs membership trade bodies     |
| Financial                              | 6     | Bank vs petty credit vs state mint             |
| Occupational / guild                   | 10    | Craft, labor, profession, specialist trades    |
| Industrial / production                | 6     | Scale production vs craft guild                |
| Academic / scholarly                   | 10    | Teaching, research, magical study              |
| Medical                                | 5     | Care vs profession vs emergency                |
| Charitable / civic / social / cultural | 12    | Mutual aid, kinship, culture                   |
| Criminal / clandestine                 | 12    | Guild through crew, plus classic underworld    |
| Mercenary / adventuring / exploratory  | 8     | Hired force vs freelance vs expedition         |
| Transportation / shipping              | 6     | Sea, river, road, post                         |
| Agriculture / resource extraction      | 5     | Grow, harvest, extract                         |
| Secret societies                       | 4     | Concealment and informal magical fellowship    |
| **Total**                              | 150   |                                                |

### Required contrast sets

These ids **must** appear. They are the explicit semantic tests for Phase 3.

| Set                 | Ids                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `religious_family`  | `church`, `temple_organization`, `religious_order`, `monastery`, `missionary_society`, `cult`           |
| `military_security` | `army`, `navy`, `militia`, `mercenary_company`, `royal_guard`, `city_watch`, `knightly_order`           |
| `commercial_family` | `bank`, `trading_company`, `merchant_house`, `merchant_guild`, `shipping_company`, `market_association` |
| `academic_family`   | `academy`, `university`, `scholarly_society`, `mage_college`, `research_institute`, `guild_of_scholars` |
| `criminal_family`   | `thieves_guild`, `gang`, `smuggling_ring`, `criminal_syndicate`, `pirate_crew`, `assassins_order`       |
| `government_family` | `government_ministry`, `city_council`, `royal_court`, `bureaucracy`                                     |

### Coding columns (corpus only)

| Column   | Meaning                                                                                   |
| -------- | ----------------------------------------------------------------------------------------- |
| Id       | Stable snake_case token for later mapping. Not a production vocab id.                     |
| Label    | Author-facing familiar name.                                                              |
| Group    | Readability bucket (not classification).                                                  |
| Contrast | Required stress-set membership, or `—`.                                                   |
| Role     | Why the concept is in the corpus (semantic contrast). Not a domain/form/activity mapping. |

Fit, confidence, and current-vocab mapping start in Phase 3.

## Corpus

### 1. Government / administrative (12)

| Id                        | Label                   | Contrast            | Role                                         |
| ------------------------- | ----------------------- | ------------------- | -------------------------------------------- |
| `government_ministry`     | Government ministry     | `government_family` | Executive department vs legislature or court |
| `city_council`            | City council            | `government_family` | Local deliberative body vs royal/national    |
| `royal_court`             | Royal court             | `government_family` | Household + governance vs council            |
| `bureaucracy`             | Bureaucracy             | `government_family` | Administrative machine vs a named ministry   |
| `parliament`              | Parliament              | —                   | Legislative assembly vs court or ministry    |
| `senate`                  | Senate                  | —                   | Chamber / oligarchic house vs parliament     |
| `magistracy`              | Magistracy              | —                   | Judicial body as an organization             |
| `exchequer`               | Exchequer               | —                   | State fiscal office vs commercial bank       |
| `diplomatic_corps`        | Diplomatic corps        | —                   | External representation                      |
| `colonial_administration` | Colonial administration | —                   | Distant occupying/governing apparatus        |
| `privy_council`           | Privy council           | —                   | Inner advisory circle vs parliament          |
| `provincial_governorate`  | Provincial governorate  | —                   | Territorial administration                   |

### 2. Political / revolutionary (8)

| Id                   | Label              | Contrast | Role                                                    |
| -------------------- | ------------------ | -------- | ------------------------------------------------------- |
| `political_party`    | Political party    | —        | Electoral / representation vehicle                      |
| `revolutionary_cell` | Revolutionary cell | —        | Clandestine change vs open party                        |
| `noble_faction`      | Noble faction      | —        | Court bloc vs the royal court as institution            |
| `reform_league`      | Reform league      | —        | Issue campaign vs governing                             |
| `advocacy_society`   | Advocacy society   | —        | Cause organization; activity `advocacy` is not in vocab |
| `succession_cabal`   | Succession cabal   | —        | Power plot vs generic secret society                    |
| `independence_front` | Independence front | —        | Separatist movement                                     |
| `populist_movement`  | Populist movement  | —        | Mass movement vs organized party                        |

### 3. Military / martial (12)

| Id                | Label           | Contrast            | Role                                       |
| ----------------- | --------------- | ------------------- | ------------------------------------------ |
| `army`            | Army            | `military_security` | Standing land force; existing preset       |
| `navy`            | Navy            | `military_security` | Maritime force vs army                     |
| `militia`         | Militia         | `military_security` | Citizen levy vs standing army              |
| `royal_guard`     | Royal guard     | `military_security` | Household protection vs field army         |
| `knightly_order`  | Knightly order  | `military_security` | Chivalric membership vs army               |
| `marines`         | Marines         | —                   | Amphibious force vs navy or army           |
| `sky_fleet`       | Sky fleet       | —                   | Fantasy aerial force                       |
| `garrison`        | Garrison        | —                   | Stationed force vs field army              |
| `warband`         | Warband         | —                   | Irregular / tribal vs army                 |
| `legion`          | Legion          | —                   | Named formation / identity vs generic army |
| `siege_engineers` | Siege engineers | —                   | Specialist corps vs occupational guild     |
| `crusading_host`  | Crusading host  | —                   | Religious + military campaign force        |

### 4. Policing / security / intelligence (8)

| Id                         | Label                    | Contrast            | Role                                   |
| -------------------------- | ------------------------ | ------------------- | -------------------------------------- |
| `city_watch`               | City watch               | `military_security` | Civic policing vs army                 |
| `secret_police`            | Secret police            | —                   | Political security vs city watch       |
| `intelligence_bureau`      | Intelligence bureau      | —                   | State intelligence vs spy ring         |
| `spy_ring`                 | Spy ring                 | —                   | Clandestine network vs bureau          |
| `inquisitorial_office`     | Inquisitorial office     | —                   | Faith + policing hybrid                |
| `customs_service`          | Customs service          | —                   | Border / fiscal enforcement            |
| `private_security_company` | Private security company | —                   | Commercial protection vs city watch    |
| `marshals`                 | Marshals                 | —                   | Crown / federal law vs municipal watch |

### 5. Religious (12)

| Id                    | Label               | Contrast           | Role                                            |
| --------------------- | ------------------- | ------------------ | ----------------------------------------------- |
| `church`              | Church              | `religious_family` | Familiar congregation; existing preset          |
| `temple_organization` | Temple organization | `religious_family` | Cult-center institution vs parish church        |
| `religious_order`     | Religious order     | `religious_family` | Rule-bound membership vs congregation           |
| `monastery`           | Monastery           | `religious_family` | Enclosed community (organization, not premises) |
| `missionary_society`  | Missionary society  | `religious_family` | Outward conversion vs local worship             |
| `cult`                | Cult                | `religious_family` | Deviant / secretive faith vs church             |
| `diocese`             | Diocese             | —                  | Territorial hierarchy vs local church           |
| `druid_circle`        | Druid circle        | —                  | Nature-faith fellowship vs temple               |
| `shrine_keepers`      | Shrine keepers      | —                  | Site stewardship vs congregation                |
| `heretical_sect`      | Heretical sect      | —                  | Schism vs cult (doctrine vs deviance)           |
| `pilgrimage_society`  | Pilgrimage society  | —                  | Travel-devotion vs missionary                   |
| `pantheon_clergy`     | Pantheon clergy     | —                  | Multi-deity priesthood vs single-faith church   |

### 6. Commercial / trade (14)

| Id                                | Label                           | Contrast            | Role                                     |
| --------------------------------- | ------------------------------- | ------------------- | ---------------------------------------- |
| `trading_company`                 | Trading company                 | `commercial_family` | Operating trade enterprise               |
| `merchant_house`                  | Merchant house                  | `commercial_family` | Family / lineage firm vs company         |
| `merchant_guild`                  | Merchant guild                  | `commercial_family` | Trade membership body vs operating house |
| `market_association`              | Market association              | `commercial_family` | Stallholders / civic market vs guild     |
| `caravan_company`                 | Caravan company                 | —                   | Overland trade vs shipping               |
| `chartered_company`               | Chartered company               | —                   | State-backed monopoly vs private house   |
| `shopkeepers_association`         | Shopkeepers association         | —                   | Local retailers vs merchant guild        |
| `auction_house`                   | Auction house                   | —                   | Event-sale enterprise                    |
| `spice_consortium`                | Spice consortium                | —                   | Commodity cartel                         |
| `factors_guild`                   | Factors guild                   | —                   | Commission agents vs merchant house      |
| `company_of_merchant_adventurers` | Company of merchant adventurers | —                   | Chartered traders vs adventurers' guild  |
| `warehouse_combine`               | Warehouse combine               | —                   | Storage enterprise vs trading company    |
| `bazaar_syndicate`                | Bazaar syndicate                | —                   | Market control vs market association     |
| `slave_trading_company`           | Slave-trading company           | —                   | Commercial + criminal pressure           |

### 7. Financial (6)

| Id                  | Label             | Contrast            | Role                                 |
| ------------------- | ----------------- | ------------------- | ------------------------------------ |
| `bank`              | Bank              | `commercial_family` | Deposit / lend; existing preset      |
| `moneylenders`      | Moneylenders      | —                   | Petty credit vs bank                 |
| `insurance_company` | Insurance company | —                   | Risk pooling vs bank                 |
| `mint`              | Mint              | —                   | Coin production; state vs commercial |
| `pawnbrokers`       | Pawnbrokers       | —                   | Secured lending vs bank              |
| `tax_farmers`       | Tax farmers       | —                   | Privatized revenue vs exchequer      |

### 8. Occupational / guild (10)

| Id                     | Label                | Contrast | Role                                      |
| ---------------------- | -------------------- | -------- | ----------------------------------------- |
| `craft_guild`          | Craft guild          | —        | Existing preset                           |
| `labor_union`          | Labor union          | —        | Worker representation vs guild governance |
| `professional_college` | Professional college | —        | Licensed profession vs craft guild        |
| `hunters_lodge`        | Hunters lodge        | —        | Field-craft fellowship                    |
| `scribes_guild`        | Scribes guild        | —        | Clerical trade vs scholarly society       |
| `entertainers_guild`   | Entertainers guild   | —        | Performance trade vs theater troupe       |
| `alchemists_guild`     | Alchemists guild     | —        | Craft vs mage college                     |
| `cartographers_guild`  | Cartographers guild  | —        | Trade vs explorers' society               |
| `pilots_guild`         | Pilots guild         | —        | Harbor navigation vs shipping company     |
| `advocates_guild`      | Advocates guild      | —        | Legal profession vs magistracy            |

### 9. Industrial / production (6)

| Id                    | Label               | Contrast | Role                                             |
| --------------------- | ------------------- | -------- | ------------------------------------------------ |
| `foundry_works`       | Foundry works       | —        | Metal production enterprise                      |
| `textile_manufactory` | Textile manufactory | —        | Scale production vs craft guild                  |
| `millers_cooperative` | Millers cooperative | —        | Joint ownership vs company                       |
| `shipyard`            | Shipyard company    | —        | Construction vs shipping operator                |
| `brewery_company`     | Brewery company     | —        | Existing `brewing` activity; enterprise vs guild |
| `glassworks`          | Glassworks          | —        | Specialist production                            |

### 10. Academic / scholarly (10)

| Id                   | Label              | Contrast          | Role                                          |
| -------------------- | ------------------ | ----------------- | --------------------------------------------- |
| `academy`            | Academy            | `academic_family` | Existing preset                               |
| `university`         | University         | `academic_family` | Degree-granting vs academy                    |
| `scholarly_society`  | Scholarly society  | `academic_family` | Learned membership vs teaching body           |
| `mage_college`       | Mage college       | `academic_family` | Magical instruction vs mundane academy        |
| `research_institute` | Research institute | `academic_family` | Inquiry vs teaching                           |
| `guild_of_scholars`  | Guild of scholars  | `academic_family` | Occupational wrapping of scholarship          |
| `great_library`      | Great library      | —                 | Text stewardship (organization, not premises) |
| `observatory`        | Observatory        | —                 | Specialized research vs generic institute     |
| `seminary`           | Seminary           | —                 | Religious + academic instruction              |
| `bardic_college`     | Bardic college     | —                 | Performance scholarship vs entertainers guild |

### 11. Medical (5)

| Id                   | Label              | Contrast | Role                                    |
| -------------------- | ------------------ | -------- | --------------------------------------- |
| `hospital_order`     | Hospital order     | —        | Care institution vs hospice             |
| `apothecaries_guild` | Apothecaries guild | —        | Building-taxonomy deferred activity gap |
| `surgeons_college`   | Surgeons college   | —        | Medical profession vs hospital          |
| `plague_wardens`     | Plague wardens     | —        | Civic emergency vs hospital             |
| `hospice_society`    | Hospice society    | —        | Charitable care vs hospital order       |

### 12. Charitable / civic / social / cultural (12)

| Id                      | Label                 | Contrast | Role                                     |
| ----------------------- | --------------------- | -------- | ---------------------------------------- |
| `charitable_foundation` | Charitable foundation | —        | Endowed giving vs relief society         |
| `orphanage_society`     | Orphanage society     | —        | Care institution                         |
| `famine_relief_society` | Famine relief society | —        | Crisis mutual aid                        |
| `burial_society`        | Burial society        | —        | Mutual funeral aid                       |
| `civic_league`          | Civic league          | —        | Local improvement vs government          |
| `mutual_aid_society`    | Mutual aid society    | —        | Reciprocal support vs charity            |
| `theater_troupe`        | Theater troupe        | —        | Performing company vs entertainers guild |
| `museum_society`        | Museum society        | —        | Cultural stewardship (org, not premises) |
| `festival_guild`        | Festival guild        | —        | Civic ritual vs religious                |
| `sporting_club`         | Sporting club         | —        | Recreational membership                  |
| `fraternal_lodge`       | Fraternal lodge       | —        | Fellowship vs secret society             |
| `clan`                  | Clan                  | —        | Kinship body vs civic association        |

### 13. Criminal / clandestine (12)

| Id                    | Label               | Contrast          | Role                                       |
| --------------------- | ------------------- | ----------------- | ------------------------------------------ |
| `thieves_guild`       | Thieves' guild      | `criminal_family` | Occupational wrapping of crime             |
| `gang`                | Gang                | `criminal_family` | Street / territorial vs guild              |
| `smuggling_ring`      | Smuggling ring      | `criminal_family` | Existing preset                            |
| `criminal_syndicate`  | Criminal syndicate  | `criminal_family` | Multi-enterprise vs gang                   |
| `pirate_crew`         | Pirate crew         | `criminal_family` | Maritime crime vs navy / shipping          |
| `assassins_order`     | Assassins' order    | `criminal_family` | Discipline / rule vs gang                  |
| `fencing_network`     | Fencing network     | —                 | Stolen-goods market vs thieves' guild      |
| `counterfeiting_ring` | Counterfeiting ring | —                 | Financial crime vs smuggling               |
| `protection_racket`   | Protection racket   | —                 | Extortion vs private security              |
| `wreckers`            | Wreckers            | —                 | Coastal predation vs pirates               |
| `prison_gang`         | Prison gang         | —                 | Confined membership vs street gang         |
| `beggars_guild`       | Beggars' guild      | —                 | Classic underworld; poverty + organization |

### 14. Mercenary / adventuring / exploratory (8)

| Id                      | Label                  | Contrast            | Role                                  |
| ----------------------- | ---------------------- | ------------------- | ------------------------------------- |
| `mercenary_company`     | Mercenary company      | `military_security` | Hired force vs army                   |
| `adventuring_company`   | Adventuring company    | —                   | Small freelance vs mercenary army     |
| `adventurers_guild`     | Adventurers' guild     | —                   | Membership hall vs a company          |
| `explorers_society`     | Explorers' society     | —                   | Geographic inquiry vs adventurers     |
| `monster_hunters_guild` | Monster hunters' guild | —                   | Specialized vs adventurers' guild     |
| `treasure_hunters`      | Treasure hunters       | —                   | Loot-seeking vs explorers             |
| `ranger_company`        | Ranger company         | —                   | Wilderness force vs army / watch      |
| `survey_expedition`     | Survey expedition      | —                   | Finite expedition vs standing society |

### 15. Transportation / shipping (6)

| Id                 | Label            | Contrast            | Role                                  |
| ------------------ | ---------------- | ------------------- | ------------------------------------- |
| `shipping_company` | Shipping company | `commercial_family` | Maritime operator vs navy             |
| `teamsters_guild`  | Teamsters guild  | —                   | Overland haulage vs shipping          |
| `coach_line`       | Coach line       | —                   | Passenger service vs teamsters        |
| `river_boatmen`    | River boatmen    | —                   | Inland water vs ocean shipping        |
| `courier_service`  | Courier service  | —                   | Messages / parcels vs postal          |
| `postal_service`   | Postal service   | —                   | State / civic mail vs private courier |

### 16. Agriculture / resource extraction (5)

| Id                     | Label                | Contrast | Role                              |
| ---------------------- | -------------------- | -------- | --------------------------------- |
| `farming_cooperative`  | Farming cooperative  | —        | Joint agricultural vs company     |
| `logging_company`      | Logging company      | —        | Timber extraction                 |
| `fishing_fleet`        | Fishing fleet        | —        | Harvest vs shipping               |
| `ranchers_association` | Ranchers association | —        | Livestock producers vs farming    |
| `fur_company`          | Fur company          | —        | Extractive trade; frontier analog |

### 17. Secret societies (4)

| Id                 | Label            | Contrast | Role                                        |
| ------------------ | ---------------- | -------- | ------------------------------------------- |
| `secret_society`   | Secret society   | —        | Concealment as identity vs fraternal lodge  |
| `wizard_circle`    | Wizard circle    | —        | Informal magical fellowship vs mage college |
| `witches_coven`    | Witches' coven   | —        | Small magical fellowship vs cult            |
| `conspiracy_cabal` | Conspiracy cabal | —        | Hidden plot vs succession cabal / spy ring  |

## Corpus integrity

- Count: **150**
- Unique ids: required (Phase 2 freeze)
- Existing production presets included as concepts: `church`, `army`, `bank`,
  `academy`, `craft_guild`, `smuggling_ring`
- Not added to `ORGANIZATION_AUTHORING_PRESETS`
- Not added to domain / form / activity registries

---

# Phase 3 — Mapping matrix

Every corpus concept mapped against **existing** `organizationDomain`,
`organizationForm`, and `activities` only. No production vocabulary was invented.

Method locks applied:

- Missing values are `—`.
- Form omitted rather than forcing `association` / `company` / `network` as an escape hatch.
- Empty activities when no existing value is genuinely what the organization does.
- Single primary domain; secondary sphere recorded in notes, not as a second domain value.
- `other` was not used to hide a gap.

Fit:

- `clean` — assigned values are honest; omitted form is not a hole; distinctive existing activities are present.
- `acceptable` — honest mapping with a thin dimension (missing activity, omitted form, or secondary sphere).
- `awkward` — missing force/office form that authors would want, escape-hatch form, or a least-wrong domain.
- `unrepresentable` — cannot pick a primary domain without lying. **None in this pass.**

### Fit tally (mapping check, not the Phase 5 pressure report)

| Fit               | Count   | Share    |
| ----------------- | ------- | -------- |
| `clean`           | 9       | 6%       |
| `acceptable`      | 117     | 78%      |
| `awkward`         | 24      | 16%      |
| `unrepresentable` | 0       | 0%       |
| **Total**         | **150** | **100%** |

Columns: Domain / Form / Activities are existing ids. Secondary is a note, not a stored field.

### Government / administrative

| Concept                 | Domain       | Form          | Activities | Fit          | Conf.  | Secondary   | Notes                                                                                              |
| ----------------------- | ------------ | ------------- | ---------- | ------------ | ------ | ----------- | -------------------------------------------------------------------------------------------------- |
| Government ministry     | `government` | —             | —          | `acceptable` | high   | —           | No office/department form. No administration activity. Association would be an escape hatch.       |
| City council            | `government` | `association` | —          | `acceptable` | medium | —           | Deliberative membership fits association. No legislation/governance activity.                      |
| Royal court             | `government` | —             | —          | `awkward`    | medium | `political` | Household plus governance. No court/household form. Association undersells hierarchy.              |
| Bureaucracy             | `government` | —             | —          | `acceptable` | high   | —           | Administrative machine carried by name. No administration activity.                                |
| Parliament              | `government` | `association` | —          | `acceptable` | medium | —           | Legislative membership body. Collides with senate/council except by name. No legislation activity. |
| Senate                  | `government` | `association` | —          | `acceptable` | medium | —           | Same mapping as parliament. Chamber vs assembly is name-only.                                      |
| Magistracy              | `government` | —             | —          | `acceptable` | high   | —           | Judicial authority. No court/tribunal form. No adjudication activity.                              |
| Exchequer               | `government` | —             | `finance`  | `acceptable` | high   | —           | State fiscal office. finance fits; banking would imply deposits. Missing office form.              |
| Diplomatic corps        | `government` | —             | —          | `acceptable` | medium | —           | No diplomacy activity. Corps is not company.                                                       |
| Colonial administration | `government` | —             | —          | `acceptable` | high   | `military`  | Distant governing apparatus. Primary remains government.                                           |
| Privy council           | `government` | `association` | —          | `acceptable` | medium | —           | Advisory membership. Distinct from parliament only by name/scale.                                  |
| Provincial governorate  | `government` | —             | —          | `acceptable` | high   | —           | Territorial administration. No office form.                                                        |

### Political / revolutionary

| Concept            | Domain      | Form          | Activities | Fit          | Conf.  | Secondary    | Notes                                                                                               |
| ------------------ | ----------- | ------------- | ---------- | ------------ | ------ | ------------ | --------------------------------------------------------------------------------------------------- |
| Political party    | `political` | `association` | —          | `clean`      | high   | —            | Membership around a shared purpose. advocacy is not in activity vocab; empty activities are honest. |
| Revolutionary cell | `political` | `network`     | —          | `acceptable` | medium | `criminal`   | Cell structure fits network. Clandestine status unmodeled.                                          |
| Noble faction      | `political` | —             | —          | `acceptable` | medium | `government` | Court bloc; not clearly a formal membership body. Omit form.                                        |
| Reform league      | `political` | `association` | —          | `acceptable` | high   | —            | Membership campaign. Missing advocacy activity.                                                     |
| Advocacy society   | `political` | `association` | —          | `acceptable` | high   | —            | Same hole as reform league: advocacy was rejected from activity vocab.                              |
| Succession cabal   | `political` | `network`     | —          | `acceptable` | low    | —            | Small conspiracy. network is a mild stretch if the cabal is a clique rather than distributed cells. |
| Independence front | `political` | —             | —          | `acceptable` | medium | `military`   | Mass separatist movement. association would over-formalize.                                         |
| Populist movement  | `political` | —             | —          | `acceptable` | high   | —            | Mass movement vs organized party. Omit form.                                                        |

### Military / martial

| Concept         | Domain     | Form    | Activities           | Fit          | Conf.  | Secondary      | Notes                                                                                                |
| --------------- | ---------- | ------- | -------------------- | ------------ | ------ | -------------- | ---------------------------------------------------------------------------------------------------- |
| Army            | `military` | —       | `warfare`, `defense` | `awkward`    | high   | —              | Existing preset. Domain and activities fit; no force/host form. Matches the Army recipe test.        |
| Navy            | `military` | —       | `warfare`, `defense` | `awkward`    | high   | —              | Same mapping as army. Maritime vs land is name-only; no naval activity.                              |
| Militia         | `military` | —       | `warfare`, `defense` | `awkward`    | high   | —              | Same mapping as army. Citizen vs standing force is unmodeled.                                        |
| Royal guard     | `military` | —       | `defense`            | `acceptable` | high   | `government`   | Household protection: defense without field warfare. No guard form.                                  |
| Knightly order  | `military` | `order` | `warfare`, `defense` | `acceptable` | medium | `religious`    | order fits a rule-bound martial membership. Secondary religious is common.                           |
| Marines         | `military` | —       | `warfare`, `defense` | `awkward`    | high   | —              | Same mapping as army/navy. Amphibious distinction is name-only.                                      |
| Sky fleet       | `military` | —       | `warfare`, `defense` | `awkward`    | high   | —              | Fantasy aerial force. Same missing-force hole as navy.                                               |
| Garrison        | `military` | —       | `defense`            | `awkward`    | medium | —              | Stationed force. defense fits; still no force form.                                                  |
| Warband         | `military` | —       | `warfare`            | `acceptable` | medium | —              | Irregular raiding group. company would be an escape hatch; omit form.                                |
| Legion          | `military` | —       | `warfare`, `defense` | `awkward`    | high   | —              | Named formation vs generic army is identity/scale, not classification. Same mapping as army.         |
| Siege engineers | `military` | —       | `warfare`            | `acceptable` | medium | `occupational` | Specialist corps, not a guild. No engineering activity.                                              |
| Crusading host  | `military` | —       | `warfare`            | `awkward`    | medium | `religious`    | Primary armed campaign. worship would pad; secondary religious is in notes. Missing host/force form. |

### Policing / security / intelligence

| Concept                  | Domain       | Form      | Activities | Fit          | Conf.  | Secondary    | Notes                                                                                                                |
| ------------------------ | ------------ | --------- | ---------- | ------------ | ------ | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| City watch               | `government` | —         | `defense`  | `acceptable` | medium | —            | Civic policing kept in government so it does not collapse onto army. No policing activity. Missing watch/force form. |
| Secret police            | `government` | —         | —          | `awkward`    | medium | `political`  | Political security. defense would euphemize; omit. Clandestine unmodeled. No investigation activity.                 |
| Intelligence bureau      | `government` | —         | —          | `awkward`    | medium | —            | State intelligence. No intelligence/espionage activity. Distinct from spy_ring only if form is omitted here.         |
| Spy ring                 | `government` | `network` | —          | `acceptable` | medium | `political`  | Distributed cells fit network. No espionage activity.                                                                |
| Inquisitorial office     | `religious`  | —         | —          | `awkward`    | medium | `government` | Faith plus policing. Primary religious as a church institution. No investigation activity.                           |
| Customs service          | `government` | —         | —          | `acceptable` | high   | —            | Border/fiscal enforcement. finance would pad.                                                                        |
| Private security company | `commercial` | `company` | `defense`  | `acceptable` | high   | —            | Commercial protection. Distinct from city_watch by domain and form.                                                  |
| Marshals                 | `government` | —         | `defense`  | `acceptable` | medium | —            | Same mapping as city_watch. Crown vs municipal scope is unmodeled.                                                   |

### Religious

| Concept             | Domain      | Form           | Activities            | Fit          | Conf.  | Secondary | Notes                                                                                                           |
| ------------------- | ----------- | -------------- | --------------------- | ------------ | ------ | --------- | --------------------------------------------------------------------------------------------------------------- |
| Church              | `religious` | `congregation` | `worship`, `ministry` | `clean`      | high   | —         | Existing preset. congregation is honest for a gathered faith community.                                         |
| Temple organization | `religious` | `congregation` | `worship`, `ministry` | `acceptable` | medium | —         | Honest values, but the mapping is identical to church. Cult-center vs parish is name-only.                      |
| Religious order     | `religious` | `order`        | `worship`, `ministry` | `clean`      | high   | —         | order vs congregation is the useful religious-family distinction.                                               |
| Monastery           | `religious` | `order`        | `worship`             | `acceptable` | high   | —         | Enclosed rule-bound community. ministry (pastoral care of laity) omitted. Thinly distinct from religious_order. |
| Missionary society  | `religious` | `association`  | `ministry`            | `acceptable` | high   | —         | Outward conversion. association fits. worship less central than ministry.                                       |
| Cult                | `religious` | `congregation` | `worship`             | `acceptable` | medium | —         | Gathered deviant practice. Deviance/secrecy unmodeled. Weakly distinct from church (no ministry).               |
| Diocese             | `religious` | —              | `ministry`            | `acceptable` | high   | —         | Territorial hierarchy, not a gathered congregation. No see/diocese form.                                        |
| Druid circle        | `religious` | `order`        | `worship`             | `acceptable` | medium | —         | Nature-faith fellowship. order as calling/discipline.                                                           |
| Shrine keepers      | `religious` | —              | `worship`             | `acceptable` | medium | —         | Site stewardship. Too small/specific for congregation.                                                          |
| Heretical sect      | `religious` | `congregation` | `worship`             | `acceptable` | medium | —         | Same mapping as cult. Schism vs deviance is name-only.                                                          |
| Pilgrimage society  | `religious` | `association`  | `worship`             | `acceptable` | high   | —         | Travel-devotion membership. Distinct from missionary_society by activity (worship vs ministry).                 |
| Pantheon clergy     | `religious` | —              | `worship`, `ministry` | `acceptable` | medium | —         | Institutional priesthood across cults. Not one congregation.                                                    |

### Commercial / trade

| Concept                         | Domain         | Form          | Activities  | Fit          | Conf.  | Secondary      | Notes                                                                                               |
| ------------------------------- | -------------- | ------------- | ----------- | ------------ | ------ | -------------- | --------------------------------------------------------------------------------------------------- |
| Trading company                 | `commercial`   | `company`     | —           | `acceptable` | high   | —              | Operating enterprise. No trade/commerce activity in vocab.                                          |
| Merchant house                  | `commercial`   | `company`     | —           | `acceptable` | medium | —              | Family firm is an operating enterprise. house is not a form. Lineage unmodeled.                     |
| Merchant guild                  | `occupational` | `guild`       | `standards` | `acceptable` | medium | `commercial`   | Represents a trade community, not an operating house. Primary occupational. Secondary commercial.   |
| Market association              | `commercial`   | `association` | —           | `acceptable` | medium | `occupational` | Stallholder membership around exchange. Distinct from merchant_guild by form and domain.            |
| Caravan company                 | `commercial`   | `company`     | —           | `acceptable` | high   | —              | Overland trade enterprise. No transport activity.                                                   |
| Chartered company               | `commercial`   | `company`     | —           | `acceptable` | medium | `government`   | State-backed monopoly. Charter/status unmodeled.                                                    |
| Shopkeepers association         | `occupational` | `association` | —           | `acceptable` | medium | `commercial`   | Local retailers as a trade constituency. Distinct from merchant_guild (guild vs association).       |
| Auction house                   | `commercial`   | `company`     | —           | `acceptable` | high   | —              | Event-sale enterprise. house is not a form.                                                         |
| Spice consortium                | `commercial`   | `company`     | —           | `acceptable` | medium | —              | Commodity combine as an operating enterprise. network not used.                                     |
| Factors guild                   | `occupational` | `guild`       | —           | `acceptable` | medium | `commercial`   | Commission-agent trade body vs merchant house.                                                      |
| Company of merchant adventurers | `commercial`   | `company`     | —           | `acceptable` | medium | —              | Chartered traders. Distinct from adventurers_guild by domain and form.                              |
| Warehouse combine               | `commercial`   | `company`     | —           | `acceptable` | high   | —              | Storage enterprise. No warehousing activity.                                                        |
| Bazaar syndicate                | `commercial`   | `company`     | —           | `acceptable` | medium | —              | Market-control enterprise. Did not follow network merely because discovery terms include syndicate. |
| Slave-trading company           | `commercial`   | `company`     | —           | `awkward`    | high   | `criminal`     | Economic exchange is primary; illicit sphere is secondary. No slaving activity.                     |

### Financial

| Concept           | Domain       | Form      | Activities           | Fit          | Conf.  | Secondary    | Notes                                                                   |
| ----------------- | ------------ | --------- | -------------------- | ------------ | ------ | ------------ | ----------------------------------------------------------------------- |
| Bank              | `commercial` | `company` | `banking`, `finance` | `clean`      | high   | —            | Existing preset.                                                        |
| Moneylenders      | `commercial` | `company` | `finance`            | `acceptable` | high   | —            | Petty credit. finance without banking (not a deposit institution).      |
| Insurance company | `commercial` | `company` | `finance`            | `acceptable` | high   | —            | Risk pooling as capital management. No insurance activity.              |
| Mint              | `government` | —         | `finance`            | `acceptable` | medium | `commercial` | State coin production. Primary public authority, not a commercial bank. |
| Pawnbrokers       | `commercial` | `company` | `finance`            | `acceptable` | high   | —            | Secured lending. Distinct from bank by omitting banking.                |
| Tax farmers       | `commercial` | `company` | `finance`            | `acceptable` | medium | `government` | Privatized revenue collection vs exchequer (government, no form).       |

### Occupational / guild

| Concept              | Domain         | Form          | Activities                                | Fit          | Conf.  | Secondary    | Notes                                                                                                       |
| -------------------- | -------------- | ------------- | ----------------------------------------- | ------------ | ------ | ------------ | ----------------------------------------------------------------------------------------------------------- |
| Craft guild          | `occupational` | `guild`       | `standards`, `apprenticeship`, `training` | `clean`      | high   | —            | Existing preset.                                                                                            |
| Labor union          | `occupational` | `association` | —                                         | `acceptable` | high   | —            | Worker representation, not trade governance. guild would misstate constitution. No labor/advocacy activity. |
| Professional college | `occupational` | `association` | `standards`, `training`                   | `acceptable` | medium | `academic`   | Licensed profession. association not guild. Secondary academic.                                             |
| Hunters lodge        | `occupational` | `guild`       | —                                         | `acceptable` | medium | —            | Field-craft fellowship. No hunting activity. standards omitted (not clearly a certifying body).             |
| Scribes guild        | `occupational` | `guild`       | `standards`, `apprenticeship`             | `acceptable` | high   | —            | Clerical trade vs scholarly_society (academic association).                                                 |
| Entertainers guild   | `occupational` | `guild`       | `training`                                | `acceptable` | medium | —            | Performance trade vs theater_troupe (commercial company). No performance activity.                          |
| Alchemists guild     | `occupational` | `guild`       | `standards`, `apprenticeship`             | `acceptable` | medium | `academic`   | Craft vs mage_college. No alchemy/magic activity.                                                           |
| Cartographers guild  | `occupational` | `guild`       | `standards`                               | `acceptable` | medium | —            | Trade body vs explorers_society (academic association).                                                     |
| Pilots guild         | `occupational` | `guild`       | `standards`, `training`                   | `acceptable` | high   | `commercial` | Harbor navigation trade vs shipping company.                                                                |
| Advocates guild      | `occupational` | `guild`       | `standards`                               | `acceptable` | high   | —            | Legal profession vs magistracy (government).                                                                |

### Industrial / production

| Concept             | Domain       | Form          | Activities | Fit          | Conf. | Secondary | Notes                                                                                                 |
| ------------------- | ------------ | ------------- | ---------- | ------------ | ----- | --------- | ----------------------------------------------------------------------------------------------------- |
| Foundry works       | `commercial` | `company`     | —          | `awkward`    | high  | —         | Production enterprise. blacksmithing is forging, not casting — not used. Missing production activity. |
| Textile manufactory | `commercial` | `company`     | —          | `acceptable` | high  | —         | Scale production vs craft_guild. No textile activity.                                                 |
| Millers cooperative | `commercial` | `cooperative` | —          | `acceptable` | high  | —         | Joint ownership is the honest form. No milling activity.                                              |
| Shipyard company    | `commercial` | `company`     | —          | `acceptable` | high  | —         | Construction enterprise vs shipping operator. No shipbuilding activity.                               |
| Brewery company     | `commercial` | `company`     | `brewing`  | `clean`      | high  | —         | Existing brewing activity on an operating enterprise.                                                 |
| Glassworks          | `commercial` | `company`     | —          | `acceptable` | high  | —         | Specialist production. No glass activity.                                                             |

### Academic / scholarly

| Concept            | Domain     | Form          | Activities                          | Fit          | Conf.  | Secondary      | Notes                                                                                                 |
| ------------------ | ---------- | ------------- | ----------------------------------- | ------------ | ------ | -------------- | ----------------------------------------------------------------------------------------------------- |
| Academy            | `academic` | `association` | `education`, `training`, `research` | `awkward`    | high   | —              | Existing preset. association is an escape hatch: an academy is an institution, not a membership body. |
| University         | `academic` | `association` | `education`, `research`             | `awkward`    | high   | —              | Same association stretch as academy. Degree-granting vs academy is unmodeled.                         |
| Scholarly society  | `academic` | `association` | `research`                          | `clean`      | high   | —              | Genuine learned membership. This is what association is for — unlike academy.                         |
| Mage college       | `academic` | `association` | `education`, `training`, `research` | `awkward`    | medium | —              | Same mapping as academy. Magical instruction exists only in the name. No magic domain or activity.    |
| Research institute | `academic` | —             | `research`                          | `acceptable` | high   | —              | Inquiry vs teaching. Omit form; company would overstate commercial constitution.                      |
| Guild of scholars  | `academic` | `guild`       | `research`                          | `acceptable` | medium | `occupational` | Occupational wrapping of scholarship. Domain stays academic.                                          |
| Great library      | `academic` | —             | `research`                          | `acceptable` | medium | —              | Knowledge stewardship. research is the nearest existing activity (archives/inquiry).                  |
| Observatory        | `academic` | —             | `research`                          | `acceptable` | high   | —              | Specialized research body.                                                                            |
| Seminary           | `academic` | —             | `education`, `ministry`             | `acceptable` | medium | `religious`    | Instructional body training clergy. Primary academic; secondary religious.                            |
| Bardic college     | `academic` | `association` | `education`, `training`             | `awkward`    | medium | —              | Same association stretch as academy. Distinct from entertainers_guild by domain.                      |

### Medical

| Concept            | Domain         | Form          | Activities                    | Fit          | Conf.  | Secondary   | Notes                                                                                                 |
| ------------------ | -------------- | ------------- | ----------------------------- | ------------ | ------ | ----------- | ----------------------------------------------------------------------------------------------------- |
| Hospital order     | `religious`    | `order`       | —                             | `awkward`    | medium | `community` | Historically a religious order. No healing/care activity. Medical domain does not exist.              |
| Apothecaries guild | `occupational` | `guild`       | `standards`, `apprenticeship` | `acceptable` | high   | —           | Trade body is representable. No pharmacy/medicine activity — the building-taxonomy deferred gap.      |
| Surgeons college   | `occupational` | `association` | `standards`, `training`       | `acceptable` | medium | `academic`  | Medical profession. Same shape as professional_college. No healing activity.                          |
| Plague wardens     | `government`   | —             | —                             | `awkward`    | medium | `community` | Civic emergency authority. defense would stretch armed protection. No public-health/healing activity. |
| Hospice society    | `community`    | `association` | —                             | `acceptable` | medium | —           | Charitable care as mutual aid. No care/healing activity.                                              |

### Charitable / civic / social / cultural

| Concept               | Domain       | Form          | Activities | Fit          | Conf.  | Secondary   | Notes                                                                                               |
| --------------------- | ------------ | ------------- | ---------- | ------------ | ------ | ----------- | --------------------------------------------------------------------------------------------------- |
| Charitable foundation | `community`  | —             | —          | `acceptable` | high   | —           | Endowed giving. Omit form; company would overstate. No charity activity.                            |
| Orphanage society     | `community`  | `association` | —          | `acceptable` | high   | —           | Care membership/society. No care activity.                                                          |
| Famine relief society | `community`  | `association` | —          | `acceptable` | high   | —           | Crisis mutual aid. Domain matches exactly; distinctive relief work is unnamed.                      |
| Burial society        | `community`  | `association` | —          | `acceptable` | high   | —           | Mutual funeral aid.                                                                                 |
| Civic league          | `community`  | `association` | —          | `acceptable` | high   | —           | Local improvement vs government. association genuine.                                               |
| Mutual aid society    | `community`  | `association` | —          | `clean`      | high   | —           | Exact community-domain match as a membership mutual-aid body.                                       |
| Theater troupe        | `commercial` | `company`     | —          | `acceptable` | medium | `community` | Operating performance company vs entertainers_guild. No performance activity.                       |
| Museum society        | `academic`   | `association` | —          | `acceptable` | medium | `community` | Knowledge/cultural stewardship as a membership society. research omitted (not primarily inquiry).   |
| Festival guild        | `community`  | `association` | —          | `acceptable` | medium | —           | Civic ritual. Name says guild; constitution is a civic membership, not a trade guild.               |
| Sporting club         | `community`  | `association` | —          | `acceptable` | high   | —           | Recreational membership. training would pad.                                                        |
| Fraternal lodge       | `community`  | `order`       | —          | `acceptable` | medium | —           | Fellowship with a rule/ritual. Distinct from secret_society only by clandestine status (unmodeled). |
| Clan                  | `community`  | —             | —          | `acceptable` | high   | —           | Kinship body. association would imply voluntary membership.                                         |

### Criminal / clandestine

| Concept             | Domain     | Form      | Activities  | Fit          | Conf.  | Secondary      | Notes                                                                                                              |
| ------------------- | ---------- | --------- | ----------- | ------------ | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Thieves' guild      | `criminal` | `guild`   | —           | `acceptable` | medium | `occupational` | Occupational wrapping of crime. No theft activity.                                                                 |
| Gang                | `criminal` | —         | —           | `acceptable` | high   | —              | Street/territorial group. network would over-specify constitution.                                                 |
| Smuggling ring      | `criminal` | `network` | `smuggling` | `clean`      | high   | —              | Existing preset.                                                                                                   |
| Criminal syndicate  | `criminal` | `company` | —           | `acceptable` | medium | —              | Multi-enterprise as an illicit operating body. Did not use network just because discovery terms include syndicate. |
| Pirate crew         | `criminal` | —         | —           | `awkward`    | high   | `military`     | Maritime crime vs navy/shipping. No crew form. warfare and smuggling omitted rather than padded.                   |
| Assassins' order    | `criminal` | `order`   | —           | `acceptable` | high   | —              | Rule-bound killing society. No assassination activity.                                                             |
| Fencing network     | `criminal` | `network` | —           | `acceptable` | high   | —              | Distributed stolen-goods market. smuggling is covert transport, not fencing.                                       |
| Counterfeiting ring | `criminal` | `network` | —           | `awkward`    | medium | —              | Ring constitution fits network. finance would pad. Distinctive work unnamed.                                       |
| Protection racket   | `criminal` | —         | —           | `acceptable` | medium | —              | Extortion vs private_security_company. No extortion activity. Omit form.                                           |
| Wreckers            | `criminal` | —         | —           | `acceptable` | high   | —              | Coastal predation. Distinct from pirate_crew by name only under this mapping.                                      |
| Prison gang         | `criminal` | —         | —           | `acceptable` | medium | —              | Same mapping as gang. Confinement context unmodeled.                                                               |
| Beggars' guild      | `criminal` | `guild`   | —           | `awkward`    | medium | `community`    | RPG underworld convention. Could be community/occupational. No begging activity.                                   |

### Mercenary / adventuring / exploratory

| Concept                | Domain         | Form          | Activities | Fit          | Conf.  | Secondary    | Notes                                                                                         |
| ---------------------- | -------------- | ------------- | ---------- | ------------ | ------ | ------------ | --------------------------------------------------------------------------------------------- |
| Mercenary company      | `military`     | `company`     | `warfare`  | `acceptable` | high   | `commercial` | Hired force as an operating enterprise. Distinct from army (no form) by company.              |
| Adventuring company    | `commercial`   | `company`     | —          | `acceptable` | medium | `military`   | Freelance hire enterprise vs mercenary_company (military + warfare). No adventuring activity. |
| Adventurers' guild     | `occupational` | `guild`       | —          | `acceptable` | medium | —            | Membership hall vs a company. occupational as a practice community.                           |
| Explorers' society     | `academic`     | `association` | `research` | `acceptable` | medium | —            | Geographic inquiry as scholarship. Distinct from treasure_hunters (commercial company).       |
| Monster hunters' guild | `occupational` | `guild`       | —          | `acceptable` | medium | `military`   | Specialized practice body. No hunting activity.                                               |
| Treasure hunters       | `commercial`   | `company`     | —          | `acceptable` | medium | —            | Loot-seeking enterprise vs explorers_society.                                                 |
| Ranger company         | `military`     | `company`     | `defense`  | `acceptable` | medium | —            | Wilderness force. company distinguishes from army; defense without necessarily field warfare. |
| Survey expedition      | `academic`     | —             | `research` | `acceptable` | medium | —            | Finite expedition, not a standing constitution. Omit form.                                    |

### Transportation / shipping

| Concept          | Domain         | Form      | Activities | Fit          | Conf.  | Secondary | Notes                                                                          |
| ---------------- | -------------- | --------- | ---------- | ------------ | ------ | --------- | ------------------------------------------------------------------------------ |
| Shipping company | `commercial`   | `company` | —          | `acceptable` | high   | —         | Maritime operator vs navy. No shipping/transport activity.                     |
| Teamsters guild  | `occupational` | `guild`   | —          | `acceptable` | high   | —         | Overland haulage as a trade body vs shipping company.                          |
| Coach line       | `commercial`   | `company` | —          | `acceptable` | high   | —         | Passenger service enterprise. No transport activity.                           |
| River boatmen    | `occupational` | `guild`   | —          | `acceptable` | medium | —         | Inland-water trade brotherhood vs ocean shipping company.                      |
| Courier service  | `commercial`   | `company` | —          | `acceptable` | high   | —         | Private messages/parcels vs postal_service.                                    |
| Postal service   | `government`   | —         | —          | `acceptable` | high   | —         | State/civic mail. Distinct from courier_service by domain. No postal activity. |

### Agriculture / resource extraction

| Concept              | Domain         | Form          | Activities | Fit          | Conf.  | Secondary | Notes                                                                             |
| -------------------- | -------------- | ------------- | ---------- | ------------ | ------ | --------- | --------------------------------------------------------------------------------- |
| Farming cooperative  | `commercial`   | `cooperative` | —          | `acceptable` | high   | —         | Joint agricultural enterprise. No farming activity.                               |
| Logging company      | `commercial`   | `company`     | —          | `acceptable` | high   | —         | Timber extraction enterprise. No logging activity.                                |
| Fishing fleet        | `commercial`   | `company`     | —          | `acceptable` | medium | —         | Harvest fleet as an operating enterprise. No fishing activity. Missing crew form. |
| Ranchers association | `occupational` | `association` | —          | `acceptable` | high   | —         | Livestock producers as a trade constituency.                                      |
| Fur company          | `commercial`   | `company`     | —          | `acceptable` | high   | —         | Extractive trade enterprise.                                                      |

### Secret societies

| Concept          | Domain      | Form      | Activities | Fit          | Conf.  | Secondary   | Notes                                                                                                                                    |
| ---------------- | ----------- | --------- | ---------- | ------------ | ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Secret society   | `community` | `order`   | —          | `awkward`    | medium | `political` | Fellowship/order is the least-wrong constitution. Concealment is the actual distinctive axis and is unmodeled. other would hide the gap. |
| Wizard circle    | `academic`  | `order`   | —          | `acceptable` | medium | —           | Informal magical fellowship vs mage_college (association stretch). No magic activity.                                                    |
| Witches' coven   | `religious` | `order`   | `worship`  | `acceptable` | medium | —           | Small magical/faith fellowship vs cult (congregation). No magic activity.                                                                |
| Conspiracy cabal | `political` | `network` | —          | `acceptable` | medium | —           | Same mapping as succession_cabal. Hidden plot vs succession is name-only. Distinct from spy_ring only by notes.                          |

## Contrast-set stress tests

Fit above asks whether each concept maps honestly. This section asks whether **closely related** concepts stay distinct once mapped.

### Religious

| Concept             | Mapping                                       | Fit          |
| ------------------- | --------------------------------------------- | ------------ |
| Church              | `religious / congregation / worship,ministry` | `clean`      |
| Temple organization | `religious / congregation / worship,ministry` | `acceptable` |
| Religious order     | `religious / order / worship,ministry`        | `clean`      |
| Monastery           | `religious / order / worship`                 | `acceptable` |
| Missionary society  | `religious / association / ministry`          | `acceptable` |
| Cult                | `religious / congregation / worship`          | `acceptable` |

The model distinguishes **order** (religious_order, monastery) from **congregation** (church, temple, cult) and **association** (missionary_society). Church vs temple_organization is identical. Cult vs church differs only by omitting `ministry`. Monastery vs religious_order differs only by omitting `ministry`. Those three pairs are preset-only under the current vocab.

### Military / security

| Concept           | Mapping                              | Fit          |
| ----------------- | ------------------------------------ | ------------ |
| Army              | `military / — / warfare,defense`     | `awkward`    |
| Navy              | `military / — / warfare,defense`     | `awkward`    |
| Militia           | `military / — / warfare,defense`     | `awkward`    |
| Mercenary company | `military / company / warfare`       | `acceptable` |
| Royal guard       | `military / — / defense`             | `acceptable` |
| City watch        | `government / — / defense`           | `acceptable` |
| Knightly order    | `military / order / warfare,defense` | `acceptable` |

Army, navy, and militia collapse to `military` + `—` + `warfare, defense`. Mercenary_company is the one military concept that can take `company` honestly. Royal_guard keeps `defense` only. City_watch was placed in `government` + `defense` so it does not collide with army. Knightly_order is the clean martial `order`. Navy vs army is name-only (no maritime activity). Militia vs army is unmodeled (citizen vs standing).

### Commercial

| Concept            | Mapping                                  | Fit          |
| ------------------ | ---------------------------------------- | ------------ |
| Bank               | `commercial / company / banking,finance` | `clean`      |
| Trading company    | `commercial / company / —`               | `acceptable` |
| Merchant house     | `commercial / company / —`               | `acceptable` |
| Merchant guild     | `occupational / guild / standards`       | `acceptable` |
| Shipping company   | `commercial / company / —`               | `acceptable` |
| Market association | `commercial / association / —`           | `acceptable` |

Operating firms (`company`) vs membership trade bodies is the successful split: bank/trading_company/merchant_house/shipping_company vs merchant_guild (`occupational` + `guild`) vs market_association (`association`). Bank is the only one with `banking`. Trading company, merchant house, and shipping company share `commercial` + `company` + empty activities — transport vs merchandise vs lineage are name-only.

### Academic

| Concept            | Mapping                                                | Fit          |
| ------------------ | ------------------------------------------------------ | ------------ |
| Academy            | `academic / association / education,training,research` | `awkward`    |
| University         | `academic / association / education,research`          | `awkward`    |
| Scholarly society  | `academic / association / research`                    | `clean`      |
| Mage college       | `academic / association / education,training,research` | `awkward`    |
| Research institute | `academic / — / research`                              | `acceptable` |
| Guild of scholars  | `academic / guild / research`                          | `acceptable` |

Scholarly_society is a genuine `association`. Academy, university, and mage_college all use `association` as an institutional escape hatch (awkward). Research_institute omits form and keeps `research`. Guild_of_scholars is the occupational wrapping (`guild`) with academic domain. Mage vs mundane college is name-only.

### Criminal

| Concept            | Mapping                          | Fit          |
| ------------------ | -------------------------------- | ------------ |
| Thieves' guild     | `criminal / guild / —`           | `acceptable` |
| Gang               | `criminal / — / —`               | `acceptable` |
| Smuggling ring     | `criminal / network / smuggling` | `clean`      |
| Criminal syndicate | `criminal / company / —`         | `acceptable` |
| Pirate crew        | `criminal / — / —`               | `awkward`    |
| Assassins' order   | `criminal / order / —`           | `acceptable` |

Form does real work: guild vs omitted vs network vs company vs order. Thieves' guild, gang, smuggling ring, syndicate, and assassins' order remain distinct. Pirate_crew has no crew form and no distinctive activity, so it is awkward and close to a generic criminal body. Smuggling is the only criminal activity that exists.

### Government

| Concept             | Mapping                        | Fit          |
| ------------------- | ------------------------------ | ------------ |
| Government ministry | `government / — / —`           | `acceptable` |
| City council        | `government / association / —` | `acceptable` |
| Royal court         | `government / — / —`           | `awkward`    |
| Bureaucracy         | `government / — / —`           | `acceptable` |

City_council can take `association`; ministry, court, and bureaucracy cannot without lying. Those three therefore collapse to `government` + `—` + empty activities. Royal_court vs ministry vs bureaucracy is name-only. This is the same missing-office/court/force pattern as army.

### Where the model breaks down

1. **Armed forces without a force form.** Army, navy, militia, marines, sky_fleet, and legion share one mapping. Mercenary_company escapes the collapse only because `company` is an honest operating-enterprise form for hired troops.
2. **Government offices without an office/court form.** Ministry, royal court, bureaucracy, magistracy, and governorate share domain plus empty form/activities.
3. **Teaching institutions forced through `association`.** Academy, university, mage_college, and bardic_college. Scholarly_society is the honest association in that family.
4. **Activity coverage is sparse outside the six presets.** Trade, transport, healing, magic, policing, intelligence, theft, and administration are unnamed. Distinctive work then lives in the organization name.
5. **Multi-domain concepts keep one primary.** Crusading host, inquisitorial office, seminary, knightly order, slave-trading company, and hospital order are expressible, but the secondary sphere is notes-only.
6. **Clandestine vs public is unmodeled.** Secret society vs fraternal lodge, spy ring vs intelligence bureau (partially rescued by `network`), cult deviance vs church.

None of these failures required a new persisted organization-type enum in this pass. They pressure form, activity grain, and possibly one independent trait (clandestine) — to be classified in Phase 4.

---

# Phase 4 — Gap taxonomy

Classification of pressure from the Phase 3 matrix. **No vocabulary is proposed
for addition here** — that is Phase 6. Counts below are evidence, not admission
criteria.

A concept may appear in more than one bucket. Army is both a missing-form
problem (A) and a preset-only distinction from navy (F). Secret society is both
a missing clandestine trait (E) and a thin mapping onto `order` (B/C).

Headline:

- The three-axis model is sound enough that **zero** concepts were
  unrepresentable.
- Most strain is **sparse activities** and **two missing forms** (`force`,
  `office`), not a broken domain set.
- Familiar nouns (army, church, bank, academy) are **preset identities**, not
  forms — matching the locked form tests.

Matrix facts used below (150 concepts):

| Signal                                                | Count |
| ----------------------------------------------------- | ----- |
| Omitted form                                          | 46    |
| Empty activities                                      | 88    |
| Secondary domain in notes                             | 37    |
| `company` assignments                                 | 33    |
| `association` assignments                             | 30    |
| Identical `commercial / company / —` signature        | 23    |
| Identical `government / — / —` signature              | 12    |
| Identical `military / — / warfare, defense` signature | 6     |

## A. Missing vocabulary

A dimension is the right place, but a reusable value is absent. Listed only
where **several materially different** concepts share the hole. One-off gaps
stay in notes.

### A1. Form `force` (or host / corps)

Armed or crewed bodies that are not membership associations, operating
companies, networks, or orders.

| Evidence                | Concepts                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Count                   | 9 awkward military mappings plus `pirate_crew`                                                                                                                 |
| Shared mapping          | `military / — / warfare, defense` for army, navy, militia, marines, sky_fleet, legion                                                                          |
| Adjacent                | garrison (`defense` only), crusading_host (`warfare` only), pirate_crew (`criminal / — / —`)                                                                   |
| Why existing forms fail | `company` is honest only for hired enterprises (mercenary_company, ranger_company). `order` is honest for knightly_order. `association` / `network` would lie. |
| Not this form           | warband (irregular; omission is honest), royal_guard (activities already distinguish)                                                                          |

This is the hole the Army preset already documents by omitting form.

### A2. Form `office` (or department / bureau)

Standing administrative institutions that are not membership bodies.

| Evidence                | Concepts                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Count                   | 12 share `government / — / —`                                                                                                                                                            |
| Representatives         | government_ministry, bureaucracy, provincial_governorate, diplomatic_corps, colonial_administration, customs_service, postal_service, intelligence_bureau, secret_police, plague_wardens |
| Nearby, not identical   | exchequer and mint (`government / — / finance`); magistracy and royal_court (judicial/household — possibly the same hole, possibly a narrower `court`)                                   |
| Why existing forms fail | `association` fits councils and parliaments (membership). These are not membership bodies. `company` would commercialize a public office.                                                |

`court` as a separate form has only two strong examples (royal_court, magistracy). That is **not yet** enough to split from `office`.

### A3. Activity coverage outside the six presets

88 concepts have empty activities. That is not 88 missing ids. Most empty
rows are the same few missing **mission** values, repeated across different
organizations.

| Missing mission (not a production id) | Independent examples                                                                                 | Why existing activities fail                                                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Trade / commerce / production         | 23× `commercial / company / —` (trading_company, merchant_house, shipping_company, foundry_works, …) | `banking`/`finance` are financial. `blacksmithing`/`brewing` are single trades. Foundry was correctly **not** mapped to `blacksmithing`. |
| Administration / governance           | ministry, bureaucracy, governorate, colonial_administration                                          | No administration activity. `standards` is occupational certification, not public administration.                                        |
| Transport                             | shipping_company, caravan_company, coach_line, courier_service, teamsters_guild, river_boatmen       | No transport activity. Domain/form already distinguish operator vs guild.                                                                |
| Healing / care                        | hospital_order, apothecaries_guild, surgeons_college, plague_wardens, hospice_society                | No healing activity. Building evidence already deferred apothecary here.                                                                 |
| Policing / investigation              | city_watch, marshals, secret_police, inquisitorial_office, customs_service                           | `defense` covers protection, not law enforcement or investigation.                                                                       |
| Intelligence / espionage              | intelligence_bureau, spy_ring                                                                        | No espionage activity. `network` distinguishes constitution, not work.                                                                   |
| Advocacy                              | reform_league, advocacy_society, labor_union, political_party                                        | `advocacy` was explicitly rejected from the activity registry. Empty activities are honest.                                              |
| Theft / predation                     | thieves_guild, gang, pirate_crew, protection_racket, wreckers                                        | `smuggling` is the only illicit activity. It was not padded onto these.                                                                  |

`blacksmithing` exists and was **unused** in this corpus. That is unusually
narrow (Phase 5), not a missing-value argument for more craft ids.

One-off holes (magic, diplomacy, shipbuilding, insurance, counterfeiting) do
**not** yet justify ids.

## B. Overloaded vocabulary

Escape hatches and discovery-term traps. Genuine reuse is not overload.

### B1. `association` — 30 uses, of which 4 are institutional escape hatches

`association` is doing its job for membership bodies (councils, parties,
societies, leagues, clubs, unions). Overload is concentrated:

| Kind                       | Count | Examples                                                                                              |
| -------------------------- | ----- | ----------------------------------------------------------------------------------------------------- |
| Genuine membership         | 26    | city_council, political_party, scholarly_society, mutual_aid_society, labor_union, market_association |
| Institutional escape hatch | 4     | academy, university, mage_college, bardic_college                                                     |

Those four are teaching institutions forced through a membership form. That is
the Academy preset’s known stretch, now repeated.

### B2. `company` — 33 uses, mostly honest; collapse is activity sparsity

Almost every `company` assignment is an operating enterprise. That is not
structural overload. The pressure is 23 concepts sharing
`commercial / company / —` because trade/production activities are missing (A3).

Mild stretches, not a dump category: fishing_fleet (crew-like),
criminal_syndicate (illicit enterprise — `network` was refused despite
discovery terms), slave_trading_company (secondary criminal).

Mercenary_company and ranger_company are **successful** `company` uses on
military domain.

### B3. `network` — 7 uses, 3 cabal stretches

Honest rings/cells: smuggling_ring, spy_ring, fencing_network,
counterfeiting_ring, revolutionary_cell.

Stretch: succession_cabal, conspiracy_cabal (clique vs distributed cells).

Discovery terms include `syndicate` and `ring`. Phase 3 **did not** map
criminal_syndicate or bazaar_syndicate to `network`. That discipline should
stay: syndicate is not automatically a network.

### B4. `guild` — 18 uses, mostly occupational

16 occupational or academic practice bodies. Two RPG underworld wrappings:
thieves_guild (acceptable), beggars_guild (awkward). Not absorbing structurally
unrelated forms.

### B5. `order` — 10 uses, successful domain-independence, two stretches

Honest: religious_order, monastery, knightly_order, assassins_order,
druid_circle, witches_coven, wizard_circle, hospital_order (historically an
order).

Stretch: secret_society, fraternal_lodge — ritual fellowship, not necessarily a
rule-bound order. `order` is the least-wrong form, not a perfect one.

### B6. `congregation` — 4 uses, not overloaded, domain-leaked

church, temple_organization, cult, heretical_sect. All religious. See C.

`cooperative` (2) is unused-narrow, not overloaded.

## C. Wrong semantic dimension

A useful distinction that does **not** belong in the dimension people reach for.

### C1. Army, church, academy, bank are not forms

Form tests already reject `army`, `bank`, `church`, `academy`. The corpus
confirms:

| Familiar noun | What it actually is                                       | What it is not                                                                  |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Army          | Preset identity over `military` + missing force form      | Not a form. Navy and militia would then need sibling forms.                     |
| Church        | Preset identity over `religious` + `congregation`         | Not a form. Temple and cult would proliferate.                                  |
| Bank          | Preset identity over `commercial` + `company` + `banking` | Not a form. Moneylenders/pawnbrokers are the same form with thinner activities. |
| Academy       | Preset identity over a teaching institution               | Not a form, and not honestly an `association`.                                  |

Do not recreate the preset taxonomy inside `OrganizationForm`.

### C2. `congregation` is a domain leak into form

Every other form claims domain independence. `congregation` is defined as
shared **religious** practice. The four uses are all `religious`. A gathered
non-religious membership already has `association`.

This is a definition leak, not a missing religious form. Repair options
(Phase 6): generalize the definition, or treat `congregation` as a religious
specialization that should not have been a form.

### C3. Activity grain mixes trades with missions

`blacksmithing` and `brewing` are specific trades. `worship`, `warfare`,
`banking` are institutional missions. The commercial corpus needed a mission
(`trade` / `production`), not more craft ids. `blacksmithing` went unused.

This is the same grain problem building taxonomy deferred (apothecary as
organization activity, not a new facility).

### C4. Medical and magical are not missing domains

Five medical concepts mapped without a medical domain: hospital_order
(`religious` + `order`), apothecaries_guild and surgeons_college
(`occupational`), plague_wardens (`government`), hospice_society
(`community`). Primary domain remained meaningful. The shared hole is a
**healing activity** (A3), not a domain.

Magical study mapped to `academic` / `occupational` / `religious`
(mage_college, wizard_circle, alchemists_guild, witches_coven). Magic is
flavor or an activity, not a sphere alongside government/military.

### C5. `house` is not a form

merchant_house and auction_house use `company`. Lineage/family firm is
preset/name. Form tests already reject `house`.

## D. Multi-dimensional organizations

37 of 150 (25%) recorded a secondary sphere in notes. **Do not make `domain`
multi-valued** on this evidence.

| Question                                     | Finding                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How common?                                  | 25% — frequent enough to notice, not the typical case.                                                                                                                                                        |
| Does a primary remain meaningful?            | Yes. Every concept got one honest primary. `other` unused.                                                                                                                                                    |
| Do activities already express the secondary? | Sometimes. Seminary (`academic` + `education, ministry`) carries the religious secondary in activities. Knightly_order’s religious secondary is notes-only. Crusading_host omitted `worship` rather than pad. |
| Does the problem belong elsewhere?           | Usually: missing activity (A3), preset identity (F), or a clandestine trait (E).                                                                                                                              |

Representative pairs (primary kept):

| Concept                 | Primary        | Secondary  | Carried by                   |
| ----------------------- | -------------- | ---------- | ---------------------------- |
| Knightly order          | `military`     | religious  | form `order`; not activities |
| Crusading host          | `military`     | religious  | notes only                   |
| Seminary                | `academic`     | religious  | `ministry` activity          |
| Inquisitorial office    | `religious`    | government | notes only                   |
| Slave-trading company   | `commercial`   | criminal   | notes only                   |
| Merchant guild          | `occupational` | commercial | form `guild`                 |
| Colonial administration | `government`   | military   | notes only                   |
| Hospital order          | `religious`    | community  | form `order`                 |

A second domain field would duplicate what activities, form, and name already
split in the successful cases, and would not fix the unsuccessful ones
(crusading_host still lacks a force form).

## E. Missing conceptual dimension

New **fields**, not new enum values. Require repeated cross-family evidence.
Examples from the brief that **failed** that bar are listed so they are not
re-proposed casually.

### E1. Official vs clandestine — strongest candidate, still not proven as a field

Concealment is the distinctive axis for several mappings that otherwise
collapse:

| Public / overt      | Clandestine counterpart    | Current mapping                                    |
| ------------------- | -------------------------- | -------------------------------------------------- |
| Fraternal lodge     | Secret society             | both `community / order / —`                       |
| Intelligence bureau | Spy ring                   | `government / — / —` vs `government / network / —` |
| Political party     | Revolutionary cell / cabal | association vs network                             |
| Church              | Cult (partial)             | congregation ± `ministry`                          |

Also: secret_police, succession_cabal, conspiracy_cabal.

This crosses domains (community, government, political, religious). `criminal`
is **not** a substitute: illicit enterprise ≠ concealment (a thieves’ guild can
be a known city institution).

`network` partially rescues cell-structured clandestine orgs, but a secret
order is not a network.

**Not admitted yet.** Repeated, but it may still be a preset/name overlay
(building taxonomy treated `safe_house` / `thieves_den` as overlays). Reopen in
Phase 6 only if a consumer needs to filter “hidden” independently of domain.

### E2. Rejected as independent fields (insufficient or already owned)

| Candidate                     | Evidence                                                                 | Why not a field                                                                               |
| ----------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Membership vs institution     | Academy vs scholarly_society                                             | Already form’s job. The hole is missing institutional forms (A1, A2), not a fourth axis.      |
| Hierarchical vs decentralized | network vs others                                                        | Already form.                                                                                 |
| Public vs private             | private_security_company vs city_watch                                   | Already domain (`commercial` vs `government`).                                                |
| Geographic scope              | city_watch vs marshals; city_council vs parliament; diocese; governorate | Name/preset. Four weak pairs, not a stable axis.                                              |
| Parent / subordinate          | diocese vs church; colonial_administration                               | Relationship, not classification. No org–org hierarchy exists; do not smuggle one into vocab. |
| State-sponsored               | chartered_company, tax_farmers                                           | Two examples. Secondary `government` notes suffice.                                           |
| Citizen vs standing           | militia vs army                                                          | One pair. Preset-only (F).                                                                    |

## F. Preset-only distinctions

Useful for authors; **must not** become vocab. These are why presets remain
projections.

| Family                                      | Shared mapping                                           | What the name carries                                                                                               |
| ------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Land / sea / air / levy / formation         | `military / — / warfare, defense`                        | army, navy, militia, marines, sky_fleet, legion                                                                     |
| Parish vs cult-center                       | `religious / congregation / worship, ministry`           | church, temple_organization                                                                                         |
| Schism vs deviance                          | `religious / congregation / worship`                     | heretical_sect, cult                                                                                                |
| Teaching brand                              | `academic / association / education, training, research` | academy, mage_college                                                                                               |
| Operating firm without a trade activity     | `commercial / company / —`                               | trading_company, merchant_house, shipping_company, caravan_company, warehouse_combine, fur_company, … (23)          |
| Street crime without a distinctive activity | `criminal / — / —`                                       | gang, protection_racket, wreckers, prison_gang (pirate_crew sits here plus A1)                                      |
| Civic mutual-aid societies                  | `community / association / —`                            | orphanage, famine relief, burial, civic league, festival, sporting club (mutual_aid_society is the clean prototype) |
| Deliberative chamber                        | `government / association / —`                           | parliament, senate, privy_council (city_council is the local variant)                                               |
| Cabal flavor                                | `political / network / —`                                | succession_cabal, conspiracy_cabal                                                                                  |
| Crown vs municipal watch                    | `government / — / defense`                               | marshals, city_watch                                                                                                |
| Learned vs exploring society                | `academic / association / research`                      | scholarly_society, explorers_society                                                                                |

Navy does not need a domain, form, or activity of its own. It needs the same
force-form hole as army (A1) plus a **preset** that authors can pick as “Navy.”

Academy does not need to become a form. It needs either an institutional form
later (Phase 6) or to remain a preset that currently misuses `association` (C1).

## Bucket map for the locked familiar nouns

| Noun    | A                  | B                        | C                                         | D   | E                       | F                           |
| ------- | ------------------ | ------------------------ | ----------------------------------------- | --- | ----------------------- | --------------------------- |
| Army    | missing force form |                          | not a form                                |     |                         | vs navy/militia/legion      |
| Church  |                    |                          | not a form; congregation is domain-tinged |     | vs cult (secrecy, weak) | vs temple_organization      |
| Bank    |                    |                          | not a form                                |     |                         | vs moneylenders/pawnbrokers |
| Academy |                    | association escape hatch | not a form; not a membership body         |     |                         | vs university/mage_college  |

## What Phase 4 does **not** conclude

- Do not add a domain. The ten-value set plus unused `other` held.
- Do not make domain multi-valued.
- Do not promote army/church/bank/academy to forms.
- Do not add new craft-specific activities without separate evidence.
  Existing narrow tags (`blacksmithing`, `brewing`) stay; mixed grain is not
  permanently desirable.
- Do not add geographic scope, parent org, or membership-vs-institution fields.

Phase 5 quantified these counts. Phase 6 ranks the few candidates that survive
this taxonomy (`force`, `office`, a small mission-activity set, possibly
clandestine as a trait). Do not treat a rank as admission to the registries.

---

# Phase 5 — Coverage and vocabulary pressure

Quantitative readout of matrix v0.1. Classification of _why_ a count matters
is Phase 4; _whether_ a count is large enough to reopen in Phase 6 is here.
Phase 3’s fit tally remains a mapping check only.

Denominator is **150 concepts** unless noted. Form is optional, so omitted form
is a real assignment (honest absence), not a missing row. Activities are
multi-valued: 89 activity assignments across 62 concepts (41%) that have at
least one.

## Fit

| Fit               |   Count |    Share |
| ----------------- | ------: | -------: |
| `clean`           |       9 |       6% |
| `acceptable`      |     117 |      78% |
| `awkward`         |      24 |      16% |
| `unrepresentable` |       0 |       0% |
| **Total**         | **150** | **100%** |

84% map without strain (`clean` + `acceptable`). Awkward is concentrated, not
diffuse: 9 of 24 are the missing-force family (8 military plus `pirate_crew`);
4 are teaching institutions on `association`; the rest are one-off least-wrong
domains or unnamed distinctive work.

Confidence: 75 high, 74 medium, 1 low (`succession_cabal`). Low-confidence
rows do not drive vocabulary.

## Domain usage

Every shipped domain except the residual.

| Domain         | Count | Share | Form omitted | Empty activities |
| -------------- | ----: | ----: | -----------: | ---------------: |
| `commercial`   |    33 |   22% |            0 |               26 |
| `government`   |    21 |   14% |           16 |               17 |
| `occupational` |    20 |   13% |            0 |                9 |
| `religious`    |    15 |   10% |            4 |                2 |
| `military`     |    14 |    9% |           11 |                0 |
| `academic`     |    14 |    9% |            5 |                2 |
| `criminal`     |    12 |    8% |            5 |               11 |
| `community`    |    12 |    8% |            2 |               12 |
| `political`    |     9 |    6% |            3 |                9 |
| `other`        |     0 |    0% |            — |                — |

Read:

- **Domain set held.** `other` unused. No concept required a new sphere.
- **Commercial is the largest bucket** because the corpus is full of firms, not
  because `commercial` is a dump. Form is always present (`company` /
  `cooperative`). Activities are empty (26/33) — trade/production hole (A3).
- **Government omits form 16/21** — office hole (A2). Councils take
  `association`; offices cannot.
- **Military omits form 11/14** but **never** lacks activities. Force hole
  (A1), not an activity hole.
- **Occupational never omits form** — `guild` / `association` are honest.
- **Community and political never received an activity** (12/12 and 9/9
  empty). Mutual aid and advocacy have no mission ids.
- **Religious is the best-covered domain** on activities (only 2 empty).

## Form usage

| Form           | Count | Share | Pressure                                                                              |
| -------------- | ----: | ----: | ------------------------------------------------------------------------------------- |
| _(omitted)_    |    46 |   31% | Largest “value.” Concentrated in government (16) and military (11).                   |
| `company`      |    33 |   22% | Honest enterprise. 23 share `commercial / company / —` (activity sparsity, not dump). |
| `association`  |    30 |   20% | 26 genuine membership; **4 teaching-institution escape hatches** (academy family).    |
| `guild`        |    18 |   12% | Honest practice bodies. Two underworld wrappings.                                     |
| `order`        |    10 |    7% | Successful domain-independence. Two fellowship stretches.                             |
| `network`      |     7 |    5% | Five rings/cells; two cabal stretches. Syndicate **not** auto-mapped.                 |
| `congregation` |     4 |    3% | All religious. Narrow because domain-leaked (C), not because unused.                  |
| `cooperative`  |     2 |    1% | Unusually narrow but honest (millers, farmers). One-off expansion not justified.      |

30% omitted is not “authors forgot form.” Phase 3 preferred `—` over escape
hatches. The omitted mass _is_ the force/office evidence.

**30 concepts map to `association`.** That would suggest dump-category risk;
the split is 26 honest membership vs 4 institutional stretches. Do not treat
the raw 30 as a mandate to split `association`. Treat the **4** as the
overload.

**33 concepts map to `company`.** Same caution: the 23-way empty-activity
collapse is a missing mission, not 23 different constitutions.

## Activity usage

14 shipped ids. Count = concepts that include the activity (a concept may
count in several rows).

| Activity         | Concepts | Share of 150 | Grain        | Pressure                                                                       |
| ---------------- | -------: | -----------: | ------------ | ------------------------------------------------------------------------------ |
| `defense`        |       13 |           9% | mission      | Broadest. Also a euphemism risk for policing.                                  |
| `warfare`        |       11 |           7% | mission      | Tied to the force family.                                                      |
| `worship`        |       11 |           7% | mission      | Religious coverage is real.                                                    |
| `standards`      |       10 |           7% | occupational | Guild/profession governance.                                                   |
| `research`       |       10 |           7% | mission      | Academic coverage is real.                                                     |
| `training`       |        8 |           5% | mission      | Often stacked with education/standards.                                        |
| `ministry`       |        7 |           5% | mission      | Distinguishes church/order from cult in the religious family.                  |
| `finance`        |        7 |           5% | mission      | Broader than `banking`; used by moneylenders, mint, tax farmers.               |
| `education`      |        5 |           3% | mission      | Teaching institutions.                                                         |
| `apprenticeship` |        4 |           3% | occupational | Craft-guild family.                                                            |
| `banking`        |        1 |         0.7% | mission      | Bank preset only. Narrow and **correct**.                                      |
| `brewing`        |        1 |         0.7% | trade        | Brewery preset analog. Narrow grain.                                           |
| `smuggling`      |        1 |         0.7% | illicit      | Smuggling-ring preset only. Narrow and **correct**.                            |
| `blacksmithing`  |        0 |           0% | trade        | **Unused.** Foundry was not mapped here (casting ≠ forging). Unusually narrow. |

62 concepts (41%) have ≥1 activity. Length: 88 none, 38 one, 21 two, 3 three
(the three triples are the academy preset shape and `craft_guild`).

Mean 0.59 activities/concept. Religious and military are covered; commercial,
community, political, and criminal mostly are not.

## Signature collapse

58 distinct domain/form/activities tuples for 150 concepts. **122 concepts
(81%) share a signature with at least one other concept.**

Collapses of 5+ (the pressure concentrations):

| Size | Mapping                           | Bucket                                        |
| ---: | --------------------------------- | --------------------------------------------- |
|   23 | `commercial / company / —`        | A3 trade/production; F firm presets           |
|   12 | `government / — / —`              | A2 office form; F ministry vs court vs bureau |
|    8 | `community / association / —`     | A3 care/civic mission; F mutual-aid presets   |
|    6 | `military / — / warfare, defense` | A1 force form; F army vs navy vs militia      |
|    6 | `occupational / guild / —`        | A3 missing practice activity; F guild flavors |
|    5 | `criminal / — / —`                | A3 theft/predation; F gang flavors            |

A collapse of **23** is vocabulary pressure. A collapse of **2** (church vs
temple; millers vs farmers cooperative) is a preset-only distinction.

## Recurring missing vs one-off

Phase 6 should only reopen rows with repeated independent examples.

| Candidate (not a production id)                      |                                      Independent concepts | Verdict                                            |
| ---------------------------------------------------- | --------------------------------------------------------: | -------------------------------------------------- |
| Form `force`                                         |                                    9+ armed/crewed bodies | Recurring — reopen                                 |
| Form `office`                                        |                                12 government institutions | Recurring — reopen                                 |
| Activity trade/production                            |                                              23 companies | Recurring — reopen                                 |
| Activity administration                              |                                     12 government empties | Recurring — reopen                                 |
| Activity transport                                   | 6 (shipping, caravan, coach, courier, teamsters, boatmen) | Recurring — reopen                                 |
| Activity healing/care                                |                                        5 medical concepts | Recurring — reopen                                 |
| Activity policing                                    |  5 (watch, marshals, secret police, inquisition, customs) | Recurring — reopen                                 |
| Activity advocacy                                    |                4 (party, reform, advocacy society, union) | Recurring — reopen; previously rejected from vocab |
| Activity theft                                       |                           5 (`criminal / — / —` collapse) | Recurring — reopen                                 |
| Activity intelligence                                |                                      2 (bureau, spy ring) | Borderline — probably not yet                      |
| Form `court`                                         |                               2 (royal court, magistracy) | One-off pair — **do not expand yet**               |
| Form `crew` vs `force`                               |                                pirate_crew, fishing_fleet | One-off — fold into force or leave name            |
| Domain medical / magical                             |                         0 unrepresentable; primaries held | One-off as domains — **do not add**                |
| Activity magic, diplomacy, insurance, counterfeiting |                                                  1–2 each | One-off — **do not expand yet**                    |

> A proposed missing form occurs twice (`court`) and therefore does not yet
> justify vocabulary expansion.

> 23 concepts map to `commercial / company` with empty activities, suggesting
> a missing trade/production _mission_, not 23 new company subtypes.

## Unused or unusually narrow

| Value           | Dimension | Count | Reading                                                                   |
| --------------- | --------- | ----: | ------------------------------------------------------------------------- |
| `other`         | domain    |     0 | Residual worked as designed: unused because primaries held. Keep.         |
| `blacksmithing` | activity  |     0 | Too narrow for the corpus. Warning against more craft ids.                |
| `cooperative`   | form      |     2 | Honest and rare. Keep; do not generalize away.                            |
| `congregation`  | form      |     4 | Narrow _and_ domain-leaked. Count is not evidence it is useful as a form. |
| `banking`       | activity  |     1 | Correctly narrow. Distinguishes bank from moneylenders (`finance` only).  |
| `smuggling`     | activity  |     1 | Correctly narrow. Only illicit activity that exists.                      |
| `brewing`       | activity  |     1 | Narrow grain sibling of unused `blacksmithing`.                           |

Do not delete narrow-but-correct values (`banking`, `smuggling`) on coverage
grounds. Do not add siblings of unused-narrow (`blacksmithing`) to chase
coverage.

## Coverage verdict (input to Phase 6)

1. **Domain coverage is adequate.** 9 of 10 used; `other` unused on purpose.
2. **Form coverage is adequate except two holes** with double-digit evidence:
   `force` and `office`. `association` overload is 4 rows, not 30.
3. **Activity coverage is the weakest axis.** 59% of concepts have none. The
   deficit is a handful of missions, not an open-ended trade catalog.
4. **81% of concepts are not unique as classification tuples.** Presets must
   absorb the familiar nouns inside those collapses.

---

# Phase 6 — Candidate refinements

Ranked proposals only. **Do not implement** in this pass. Proposed ids are
discovery labels — they are not in the registries and must not be treated as
shipped vocabulary.

Principle: do not add a value because one preset needs it. Prefer additions
supported by several materially different organizations. Prefer a small coherent
set; presets absorb familiar nouns (Phase 7).

If a later pass implements anything, implement the **high-confidence package
together** (two forms + four missions). Adding `force` without `office` leaves
government offices as the remaining omitted-form dump. Adding `trade` without
`production` and `transport` repeats the craft-vs-mission grain mistake in
miniature.

Would-use counts are _how many of the 150 would honestly take the value if it
existed_, not current mappings. Core vs extended notes where the boundary is
fuzzy.

## Ranking summary

| Rank   | Id (proposed)             | Dimension     | Would-use (core) | Why it survives                                                               |
| ------ | ------------------------- | ------------- | ---------------: | ----------------------------------------------------------------------------- |
| High   | `force`                   | Form          |                9 | Armed/crewed host has no constitution. Army preset already omits form.        |
| High   | `office`                  | Form          |               12 | Appointed institution has no constitution. 12-way `government / — / —`.       |
| High   | `trade`                   | Activity      |               10 | Largest activity hole among operating firms.                                  |
| High   | `production`              | Activity      |                7 | Making/extracting is not `trade` and is not a craft id.                       |
| High   | `transport`               | Activity      |                6 | Moving people/goods/messages; independent of trade.                           |
| High   | `administration`          | Activity      |                7 | Government work unnamed; pairs with `office` as `warfare` pairs with `force`. |
| Medium | `care`                    | Activity      |                5 | Medical concepts kept a domain; distinctive work unnamed.                     |
| Medium | `policing`                | Activity      |                5 | `defense` is a euphemism for several; overlap needs a rule.                   |
| Medium | `advocacy`                | Activity      |                4 | Entire political domain has empty activities; previously rejected from vocab. |
| Medium | clandestine               | Trait / field |                7 | Crosses domains; ownership (field vs overlay vs preset) unsolved.             |
| Low    | `court`                   | Form          |                2 | Fold into `office` until more families appear.                                |
| Low    | `crew`                    | Form          |                2 | Fold into `force` or leave to name.                                           |
| Low    | `college` / `institution` | Form          |                4 | One teaching family; `institution` would collide with `office`.               |
| Low    | `theft`                   | Activity      |                5 | Catalog trap (then assassination, extortion, fencing…).                       |
| Low    | `intelligence`            | Activity      |                2 | Borderline pair.                                                              |

**Explicitly not recommended** (reaffirmed, not re-argued): new domain; multi-valued
domain; promoting army/church/bank/academy to forms; a craft activity per trade;
geographic scope, parent-org, or membership-vs-institution fields.

---

## High confidence

Repeated evidence across materially different concepts. Semantics are clear
enough to draft a definition.

### Form `force`

|                       |                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `force`                                                                                                                                                                                                                                     |
| **Dimension**         | Form                                                                                                                                                                                                                                        |
| **Definition**        | An organization constituted as an armed, levied, or crewed host rather than as a membership body or an operating enterprise.                                                                                                                |
| **Examples**          | army, navy, militia, marines, sky fleet, legion, garrison, crusading host, pirate crew                                                                                                                                                      |
| **Would-use**         | **9 core.** Extended ~13 if royal guard, warband, city watch, and marshals are included.                                                                                                                                                    |
| **Why existing fail** | No current form names a host. `company` is an escape hatch (the Army preset omits form on purpose). `order` fits knightly membership, not a field army. `network` over-specifies cells.                                                     |
| **Overlap risk**      | **Low if scoped.** Mercenary company and ranger company stay `company` (hired enterprise). Knightly order stays `order`. City watch / marshals may share `force` or wait on `policing` (medium). Do not also add `crew`, `host`, or `army`. |

Navy vs army vs militia remain **preset/name** on this form (Phase 4 F).

### Form `office`

|                       |                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Proposed value**    | `office`                                                                                                                                                                                                                                                                                                                       |
| **Dimension**         | Form                                                                                                                                                                                                                                                                                                                           |
| **Definition**        | An appointed or statutory institution that exercises authority or performs an official function, rather than a voluntary membership body.                                                                                                                                                                                      |
| **Examples**          | government ministry, bureaucracy, provincial governorate, colonial administration, diplomatic corps, postal service, customs service, intelligence bureau, magistracy, exchequer                                                                                                                                               |
| **Would-use**         | **12 core** (`government / — / —` collapse). Extended ~14–15 with exchequer, mint, inquisitorial office.                                                                                                                                                                                                                       |
| **Why existing fail** | `association` is honest for councils/parliament (membership chambers) and a lie for a ministry. `company` would privatize the state. The Army-shaped hole for government is omitted form, not a missing domain.                                                                                                                |
| **Overlap risk**      | **Medium on the court edge.** Royal court and magistracy could be a later `court` form (low; n=2). Define `office` broadly enough to hold them for now. Do not add a generic `institution` form — it would collide with `office` and with academic teaching bodies. Diocese is a territorial see, not automatically an office. |

Parliament / senate / privy council stay `association`. Tax farmers stay `company`.

### Activity `trade`

|                       |                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `trade`                                                                                                                                                                                                                         |
| **Dimension**         | Activity (mission)                                                                                                                                                                                                              |
| **Definition**        | Sustained buying, selling, or exchanging of goods or commercial services as an operating concern.                                                                                                                               |
| **Examples**          | trading company, merchant house, chartered company, auction house, spice consortium, warehouse combine, bazaar syndicate, fur company, company of merchant adventurers, slave-trading company                                   |
| **Would-use**         | **10.** Not the full 23-way `commercial / company / —` collapse — that mix also needs `production` and `transport`.                                                                                                             |
| **Why existing fail** | No exchange mission exists. `finance` / `banking` are capital, not goods. `blacksmithing` / `brewing` are craft ids and were not used (or used once) for this family.                                                           |
| **Overlap risk**      | **Low if production and transport are sibling missions.** Merchant guild stays occupational `standards` (represents a trade, does not operate one). Market / shopkeepers associations are constituencies, not operating houses. |

### Activity `production`

|                       |                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `production`                                                                                                                                                                                                                          |
| **Dimension**         | Activity (mission)                                                                                                                                                                                                                    |
| **Definition**        | Making, extracting, or processing goods at organizational scale.                                                                                                                                                                      |
| **Examples**          | foundry works, textile manufactory, shipyard, glassworks, millers cooperative, logging company, fishing fleet                                                                                                                         |
| **Would-use**         | **7.** Brewery company already has `brewing` and need not dual-tag.                                                                                                                                                                   |
| **Why existing fail** | Foundry was not mapped to `blacksmithing` (casting ≠ forging). That unused craft id is the warning: the hole is a mission, not another trade. Farming cooperative is joint ownership (`cooperative`) plus unnamed growing/extracting. |
| **Overlap risk**      | **Intentional with `blacksmithing` / `brewing`.** Those stay unusually narrow. Do not add more craft siblings. Do not fold logging/fishing into `trade`.                                                                              |

### Activity `transport`

|                       |                                                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `transport`                                                                                                                                                                                                       |
| **Dimension**         | Activity (mission)                                                                                                                                                                                                |
| **Definition**        | Moving people, goods, or messages as a sustained service.                                                                                                                                                         |
| **Examples**          | shipping company, caravan company, coach line, courier service, teamsters guild, river boatmen                                                                                                                    |
| **Would-use**         | **6.** Postal service is a possible seventh (government office that moves mail).                                                                                                                                  |
| **Why existing fail** | No movement mission. `smuggling` is covert illicit movement, not a civilian operator. Navy is a `force`, not a carrier.                                                                                           |
| **Overlap risk**      | **Low vs `trade`.** A trading company that also hauls may take both; a coach line should not have to pretend it is a merchant house. Postal vs courier stays a domain distinction (`government` vs `commercial`). |

### Activity `administration`

|                       |                                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `administration`                                                                                                                                                                  |
| **Dimension**         | Activity (mission)                                                                                                                                                                |
| **Definition**        | Conducting official, bureaucratic, or institutional administration — records, policy execution, civil function — as sustained work.                                               |
| **Examples**          | government ministry, bureaucracy, provincial governorate, colonial administration, diplomatic corps, postal service, customs service                                              |
| **Would-use**         | **7.** Not every omitted-form government concept: chambers keep empty-or-later legislation; watch keeps defense/policing; exchequer already has `finance`.                        |
| **Why existing fail** | Government offices collapse to empty activities even after `office` lands. `ministry` is pastoral religious care, not a civil service. `standards` is occupational certification. |
| **Overlap risk**      | **Name collision with religious `ministry`.** Keep both; they are different work. Do not use `administration` as a dump for “any government org.”                                 |

`force` + `warfare`/`defense` already show the pattern: form is constitution, activity is work. `office` without `administration` would still leave a 12-way activity collapse.

---

## Medium confidence

Useful pattern; semantics or ownership still need a rule before a registry edit.

### Activity `care`

|                       |                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `care`                                                                                                                                   |
| **Dimension**         | Activity (mission)                                                                                                                       |
| **Definition**        | Providing healing, nursing, or charitable bodily care as sustained work.                                                                 |
| **Examples**          | hospital order, hospice society, plague wardens; possibly surgeons college, apothecaries guild                                           |
| **Would-use**         | **3–5.** Occupational medical bodies already have `standards` / `apprenticeship`.                                                        |
| **Why existing fail** | No healing mission. `ministry` is spiritual. Medical is not a missing domain (Phase 4 C).                                                |
| **Overlap risk**      | **Catalog pressure** (pharmacy vs surgery vs public health). One broad `care` is the same grain as `trade`. Do not add a medical domain. |

### Activity `policing`

|                       |                                                                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `policing`                                                                                                                                                                                                                  |
| **Dimension**         | Activity (mission)                                                                                                                                                                                                          |
| **Definition**        | Enforcing civic, fiscal, or political order through investigation, patrol, or internal security — distinct from field warfare.                                                                                              |
| **Examples**          | city watch, marshals, secret police, inquisitorial office, customs service                                                                                                                                                  |
| **Would-use**         | **5.** Private security company already uses `defense` honestly (hired protection).                                                                                                                                         |
| **Why existing fail** | Watch/marshals used `defense` as a nearest neighbor. Secret police omitted it as a euphemism.                                                                                                                               |
| **Overlap risk**      | **High with `defense`.** Needs a rule: `defense` = protecting from external/armed threat; `policing` = enforcing order among a population. Until that rule is crisp, watch could stay on `defense` + optional `force` form. |

### Activity `advocacy`

|                       |                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | `advocacy`                                                                                                                                                                                        |
| **Dimension**         | Activity (mission)                                                                                                                                                                                |
| **Definition**        | Campaigning, representing, or organizing around a cause, constituency, or program of change.                                                                                                      |
| **Examples**          | political party, reform league, advocacy society, labor union                                                                                                                                     |
| **Would-use**         | **4.** Civic league is a possible fifth.                                                                                                                                                          |
| **Why existing fail** | Political domain is 9/9 empty activities. Tests previously **rejected** `advocacy` from the activity vocab. The corpus now shows that rejection is why the whole political column has no mission. |
| **Overlap risk**      | **Reopen-vs-reject.** If it returns, it must stay a mission (not a domain). Independence fronts and populist movements may still omit it (mass movement ≠ campaign organization).                 |

### Clandestine (trait, not an enum on domain/form/activity)

|                       |                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed value**    | Not a classification id. Candidate field or overlay, e.g. official vs clandestine.                                                                                                                                                          |
| **Dimension**         | Missing conceptual dimension (Phase 4 E)                                                                                                                                                                                                    |
| **Definition**        | Whether the organization conceals its existence, membership, or purpose from the public or the state.                                                                                                                                       |
| **Examples**          | secret society vs fraternal lodge; spy ring vs intelligence bureau; revolutionary cell vs political party; succession/conspiracy cabals; secret police; cult (partial)                                                                      |
| **Would-use**         | **~7** as a filterable trait.                                                                                                                                                                                                               |
| **Why existing fail** | `network` only captures cell structure. `criminal` is illicit enterprise, not concealment (a thieves’ guild can be a known city institution).                                                                                               |
| **Overlap risk**      | **Ownership unsolved.** May still be a preset/name overlay (building taxonomy treated some concealment as overlay). Do not add a `secret` domain or a `cabal` form. Reopen only if a consumer must filter “hidden” independently of domain. |

---

## Low confidence / defer

Interesting, but not enough independent families — or a catalog trap.

| Candidate                                   | Dimension |                 n | Why defer                                                                                                                                              |
| ------------------------------------------- | --------- | ----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `court`                                     | Form      |                 2 | Royal court + magistracy. Hold inside `office`.                                                                                                        |
| `crew`                                      | Form      |                 2 | Pirate crew, fishing fleet. Hold inside `force` or name.                                                                                               |
| `college` / `institution`                   | Form      |                 4 | Academy family only. Generic `institution` collides with `office`. Keep academy as a stretched preset (Phase 7).                                       |
| `theft`                                     | Activity  |                 5 | Uncollapses `criminal / — / —`, then invites assassination, extortion, fencing, counterfeiting. Domain + form already distinguish guild/network/order. |
| `intelligence`                              | Activity  |                 2 | Bureau vs spy ring is already form (`—` vs `network`).                                                                                                 |
| magic, diplomacy, insurance, counterfeiting | Activity  |               1–2 | One-off distinctive work. Name/preset.                                                                                                                 |
| Medical / magical **domain**                | Domain    | 0 unrepresentable | Primaries held.                                                                                                                                        |
| Geographic scope, parent org                | Field     |        weak pairs | Phase 4 E2.                                                                                                                                            |
| Multi-valued domain                         | Schema    |    37 secondaries | Primary always worked.                                                                                                                                 |

`blacksmithing` remaining unused is evidence **against** more craft ids, not a candidate to keep filling.

---

## Package and non-goals

**Smallest coherent next vocab pass (not this pass):**

1. Forms: `force`, `office`.
2. Mission activities: `trade`, `production`, `transport`, `administration`.
3. Leave `care`, `policing`, `advocacy`, and clandestine for a follow-up once overlap rules are written.
4. Do not touch domain. Do not add craft activities. Do not promote familiar nouns to forms.

Army preset, if `force` ships later, should start projecting `form: force`. Academy preset should **not** grow a new form in the same pass.

Phase 7 classified which of the 150 belong as authoring presets on the _current_
model, and which would become better presets if the high-confidence package
existed. Do not add them to `ORGANIZATION_AUTHORING_PRESETS` in this pass.

---

# Phase 7 — Preset candidate report

Which of the 150 would make good **authoring presets**. Success is not 150
presets. A preset is an ephemeral projection: familiar name → domain / form /
activities, stripped on persist.

**Do not add any of these to `ORGANIZATION_AUTHORING_PRESETS` in this pass.**

A good preset is familiar, recognizable without explanation, common enough for
first-class discovery, able to project useful defaults, meaningfully different
from adjacent presets, and useful as a shortcut.

| Class                | Count | Meaning                                                                                    |
| -------------------- | ----: | ------------------------------------------------------------------------------------------ |
| Strong               |    19 | Keep or add if the picker grows. Distinct projection or the named prototype of a collapse. |
| Long-tail            |    35 | Real shortcut, second-tier. Do not block the strong set.                                   |
| Adjacent + customize |    81 | Start from a parent preset; change the name (and maybe one field).                         |
| Poor                 |    15 | Too generic, too specific, a place, a subunit, or a mass movement.                         |

81 adjacent is the point: most familiar nouns are **names**, not types. Navy is
the example — identical to army even after `force`. That is customize-army, not
a second preset.

Existing six stay **strong** (including stretched `academy`). Grow 6 → 19 later
if the picker grows; do not ship navy / temple / university as extras.

## Strong (19)

Includes the six shipped recipes. Projection is the current-model mapping.

| Id                    | Label               | Existing? | Current projection                                           | Why strong                                                |
| --------------------- | ------------------- | --------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| `church`              | Church              | yes       | `religious / congregation / worship, ministry`               | Gathered faith.                                           |
| `religious_order`     | Religious order     |           | `religious / order / worship, ministry`                      | Order vs congregation is the useful faith split.          |
| `army`                | Army                | yes       | `military / — / warfare, defense`                            | Standing host. Later: project `force`.                    |
| `knightly_order`      | Knightly order      |           | `military / order / warfare, defense`                        | Martial membership, not a host.                           |
| `mercenary_company`   | Mercenary company   |           | `military / company / warfare`                               | Hired force vs army.                                      |
| `city_watch`          | City watch          |           | `government / — / defense`                                   | Civic policing vs army.                                   |
| `government_ministry` | Government ministry |           | `government / — / —`                                         | Prototype of the office hole.                             |
| `city_council`        | City council        |           | `government / association / —`                               | Local chamber vs ministry.                                |
| `political_party`     | Political party     |           | `political / association / —`                                | Clean membership vehicle.                                 |
| `bank`                | Bank                | yes       | `commercial / company / banking, finance`                    | Deposit institution.                                      |
| `trading_company`     | Trading company     |           | `commercial / company / —`                                   | Prototype of operating firms. Distinct from bank.         |
| `craft_guild`         | Craft guild         | yes       | `occupational / guild / standards, apprenticeship, training` | Practice-body prototype.                                  |
| `academy`             | Academy             | yes       | `academic / association / education, training, research`     | Stretched form; keep as preset, do not promote to a form. |
| `scholarly_society`   | Scholarly society   |           | `academic / association / research`                          | What `association` is for — unlike academy.               |
| `adventurers_guild`   | Adventurers' guild  |           | `occupational / guild / —`                                   | Hall vs a company. RPG staple.                            |
| `mutual_aid_society`  | Mutual aid society  |           | `community / association / —`                                | Prototype of civic membership.                            |
| `thieves_guild`       | Thieves' guild      |           | `criminal / guild / —`                                       | Occupational wrapping of crime.                           |
| `gang`                | Gang                |           | `criminal / — / —`                                           | Prototype of street crime.                                |
| `smuggling_ring`      | Smuggling ring      | yes       | `criminal / network / smuggling`                             | Distinct illicit network.                                 |

Discoverability groupings for a picker (UI only — **not** a persisted taxonomy):

| Family          | Strong presets                                                                     |
| --------------- | ---------------------------------------------------------------------------------- |
| Faith           | church, religious_order                                                            |
| Arms            | army, knightly_order, mercenary_company                                            |
| Crown and civic | government_ministry, city_council, city_watch, political_party, mutual_aid_society |
| Learning        | academy, scholarly_society, adventurers_guild                                      |
| Commerce        | bank, trading_company, craft_guild                                                 |
| Underworld      | thieves_guild, gang, smuggling_ring                                                |

## Long-tail (35)

Useful shortcuts; second-tier. Grouped by sphere, not a second taxonomy.

- **Crown:** royal court, magistracy, diplomatic corps, exchequer, mint, postal service
- **Political / clandestine:** revolutionary cell, secret police, intelligence bureau, spy ring, inquisitorial office, secret society
- **Arms:** royal guard, warband, private security company, pirate crew
- **Faith / magic:** missionary society, druid circle, hospital order, witches' coven, wizard circle, seminary
- **Commerce / craft:** merchant guild, brewery company, labor union, professional college, hunters' lodge, farming cooperative, theater troupe
- **Learning / adventure:** research institute, adventuring company, charitable foundation, fraternal lodge
- **Crime:** criminal syndicate, assassins' order

## Adjacent + customize (81)

Start from the parent; change the display name. Do not add a parallel preset
unless a later UI explicitly wants name-only duplicates (not recommended).

| Parent                 | Customize as                                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `army`                 | navy, militia, marines, sky fleet, garrison, legion, crusading host                                                                                                                                                                                                                         |
| `church`               | temple organization, cult, heretical sect                                                                                                                                                                                                                                                   |
| `religious_order`      | monastery                                                                                                                                                                                                                                                                                   |
| `academy`              | university, mage college, bardic college                                                                                                                                                                                                                                                    |
| `bank`                 | moneylenders, insurance company, pawnbrokers, tax farmers                                                                                                                                                                                                                                   |
| `trading_company`      | merchant house, chartered company, auction house, warehouse combine, bazaar syndicate, company of merchant adventurers, fur company, caravan / shipping / coach / courier (until transport splits), foundry / textile / shipyard / glassworks / logging / fishing (until production splits) |
| `craft_guild`          | scribes, entertainers, alchemists, cartographers, pilots, advocates, apothecaries, teamsters, river boatmen                                                                                                                                                                                 |
| `city_council`         | parliament, senate, privy council                                                                                                                                                                                                                                                           |
| `city_watch`           | marshals                                                                                                                                                                                                                                                                                    |
| `government_ministry`  | colonial administration, provincial governorate, customs service                                                                                                                                                                                                                            |
| `political_party`      | reform league, advocacy society                                                                                                                                                                                                                                                             |
| `scholarly_society`    | explorers' society, guild of scholars, museum society                                                                                                                                                                                                                                       |
| `mutual_aid_society`   | orphanage, famine relief, burial, civic league, festival, sporting club, hospice                                                                                                                                                                                                            |
| `thieves_guild`        | beggars' guild                                                                                                                                                                                                                                                                              |
| `gang`                 | protection racket, wreckers, prison gang                                                                                                                                                                                                                                                    |
| `smuggling_ring`       | fencing network, counterfeiting ring                                                                                                                                                                                                                                                        |
| `mercenary_company`    | ranger company                                                                                                                                                                                                                                                                              |
| `adventurers_guild`    | monster hunters' guild                                                                                                                                                                                                                                                                      |
| `adventuring_company`  | treasure hunters                                                                                                                                                                                                                                                                            |
| `merchant_guild`       | market association, shopkeepers association, factors guild, ranchers association                                                                                                                                                                                                            |
| `farming_cooperative`  | millers cooperative                                                                                                                                                                                                                                                                         |
| `missionary_society`   | pilgrimage society                                                                                                                                                                                                                                                                          |
| `professional_college` | surgeons college                                                                                                                                                                                                                                                                            |
| `revolutionary_cell`   | succession cabal, conspiracy cabal                                                                                                                                                                                                                                                          |

Navy remains adjacent **after** `force`. Temple remains adjacent after nothing
vocab can do — parish vs cult-center is a name. University remains adjacent —
degree-granting is unmodeled on purpose (preset-only).

## Poor (15)

| Reason                          | Concepts                                                                |
| ------------------------------- | ----------------------------------------------------------------------- |
| Generic / not a type            | bureaucracy, noble faction, pantheon clergy                             |
| Mass movement, not constituted  | independence front, populist movement                                   |
| Too specific / situational      | spice consortium, shrine keepers, plague wardens, slave-trading company |
| Subunit                         | siege engineers                                                         |
| Territorial unit of another org | diocese                                                                 |
| Premises (building taxonomy)    | great library, observatory                                              |
| Kinship, not an org template    | clan                                                                    |
| Finite event                    | survey expedition                                                       |

## After the high-confidence package

Class on the **current** model, then the shift if `force`, `office`, `trade`,
`production`, `transport`, and `administration` existed.

| Concept                                                                             | Now                        | After package                        |
| ----------------------------------------------------------------------------------- | -------------------------- | ------------------------------------ |
| `shipping_company`                                                                  | adjacent → trading company | **strong** (transport vs trade)      |
| `foundry_works`                                                                     | adjacent → trading company | **long-tail** (production prototype) |
| `teamsters_guild`                                                                   | adjacent → craft guild     | **long-tail** (haulage mission)      |
| `caravan_company`, `coach_line`, `courier_service`                                  | adjacent → trading company | adjacent → shipping company          |
| `textile_manufactory`, `shipyard`, `glassworks`, `logging_company`, `fishing_fleet` | adjacent → trading company | adjacent → foundry                   |
| `river_boatmen`                                                                     | adjacent → craft guild     | adjacent → teamsters                 |
| `navy`, `militia`, `marines`, `sky_fleet`, `legion`                                 | adjacent → army            | **still adjacent → army**            |
| `government_ministry`, `army`, `city_watch`                                         | strong                     | still strong, better defaults        |

The package creates new prototypes (`shipping_company`, `foundry_works`). It
does **not** justify navy or temple as presets.

## Contrast-set reading (preset layer)

The required families, as authoring shortcuts rather than mappings:

- **Religious:** church and religious order are the two strong picks. Temple,
  cult, and monastery customize those. Missionary society is long-tail.
- **Military/security:** army, knightly order, mercenary company, city watch
  are strong. Navy and militia customize army. Royal guard is long-tail.
- **Commercial:** bank vs trading company is the useful firm split. Merchant
  house customizes trading company. Merchant guild is long-tail (constituency,
  not a house). Shipping company is adjacent today, strong after `transport`.
- **Academic:** academy (teaching, stretched) vs scholarly society (membership).
  University and mage college customize academy.
- **Criminal:** thieves' guild, gang, and smuggling ring are three strong
  constitutions. Syndicate, pirate crew, and assassins' order are long-tail.

## Recommendation

1. Leave the shipped six as they are.
2. If the picker grows, grow toward the other 13 strong ids — not toward navy /
   temple / university.
3. Long-tail is a backlog, not a sprint.
4. Adjacent concepts should be “start from X, rename” in the authoring UI,
   not extra recipes.

Phase 8 records which of those choices are settled versus still open for an
implementation pass.

---

# Phase 8 — Open questions

Questions that would change a later implementation pass, plus settled answers
so those choices are not re-litigated. **Still no schema, vocab, or preset
edits in this pass.**

The original brief asked six outcome questions. Evidence answers them below.
What remains open is _how_ to ship the high-confidence package, not _whether_
the three-axis model held.

## Outcome answers

| #   | Question                                                               | Answer from corpus v0.1                                                                                                                                                                            |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Does `domain + form + activities` provide a clean semantic foundation? | **Yes, with two form holes and sparse missions.** Zero unrepresentable. `other` unused. 84% clean+acceptable.                                                                                      |
| 2   | Are any existing dimensions poorly defined or overloaded?              | **Form and activity, not domain.** `association` overload is 4 teaching institutions, not 30. `congregation` leaks domain. Activity grain mixes trades (`blacksmithing` unused) with missions.     |
| 3   | Which vocabulary additions have strong repeated evidence?              | Forms `force` and `office`; missions `trade`, `production`, `transport`, `administration`. Not a new domain. Not army/church/bank/academy as forms.                                                |
| 4   | Are we missing a genuinely independent organization dimension?         | **Not proven.** Official vs clandestine is the strongest candidate field and is still not admitted. Geographic scope, parent/subordinate, and membership-vs-institution failed.                    |
| 5   | Which distinctions should remain at the authoring-preset layer?        | The 81 adjacent names — navy, temple, university, merchant house, and the rest. Famous nouns that share a signature.                                                                               |
| 6   | Smallest coherent model for a broad preset library?                    | Keep the ten domains. Later: two forms + four missions as one package. Grow the picker 6 → 19 strong presets. Absorb the rest as “start from X, rename.” No craft catalog. No multi-valued domain. |

## Settled — do not reopen

These were argued in Phases 4–7. An implementation pass should treat them as
constraints.

- Do not add a domain. Do not make domain multi-valued (37 secondaries; every
  concept kept an honest primary).
- Do not promote army, church, bank, or academy to forms. Form tests already
  reject those ids; that lock stays.
- Do not add new craft-specific activities without separate evidence. Leave
  existing narrow values (`blacksmithing`, `brewing`, `banking`, `smuggling`)
  untouched. Mixed grain is not permanently desirable.
- Do not add geographic scope, parent-org, or membership-vs-institution fields.
- Do not add `court` or `crew` forms (fold into `office` / `force`).
- Do not add `theft` or other crime-catalog activities.
- Navy stays adjacent to army **even after `force`**. Temple stays adjacent to
  church. University stays adjacent to academy.
- `congregation` earns its keep as the church-vs-order contrast (4 uses, all
  religious). Do not generalize it in the same pass as `force`/`office`.
- Clandestine is **not** part of the high-confidence package.

## Open — would change the next implementation pass

Each row is a decision an implementer must make. Lean is evidence, not a
commit.

### Q1. Unlock `force` in the form tests?

`organization-form.test.ts` currently rejects `force` in the same list as
`army`, `bank`, `church`, `academy`, and `house`. Phase 6 treats `force` as a
**constitution** (host) and army as a **preset identity**. Shipping `force`
requires rewriting that test: keep rejecting the familiar nouns; allow `force`.

The Army preset test (`omits an equivocal form from the Army recipe`) would
also change: once `force` exists, omitting form is no longer the honest recipe.

**Lean:** unlock `force`; keep rejecting `army`. Same pass should make the army
preset project `form: force`.

### Q2. How wide is `force`?

Phase 6 core would-use is 9 (army family + pirate crew). Extended would-use
includes royal guard, warband, city watch, and marshals.

If `force` includes city watch, member titles and the policing/defense overlap
leak into the form. If it excludes watch, watch stays omitted-form until
`policing` (medium) is decided.

**Lean:** ship `force` for armed/crewed hosts (army family + pirate crew +
warband + royal guard). Leave watch/marshals on omitted form until a policing
rule exists.

### Q3. Mission grain vs leftover craft ids?

Adding `trade` / `production` / `transport` without touching `blacksmithing`
and `brewing` leaves two unusually narrow trades beside a new mission layer.
That is **workable** (activities are multi-valued) and **semantically uneven**.
Do not treat mixed granularity as permanently desirable.

Forward rule: new organization activities should normally describe reusable
organizational missions or practices spanning multiple familiar organization
types. Narrow occupational activities require separate evidence.

A later audit can decide whether `brewing` / `blacksmithing` remain useful
specialization tags, become discovery aliases, or get retired. Do not migrate
them in Pass A.

**Lean:** leave existing narrow values in place; freeze _additions_ of new
craft-specific activities; do not restack or delete `brewing` while the brewery
long-tail still projects it.

### Q4. `office` and courts?

`office` is **not** in the rejected-form list (unlike `force`). Royal court and
magistracy are n=2. Phase 6 folds them into `office` for now.

**Lean:** define `office` broadly enough to hold courts. Do not add `court`.

### Q5. Domain/form/activity allowlist?

The schema has no pair allowlist. `force` is useful on military, criminal
(pirate), and maybe government (guard). An allowlist would undo that.

**Lean:** no allowlist. Copy can suggest typical pairs. Member titles for
`force` and `office` must stay domain-independent (the `congregation` leak
pattern).

### Q6. Preset picker vs “start from X, rename”?

Growing 6 → 19 without a customize-from-parent path will recreate navy/temple
pressure in the UI. The 81 adjacent concepts are the argument for a rename
flow, not 81 recipes.

**Lean:** if the picker grows, ship rename-from-parent in the same product pass
as the extra strong presets. Do not add navy as a seventh recipe as a
substitute for that UI.

### Q7. Academy stretch?

Academy remains `association` (escape hatch). A `college`/`institution` form
was deferred (collides with `office`; one teaching family).

**Lean:** keep the academy preset unchanged in the `force`/`office` pass.
Revisit only with more than the academy-family four.

### Q8. Clandestine as a field?

Repeated across domains; ownership unsolved (field vs overlay vs preset). No
consumer yet needs to filter “hidden” independently of domain.

**Lean:** not in the next vocab pass. Reopen only with a concrete filter
requirement.

### Q9. Ship the package together?

Phase 6: adding `force` without `office` leaves government as the omitted-form
dump; adding `trade` without `production` and `transport` repeats the
craft-vs-mission mistake.

**Lean:** one vocab PR for the two forms + four missions. Preset projection
updates (army → `force`) in that PR. Picker growth (6 → 19) can wait.

### Q10. Overview and search?

Overview facets **domain only**. Form is optional; after `force`/`office` a
form facet would expose the new constitutions. Search already concatenates
classification discovery terms.

**Lean:** add a form facet only if overview users need to separate hosts from
offices from companies. Not a blocker for the vocab PR.

---

## Next implementation pass (when one is scheduled)

Pass A (below) shipped the high-confidence vocabulary and army recipe.
Passes B–C remain deferred:

1. Pass B: treat the 19 strong names as a candidate pool, not auto-ship.
2. Pass C: picker families plus customize-from-parent.
3. Do not add navy/temple/university presets in those passes unless evidence
   reopens them.
4. New activities should normally be reusable missions spanning multiple
   familiar types; narrow occupational activities need separate evidence.
5. Do not add a clandestine field, a `college` form, or an allowlist.

Corpus and matrix v0.1 stay frozen. Matrix v0.2 is a parallel recode of the
same 150 ids.

---

# Pass A — Vocabulary + matrix v0.2

Shipped in contracts. Does not rewrite Phases 1–8 or corpus v0.1.

## What shipped

| Layer       | Change                                                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form        | `force` (armed/levied/crewed host) and `office` (appointed/statutory institution). Form tests still reject `army`, `bank`, `church`, `academy`, `house`. |
| Activity    | `trade`, `production`, `transport`, `administration`. Existing narrow ids untouched. `ORGANIZATION_ACTIVITY_TERM` now states the forward admission rule. |
| Army preset | `domain: military`, `form: force`, `activities: [warfare, defense]`. Other five recipes unchanged. `authoringPresetId` still stripped on persist.        |

No new domains. No clandestine field. No allowlists. No `college` / `court` /
`crew`. No navy / temple / university recipes. No `advocacy`.

## Activity admission (forward)

New organization activities should normally describe reusable organizational
missions or practices spanning multiple familiar organization types. Narrow
occupational activities require separate evidence. Do not add craft-specific
siblings of `blacksmithing` / `brewing`. A later audit may alias or retire
those two; Pass A does not.

## Matrix v0.2 — parallel recode

Same 150 ids. Overrides only; v0.1 cells are inherited unless named.

### Recode rules applied

**Form `force` (11):** army, navy, militia, marines, sky_fleet, garrison,
legion, crusading_host, pirate_crew, warband, royal_guard. City watch and
marshals stay omitted (Phase 8 Q2 lean — not recoded onto `force`).

**Form `office` (15):** government_ministry, royal_court, bureaucracy,
magistracy, diplomatic_corps, colonial_administration, provincial_governorate,
secret_police, intelligence_bureau, customs_service, plague_wardens,
postal_service, exchequer, mint, inquisitorial_office. Diocese skipped
(religious constitution already has `congregation`).

**Activity `trade` (10):** trading_company, merchant_house, chartered_company,
auction_house, spice_consortium, company_of_merchant_adventurers,
warehouse_combine, bazaar_syndicate, slave_trading_company, fur_company.
Not merchant_guild / market_association (those keep empty activities).

**Activity `production` (8):** foundry_works, textile_manufactory, shipyard,
glassworks, millers_cooperative, logging_company, fishing_fleet,
farming_cooperative. Brewery_company keeps `brewing` — no dual-tag.

**Activity `transport` (6+1):** shipping_company, caravan_company, coach_line,
courier_service, teamsters_guild, river_boatmen; postal_service also takes
`transport` beside `administration`.

**Activity `administration` (7):** government_ministry, bureaucracy,
colonial_administration, provincial_governorate, diplomatic_corps,
postal_service, customs_service. Not chambers, watch, exchequer (already
`finance`), secret_police, or intelligence_bureau.

**Fit:** upgrade awkward → acceptable when the named hole is filled. Army is
**clean** (`military / force / warfare, defense` matches the noun). Navy-family
stays acceptable (name-only; still collapses onto army’s signature). Stay
awkward: academy, university, mage_college, bardic_college, hospital_order,
counterfeiting_ring, beggars_guild, secret_society.

### Fit and coverage vs v0.1

| Metric                   | v0.1 | v0.2 | Δ         |
| ------------------------ | ---- | ---- | --------- |
| Clean                    | 9    | 10   | +1 (army) |
| Acceptable               | 117  | 132  | +15       |
| Awkward                  | 24   | 8    | −16       |
| Unrepresentable          | 0    | 0    | 0         |
| Omitted form             | 46   | 20   | −26       |
| Empty activities         | 88   | 57   | −31       |
| Rows with ≥1 activity    | 62   | 93   | +31       |
| Activity assignments     | 90   | 121  | +31       |
| Unique signatures        | 61   | 66   | +5        |
| Rows sharing a signature | 124  | 119  | −5        |
| Rows recoded             | —    | 50   | —         |

### Signatures that still collapse (≥5 rows)

| Signature                              | Count | Notes                                                                           |
| -------------------------------------- | ----- | ------------------------------------------------------------------------------- |
| `commercial / company / trade`         | 10    | Split from the old 23× empty-activity company bucket. Distinct from production. |
| `community / association / —`          | 8     | Unchanged. No `care` activity in Pass A.                                        |
| `government / office / administration` | 6     | Former `government / — / —` with a constitution and a mission.                  |
| `military / force / warfare, defense`  | 6     | Army + navy family. **Navy still equals army** — F holds after `force`.         |
| `commercial / company / production`    | 6     | Foundry family; brewing stays off this signature.                               |
| `government / office / —`              | 5     | Courts, mint, inquisitorial office, etc. Constitution without a new mission.    |

v0.1’s `commercial / company / —` (23) and `government / — / —` (12) and
`military / — / warfare, defense` (6) are gone as omitted-form / empty-activity
buckets. The navy–army identity is the intended remaining collapse.

### Remaining awkward (8)

academy, university, mage_college, bardic_college, hospital_order,
counterfeiting_ring, beggars_guild, secret_society.

These wait on Pass B/C or later questions (college form, care activity,
clandestine trait) — not Pass A.

### What Pass A did **not** do

- Rewrite corpus v0.1 or Phase 1–3 mappings.
- Add navy / temple / university / college recipes.
- Dual-tag brewery onto `production`.
- Recode city watch or marshals onto `force`.
- Recode diocese onto `office`.
