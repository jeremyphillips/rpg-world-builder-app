import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CONTENT_TYPE_KEYS,
  CONTENT_TYPE_TERMS,
  getActionEconomySectionLabel,
  getMonsterActionKindLabel,
  getTermCollectionLabel,
  getTermSentenceForm,
  MONSTER_ACTION_KIND_ENTRIES,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'monster-form-labels.ts'),
  'utf8',
)

import { MONSTER_ACTION_SECTIONS } from '@rpg/contracts/content'

import { masterDetailEmptySectionLabel } from '../../lib/master-detail/master-detail-constants'
import {
  formatMonsterActionMultiattackPreviewConfigureHint,
  LEGENDARY_ACTION_CATEGORY_LABELS,
  MONSTER_ACTION_EDITOR_FALLBACK_TITLES,
  MONSTER_ACTIONS_HEADING,
  MONSTER_BONUS_ACTIONS_HEADING,
  MONSTER_LEGENDARY_ACTIONS_HEADING,
  MONSTER_REACTIONS_HEADING,
  monsterActionSectionEmptyLabel,
  monsterActionSectionHeading,
} from './monster-form-labels'

describe('monster-form-labels', () => {
  it('uses contract action-economy section headings', () => {
    expect(MONSTER_ACTIONS_HEADING).toBe(getActionEconomySectionLabel('action'))
    expect(MONSTER_BONUS_ACTIONS_HEADING).toBe(getActionEconomySectionLabel('bonus-action'))
    expect(MONSTER_REACTIONS_HEADING).toBe(getActionEconomySectionLabel('reaction'))
  })

  it('formats section empty copy from section headings via the master-detail template', () => {
    for (const section of MONSTER_ACTION_SECTIONS) {
      expect(monsterActionSectionEmptyLabel(section)).toBe(
        masterDetailEmptySectionLabel(monsterActionSectionHeading(section).toLowerCase()),
      )
    }
    expect(monsterActionSectionEmptyLabel('bonusActions')).toBe(
      masterDetailEmptySectionLabel('bonus actions'),
    )
    expect(monsterActionSectionEmptyLabel('legendaryActions')).toBe(
      masterDetailEmptySectionLabel(MONSTER_LEGENDARY_ACTIONS_HEADING.toLowerCase()),
    )
  })

  it('derives multiattack preview configure hint noun from action kind vocab', () => {
    const noun = getTermSentenceForm(MONSTER_ACTION_KIND_ENTRIES.multiattack, 1)
    expect(formatMonsterActionMultiattackPreviewConfigureHint('steps')).toBe(
      `Configure steps to preview this ${noun}.`,
    )
  })

  it('wires legendary reference category label from action kind vocabulary', () => {
    expect(LEGENDARY_ACTION_CATEGORY_LABELS.reference).toBe(
      getMonsterActionKindLabel('action-reference'),
    )
  })

  it('keeps editor fallback titles distinct from kind vocabulary labels', () => {
    expect(MONSTER_ACTION_EDITOR_FALLBACK_TITLES.special).not.toBe(
      getMonsterActionKindLabel('special'),
    )
    expect(MONSTER_ACTION_EDITOR_FALLBACK_TITLES.save).not.toBe(getMonsterActionKindLabel('save'))
    expect(MONSTER_ACTION_EDITOR_FALLBACK_TITLES.special).toBe('Special Ability')
    expect(MONSTER_ACTION_EDITOR_FALLBACK_TITLES.save).toBe('Saving Throw')
  })

  it('does not duplicate the primary spellcasting validation message', () => {
    expect(source).not.toContain('Only one Spellcasting profile is allowed.')
  })

  it('does not embed catalog nouns as string literals', () => {
    const owned = CONTENT_TYPE_KEYS.flatMap((key) => {
      const term = CONTENT_TYPE_TERMS[key]
      return [term.label, getTermCollectionLabel(term)]
    })
    const literals = [...source.matchAll(/'([^'\\]+)'|"([^"\\]+)"/g)].map(
      (match) => match[1] ?? match[2] ?? '',
    )
    for (const noun of owned) {
      expect(literals, noun).not.toContain(noun)
    }
  })
})
