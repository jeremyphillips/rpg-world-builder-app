import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const actionsSource = readFileSync(
  fileURLToPath(new URL('../../components/create/location-create-actions.tsx', import.meta.url)),
  'utf8',
)
const childrenSource = readFileSync(
  fileURLToPath(
    new URL('../../components/hierarchy/location-children-section.tsx', import.meta.url),
  ),
  'utf8',
)
const modalSource = readFileSync(
  fileURLToPath(new URL('../../components/create/location-create-modal.tsx', import.meta.url)),
  'utf8',
)

const pageSource = readFileSync(
  fileURLToPath(new URL('../../components/create/location-create-page.tsx', import.meta.url)),
  'utf8',
)
const formSource = readFileSync(
  fileURLToPath(new URL('../../components/create/location-create-form.tsx', import.meta.url)),
  'utf8',
)

describe('location create bypass guard', () => {
  it('routes overview create through the split action and modal handoff', () => {
    expect(actionsSource).toContain('ContentCreateSplitAction')
    expect(actionsSource).toContain('setupCompletion')
    expect(actionsSource).toContain('buildLocationCreateHandoffHref')
    expect(actionsSource).toContain('LocationCreateModal')
    expect(actionsSource).not.toContain('useLocationCreateSessionLaunch')
  })

  it('routes contained add selections through LocationCreateModal', () => {
    expect(childrenSource).toContain('LocationCreateModal')
    expect(childrenSource).toContain('setCreateIntent')
    expect(childrenSource).toContain('parentLocationId: fixedParentLocationId')
    expect(childrenSource).toContain('parentKind:')
    expect(childrenSource).not.toContain('LocationContainedCreateDrawer')
    expect(childrenSource).not.toContain('useLocationCreateSessionLaunch')
  })

  it('resolves create sessions inside LocationCreateModal without drawer handoff', () => {
    expect(modalSource).toContain('resolveLocationCreateSession')
    expect(modalSource).toContain('completeLocationCreateSetup')
    expect(modalSource).toContain('LocationCreateForm')
    expect(modalSource).not.toContain('LocationContainedCreateDrawer')
    expect(modalSource).not.toContain('ContentFormDrawer')
  })

  it('does not redirect unrestricted create when Location type changes', () => {
    expect(pageSource).not.toContain('LocationCreateAuthoringTypeWatcher')
    expect(pageSource).not.toContain('Building create must use the composition coordinator.')
    expect(pageSource).not.toContain('LocationCreateSetupHost')
  })

  it('keeps modal building composition on LocationCreateForm', () => {
    expect(formSource).toContain("fixedCreate.authoringType === 'building'")
    expect(formSource).toContain('completeBuildingCreateComposition')
    expect(formSource).not.toMatch(
      /fixedCreate\.authoringType === 'building' && props\.buildingSetupApplication/,
    )
  })
})
