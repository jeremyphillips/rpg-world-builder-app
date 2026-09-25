import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  CONTENT_MEDIA_DOMAINS,
  createUploadRoleAssignment,
  focalPointFromCropCenter,
  resetPrimaryCrop,
} from '@rpg/contracts'
import { createUploadSession } from '../api/media-api'
import { MediaManager, type MediaManagerProps } from './media-manager'
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
    scope: { kind: 'user-pc', userId: 'user' },
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    createdAt: new Date().toISOString(),
    maxUploadBytes: 5_242_880,
    maxAttachments: 20,
    maxUploadsInFlight: 3,
  })
})

function createUploadFile(name: string, type: string) {
  return new File(['demo'], name, { type })
}

function mount(overrides: Partial<MediaManagerProps> = {}) {
  const props: MediaManagerProps = {
    open: true,
    onOpenChange: vi.fn(),
    domain: 'character',
    value: structuredClone(mediaFixture),
    scope: { kind: 'user-pc', userId: 'user' },
    initialAssets: mediaFixtureAssets,
    mode: 'form',
    onSave: vi.fn(),
    ...overrides,
  }
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={client}>
      <MediaManager {...props} />
    </QueryClientProvider>,
  )
  return { ...view, props }
}

describe('MediaManager', () => {
  it.each(CONTENT_MEDIA_DOMAINS)('renders policy controls for %s', (domain) => {
    mount({
      domain,
      value: { ...mediaFixture, roles: { primary: createUploadRoleAssignment('image-0') } },
    })
    expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeInTheDocument()
    expect(Boolean(screen.queryByRole('checkbox', { name: 'Portrait' }))).toBe(
      domain === 'character',
    )
    expect(Boolean(screen.queryByRole('checkbox', { name: 'Banner' }))).toBe(domain === 'campaign')
    expect(Boolean(screen.queryByRole('checkbox', { name: 'Emblem' }))).toBe(
      domain === 'campaign' || domain === 'organization',
    )
    expect(screen.queryByRole('button', { name: 'Set as primary' })).not.toBeInTheDocument()
  })

  it('applies alt edits and preserves initial revision without mutating the parent', async () => {
    const { props } = mount()
    fireEvent.click(screen.getByRole('button', { name: 'Accessibility & details' }))
    fireEvent.change(screen.getByLabelText('Image description'), {
      target: { value: 'A warrior wearing a blue cloak' },
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(props.onSave).toHaveBeenCalled())
    expect(props.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedMediaRevision: 4,
        media: expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({ alt: 'A warrior wearing a blue cloak' }),
          ]),
        }),
      }),
    )
    expect(props.value).toEqual(mediaFixture)
  })

  it('removes an image immediately with an undo toast and supports discarding the draft', async () => {
    const { props } = mount({
      value: {
        ...mediaFixture,
        roles: {
          primary: createUploadRoleAssignment('image-0'),
          portrait: createUploadRoleAssignment('image-0'),
        },
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('Image removed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Discard image changes?')
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }))
    expect(props.onOpenChange).toHaveBeenCalledWith(false)
    expect(props.onSave).not.toHaveBeenCalled()
  })

  it('restores a removed image, index, and roles from undo', async () => {
    mount({
      value: {
        ...mediaFixture,
        roles: {
          primary: createUploadRoleAssignment('image-0'),
          portrait: createUploadRoleAssignment('image-0'),
        },
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Seraphina Vale — portrait.jpg, Portrait, Primary/ }),
      ).toHaveAttribute('aria-pressed', 'true')
    })
    expect(screen.getByRole('checkbox', { name: 'Portrait' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeChecked()
  })

  it('confirms customized role removal with role-specific copy', () => {
    const source = {
      width: mediaFixtureAssets[0]!.orientedWidth,
      height: mediaFixtureAssets[0]!.orientedHeight,
    }
    const crop = resetPrimaryCrop(source)
    const customizedCrop = { ...crop, x: crop.x + 0.05 }
    mount({
      value: {
        ...mediaFixture,
        roles: {
          primary: {
            ...createUploadRoleAssignment('image-0'),
            presentation: {
              mode: 'crop',
              crop: customizedCrop,
              focalPoint: focalPointFromCropCenter(customizedCrop),
            },
          },
        },
      },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Primary image' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Remove Primary image role?')
    expect(screen.getByRole('button', { name: 'Remove role' })).toBeInTheDocument()
  })

  it('shows a body drop overlay for external file drags but not text drags', () => {
    mount({ value: { revision: 0, images: [], roles: {} } })
    const host = screen.getByLabelText('Images').parentElement!.parentElement!
    fireEvent.dragEnter(host, { dataTransfer: { types: ['Files'], items: [] } })
    expect(screen.getByText('Drop to upload')).toBeInTheDocument()
    fireEvent.dragLeave(host, { dataTransfer: { types: ['Files'], items: [] } })
    expect(screen.queryByText('Drop to upload')).not.toBeInTheDocument()
    fireEvent.dragEnter(host, { dataTransfer: { types: ['text/plain'], items: [] } })
    expect(screen.queryByText('Drop to upload')).not.toBeInTheDocument()
  })

  it('enqueues oversized image body drops for the upload pipeline', () => {
    mount({ value: { revision: 0, images: [], roles: {} } })
    const host = screen.getByLabelText('Images').parentElement!.parentElement!
    const oversized = createUploadFile('large.png', 'image/png')
    Object.defineProperty(oversized, 'size', { value: 7_153_401 })

    fireEvent.drop(host, {
      dataTransfer: {
        types: ['Files'],
        files: [oversized],
      },
    })

    expect(screen.getByText(/large\.png/)).toBeInTheDocument()
  })

  it('refuses invalid body drops without enqueueing uploads', () => {
    mount({ value: { revision: 0, images: [], roles: {} } })
    const host = screen.getByLabelText('Images').parentElement!.parentElement!
    fireEvent.dragEnter(host, {
      dataTransfer: {
        types: ['Files'],
        items: [{ kind: 'file', type: 'application/pdf' }],
        files: [createUploadFile('doc.pdf', 'application/pdf')],
      },
    })
    expect(screen.getByText("These files can't be added")).toBeInTheDocument()
    fireEvent.drop(host, {
      dataTransfer: {
        types: ['Files'],
        files: [createUploadFile('doc.pdf', 'application/pdf')],
      },
    })
    expect(screen.queryByText(/doc\.pdf/)).not.toBeInTheDocument()
  })

  it('routes browse files and add images through the upload queue', async () => {
    const user = userEvent.setup()
    mount({ value: { revision: 0, images: [], roles: {} } })
    await user.click(screen.getByRole('button', { name: /browse files/i }))
    expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /\+ add images/i }))
  })

  it('does not emit routine status notices when toggling roles', () => {
    mount({
      value: {
        revision: 0,
        images: [{ id: 'image-0', assetId: mediaFixtureAssets[0]!.id }],
        roles: {},
      },
      initialSelectedImageId: 'image-0',
    })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Portrait' }))
    expect(screen.queryByText(/assigned to selected image/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/unassigned/i)).not.toBeInTheDocument()
  })

  it('shows the form footer hint with the singular domain label', () => {
    mount({ domain: 'class', value: { revision: 0, images: [], roles: {} } })
    expect(screen.getByText('Changes are saved with this class.')).toBeInTheDocument()
  })

  it('retains draft on failed detail save and surfaces a persistent toast', async () => {
    const { props } = mount({
      mode: 'detail',
      onSave: vi.fn().mockRejectedValue(new Error('Revision conflict')),
    })
    fireEvent.click(screen.getByRole('button', { name: 'Accessibility & details' }))
    fireEvent.change(screen.getByLabelText('Image description'), {
      target: { value: 'Unsaved description' },
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Revision conflict')
    expect(screen.getByLabelText('Image description')).toHaveValue('Unsaved description')
    expect(props.onOpenChange).not.toHaveBeenCalled()
  })

  it('shows the system class tile without remove image when media.images is empty', () => {
    mount({
      domain: 'class',
      value: { revision: 0, images: [], roles: {} },
      contentContext: {
        contentType: 'classes',
        slug: 'fighter',
        contentSource: 'system',
        rulesetId: 'srd-cc-5.2.1',
      },
    })

    expect(screen.getByRole('button', { name: /System fighter/i })).toBeInTheDocument()
    expect(screen.getByText('Images (1)')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument()
  })

  it('orders the details column as roles, file metadata, accessibility disclosure, and remove', () => {
    mount()
    const details = screen.getByLabelText('Image details')
    const headings = Array.from(details.querySelectorAll('h4')).map((node) => node.textContent)
    expect(headings).toEqual(['Assign roles', 'File'])
    expect(screen.getByRole('button', { name: 'Accessibility & details' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument()
  })
})
