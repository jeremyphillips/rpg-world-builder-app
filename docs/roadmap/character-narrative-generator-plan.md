# Character narrative generator — v1 architecture

Status: product decisions agreed; implementation pending.

## Goal and agreed behavior

Generate a character's narrative in one click inside the builder Identity step.
Use authored sentences and short passages, composed locally without an LLM or a
generation API. Use available character choices and selected campaign connections.

- Alignment is a hard compatibility constraint. Flaws and internal tension must
  remain compatible with the selected alignment.
- Fill empty narrative fields only. Preserve existing authored text.
- Write in first person.
- Allow invented personal experiences involving selected campaign connections,
  without changing established campaign facts or relationships.
- Defer builder ordering and broader UX decisions. Generate from the choices
  available at click time; never regenerate automatically after those choices change.

Default output: two personality traits, one ideal, one bond, one flaw, and a short
backstory with three beats: formative experience, defining choice, present motivation.
Target 90–150 words for the backstory as an editorial guideline.

This generates narrative, not a mechanical background, proficiency grant, or
character connection. It never changes alignment, species, class, or memberships.

## Existing integration points

- [CharacterNarrative](../../packages/contracts/src/rpg/runtime/character/sheet/narrative.ts)
  already owns all five output fields. Reuse it; do not duplicate the domain shape.
- [Builder draft](../../packages/contracts/src/rpg/runtime/character-builder/draft/draft.ts)
  carries identity, species/heritage, class/level, connections, and pending choices.
- [Build context](../../packages/contracts/src/rpg/runtime/character-builder/context.ts)
  carries organizations and playable catalog context, but no location catalog.
- [Identity step](../../apps/dashboard/src/features/character/components/builder/steps/identity/identity-step.tsx)
  uses the shared schema-driven Form and custom slots.
- [Identity conversion](../../apps/dashboard/src/features/character/lib/steps/identity-form-values.ts)
  maps narrative string arrays to form rows and back; IdentityDraftSync persists edits.
- Connections currently resolves residence locations through the existing
  `useLocations` query. Reuse that path and its feature public export.
- Identity currently precedes connections, species, and class. Missing input is
  expected, especially on the first visit.

Residence picker integration is present in the working tree at planning time.
Verify its final public exports when implementation begins.

## Ownership and dependencies

Follow the existing name-generator core/data/integrations split.

