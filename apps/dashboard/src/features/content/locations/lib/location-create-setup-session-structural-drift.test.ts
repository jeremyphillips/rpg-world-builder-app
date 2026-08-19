import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sessionSourcePath = fileURLToPath(
  new URL('../components/location-create-setup-session.client.tsx', import.meta.url),
)

describe('location create setup session structural drift', () => {
  it('routes setup through CreateSetupShell and the modal setup SSOT', () => {
    const source = readFileSync(sessionSourcePath, 'utf8')

    expect(source).toContain('CreateSetupShell')
    expect(source).toContain('resolveLocationCreateModalSetupModel')
    expect(source).toContain('applyLocationCreateModalSetupValueChange')
    expect(source).toContain('buildLocationCreateSetupSets')
    expect(source).not.toContain('CreateSetupPanel')
    expect(source).not.toContain('onReset')
  })
})
