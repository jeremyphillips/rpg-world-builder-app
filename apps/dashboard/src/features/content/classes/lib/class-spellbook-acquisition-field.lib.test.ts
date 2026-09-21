import { describe, expect, it } from 'vitest'

import {
  buildClassSpellbookAcquisitionDraft,
  buildClassSpellbookAcquisitionHostConfig,
  mapClassSpellbookAcquisitionDraftToProgression,
} from './class-spellbook-acquisition-field.lib'

describe('class-spellbook-acquisition-field.lib', () => {
  it('uses acquisition-specific add-row copy on the host config', () => {
    expect(
      buildClassSpellbookAcquisitionHostConfig({
        allowedLevels: [1, 2, 3],
      }).addRowLabel,
    ).toBe('Add level')
  })

  it('round-trips sparse gain rows without fill-forward', () => {
    const acquisition = {
      curve: {
        rows: [
          { level: 1, count: 6 },
          { level: 2, count: 2 },
          { level: 4, count: 3 },
        ],
      },
      extension: 'zero' as const,
    }

    const draft = buildClassSpellbookAcquisitionDraft(acquisition)
    expect(mapClassSpellbookAcquisitionDraftToProgression(draft)).toEqual(acquisition)
  })
})
