import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MediaStatusNotice } from './media-status-notice'

describe('MediaStatusNotice', () => {
  it('renders image-added notices with truncated filename preview', () => {
    render(
      <MediaStatusNotice
        notice={{
          kind: 'image-added',
          filename: 'seraphina-final-character-portrait.webp',
        }}
      />,
    )
    expect(screen.getByText(/seraphina/)).toBeInTheDocument()
    expect(
      screen.getByText(/added\. Assign a role to use it as representative artwork\./),
    ).toBeInTheDocument()
  })
})
