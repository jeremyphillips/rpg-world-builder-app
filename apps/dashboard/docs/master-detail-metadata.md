# Master-detail metadata

List rows and detail headers share one resolved object. Domain editors supply classification. They do not assemble the caption.

## Facts

| Property       | Owner                     | Meaning                                                                                     |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| `provenance`   | Shared resolver           | `system` only when the row id was on a system entity at editor open. Otherwise `homebrew`.  |
| `persistence`  | Shared resolver           | `persisted` when the row id is on the latest saved entity. Otherwise `new`.                 |
| `kindLabel`    | Domain `mapListItem`      | What the row is, such as "Natural weapon".                                                  |
| `summary`      | Domain `mapListItem`      | Optional list phrase when it differs from the kind. Detail still uses `kindLabel`.          |
| `sectionLabel` | The editor for that array | Where it sits, such as "Actions". Shown on the detail caption only.                         |
| `eyebrow`      | Domain `mapListItem`      | Leading list label, such as "Level 1". It stays above the title.                            |
| `sourceName`   | Derived at render         | Original name while a custom name is stored. It is not saved again and is not a kind label. |

`mapListItem` cannot set provenance or persistence.

## Unsaved

`Unsaved` means the row has not been persisted. It is not form dirtiness and not an unpublished draft. A saved homebrew draft stays `persisted`. A local subclass id (`draft-…`) is `new`. Editing, reordering, or selecting a row does not change persistence. Duplicating a row creates a new id, so the copy is `new` until save.

## Baselines

`embeddedSeedRowIds` is every embedded id on the latest saved entity. `loadContentEditFormState` rebuilds it from the list-cache entity. A successful save writes that entity into the list cache before the refetch. A failed save does not.

`embeddedSystemOriginRowIds` is frozen from the first load of a system entity in the session. Later saves must not add ids to it. A homebrew parent has no system-origin set.

Create mode has no saved entity, so every row is `new` and `homebrew` until an edit shell loads the created entity.

Reload limitation: a homebrew row saved onto a system creature in an earlier session is just another id on that entity. Entry citation provenance does not record System versus Homebrew, so a later visit classifies that row as system-origin. This change does not add a schema field for that distinction.

## Captions

`joinMasterDetailCaption` chooses what to show. Omitting a fact does not change it. Separators are omitted for empty parts. Typography stays the caption style. Badges are not used.

- List: `summary` when the domain set one, otherwise kind, then `Unsaved` when new. With no kind: `Unsaved` when new, otherwise System or Homebrew.
- Detail: derived source name, eyebrow, kind, section, then the same token. The eyebrow stays a separate line in the list.
- Provenance is hidden when a kind label or `Unsaved` is already shown.

A new Bite is `Natural weapon · Unsaved` in the list and `Natural weapon · Actions · Unsaved` in the detail. After it is renamed, the detail can lead with the derived name: `Bite · Natural weapon · Actions · Unsaved`. A saved custom trait is `Homebrew`. A system-origin trait is `System`.
