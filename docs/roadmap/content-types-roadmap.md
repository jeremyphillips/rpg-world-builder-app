# Content Type vs. Vocabulary Guidance

Use a **vocabulary enum** for stable classifications. Use a **first-class content
type** when the concept represents a named, campaign-specific entity with its
own relationships, prose, ownership, or lifecycle.

## Promotion threshold

A concept should usually become its own content type when it meets **two or
more** of these conditions:

- Users create and name individual records.
- Records need substantial prose, lore, notes, or presentation content.
- Other content references a specific record by ID.
- Records relate to multiple content domains.
- Records need campaign overrides, homebrew entries, or availability rules.
- Records have their own editor, detail page, search, or permissions.
- Records need hierarchy, membership, ownership, chronology, or graph
  relationships.
- Different records of the same kind can carry materially different mechanics.

Keep the concept as vocabulary when it only classifies another record and its
entries remain short, stable, and globally meaningful.

## Tier 1 — Strong first-class content candidates

These are likely to outgrow enums quickly and should be treated as first-class
content once they enter product scope.

### Organization

Covers factions, guilds, governments, churches, military orders, criminal groups,
academic institutions, and similar bodies.

**Promote when** organizations need any combination of:

- names and descriptions
- members or leaders
- alliances and rivalries
- controlled locations
- associated cultures, faiths, or events
- campaign-specific organizations

Keep `organizationKind` as vocabulary.

### Faith or Religion

Represents an authored belief system or religious tradition rather than a simple
category.

**Promote when** a faith needs:

- doctrines, practices, symbols, or tenets
- associated deities or higher powers
- clergy, organizations, holidays, or locations
- character-facing choices or mechanical grants
- campaign-specific or homebrew traditions

Keep classifications such as `faithKind` or `traditionKind` as vocabulary.

### Deity or Higher Power

Represents a specific divine, cosmic, ancestral, or supernatural entity.

**Promote when** deities need:

- names, titles, symbols, and lore
- domains or portfolios
- associated faiths and organizations
- relationships with other powers
- cleric, feat, spell, or character options

Keep `divineRank`, `deityKind`, and similar classifications as vocabulary.

### Location

Represents named places and geographic containment.

**Promote when** locations need:

- names and descriptions
- parent-child geography
- inhabitants, organizations, cultures, or events
- maps, ownership, travel data, or campaign state
- references from characters, adventures, or encounters

Prefer one broad **Location** content type with a `locationKind` vocabulary
before creating separate schemas for every geographic scale.

### Culture

Represents a social or cultural identity that may cross species, heritage,
language, region, or faith boundaries.

**Promote when** cultures need:

- naming conventions
- languages or dialects
- customs, values, or traditions
- relationships to species, heritages, or locations
- organizations, faiths, or historical events
- campaign-defined cultures

Keep culture categories and tags as vocabulary.

### Historical Event

Represents a named occurrence with participants, chronology, and consequences.

**Promote when** events need:

- dates or eras
- participants and locations
- causes and outcomes
- links to organizations, cultures, or faiths
- campaign-specific history

Keep `eventKind` as vocabulary.

## Tier 2 — Likely content types once richer authoring is needed

These can remain embedded or represented through broader content types until
their requirements become distinct.

### Settlement

Initially model as:

```typescript
type Location = {
  kind: 'settlement'
}
```

Promote to a specialized schema only when settlements consistently need unique
fields such as population, districts, services, government, demographics, or
local laws.

### Government or Political Entity

Initially model as an organization, potentially linked to controlled locations.

Promote separately when territorial control, succession, laws, diplomacy,
sovereignty, or political hierarchy becomes central enough that normal
organization fields become awkward.

### Holiday or Observance

Initially model as an event or faith-owned embedded record.

**Promote when** observances need:

- calendar recurrence
- culture or faith applicability
- location-specific practices
- independent search and references
- campaign overrides

### Plane, Realm, or Cosmological Region

Initially model as a location with a cosmological kind.

Promote when planes require specialized environmental rules, travel connections,
metaphysical traits, or distinct mechanics.

### Language

Languages can remain catalog vocabulary while they are mostly selectable labels.

**Promote when** they need:

- scripts or dialects
- language families
- mutual intelligibility
- associated cultures or locations
- naming-convention integration
- campaign-defined language records

Keep language category, family, and rarity as vocabulary.

### Named Relic or Artifact

Ordinary items remain equipment content.

**Promote when** named relics require:

- unique history
- ownership and current location
- relationships to organizations, faiths, or events
- stateful campaign identity
- mechanics beyond the base equipment definition

This may eventually belong to an item-instance system rather than a generic
content catalog.

### Vehicle, Vessel, or Structure

Initially model through equipment, locations, or world objects.

Promote when named ships, castles, temples, headquarters, or mobile bases need
ownership, occupants, history, location, damage state, or campaign-specific
identity.

## Tier 3 — Keep as vocabulary until proven otherwise

These concepts usually work well as enums or catalog vocabularies because they
primarily classify other records.

- damage types
- creature types
- spell schools
- alignments or ethos categories
- organization kinds
- location kinds
- event kinds
- deity ranks
- domains
- professions
- social ranks
- titles
- currencies
- terrain categories
- settlement sizes
- government forms
- religious tradition categories
- culture tags

Promote one of these only when entries become independently authored entities
rather than labels.

For example:

- “Monarchy” classifies a government → vocabulary
- “The Kingdom of Ardel” owns territory, rulers, laws, and diplomacy →
  first-class content

## Recommended initial content set

A practical first expansion beyond the existing rules catalog is:

- Organization
- Faith
- Deity
- Location
- Culture
- HistoricalEvent

Use broad content types with vocabularies beneath them:

- **Organization** — `organizationKind`
- **Location** — `locationKind`
- **Faith** — `faithKind`
- **Deity** — `deityKind`, `divineRank`
- **HistoricalEvent** — `eventKind`

Avoid introducing a dedicated schema for every worldbuilding noun. Prefer broad
entities until a subtype develops materially different validation, authoring,
relationships, or UI.

## Decision rule

**Promote identity; enumerate classification.**

A named kingdom, church, deity, city, culture, or war is content.

Its kind—government, religious organization, divine rank, settlement, cultural
category, or event type—is vocabulary.
