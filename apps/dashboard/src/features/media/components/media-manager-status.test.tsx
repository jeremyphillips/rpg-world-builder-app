import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MediaManagerStatus } from './media-manager-status'
import { mediaFixture } from '../fixtures'

describe('MediaManagerStatus', () => {
  it('shows upload progress and failure messages', () => {
    render(
      <MediaManagerStatus
        entries={[
          { id: '1', file: new File(['a'], 'a.png'), status: 'uploading' },
          { id: '2', file: new File(['b'], 'b.png'), status: 'queued' },
          { id: '3', file: new File(['c'], 'c.png'), status: 'failed' },
        ]}
        validation={{ ok: true, media: mediaFixture }}
      />,
    )
    expect(screen.getByText('Uploading 2 images…')).toBeInTheDocument()
    expect(screen.getByText('Upload failed. Try again.')).toBeInTheDocument()
  })
})
