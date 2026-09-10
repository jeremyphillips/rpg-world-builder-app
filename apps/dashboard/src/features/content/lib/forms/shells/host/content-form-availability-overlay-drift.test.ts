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
const subclassEditorPanelPath = fileURLToPath(
  new URL('../../../../classes/components/subclasses/subclass-editor-panel.tsx', import.meta.url),
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
    expect(readFileSync(subclassEditorPanelPath, 'utf8')).toContain(
      'CONTENT_FORM_AVAILABILITY_PRESENTATION_DISCLOSURE',
    )
    expect(readFileSync(subclassEditorPanelPath, 'utf8')).toContain(
      'buildContentAvailabilitySlotItem',
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