| Location                                               | Owns                                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/contracts/src/character-narrative/`          | Zod schemas and inferred types for context, fragments, plans, results, and diagnostics; isolated `@rpg/contracts/character-narrative` export |
| `packages/character-narrative-core/`                   | Pure eligibility, weighted selection, compatibility, seeded randomness, token interpolation, and composition                                 |
| `packages/character-narrative-data/`                   | Authored collections, manifest, context affinity bindings, validation, and lazy loaders                                                      |
| `packages/character-narrative-integrations/`           | Draft/catalog projection, reference binding, semantic affinities, and load/generate orchestration                                            |
| `apps/dashboard/src/features/character/lib/narrative/` | Editor conversion and fill-empty application policy                                                                                          |
| `apps/dashboard/src/features/character/hooks/`         | Context loading and generation lifecycle                                                                                                     |
| Identity step components                               | One Generate narrative action and minimal pending/error feedback                                                                             |

Core and data depend on contracts, not each other or integrations. Integrations
depends on contracts, core, and data. Dashboard invokes integrations and owns form
state. Contracts must not import generator packages. No new standalone dashboard
feature, catalog content type, server endpoint, or database collection in v1.

Use workspace package conventions. Add contracts package exports and export-surface
tests. New closed vocabularies follow the sibling `*_TERM` / `*_ENTRIES` convention.
Keep an internal seeded RNG initially; do not couple narrative generation to name
generation merely to reuse a helper.

## Proposed contracts

Names below are proposed exports, not existing APIs.

### NarrativeGenerationContext

A small, immutable projection assembled from current form values, the draft, and
eligible resolved content. Compose source schemas or derive types with Pick/Omit
instead of redefining character DTOs.

- Optional alignment; missing is distinct from neutral and unaligned.
- Character kind, selected class and level, species, heritage, and cultural affinity.
- Semantic affinity IDs derived from explicit bindings, never display-name matching.
- Eligible selected organization references: ID, name, actual membership title if
  present, domain, functions, and practices.
- Eligible selected residence references: ID, name, kind, relevant classification.
- No full campaign documents, rich-text descriptions, or unrelated roster data.

Custom content without affinity bindings still supports name/reference insertion
and general fragments. Do not infer cultural history from a species label.

### NarrativeFragment

- `id`: stable unique identifier.
- `slot`: trait, ideal, bond, flaw, formative-experience, defining-choice, or motivation.
- `text`: complete first-person sentence or short passage.
- `alignmentIds`: explicit allowed alignments for morally specific content; a
  documented unrestricted mode for alignment-independent content.
- `requires`: a small closed set of required reference capabilities, such as
  organization, organization title, or residence.
- `themeIds`: compatibility with a small set of shared narrative themes.
- `affinities`: explicit weighted matches for supported context metadata.
- `conflictTags`: mutually incompatible assumptions within generated content.
- `weight`: positive baseline selection weight.

Keep these fields declarative and validated. Do not introduce arbitrary predicate
code, a general rule language, or free-form template expressions.

### NarrativeCompositionPlan and NarrativeGenerationResult

The plan selects a shared theme, a motive compatible with alignment, and optional
organization/residence bindings. Bind each reference once for the whole result.

Return narrative arrays derived from CharacterNarrative and plain backstory
paragraphs for the editor adapter. Return seed, collection revision, fragment IDs,
bound entity IDs, and fallback diagnostics alongside the content. Do not persist
this metadata or catalog snapshots into the builder draft in v1.

Use a discriminated success/failure result. A malformed or unavailable collection
must produce an actionable failure without partially applying output.

## Composition algorithm

1. Capture current form identity and draft choices. Resolve only permitted content.
2. Load the required narrative collections from a trusted import manifest.
3. Filter candidates by required context and alignment before weighting.
4. Select a supported theme with viable candidates for every requested output slot.
5. Bind at most one organization and one residence for this composition. Prefer
   explicit context relevance; use seeded selection for ties. Membership sorting
   priority is not authority or narrative importance.
6. Select compatible entries by theme, context affinity, and base weight. Avoid
   duplicate IDs and incompatible tags. Alignment exclusions cannot be overridden
   by an affinity score.
7. Use bounded retries when combinations are incompatible, then a validated complete
   fallback composition. Never relax alignment or reference eligibility to finish.
8. Interpolate approved tokens and validate the complete result before applying it.

Use a local seeded RNG passed into pure selection code. The same normalized input,
seed, and collection revision must produce identical results. Sort context references
and candidate IDs consistently so query ordering cannot change a seeded outcome.

Start with a finite token vocabulary: organization name, organization title, residence
name, and class name where grammatical. Missing required tokens disqualify the entry.
Validate token declarations and unknown placeholders at collection load/test time.

Do not independently randomize each field. The shared plan supplies coherence across
the ideal, flaw, bond, and story. Prefer thematic links over back-references such as
"that betrayal," which become fragile when a field is preserved or a beat falls back.

## Alignment and campaign truth

Reuse canonical alignment IDs. Derive the moral and order axes internally for authoring
helpers and affinity scoring; do not store a second alignment on the character.

For a lawful-good character, inflexibility about promises can be a flaw; delight in
harming innocents cannot. Alignment does not force a class or species stereotype.
Editorial review establishes semantic compatibility; tags alone cannot prove prose
is appropriate.

Missing alignment uses alignment-independent candidates. Unaligned gets its own
supported policy and is never silently mapped to neutral. Generic fallback coverage
must exist for both cases and every canonical alignment.

Campaign names are bound to eligible selected connections, not random campaign
entities. Reuse existing play visibility/availability logic and authorized queries.
Do not broaden access to resolve a hidden or unavailable reference.

- Residence supports "Living in X"; it does not establish birthplace or upbringing.
- Membership supports personal obligations; it does not establish leadership,
  expulsion, secret faction policies, or an invented official rank.
- An organization classification can guide suitable experiences, but does not prove
  a war, crime, divine mandate, or named historical event occurred.
- Personal encounters and decisions are permitted, but never write new entities,
  relationships, or campaign history as a generation side effect.

If a selected reference cannot be resolved, use a reference-free alternative and
report that omission in diagnostics. A query error is distinct from no connection;
handle it explicitly rather than silently presenting it as complete campaign context.

## Field preservation and form lifecycle

The unit of preservation is the whole narrative field, not an individual array row.

- An array is empty only when every row is blank after trimming. Replace a wholly
  empty array with generated rows. If any row has text, preserve the whole array.
- Backstory is empty only when the editor's semantic emptiness rules say so. Do not
  mistake `<p></p>` for authored text, or meaningful non-text content for blank text.
- Never append generated rows to a partially authored field in v1.
- When all five fields are populated, generation is a no-op with a short explanation.
- Rerolling populated fields and overwriting text are outside v1. A user can clear a
  field and generate again.

Generate a complete candidate internally, then apply only empty fields. Existing
prose is opaque: v1 does not parse it or claim semantic consistency with it. Generated
fields remain mutually compatible, but a manually authored ideal can conflict with
a newly generated backstory. This is an explicit v1 limitation.

Read current form values at click time, especially alignment. While collections or
queries load, capture a context fingerprint. Before applying results, discard stale
work if generation inputs changed, and re-check which target fields are still empty.
Prevent overlapping clicks. Apply only the narrative paths, mark dirty/validate, and
let existing draft synchronization persist the form update. Do not reset the entire
identity form or independently write competing form and draft state.

The core returns plain text. Dashboard uses the editor's supported representation
and escapes inserted names when rendering paragraphs. Preserve non-narrative identity
fields, including image metadata, through the existing conversion/sync boundary;
verify this explicitly during integration.

## Initial collection and editorial proof

First prove the model with approximately 24–36 entries and a few complete, reviewed
compositions. Expand toward 80–120 entries only after coherence and fallback behavior
work. Count is a budget, not a substitute for coverage.

Start with three themes: duty, belonging, and ambition. Each theme needs compatible
motives across the supported alignment set; ambition is not inherently evil and duty
does not require obedience to government. Use shared entries where appropriate.

Illustrative lawful-good composition with an existing residence and organization:

- Trait: "I make few promises, but I remember every one."
- Trait: "I notice who has been left out of a conversation."
- Ideal: "A promise matters most when keeping it becomes inconvenient."
- Bond: "I want my neighbors in {{residence.name}} to know they can rely on me."
- Flaw: "I take on obligations I should admit I cannot carry alone."
- Formative experience: "Living in {{residence.name}}, I learned how much ordinary
  kindness depends on someone being willing to act. I began with small promises and
  discovered that keeping them mattered more to me than receiving thanks."
- Defining choice: "Through my connection to {{organization.name}}, I found more
  chances to put that conviction into practice. When helping someone became
  inconvenient, I chose to keep my word, even though asking for help would have made
  the burden easier to bear."
- Motivation: "Now I want to prove that a promise can survive distance and hardship.
  I am looking for work that lets me help others while learning which responsibilities
  are mine to carry and which I must learn to share."

This example demonstrates continuity, not a universal alignment template. Review
samples for repetitive openings, unsupported claims, grammar after insertion, moral
caricatures, and first-person consistency. Use neutral fantasy-adventure tone in v1;
defer a tone selector.

## Implementation milestones

1. **Contracts and proof collection:** establish package boundaries, schema exports,
   vocabulary, three beats, alignment policy, approved tokens, and representative
   entries. No schema migration or new character fields.
2. **Pure generator:** deterministic selection, viable-theme selection, bounded
   compatibility retries, validated fallback compositions, and diagnostics.
3. **Context adapters:** draft/catalog projection; selected organization and residence
   resolution; class/species/heritage affinity bindings; standalone and classless NPC
   support. Defer proficiency, spell, feat, ability, and equipment affinities.
4. **Builder application:** one action via Form slot, lazy load lifecycle, semantic
   emptiness, safe rich-text rendering, stale-result handling, and draft persistence.
   New components receive co-located CSF3 stories and interactive tests.
5. **Collection expansion and documentation:** expand reviewed entries; add package
   READMEs and authoring guide; document exports in contracts structure, workspace
   ownership in architecture, and behavior in dashboard character-builder docs.

## Acceptance criteria and verification

- All canonical alignments plus missing/unaligned inputs produce complete compatible
  output with generic context. Distinct traits are always available.
- Changing class/species/context affinity never makes an excluded alignment entry
  eligible. Tests cover actual selected fragment metadata, not only text snapshots.
- No missing tokens, duplicate IDs, invalid vocabulary, impossible required references,
  or empty fallback pools. Validate collections against schemas and cross-entry rules.
- Fixed seed/revision/context is reproducible; multiple seeds demonstrate useful variety.
- Sparse drafts, standalone creation, level-zero classless NPCs, missing/deleted content,
  and multiple selected connections all have explicit tested behavior.
- Hidden/unavailable content never reaches output. Generation creates no relationships.
- Filled arrays and rich text remain unchanged. Empty editor markup is filled correctly.
- Name, alignment, gender, image metadata, and other draft slices survive application.
- Input changes during loading cannot apply stale results or overwrite typing. Failures
  preserve the form; repeated clicks cannot race.
- Generated text survives existing form-to-draft and finalization paths.
- Review representative outputs across alignments and contexts; automated checks cannot
  replace prose quality review.

At implementation time run the affected pre-commit gates using the current hook
scripts as source of truth, regenerate JSON schemas when required, and run the full
pre-push coverage/health/build gates before sharing. Do not suppress code-health
findings without consulting the user. The planning document itself needs formatting
and link validation; no runtime behavior is changed by this plan.

## Follow-on enhancements

1. Campaign-authored narrative packs with the same validation and composition model.
2. Persistent composition provenance and user locks for coherent selective regeneration.
3. Explicit adventure hooks and visible campaign tensions as additional context.
4. Linked entity mentions and stale-context detection without automatic prose rewrites.
5. Additional affinities for resolved proficiencies, languages, spells, and equipment.
6. Saved-character/NPC adapters that reuse the same engine, including multiclass context.

These are extension points, not v1 delivery requirements. Builder ordering remains a
separate UX decision.
