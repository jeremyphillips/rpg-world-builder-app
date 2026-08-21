import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const organizationCreateModalPath = fileURLToPath(
  new URL(
    '../../../../organizations/components/create/organization-create-modal.tsx',
    import.meta.url,
  ),
)
const locationCreateFormPath = fileURLToPath(
  new URL('../../../../locations/components/create/location-create-form.tsx', import.meta.url),
)
const contentCreateShellPath = fileURLToPath(
  new URL('../create/content-create-shell.tsx', import.meta.url),
)

const manualPublishParsePattern = /resolveContentFormSchema\([^)]*,\s*['"]publish['"]\)\.parse\(/

describe('ContentFormDef create submit drift guard', () => {
  it('requires organization create modal to use useContentFormSubmit', () => {
    const source = readFileSync(organizationCreateModalPath, 'utf8')

    expect(source).toContain('useContentFormSubmit')
    expect(source).not.toMatch(manualPublishParsePattern)
  })

  it('requires location create form to use useContentFormSubmit', () => {
    const source = readFileSync(locationCreateFormPath, 'utf8')

    expect(source).toContain('useContentFormSubmit')
    expect(source).not.toMatch(manualPublishParsePattern)
    expect(source).not.toContain('BuildingCreateSubmitButton')
  })

  it('requires page create shell to use useContentFormSubmit', () => {
    const source = readFileSync(contentCreateShellPath, 'utf8')

    expect(source).toContain('useContentFormSubmit')
    expect(source).not.toMatch(manualPublishParsePattern)
  })
})
