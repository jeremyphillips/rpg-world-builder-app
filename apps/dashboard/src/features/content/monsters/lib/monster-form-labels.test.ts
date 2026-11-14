import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CONTENT_TYPE_KEYS,
  CONTENT_TYPE_TERMS,
  getActionEconomySectionLabel,
  getMonsterActionKindLabel,
  getTermCollectionLabel,
  PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'monster-form-labels.ts'),
  'utf8',
)

import {
  LEGENDARY_ACTION_CATEGORY_LABELS,
  MONSTER_ACTIONS_HEADING,
  MONSTER_BONUS_ACTIONS_HEADING,
  MONSTER_REACTIONS_HEADING,
} from './monster-form-labels'

describe('monster-form-labels', () => {
  it('uses contract action-economy section headings', () => {
    expect(MONSTER_ACTIONS_HEADING).toBe(getActionEconomySectionLabel('action'))
    expect(MONSTER_BONUS_ACTIONS_HEADING).toBe(getActionEconomySectionLabel('bonus-action'))
    expect(MONSTER_REACTIONS_HEADING).toBe(getActionEconomySectionLabel('reaction'))
  })

  it('wires legendary reference category label from action kind vocabulary', () => {
    expect(LEGENDARY_ACTION_CATEGORY_LABELS.reference).toBe(
      getMonsterActionKindLabel('action-reference'),
    )
  })

  it('does not duplicate the primary spellcasting validation message', () => {
    expect(source).not.toContain(PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE)
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
