import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MediaGallery } from './media-gallery'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

it('shows the quiet empty state copy', () => {
  render(
    <MediaGallery
      media={{ revision: 0, images: [], roles: {} }}
      assets={{}}
      allowedRoles={['portrait', 'primary']}
      entries={[]}
      onSelect={vi.fn()}
      onAdd={vi.fn()}
      onRetry={vi.fn()}
      onRemoveUpload={vi.fn()}
    />,
  )
  expect(screen.getByText('No images yet')).toBeInTheDocument()
  expect(screen.getByText('Uploaded images will appear here.')).toBeInTheDocument()
  expect(screen.queryByText(/assign a role/i)).not.toBeInTheDocument()
})

it('calls onAdd from the gallery picker', async () => {
  const onAdd = vi.fn()
  const user = userEvent.setup()
  render(
    <MediaGallery
      media={{ revision: 0, images: [], roles: {} }}
      assets={{}}
      allowedRoles={['portrait', 'primary']}
      entries={[]}
      onSelect={vi.fn()}
      onAdd={onAdd}
      onRetry={vi.fn()}
      onRemoveUpload={vi.fn()}
    />,
  )
  await user.click(screen.getByRole('button', { name: /\+ add images/i }))
})

it('moves keyboard selection between images and shows role badges without a footer row', () => {
  const onSelect = vi.fn()
  render(
    <MediaGallery
      media={mediaFixture}
      assets={Object.fromEntries(mediaFixtureAssets.map((asset) => [asset.id, asset]))}
      allowedRoles={['portrait', 'primary']}
      selectedId="image-0"
      entries={[]}
      onSelect={onSelect}
      onAdd={vi.fn()}
      onRetry={vi.fn()}
      onRemoveUpload={vi.fn()}
    />,
  )
  const first = screen.getByRole('button', { name: /Seraphina Vale — portrait.jpg/ })
  expect(first).toHaveAttribute('aria-pressed', 'true')
  fireEvent.keyDown(first, { key: 'ArrowRight' })
  expect(onSelect).toHaveBeenCalledWith('image-1')
  expect(screen.getByRole('button', { name: /mountain expedition/ })).toHaveFocus()
  expect(screen.queryByText(/✓ Selected/)).not.toBeInTheDocument()
  expect(screen.getByText('Portrait')).toBeInTheDocument()
  expect(first.textContent).not.toMatch(/Portrait ·/)
})

it('labels upload queue rows with Waiting, Uploading, or Failed', () => {
  render(
    <MediaGallery
      media={{ revision: 0, images: [], roles: {} }}
      assets={{}}
      allowedRoles={['primary']}
      entries={[
        { id: 'a', file: new File(['a'], 'queued.png'), status: 'queued' },
        { id: 'b', file: new File(['b'], 'uploading.png'), status: 'uploading' },
        { id: 'c', file: new File(['c'], 'failed.png'), status: 'failed', error: 'Network error' },
      ]}
      onSelect={vi.fn()}
      onAdd={vi.fn()}
      onRetry={vi.fn()}
      onRemoveUpload={vi.fn()}
    />,
  )
  expect(screen.getByText(/— Waiting/)).toBeInTheDocument()
  expect(screen.getByText(/— Uploading/)).toBeInTheDocument()
  expect(screen.getByText(/— Failed/)).toBeInTheDocument()
})
