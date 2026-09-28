import { createUploadRoleAssignment } from '@rpg/contracts'
import { resolveCropRelativeGuideLayout } from '@rpg/ui'
import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createUploadSession } from '../api/media-api'
import type * as MediaApiModule from '../api/media-api'
import { MediaManager } from './media-manager'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'
import { resolveFramePresentation } from '../lib/content-media-image-frame.lib'

vi.mock('../api/media-api', async (importOriginal) => {
  const actual = await importOriginal<typeof MediaApiModule>()
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

function mount(overrides: Partial<Parameters<typeof MediaManager>[0]> = {}) {
  return render(
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
        {...overrides}
      />
    </QueryClientProvider>,
  )
}

it('shows a neutral preview for a selected image with no assigned roles', () => {
  mount()
  expect(screen.getByRole('heading', { name: 'Image preview' })).toBeInTheDocument()
  expect(
    screen.getByText('Assign a role to control how this image is used on this character.'),
  ).toBeInTheDocument()
  expect(screen.queryByLabelText('Zoom')).not.toBeInTheDocument()
  expect(screen.queryByText(/Seraphina Vale/)).not.toBeInTheDocument()
})

it('renders a presentation switch only when multiple roles are assigned', () => {
  mount({
    value: {
      ...mediaFixture,
      roles: {
        primary: createUploadRoleAssignment('image-0'),
        portrait: createUploadRoleAssignment('image-0'),
      },
    },
  })
  expect(screen.getByRole('group', { name: 'Presentation' })).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeInTheDocument()
})

it('hides the presentation switch when only one role is assigned', () => {
  mount({
    value: {
      ...mediaFixture,
      roles: { primary: createUploadRoleAssignment('image-0') },
    },
  })
  expect(screen.queryByRole('group', { name: 'Presentation' })).not.toBeInTheDocument()
})

it('switches presentations on a shared source without changing role assignments', () => {
  mount({
    value: {
      ...mediaFixture,
      roles: {
        primary: createUploadRoleAssignment('image-0'),
        portrait: createUploadRoleAssignment('image-0'),
      },
    },
  })
  expect(screen.getByLabelText('Zoom')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Primary' }))
  expect(screen.getByRole('group', { name: 'Primary crop position' })).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeChecked()
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
})

it('returns to the neutral preview when the active role is unchecked', () => {
  mount({
    value: {
      ...mediaFixture,
      roles: {
        primary: createUploadRoleAssignment('image-0'),
        portrait: createUploadRoleAssignment('image-0'),
      },
    },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Primary' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Primary image' }))
  expect(screen.getByRole('heading', { name: 'Portrait crop' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Portrait' }))
  expect(screen.getByRole('heading', { name: 'Image preview' })).toBeInTheDocument()
})

it('projects the renderer frame presentation as the primary card guide', () => {
  const authoredCrop = { x: 0.2, y: 0.15, width: 0.6, height: 0.45 }
  const focalPoint = { x: 0.5, y: 0.3 }
  mount({
    initialSelectedImageId: 'image-1',
    value: {
      ...mediaFixture,
      roles: {
        primary: {
          ...createUploadRoleAssignment('image-1'),
          presentation: { mode: 'crop', crop: authoredCrop, focalPoint },
        },
      },
    },
  })

  const presentation = resolveFramePresentation({
    role: 'primary',
    authoredCrop,
    focalPoint,
    frame: 'builderCard',
  })
  const layout = resolveCropRelativeGuideLayout(authoredCrop, presentation.effectiveCrop!)
  const guide = document.querySelector<HTMLElement>('[data-effective-crop-guide]')

  expect(guide).toHaveStyle({
    left: `${layout.leftPercent}%`,
    top: `${layout.topPercent}%`,
    width: `${layout.widthPercent}%`,
    height: `${layout.heightPercent}%`,
  })
  expect(screen.getAllByText(/outlined card window shows the resulting crop/i)).toHaveLength(1)
})
