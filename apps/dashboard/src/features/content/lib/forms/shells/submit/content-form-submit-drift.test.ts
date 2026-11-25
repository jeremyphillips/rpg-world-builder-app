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
const contentEditShellPath = fileURLToPath(
  new URL('../edit/content-edit-shell.tsx', import.meta.url),
)
const contentFormSubmitCommitPath = fileURLToPath(
  new URL('./content-form-submit-commit.lib.ts', import.meta.url),
)
const previewValidationPath = fileURLToPath(
  new URL('../../validation/use-content-publish-validation.ts', import.meta.url),
)
const previewRailPath = fileURLToPath(
  new URL('../../preview/content-preview-rail.tsx', import.meta.url),
)
const publishBridgePath = fileURLToPath(
  new URL('../layout/content-create-publish-validation-bridge.client.tsx', import.meta.url),
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

  it('requires page create shell to use prepare-once publish and draft commit pipeline', () => {
    const source = readFileSync(contentCreateShellPath, 'utf8')

    expect(source).toContain('useContentFormSubmit')
    expect(source).toContain('prepareSerializedContentFormWrite')
    expect(source).not.toMatch(manualPublishParsePattern)
    expect(source).not.toContain('serializeContentFormInput(')
  })

  it('requires edit shell to use prepare-once commit pipeline', () => {
    const source = readFileSync(contentEditShellPath, 'utf8')

    expect(source).toContain('useContentFormSubmit')
    expect(source).toContain('prepareSerializedContentFormWrite')
    expect(source).toContain('persistContentEditUpdate')
    expect(source).not.toContain('useSubmitHandler')
  })

  it('requires commit submit authority in content-form-submit-commit', () => {
    const source = readFileSync(contentFormSubmitCommitPath, 'utf8')

    expect(source).toContain('runContentFormCommitPipeline')
    expect(source).not.toContain('applyContentPublishValidation')
  })

  it('requires publish preview and bridges to share canonical publish evaluation', () => {
    const railSource = readFileSync(previewRailPath, 'utf8')
    const validationSource = readFileSync(previewValidationPath, 'utf8')
    const bridgeSource = readFileSync(publishBridgePath, 'utf8')

    expect(railSource).toContain('resolveContentPublishSchema')
    expect(validationSource).toContain('evaluateContentPublishFormIssues')
    expect(validationSource).not.toContain('safeParseWithFieldErrors')
    expect(bridgeSource).toContain('evaluateContentPublishFormIssues')
    expect(bridgeSource).not.toContain('prepareFormIssues')
  })
})
