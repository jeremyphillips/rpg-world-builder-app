import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CONTENT_MEDIA_DOMAINS } from '@rpg/contracts'
import { MediaManager, type MediaManagerProps } from './media-manager'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

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
