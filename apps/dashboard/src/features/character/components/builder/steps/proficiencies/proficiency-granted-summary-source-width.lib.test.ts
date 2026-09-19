import { describe, expect, it } from 'vitest'

import { collectProficiencyGrantedSummarySourceLabels } from './proficiency-granted-summary-source-width.lib'

describe('collectProficiencyGrantedSummarySourceLabels', () => {
  it('returns unique source labels across rows', () => {
    expect(
      collectProficiencyGrantedSummarySourceLabels([
        {
          kind: 'savingThrows',
          label: 'Saving Throws',
          sourceGroups: [{ sourceLabel: 'Druid', valueLabels: ['Intelligence'] }],
        },
        {
          kind: 'languages',
          label: 'Languages',
          sourceGroups: [
            { sourceLabel: 'Druid', valueLabels: ['Druidic'] },
            { sourceLabel: 'Origin', valueLabels: ['Common'] },
          ],
        },
      ]),
    ).toEqual(['Druid', 'Origin'])
  })
})
