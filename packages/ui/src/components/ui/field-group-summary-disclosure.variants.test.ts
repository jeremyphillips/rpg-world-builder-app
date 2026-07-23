import { describe, expect, it } from 'vitest'

import {
  fieldGroupSummaryDisclosurePanelClasses,
  resolveFieldGroupSummaryDisclosurePanelClasses,
} from './field-group-summary-disclosure.variants'

describe('resolveFieldGroupSummaryDisclosurePanelClasses', () => {
  it('returns divider and padding classes by default', () => {
    expect(resolveFieldGroupSummaryDisclosurePanelClasses()).toBe(
      fieldGroupSummaryDisclosurePanelClasses,
    )
    expect(resolveFieldGroupSummaryDisclosurePanelClasses(true)).toContain('border-t')
    expect(resolveFieldGroupSummaryDisclosurePanelClasses(true)).toContain('pt-3')
  })

  it('omits only the panel top border when panelDivider is false', () => {
    expect(resolveFieldGroupSummaryDisclosurePanelClasses(false)).toBe('pt-3')
    expect(resolveFieldGroupSummaryDisclosurePanelClasses(false)).not.toContain('border-t')
  })
})
