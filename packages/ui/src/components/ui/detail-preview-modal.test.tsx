import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { DETAIL_PREVIEW_MODAL_CLOSE_LABEL, DetailPreviewModal } from './detail-preview-modal.client'

describe('DetailPreviewModal', () => {
  it('renders shared preview chrome only', () => {
    render(
      <DetailPreviewModal open headline="Preview fighter" onOpenChange={() => undefined}>
        <p>Sheet body</p>
      </DetailPreviewModal>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Preview fighter' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: DETAIL_PREVIEW_MODAL_CLOSE_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByText('Sheet body')).toBeInTheDocument()
  })
})
