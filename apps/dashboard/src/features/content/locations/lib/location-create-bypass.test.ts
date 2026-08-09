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

describe('location create bypass guard', () => {
  it('routes overview promoted shortcuts through resolveLocationCreateSession launcher', () => {
    expect(actionsSource).toContain('useLocationCreateSessionLaunch')
    expect(actionsSource).toContain('launch({ authoringType })')
    expect(actionsSource).not.toMatch(/Link to=\{buildLocationCreateHref\([^)]*authoringType/)
  })

  it('routes contained add selections through resolveLocationCreateSession launcher', () => {
    expect(childrenSource).toContain('useLocationCreateSessionLaunch')
    expect(childrenSource).toContain(
      'launch({ authoringType, parentLocationId: fixedParentLocationId })',
    )
    expect(childrenSource).not.toContain('setCreateIntent')
  })
})
