import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'

import {
  CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS,
  classSpellcastingPreviewParentDependsOn,
  spellcastingFromClassFormWatch,
  spellcastingFromFormValues,
} from './class-form-values'
import { classFormDef, type ClassFormValues } from './class-form-def'

const SPELLCASTING_ADAPTER_INPUTS = [
  'hasSpellcasting',
  'grantsCantrips',
  'spellcasting',
  'spellSelectionModel',
  'spellSelectionChangePackage',
  'spellbookAcquisitionIrregular',
  'spellbookAcquisitionStarting',
  'spellbookAcquisitionPerLevel',
  'spellbookAcquisitionThroughLevel',
  'spellbookAcquisitionCurve',
] as const

function parentWatchFromFormValues(formValues: ClassFormValues): Record<string, unknown> {
  const watched: Record<string, unknown> = {}
  for (const key of CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS) {
    watched[`../../${key}`] = formValues[key]
  }
  return watched
}

describe('spellcastingFromClassFormWatch', () => {
  it('keeps preview parent keys aligned with spellcastingFromFormValues inputs', () => {
    expect([...CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS]).toEqual([
      ...SPELLCASTING_ADAPTER_INPUTS,
    ])
    expect(classSpellcastingPreviewParentDependsOn()).toEqual(
      SPELLCASTING_ADAPTER_INPUTS.map((key) => `../../${key}`),
    )
  })

  it('matches spellcastingFromFormValues for bard seed form values', () => {
    const bard = loadSeedClasses('srd-cc-5.2.1').find((c) => c.slug === 'bard')
    if (!bard) throw new Error('missing bard seed')
    const formValues = classFormDef.toFormValues(bard) as ClassFormValues
    const watched = parentWatchFromFormValues(formValues)

    expect(spellcastingFromClassFormWatch(watched)).toEqual(spellcastingFromFormValues(formValues))
  })
})
