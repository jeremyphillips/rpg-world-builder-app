import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { COMPACT_MEDIA_FIELD_PRESENTATION } from '../lib/media-field-config'
import { DetailMediaField } from './detail-media-field'

vi.mock('./media-manager', () => ({
  MediaManager: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Media manager</div> : null,
}))

describe('DetailMediaField', () => {
  it('opens the manager when editable and empty', () => {
    render(
      <DetailMediaField
        config={{ domain: 'character', presentation: COMPACT_MEDIA_FIELD_PRESENTATION }}
        scope={{ kind: 'user-pc', userId: 'user-1' }}
        value={{ revision: 0, images: [], roles: {} }}
        onSave={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Character images: No images. Add' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders nothing when read-only and empty', () => {
    const { container } = render(
      <DetailMediaField
        config={{ domain: 'character', presentation: COMPACT_MEDIA_FIELD_PRESENTATION }}
        scope={{ kind: 'user-pc', userId: 'user-1' }}
        value={{ revision: 0, images: [], roles: {} }}
        readOnly
        onSave={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
