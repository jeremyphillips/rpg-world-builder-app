import { PICKER_DISABLED_REASON_SELECTION_FULL } from '@rpg/contracts'
import { CATALOG_PICKER_ADD_LABEL, CATALOG_PICKER_REMOVE_LABEL } from '@rpg/ui'
import { describe, expect, it } from 'vitest'

import {
  PICKER_MUTATION_FAMILIES,
  resolvePickerCapacityTooltip,
  resolvePickerMutationCopy,
  resolvePickerPendingLabel,
} from './picker-mutation-family'
import {
  PICKER_SELECTION_OWNED_LABEL,
  resolvePickerSelectionStateLine,
} from './picker-selection-state'

describe('resolvePickerMutationCopy', () => {
  it('exposes generic Add and Remove from the catalog picker labels', () => {
    expect(resolvePickerMutationCopy('genericSelection')).toEqual({
      acquire: CATALOG_PICKER_ADD_LABEL,
      acquiring: 'adding',
      state: 'Selected',
      release: CATALOG_PICKER_REMOVE_LABEL,
      releasing: 'removing',
    })
  })

  it('owns the learned and prepared triplets', () => {
    expect(resolvePickerMutationCopy('learnedSpell')).toEqual({
      acquire: 'Learn',
      acquiring: 'learning',
      state: 'Learned',
      release: 'Unlearn',
      releasing: 'unlearning',
    })
    expect(resolvePickerMutationCopy('preparedSpell')).toEqual({
      acquire: 'Prepare',
      acquiring: 'preparing',
      state: 'Prepared',
      release: 'Unprepare',
      releasing: 'unpreparing',
    })
  })

  it('lets the caller choose acquire or release', () => {
    const learned = PICKER_MUTATION_FAMILIES.learnedSpell
    const alreadyLearned = true

    expect(alreadyLearned ? learned.release : learned.acquire).toBe('Unlearn')
    expect(alreadyLearned ? learned.acquire : learned.release).toBe('Learn')
  })
})

describe('resolvePickerCapacityTooltip', () => {
  it('builds the three capacity sentences from the stored progressive forms', () => {
    const learned = resolvePickerMutationCopy('learnedSpell')
    const prepared = resolvePickerMutationCopy('preparedSpell')
    const generic = resolvePickerMutationCopy('genericSelection')

    expect(resolvePickerCapacityTooltip('learnedSpell')).toEqual({
      title: PICKER_DISABLED_REASON_SELECTION_FULL,
      body: 'Unlearn a spell before learning another.',
    })
    expect(resolvePickerCapacityTooltip('learnedSpell').body).toBe(
      `${learned.release} a spell before ${learned.acquiring} another.`,
    )
    expect(resolvePickerCapacityTooltip('preparedSpell').body).toBe(
      'Unprepare a spell before preparing another.',
    )
    expect(resolvePickerCapacityTooltip('preparedSpell').body).toBe(
      `${prepared.release} a spell before ${prepared.acquiring} another.`,
    )
    expect(resolvePickerCapacityTooltip('genericSelection').body).toBe(
      'Remove a selection before adding another.',
    )
    expect(resolvePickerCapacityTooltip('genericSelection').body).toBe(
      `${generic.release} a selection before ${generic.acquiring} another.`,
    )
  })
})

describe('resolvePickerPendingLabel', () => {
  it('capitalizes the stored progressive and appends an ellipsis', () => {
    expect(resolvePickerPendingLabel('learnedSpell', 'acquire')).toBe('Learning…')
    expect(resolvePickerPendingLabel('learnedSpell', 'release')).toBe('Unlearning…')
    expect(resolvePickerPendingLabel('preparedSpell', 'acquire')).toBe('Preparing…')
    expect(resolvePickerPendingLabel('preparedSpell', 'release')).toBe('Unpreparing…')
    expect(resolvePickerPendingLabel('genericSelection', 'acquire')).toBe('Adding…')
    expect(resolvePickerPendingLabel('genericSelection', 'release')).toBe('Removing…')
  })
})

describe('resolvePickerSelectionStateLine', () => {
  it('reads state words from the matching family', () => {
    expect(resolvePickerSelectionStateLine({ kind: 'selected' })).toEqual({ label: 'Selected' })
    expect(resolvePickerSelectionStateLine({ kind: 'learned' })).toEqual({ label: 'Learned' })
    expect(resolvePickerSelectionStateLine({ kind: 'prepared' })).toEqual({ label: 'Prepared' })
  })

  it('uses the Owned label and passes provenance labels through', () => {
    expect(
      resolvePickerSelectionStateLine({
        kind: 'owned',
        provenance: [
          { kind: 'package', label: 'Package ×2', quantity: 2 },
          { kind: 'purchase', label: 'Purchased' },
        ],
      }),
    ).toEqual({
      label: PICKER_SELECTION_OWNED_LABEL,
      provenance: ['Package ×2', 'Purchased'],
    })
  })

  it('omits the line when there is no selection state', () => {
    expect(resolvePickerSelectionStateLine(null)).toBeNull()
    expect(resolvePickerSelectionStateLine(undefined)).toBeNull()
  })
})
