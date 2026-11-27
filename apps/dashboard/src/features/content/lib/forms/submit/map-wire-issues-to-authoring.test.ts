import { describe, expect, it } from 'vitest'
import type { FormIssue } from '@rpg/ui/form'

import { mapWireIssuesToAuthoring } from './map-wire-issues-to-authoring.lib'
import { projectCompactedArrayProvenance } from './project-compacted-array-provenance.lib'

const issue = (path: string): FormIssue => ({ path, message: 'bad', severity: 'field' })

describe('mapWireIssuesToAuthoring', () => {
  it('maps a surviving request row back to its source row, not its current index', () => {
    // sources 0 and 2 dropped; source 1 -> 0, source 3 -> 1
    const provenance = projectCompactedArrayProvenance('traits', 4, (i) => i === 1 || i === 3)
    const { issues, unattributed } = mapWireIssuesToAuthoring(
      [issue('traits.0.name'), issue('traits.1.name')],
      provenance,
    )
    expect(issues.map((i) => i.path)).toEqual(['traits.1.name', 'traits.3.name'])
    expect(unattributed).toEqual([])
  })

  it('keeps duplicate-valued rows distinct by recorded identity', () => {
    const provenance = projectCompactedArrayProvenance('rows', 3, (i) => i !== 0)
    const { issues } = mapWireIssuesToAuthoring([issue('rows.0'), issue('rows.1')], provenance)
    expect(issues.map((i) => i.path)).toEqual(['rows.1', 'rows.2'])
  })

  it('falls back to the collection and reports a row the map cannot attribute', () => {
    const provenance = projectCompactedArrayProvenance('traits', 2, () => true)
    const { issues, unattributed } = mapWireIssuesToAuthoring([issue('traits.7.name')], provenance)
    expect(issues[0]!.path).toBe('traits')
    expect(unattributed).toEqual(['traits.7.name'])
  })

  it('treats null provenance like empty lineage', () => {
    const { issues } = mapWireIssuesToAuthoring([issue('name')], null as never)
    expect(issues.map((i) => i.path)).toEqual(['name'])
  })

  it('applies declared renames and leaves uncovered paths unchanged', () => {
    const { issues } = mapWireIssuesToAuthoring([issue('wire.speed'), issue('name')], {
      pathMap: { 'movement.speed': 'wire.speed' },
    })
    expect(issues.map((i) => i.path)).toEqual(['movement.speed', 'name'])
  })

  it('composes a rename into a compacted collection', () => {
    const provenance = {
      pathMap: { features: 'wireFeatures' },
      ...projectCompactedArrayProvenance('features', 3, (i) => i === 2),
    }
    const { issues } = mapWireIssuesToAuthoring([issue('wireFeatures.0.name')], provenance)
    expect(issues[0]!.path).toBe('features.2.name')
  })
})
