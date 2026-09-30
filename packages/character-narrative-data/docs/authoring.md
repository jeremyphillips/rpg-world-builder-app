# Character narrative authoring

This guide is the acceptance standard for authored narrative fragments and the
canonical reference for agents editing a narrative collection. A valid schema is
necessary, but it does not make a fragment playable.

## Editorial objective

Write handles that a player or GM can pull during play, not summaries of who a
character is. Favor concrete, external, unresolved material over conclusions
about the character. A strong fragment creates behavior, tension, an obligation,
a relationship, a discoverable secret, or a thing another character can
challenge, threaten, demand, expose, or help complete.

The collection should contain friction rather than finished interpretation.
After reading a fragment, a player should wonder what happens when it comes up.
Do not complete that story on the player's behalf.

At least 65% of a reviewed composition fixture should be externally actionable.
A fragment counts when it gives another player or the GM a clear handle, or when
it tells the player what their character predictably does under a recognizable
condition. Introspection may remain as contrast, but it must not dominate a
composition.

## Hard acceptance test

Every fragment must answer at least one concrete play question for its slot:

- **Personality trait:** What will I repeatedly do at the table?
- **Ideal:** What choice will this push me toward?
- **Bond:** Who or what can pull me into action?
- **Flaw:** How will this predictably create trouble?
- **Experience:** What happened, what did I do, and what consequence is still live?
- **Choice:** What did I choose when alternatives had meaningful costs?
- **Motivation:** What present goal will make me act?

Reject a fragment that communicates only introspection, preference, identity, or
personal growth. A player should be able to demonstrate the fragment through a
decision, habit, reaction, obligation, ritual, temptation, fear, prejudice, or
contradiction.

## Slot standards

### Personality traits

Write a visible tell or repeated behavior, not a broad adjective or a summary of
how the character approaches life. Prefer language the player can perform nearly
verbatim.

- Pass: “I memorize the exits before I sit down.”
- Reject: “I am curious about other people.”
- Reject: “I keep careful track of my commitments.”

### Ideals

Write a decision rule or visible behavior, especially one that can carry a cost.
Show the value instead of naming or defending it. The fragment should help
answer, “What would my character choose here?”

- Pass: “If I give my word, I keep it even when I regret giving it.”
- Pass: “When food is short, I watch who gets served last.”
- Reject: “I value loyalty.”
- Reject: “A community proves its strength by how it treats its weakest member.”

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
character does when the pressure appears, not the psychological pattern that
explains the behavior. Prefer a trigger followed by an action the player can
perform nearly verbatim.

- Pass: “When someone offers me something freely, I look for the price they have
  not named.”
- Pass: “When someone crosses me, I keep pushing after I have already gotten what
  I wanted.”
- Reject: “I treat generosity as hidden leverage.”
- Reject: “I let resentment become a vendetta.”

### Motivations

Name or strongly imply a target state the character can make progress toward in
play. A motivation should create destinations, milestones, opposition, and
decisions for the campaign. A general preference, job category, or repeated
method is not enough.

- Pass: “I am building a chain of debtors in every town on the north road.”
- Pass: “I want to establish a refuge where anyone can leave freely and still
  return.”
- Reject: “I seek authority over a durable system of favors.”
- Reject: “I look for communities that value freedom.”

### Experience and story prose

Write unfinished business rooted in remembered experience, not therapeutic
self-analysis or a miniature completed character arc. Use concrete
circumstances, roles, places, objects, routines, choices, failures, and
consequences. Reflection may follow an event, but it must not explain the lesson
when the event can demonstrate it.

Every experience or story passage must contain at least two of:

1. a concrete circumstance or event;
2. a concrete choice or action;
3. an unresolved consequence or lasting change that can return during play.

“My training taught me patience” fails. “My old mentor made me name the footing,
distance, and commitment of every charge; I still do that when a plan becomes
complicated” passes.

Prefer one sharp cause and one live consequence over a
cause → action → consequence → interpretation chain. Split passages that contain
several independent hooks.

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

Use concrete roles, possessions, places, and acts instead of portable placeholder
nouns. Proper names are optional; specificity is not.

- Prefer “the quartermaster” to “someone.”
- Prefer “their ledger” to “something they valued.”
- Prefer “the traveler nobody would share a fire with” to “the outsider.”
- Prefer “the river village” to “a threatened place.”
- Prefer “a dying soldier's promise to his sister” to “a costly promise.”

Do not state the moral when behavior can reveal it. Heavily revise constructions
such as “I learned that,” “this taught me,” “I believe,” “I know that,” “which
made me,” “made me wary of,” “proves its strength by,” and “without claiming.”

Class, species, heritage, and culture references must sound like lived
experience, not template inputs. Naturalize them through training habits,
physical experience, social treatment, possessions, rituals, or relationships.
Avoid “as a {{class.name}}” and “being {{species.name}}” unless a character would
naturally use the explicit label in that situation. An ancestry reference should
invoke an actual social or physical consequence rather than merely announce the
taxonomy.

The collection quality tests reject the following generic constructions anywhere
in the collection:

- “what matters to me” / “what mattered to me”
- “the person I am becoming”
- “reconsider what I want” / “reconsider what I wanted”
- “there was more to learn” / “how much I still had to learn” / “how much I had yet to learn”
- “gave me a new perspective”

Repeated openings such as “I learned to,” “I began to notice,” or “I came to
understand” are editorial smells for human review in the inventory report, not
automatic test failures.

For each alignment, alignment-sensitive slots (`ideals`, `flaws`, `choice`,
`motivation`) need at least two explicitly tagged candidates. The alternates must
express different methods or pressures, not paraphrases of the same temperament.
One fragment may list several compatible alignments when the pressure genuinely
fits each.

## Alignment

Alignment constrains compatible values and choices; it does not prescribe a
single temperament. Avoid moral caricatures and repeated stereotypes.

- Chaotic Evil need not always be violent, antisocial, or impulsive.
- Lawful Good need not always be dutiful, gentle, or trusting.
- A compatible flaw may frustrate an alignment’s values without contradicting
  them.

Review each alignment pool for varied values, methods, pressures, relationships,
and consequences. Automated **alignment-specific coverage** counts only
fragments whose `alignmentIds` include that alignment; **alignment eligibility**
also includes untagged generic fragments. Affinities and tags cannot substitute
for editorial judgment.

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
4. Rerun the fixed composition fixture and confirm at least 65% of its selected
   fragments are externally actionable.
5. Review playable specificity, voice, concreteness, live consequences,
   alignment variety, and cross-fragment coherence. Reject passages whose main
   work is retrospective interpretation.

Automated tests protect structure and obvious regressions. They do not certify
literary quality.

When changing the foundation collection:

1. Bump its `revision`.
2. Run `pnpm --filter @rpg/character-narrative-data review:inventory`.
3. Run `pnpm --filter @rpg/character-narrative-integrations review:foundation`.
4. Update `foundation-composition-review.md` when the editorial acceptance
   statement changes.
5. Run the data and integrations package tests.

## Deferred structured ingredients

A future expansion system may separate rendered prose from ingredients such as
`trigger`, `behavior`, `origin`, `tension`, and `consequence`. Do not add unused
ingredient metadata to the current collection. Adopt it only with a concrete
template or language-model consumer and a separate composition design.
