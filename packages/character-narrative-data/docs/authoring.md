# Character narrative authoring

This guide is the acceptance standard for authored narrative fragments. A valid
schema is necessary, but it does not make a fragment playable.

## Hard acceptance test

Every fragment must answer at least one concrete play question for its slot:

- **Personality trait:** What will I repeatedly do at the table?
- **Ideal:** What choice will this push me toward?
- **Bond:** Who or what can pull me into action?
- **Flaw:** How will this predictably create trouble?
- **Experience:** What happened, what did I do, and what changed because of it?
- **Choice:** What did I choose when alternatives had meaningful costs?
- **Motivation:** What present goal will make me act?

Reject a fragment that communicates only introspection, preference, identity, or
personal growth. A player should be able to demonstrate the fragment through a
decision, habit, reaction, obligation, ritual, temptation, fear, prejudice, or
contradiction.

## Slot standards

### Personality traits

Write a visible tell or repeated behavior, not a broad adjective.

- Pass: “I memorize the exits before I sit down.”
- Reject: “I am curious about other people.”

### Ideals

Write a decision rule, especially one that can carry a cost. The fragment should
help answer, “What would my character choose here?”

- Pass: “If I give my word, I keep it even when I regret giving it.”
- Reject: “I value loyalty.”

### Bonds

Create an actionable attachment or obligation: a person, institution, place,
debt, promise, rivalry, possession, or unresolved event.

- Pass: “Captain Verran covered for me once, and I still answer when the Guard
  sends for me.”
- Reject: “My connection to the Guard gives me a reason to return.”

Campaign-bound fragments may invent a personal response to a selected reference,
but must not invent facts about that reference.

### Flaws

Create predictable pressure with an observable consequence. State what the
character does when the pressure appears, not only what they feel.

- Pass: “I assume hesitation means betrayal and confront people before I have
  proof.”
- Reject: “I read too much into changes in tone.”

### Experience and story prose

Write remembered experience, not therapeutic self-analysis. Use concrete
circumstances, people, places, routines, choices, failures, and turning points.
Reflection may follow an event, but it must not replace the event.

Every experience or story passage must contain at least two of:

1. a concrete circumstance or event;
2. a concrete choice or action;
3. a consequence or lasting change.

“My training taught me patience” fails. “My master made me explain every failed
spell before trying again; I still dissect problems that way” passes.

## Hook shapes

Use all three shapes across the collection. Do not force every fragment into a
contradiction.

- **Direct hook:** a clear behavior, value, or goal.
- **Pressure hook:** an obligation, temptation, fear, taboo, or liability that
  predictably demands action.
- **Tension hook:** two competing impulses, such as loyal but resentful,
  ambitious but afraid of recognition, generous with money but possessive of
  information, or hostile to authority but hungry for a mentor’s approval.

## Voice and concreteness

Use first person and neutral fantasy-adventure language. Prefer concrete verbs,
objects, routines, and consequences over summaries of self-discovery.

The collection quality tests may reject narrow, repeated constructions. The
following are broader editorial smells and require review in context:

- “what matters to me”
- “the person I am becoming”
- “reconsider what I want”
- “there was more to learn”
- “gave me a new perspective”
- repeated openings such as “I learned to,” “I began to notice,” or “I came to
  understand”

An occasional phrase can be justified by a specific event. Repetition across the
collection is evidence that the event has been replaced by abstraction.

## Alignment

Alignment constrains compatible values and choices; it does not prescribe a
single temperament. Avoid moral caricatures and repeated stereotypes.

- Chaotic Evil need not always be violent, antisocial, or impulsive.
- Lawful Good need not always be dutiful, gentle, or trusting.
- A compatible flaw may frustrate an alignment’s values without contradicting
  them.

Review each alignment pool for varied values, methods, pressures, relationships,
and consequences. Affinities and tags cannot substitute for editorial judgment.

## Campaign truth and templates

- Declare every `{{token}}` in `requires`.
- Declare every relationship assumption in `conditions`.
- Use only facts provided by the selected relationship or context.
- Do not invent offices, crimes, wars, cultural histories, or entity behavior.
- Use `conflictTags` only for genuinely incompatible assumptions. They prevent
  combinations; they do not establish positive tension or story continuity.

## Collection review

Before accepting an expansion:

1. Inspect coverage by slot and theme, slot and alignment eligibility,
   relationship/context family, and hook shape.
2. Resolve unexplained gaps rather than pursuing a raw fragment count.
3. Review exact duplicates, repeated sentence openings, and high-overlap phrase
   clusters.
4. Rerun the fixed composition fixture and review playable specificity, voice,
   concreteness, consequences, alignment variety, and cross-fragment coherence.

Automated tests protect structure and obvious regressions. They do not certify
literary quality.

## Deferred structured ingredients

A future expansion system may separate rendered prose from ingredients such as
`trigger`, `behavior`, `origin`, `tension`, and `consequence`. Do not add unused
ingredient metadata to the current collection. Adopt it only with a concrete
template or language-model consumer and a separate composition design.
