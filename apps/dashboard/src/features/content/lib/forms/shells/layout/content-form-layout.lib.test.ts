import { describe, expect, it } from 'vitest'

import { contentFormRegistry } from '../../registry/content-form-registry'
import { hasContentFormPreview } from '../../preview/content-form-preview.types'
import { resolveContentFormLayout } from './content-form-layout.lib'
import '../../registry/content-form-test-registry'

describe('resolveContentFormLayout', () => {
  const previewDefs = Object.values(contentFormRegistry).filter((def) => hasContentFormPreview(def))
  const nonPreviewDefs = Object.values(contentFormRegistry).filter(
    (def) => !hasContentFormPreview(def),
  )

  it.each(previewDefs)(
    '$routeKey preview def resolves to viewport wide layout with preview enabled',
    (def) => {
      expect(resolveContentFormLayout(def)).toEqual({
        previewEnabled: true,
        pageWidth: 'wide',
        scrollMode: 'viewport',
      })
    },
  )

  it.each(nonPreviewDefs)('$routeKey non-preview def resolves to document narrow layout', (def) => {
    expect(resolveContentFormLayout(def)).toEqual({
      previewEnabled: false,
      pageWidth: 'narrow',
      scrollMode: 'document',
    })
  })

  it('preview-capable def without buildTabs resolves to wide document layout', () => {
    expect(
      resolveContentFormLayout({
        preview: {
          buildIdentity: () => ({ name: 'Test' }),
          buildSections: () => ({}),
        },
        buildTabs: undefined,
      }),
    ).toEqual({
      previewEnabled: false,
      pageWidth: 'wide',
      scrollMode: 'document',
    })
  })
})
