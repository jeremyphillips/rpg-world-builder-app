import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  CONTENT_FORM_AVAILABILITY_PRESENTATION_DIALOG,
  CONTENT_FORM_AVAILABILITY_PRESENTATION_DISCLOSURE,
  CONTENT_FORM_IDENTITY_LAYOUT_INLINE,
  CONTENT_FORM_IDENTITY_LAYOUT_STACKED,
} from '../content-form-presentation.lib'

const organizationCreateModalPath = fileURLToPath(
  new URL(
    '../../../../organizations/components/create/organization-create-modal.tsx',
    import.meta.url,
  ),
)
const locationCreateFormPath = fileURLToPath(
  new URL('../../../../locations/components/create/location-create-form.tsx', import.meta.url),
)
const classSubclassesTabPath = fileURLToPath(
  new URL('../../../../classes/components/class-subclasses-tab.tsx', import.meta.url),
)
const subclassDetailEditorPath = fileURLToPath(
  new URL('../../../../classes/components/subclasses/subclass-detail-editor.tsx', import.meta.url),
)
const subclassEditorCampaignAccessFieldPath = fileURLToPath(
  new URL(
    '../../../../classes/components/subclasses/subclass-editor-campaign-access-field.tsx',
    import.meta.url,
  ),
)
const nestedResourceMasterDetailEditorPath = fileURLToPath(
  new URL(
    '../../../../components/master-detail/nested-resource-master-detail-editor.tsx',
    import.meta.url,
  ),
)
const masterDetailEditorShellPath = fileURLToPath(
  new URL('../../../../components/master-detail/master-detail-editor-shell.tsx', import.meta.url),
)
const contentFormLayoutPath = fileURLToPath(
  new URL('../layout/content-form-shell-layout.tsx', import.meta.url),
)

describe('campaign availability overlay presentation drift guard', () => {
  it('requires overlay hosts to opt into disclosure presentation', () => {
    expect(readFileSync(organizationCreateModalPath, 'utf8')).toContain(
      'CONTENT_FORM_AVAILABILITY_PRESENTATION_DISCLOSURE',
    )
    expect(readFileSync(locationCreateFormPath, 'utf8')).toContain(
      'CONTENT_FORM_AVAILABILITY_PRESENTATION_DISCLOSURE',
    )
    expect(readFileSync(nestedResourceMasterDetailEditorPath, 'utf8')).toContain(
      'MasterDetailEditorShell',
    )
    expect(readFileSync(masterDetailEditorShellPath, 'utf8')).toContain(
      'MasterDetailAvailabilityHeaderLine',
    )
    expect(readFileSync(classSubclassesTabPath, 'utf8')).toContain(
      'NestedResourceMasterDetailEditor',
    )
    expect(readFileSync(classSubclassesTabPath, 'utf8')).toContain('openCampaignAvailabilityDialog')
    expect(readFileSync(subclassEditorCampaignAccessFieldPath, 'utf8')).toContain(
      'presentation="dialog"',
    )
    expect(readFileSync(subclassDetailEditorPath, 'utf8')).toContain(
      'SubclassEditorCampaignAccessField',
    )
  })

  it('requires the page shell to opt into dialog presentation', () => {
    const source = readFileSync(contentFormLayoutPath, 'utf8')
    expect(source).toContain('CONTENT_FORM_AVAILABILITY_PRESENTATION_DIALOG')
    expect(source).toContain('CONTENT_FORM_IDENTITY_LAYOUT_INLINE')
  })

  it('keeps presentation constants stable', () => {
    expect(CONTENT_FORM_AVAILABILITY_PRESENTATION_DISCLOSURE).toBe('disclosure')
    expect(CONTENT_FORM_AVAILABILITY_PRESENTATION_DIALOG).toBe('dialog')
    expect(CONTENT_FORM_IDENTITY_LAYOUT_STACKED).toBe('stacked')
    expect(CONTENT_FORM_IDENTITY_LAYOUT_INLINE).toBe('inline')
  })
})
