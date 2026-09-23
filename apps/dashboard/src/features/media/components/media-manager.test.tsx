import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CONTENT_MEDIA_DOMAINS } from '@rpg/contracts'
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
    mount({ domain, value: { ...mediaFixture, roles: { primary: { imageId: 'image-0' } } } })
    expect(screen.getByRole('checkbox', { name: 'Primary image' })).toBeInTheDocument()
    expect(Boolean(screen.queryByRole('checkbox', { name: 'Portrait' }))).toBe(
      domain === 'character',
    )
    expect(screen.queryByRole('button', { name: 'Set as primary' })).not.toBeInTheDocument()
  })
  it('applies alt edits and preserves initial revision without mutating the parent', async () => {
    const { props } = mount()
    fireEvent.change(screen.getByLabelText('Alt text'), {
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
  it('confirms assigned removal, clears both roles, and supports discarding the draft', async () => {
    const { props } = mount({
      value: {
        ...mediaFixture,
        roles: { primary: { imageId: 'image-0' }, portrait: { imageId: 'image-0' } },
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('portrait')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Discard image changes?')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(props.onOpenChange).toHaveBeenCalledWith(false)
    expect(props.onSave).not.toHaveBeenCalled()
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

  it('retains draft on failed detail save', async () => {
    const { props } = mount({
      mode: 'detail',
      onSave: vi.fn().mockRejectedValue(new Error('Revision conflict')),
    })
    fireEvent.change(screen.getByLabelText('Alt text'), {
      target: { value: 'Unsaved description' },
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText(/Revision conflict/)
    expect(screen.getByLabelText('Alt text')).toHaveValue('Unsaved description')
    expect(props.onOpenChange).not.toHaveBeenCalled()
  })
})
