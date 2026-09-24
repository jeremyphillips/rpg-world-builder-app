import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MediaStatusNotice } from './media-status-notice'
import { textMediaStatusNotice } from '../lib/media-notice.lib'

describe('MediaStatusNotice', () => {
  it('renders text notices', () => {
    render(<MediaStatusNotice notice={textMediaStatusNotice('Image removed from the draft.')} />)
    expect(screen.getByText('Image removed from the draft.')).toBeInTheDocument()
  })
})
