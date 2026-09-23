import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MediaGallery } from './media-gallery'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

it('moves keyboard selection between images and exposes independent role badges', () => {
  const onSelect = vi.fn()
  render(
    <MediaGallery
      media={mediaFixture}
      assets={Object.fromEntries(mediaFixtureAssets.map((asset) => [asset.id, asset]))}
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
})
