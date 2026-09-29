/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'

import { measureStatRowLabelColumnWidths } from '../measure-stat-row-label-column-widths.lib'

function labelGroup(width: number): HTMLDivElement {
  const group = document.createElement('div')
  const label = document.createElement('span')
  label.setAttribute('data-slot', 'content-stat-row-label')
  Object.defineProperty(label, 'getBoundingClientRect', {
    value: () => ({ width }),
  })
  group.append(label)
  return group
}

describe('measureStatRowLabelColumnWidths', () => {
  it('returns undefined for a single group', () => {
    expect(measureStatRowLabelColumnWidths([labelGroup(80)])).toBeUndefined()
  })

  it('shares one ceil’d max label width across every group, including wrapped rows', () => {
    expect(
      measureStatRowLabelColumnWidths([labelGroup(80.2), labelGroup(120), labelGroup(40)]),
    ).toBe(120)
    expect(measureStatRowLabelColumnWidths([labelGroup(80.2), labelGroup(40.4)])).toBe(81)
  })

  it('restores label white-space after the nowrap measure pass', () => {
    const group = labelGroup(40)
    const label = group.querySelector('span')
    if (!label) {
      throw new Error('expected label')
    }
    label.style.whiteSpace = 'normal'

    measureStatRowLabelColumnWidths([group, labelGroup(10)])

    expect(label.style.whiteSpace).toBe('normal')
  })
})
