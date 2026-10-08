import { CATALOG_PICKER_ADD_LABEL, CATALOG_PICKER_REMOVE_LABEL } from '@rpg/ui'
import { describe, expect, it } from 'vitest'

import { PICKER_MUTATION_FAMILIES, resolvePickerMutationCopy } from './picker-mutation-family'
import {
  PICKER_SELECTION_OWNED_LABEL,
  resolvePickerSelectionStateLine,
} from './picker-selection-state'

describe('resolvePickerMutationCopy', () => {
  it('exposes generic Add and Remove from the catalog picker labels', () => {
    expect(resolvePickerMutationCopy('genericSelection')).toEqual({
      acquire: CATALOG_PICKER_ADD_LABEL,
      state: 'Selected',
      release: CATALOG_PICKER_REMOVE_LABEL,
    })
  })

  it('owns the learned and prepared triplets', () => {
    expect(resolvePickerMutationCopy('learnedSpell')).toEqual({
      acquire: 'Learn',
      state: 'Learned',
      release: 'Unlearn',
    })
    expect(resolvePickerMutationCopy('preparedSpell')).toEqual({
      acquire: 'Prepare',
      state: 'Prepared',
      release: 'Unprepare',
    })
  })

  it('lets the caller choose acquire or release', () => {
    const learned = PICKER_MUTATION_FAMILIES.learnedSpell
    const alreadyLearned = true

    expect(alreadyLearned ? learned.release : learned.acquire).toBe('Unlearn')
    expect(alreadyLearned ? learned.acquire : learned.release).toBe('Learn')
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
