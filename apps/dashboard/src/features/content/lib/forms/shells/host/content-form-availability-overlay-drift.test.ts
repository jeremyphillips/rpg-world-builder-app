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
const subclassEditorPanelPath = fileURLToPath(
  new URL('../../../../classes/components/subclasses/subclass-editor-panel.tsx', import.meta.url),
)
const contentFormLayoutPath = fileURLToPath(
  new URL('../layout/content-form-shell-layout.tsx', import.meta.url),
)

describe('campaign availability overlay presentation drift guard', () => {
  it('requires overlay hosts to opt into disclosure presentation', () => {
    expect(readFileSync(organizationCreateModalPath, 'utf8')).toContain(
      'availabilityPresentation="disclosure"',
    )
    expect(readFileSync(locationCreateFormPath, 'utf8')).toContain(
      'availabilityPresentation="disclosure"',
    )
    expect(readFileSync(subclassEditorPanelPath, 'utf8')).toContain('presentation="disclosure"')
  })

  it('requires the page shell to opt into dialog presentation', () => {
    const source = readFileSync(contentFormLayoutPath, 'utf8')
    expect(source).toContain("availabilityPresentation: 'dialog'")
    expect(source).toContain("identityLayout: 'inline'")
  })
})
