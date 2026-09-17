import { describe, expect, it } from 'vitest'

import { resolveTableKindPresentation } from './table-builder-kind-ui.lib'
import type { TableBuilderHostConfig } from './table-builder-host-config'

const dualKindConfig: TableBuilderHostConfig = {
  allowedKinds: ['levelProgression', 'general'],
  recommendedKind: 'levelProgression',
}

describe('resolveTableKindPresentation', () => {
  it('orders recommended kind first when creating with multiple allowed kinds', () => {
    expect(resolveTableKindPresentation(dualKindConfig, 'create', 'general')).toEqual({
      mode: 'selectable',
      kinds: ['levelProgression', 'general'],
    })
  })

  it('uses compact metadata when editing an existing table', () => {
    expect(resolveTableKindPresentation(dualKindConfig, 'edit', 'general')).toEqual({
      mode: 'metadata',
      kind: 'general',
    })
  })

  it('uses compact metadata for a single allowed kind even on create', () => {
    expect(
      resolveTableKindPresentation({ allowedKinds: ['general'] }, 'create', 'general'),
    ).toEqual({
      mode: 'metadata',
      kind: 'general',
    })
  })
})
