'use client'

import { Eyebrow, Text } from '@rpg/ui'

import {
  CHARACTER_EMPTY_SECTION_TEXT,
  CHARACTER_SECTION_LABELS,
  type CharacterActionRowViewModel,
  type CharacterDetailListItem,
  type CharacterDetailListSection,
  type CharacterProficienciesViewModel,
} from '../lib/character-display'
import {
  characterDetailActionsPanelClasses,
  characterDetailCombatCardClasses,
  characterDetailCombatRowGridClasses,
  characterDetailListItemClasses,
} from './character-detail-sheet.variants'

export type CharacterDetailCombatRowProps = {
  actions: CharacterActionRowViewModel[]
  savingThrows: CharacterDetailListSection
  proficiencies: CharacterProficienciesViewModel
}

/** Actions, saving throws, and proficiencies in a responsive three-column row. */
export function CharacterDetailCombatRow({
  actions,
  savingThrows,
  proficiencies,
}: CharacterDetailCombatRowProps) {
  return (
    <div className={characterDetailCombatRowGridClasses}>
      <CharacterDetailActionsPanel actions={actions} />
      <CharacterDetailSavingThrowsPanel section={savingThrows} />
      <CharacterDetailProficienciesPanel section={proficiencies} />
    </div>
  )
}

function CharacterDetailActionsPanel({ actions }: { actions: CharacterActionRowViewModel[] }) {
  return (
    <section className={characterDetailActionsPanelClasses}>
      <Eyebrow size="xs">{CHARACTER_SECTION_LABELS.actions}</Eyebrow>
      {actions.length === 0 ? (
        <Text variant="muted">{CHARACTER_EMPTY_SECTION_TEXT.actions}</Text>
      ) : (
        <ul className="space-y-2">
          {actions.map((action) => (
            <li key={action.id} className="rounded-md bg-surface-strong px-3 py-2 text-sm">
              <div className="font-medium">{action.name}</div>
              <div className="text-muted-foreground">
                Attack {action.attackBonus} · Damage {action.damage}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CharacterDetailSavingThrowsPanel({ section }: { section: CharacterDetailListSection }) {
  return (
    <section className={characterDetailCombatCardClasses}>
      <Eyebrow size="xs" className="mb-3">
        {section.title}
      </Eyebrow>
      <CharacterDetailListItems items={section.items} emptyText={section.emptyText} />
    </section>
  )
}

function CharacterDetailProficienciesPanel({
  section,
}: {
  section: CharacterProficienciesViewModel
}) {
  const hasItems = section.groups.length > 0

  return (
    <section className={characterDetailCombatCardClasses}>
      <Eyebrow size="xs" className="mb-3">
        {section.title}
      </Eyebrow>
      {!hasItems ? (
        <Text variant="muted">{section.emptyText}</Text>
      ) : (
        <div className="space-y-4">
          {section.groups.map((group) => (
            <div key={group.id} className="space-y-2">
              <Eyebrow size="xs">{group.title}</Eyebrow>
              <CharacterDetailListItems items={group.items} emptyText={section.emptyText} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function CharacterDetailListItems({
  items,
  emptyText,
}: {
  items: CharacterDetailListItem[]
  emptyText: string
}) {
  if (items.length === 0) {
    return <Text variant="muted">{emptyText}</Text>
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className={characterDetailListItemClasses}>
          <div className="font-medium">{item.label}</div>
          {item.detail ? <div className="text-muted-foreground">{item.detail}</div> : null}
        </li>
      ))}
    </ul>
  )
}
