import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const actionsSource = readFileSync(
  fileURLToPath(new URL('../components/location-create-actions.client.tsx', import.meta.url)),
  'utf8',
)
const childrenSource = readFileSync(
  fileURLToPath(new URL('../components/location-children-section.client.tsx', import.meta.url)),
  'utf8',
)
const modalSource = readFileSync(
  fileURLToPath(new URL('../components/location-create-modal.client.tsx', import.meta.url)),
  'utf8',
)

describe('location create bypass guard', () => {
  it('routes overview promoted shortcuts through resolveLocationCreateSession launcher', () => {
    expect(actionsSource).toContain('useLocationCreateSessionLaunch')
    expect(actionsSource).toContain('launch({ authoringType })')
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
})
