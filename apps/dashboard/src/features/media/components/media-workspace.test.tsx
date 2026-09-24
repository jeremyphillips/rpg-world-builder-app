import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createUploadSession } from '../api/media-api'
import { MediaManager } from './media-manager'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

vi.mock('../api/media-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/media-api')>()
  return {
    ...actual,
    createUploadSession: vi.fn(),
    uploadMediaFile: vi.fn(),
  }
})

beforeEach(() => {
  vi.mocked(createUploadSession).mockResolvedValue({
    id: 'session',
    scope: { kind: 'user-pc', userId: 'demo' },
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    createdAt: new Date().toISOString(),
    maxUploadBytes: 5_242_880,
    maxAttachments: 20,
    maxUploadsInFlight: 3,
  })
})

it('shows a neutral preview for a selected image with no assigned roles', () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MediaManager
        open
        onOpenChange={vi.fn()}
        domain="character"
        value={{
          revision: 0,
          images: [{ id: 'image-0', assetId: mediaFixtureAssets[0]!.id }],
          roles: {},
        }}
        scope={{ kind: 'user-pc', userId: 'demo' }}
        initialAssets={mediaFixtureAssets}
        initialSelectedImageId="image-0"
        mode="form"
        onSave={vi.fn()}
      />
    </QueryClientProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Image preview' })).toBeInTheDocument()
  expect(screen.getByText('Assign a role to control how this image is used.')).toBeInTheDocument()
  expect(screen.queryByLabelText('Zoom')).not.toBeInTheDocument()
  expect(screen.queryByText(/Seraphina Vale/)).not.toBeInTheDocument()
})

it('renders a presentation switch only when multiple roles are assigned', () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MediaManager
        open
        onOpenChange={vi.fn()}
        domain="character"
        value={{
          ...mediaFixture,
          roles: { primary: { imageId: 'image-0' }, portrait: { imageId: 'image-0' } },
        }}
        scope={{ kind: 'user-pc', userId: 'demo' }}
        initialAssets={mediaFixtureAssets}
        initialSelectedImageId="image-0"
        mode="form"
        onSave={vi.fn()}
      />
    </QueryClientProvider>,
  )
  expect(screen.getByRole('group', { name: 'Presentation' })).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeInTheDocument()
})

it('switches presentations on a shared source without changing role assignments', () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MediaManager
        open
        onOpenChange={vi.fn()}
        domain="character"
        value={{
          ...mediaFixture,
          roles: { primary: { imageId: 'image-0' }, portrait: { imageId: 'image-0' } },
        }}
        scope={{ kind: 'user-pc', userId: 'demo' }}
        initialAssets={mediaFixtureAssets}
        mode="form"
        onSave={vi.fn()}
      />
    </QueryClientProvider>,
  )
  expect(screen.getByLabelText('Zoom')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Primary' }))
  expect(screen.getByRole('group', { name: 'Primary crop position' })).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeChecked()
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
})
