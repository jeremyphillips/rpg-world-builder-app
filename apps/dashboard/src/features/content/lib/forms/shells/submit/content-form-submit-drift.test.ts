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
const contentFormSubmitPresentationPath = fileURLToPath(
  new URL('./content-form-submit-presentation.lib.ts', import.meta.url),
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
const editPublishBridgePath = fileURLToPath(
  new URL('../edit/content-edit-publish-bridge.tsx', import.meta.url),
)
const monsterStatisticsPanelPath = fileURLToPath(
  new URL('../../../../monsters/components/form/statistics/statistics-panel.tsx', import.meta.url),
)
const masterDetailRowValidationPath = fileURLToPath(
  new URL('../../../master-detail/master-detail-row-validation.ts', import.meta.url),
)
const duplicateContentDialogPath = fileURLToPath(
  new URL('../../../duplication/duplicate-content-dialog.tsx', import.meta.url),
)
const masterDetailInlineTitlePath = fileURLToPath(
  new URL('../../../../components/master-detail/master-detail-inline-title.tsx', import.meta.url),
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
    expect(source).toContain('pipeline.prepared.provenance')
    expect(source).not.toContain('applyContentPublishValidation')
  })

  it('requires persist validation failure to paint api issues canonically', () => {
    const source = readFileSync(contentFormSubmitPresentationPath, 'utf8')

    expect(source).toContain('mapWireIssuesToAuthoring')
    expect(source).not.toContain('applyValidationIssuesToForm')
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

  it('requires edit publish bridge to use canonical publish evaluation and rhf paint', () => {
    const source = readFileSync(editPublishBridgePath, 'utf8')

    expect(source).toContain('validateContentPublishValues')
    expect(source).toContain('applyApiValidationIssuesToCanonicalRhf')
    expect(source).not.toContain('applyValidationIssuesToForm')
    expect(source).not.toContain('applyContentPublishValidation')
  })

  it('requires monster statistics panel to use content presentation issues only', () => {
    const source = readFileSync(monsterStatisticsPanelPath, 'utf8')

    expect(source).toContain('useContentFormPresentationIssues')
    expect(source).toContain('useFieldIssue')
    expect(source).not.toContain('flattenFormIssues')
    expect(source).not.toContain('useFormValidationPresentation')
    expect(source).not.toContain('publishPresentationIssues')
  })

  it('requires duplicate content dialog to use runner submit helper', () => {
    const source = readFileSync(duplicateContentDialogPath, 'utf8')

    expect(source).toContain('useRunnerFormSubmit')
    expect(source).not.toContain('useAdoptedFormSubmit')
    expect(source).not.toContain('useSubmitHandler')
  })

  it('requires content master-detail validation to use adopted presentation hooks', () => {
    const rowValidation = readFileSync(masterDetailRowValidationPath, 'utf8')
    const inlineTitle = readFileSync(masterDetailInlineTitlePath, 'utf8')

    expect(rowValidation).toContain('useContentFormPresentationIssues')
    expect(rowValidation).not.toContain('useFormValidationPresentation')
    expect(inlineTitle).toContain('useFieldIssue')
    expect(inlineTitle).not.toContain('useFormValidationPresentation')
    expect(inlineTitle).not.toContain('useFieldErrorPresentation')
  })
})
