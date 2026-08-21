import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const organizationCreateModalPath = fileURLToPath(
  new URL(
    '../../../organizations/components/authoring/organization-create-modal.client.tsx',
    import.meta.url,
  ),
)
const locationCreateFormPath = fileURLToPath(
  new URL('../../../locations/components/create/location-create-form.client.tsx', import.meta.url),
)

describe('ContentFormHost def adapter drift guard', () => {
  it('requires organization create modal to project def-owned host config', () => {
    const source = readFileSync(organizationCreateModalPath, 'utf8')

    expect(source).toContain('resolveContentFormHostConfig')
    expect(source).not.toMatch(/schema:\s*resolveContentFormSchema\(organizationFormDef/)
    expect(source).not.toMatch(/fields:\s*contentFormFields\(organizationFormDef/)
  })

  it('documents location create as intentionally hand-composed', () => {
    const source = readFileSync(locationCreateFormPath, 'utf8')

    expect(source).toContain('locationFormValueSyncs')
    expect(source).not.toContain('resolveContentFormHostConfig')
  })
})
