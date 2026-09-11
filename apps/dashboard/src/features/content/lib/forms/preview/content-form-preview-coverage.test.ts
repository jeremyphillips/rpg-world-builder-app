import { describe, expect, it } from 'vitest'

import { contentFormRegistry } from '../registry/content-form-registry'
import { hasContentFormPreview } from './content-form-preview.types'
import '../registry/content-form-test-registry'

describe('ContentFormDef preview coverage', () => {
  const previewEntries = Object.values(contentFormRegistry).filter((def) =>
    hasContentFormPreview(def),
  )

  it('registers at least the class projection', () => {
    expect(previewEntries.map((def) => def.routeKey)).toContain('classes')
  })

  it.each(previewEntries)('$routeKey buildSections keys match buildTabs ids', (def) => {
    const ctx = { campaignId: 'camp_1', mode: 'create' as const, entitySource: 'homebrew' as const }
    const tabs = def.buildTabs?.(ctx) ?? []
    const values = { ...def.createDefaultValues, name: '' }
    const sections = def.preview!.buildSections(values, ctx)

    expect(Object.keys(sections).sort()).toEqual([...tabs.map((tab) => tab.id)].sort())
  })
})
