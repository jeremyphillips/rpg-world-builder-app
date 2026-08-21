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
  it('routes overview promoted shortcuts through the canonical session surfaces', () => {
    expect(actionsSource).toContain('useLocationCreateSessionLaunch')
    expect(actionsSource).toContain('launch({ authoringType })')
    expect(actionsSource).toContain("authoringType === 'building'")
    expect(actionsSource).toContain('LocationCreateModal')
    expect(actionsSource).not.toMatch(/Link to=\{buildLocationCreateHref\([^)]*authoringType/)
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

  it('routes unrestricted Building selection into the typed building session', () => {
    expect(pageSource).toContain('LocationCreateAuthoringTypeWatcher')
    expect(pageSource).toContain("authoringType === 'building'")
    expect(pageSource).toContain('buildLocationFixedCreateHref')
    expect(pageSource).toContain('ROUTES.content.locations.create(campaignId)')
  })

  it('blocks generic create from persisting buildings', () => {
    expect(pageSource).toContain('Building create must use the composition coordinator.')
    expect(formSource).toContain("fixedCreate.authoringType === 'building'")
    expect(formSource).toContain('completeBuildingCreateComposition')
    expect(formSource).not.toMatch(
      /fixedCreate\.authoringType === 'building' && props\.buildingSetupApplication/,
    )
  })
})
