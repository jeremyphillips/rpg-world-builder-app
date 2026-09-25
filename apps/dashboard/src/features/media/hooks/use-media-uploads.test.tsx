import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CONTENT_MEDIA_MAX_ATTACHMENTS,
  CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT,
  type MediaAssetUploadResponse,
} from '@rpg/contracts'
import { createUploadSession, uploadMediaFile } from '../api/media-api'
import { mediaFixtureAssets } from '../fixtures'
import { useMediaUploads } from './use-media-uploads'

vi.mock('../api/media-api', () => ({ createUploadSession: vi.fn(), uploadMediaFile: vi.fn() }))
const scope = { kind: 'user-pc' as const, userId: 'demo' }
function mount() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const onAsset = vi.fn()
  const hook = renderHook(() => useMediaUploads(scope, 0, onAsset), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  })
  return { ...hook, onAsset }
}
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(createUploadSession).mockResolvedValue({
    id: 'session',
    scope,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    createdAt: new Date().toISOString(),
    maxUploadBytes: 10000,
    maxAttachments: CONTENT_MEDIA_MAX_ATTACHMENTS,
    maxUploadsInFlight: CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT,
  })
})
describe('media upload queue', () => {
  it('bounds concurrency and publishes out-of-order results in chooser order', async () => {
    const pending: Array<(response: MediaAssetUploadResponse) => void> = []
    vi.mocked(uploadMediaFile).mockImplementation(
      () => new Promise((resolve) => pending.push(resolve)),
    )
    const { result, onAsset } = mount()
    act(() => result.current.add([0, 1, 2, 3].map((index) => new File(['image'], `${index}.png`))))
    await waitFor(() => expect(uploadMediaFile).toHaveBeenCalledTimes(3))
    await act(async () =>
      pending[1]!({ sessionId: 'session', asset: { ...mediaFixtureAssets[0]!, id: 'second' } }),
    )
    expect(onAsset).not.toHaveBeenCalled()
    await waitFor(() => expect(uploadMediaFile).toHaveBeenCalledTimes(4))
    await act(async () =>
      pending[0]!({ sessionId: 'session', asset: { ...mediaFixtureAssets[0]!, id: 'first' } }),
    )
    expect(onAsset.mock.calls.map((call) => call[0].id)).toEqual(['first', 'second'])
    expect(createUploadSession).toHaveBeenCalledTimes(1)
  })
  it('retries failures with the same idempotency key and retains successful files', async () => {
    vi.mocked(uploadMediaFile)
      .mockRejectedValueOnce(new Error('Upload interrupted'))
      .mockResolvedValue({ sessionId: 'session', asset: mediaFixtureAssets[0]! })
    const { result, onAsset } = mount()
    act(() => result.current.add([new File(['image'], 'source.png')]))
    await waitFor(() => expect(result.current.entries[0]?.status).toBe('failed'))
    act(() => result.current.retry(result.current.entries[0]!.id))
    await waitFor(() => expect(onAsset).toHaveBeenCalledTimes(1))
    expect(vi.mocked(uploadMediaFile).mock.calls[0]![2]).toBe(
      vi.mocked(uploadMediaFile).mock.calls[1]![2],
    )
    expect(result.current.entries).toHaveLength(0)
  })
  it('ignores late responses after queue removal and aborts on unmount', async () => {
    let finish!: (response: MediaAssetUploadResponse) => void
    vi.mocked(uploadMediaFile).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const { result, onAsset, unmount } = mount()
    act(() => result.current.add([new File(['image'], 'source.png')]))
    await waitFor(() => expect(uploadMediaFile).toHaveBeenCalledTimes(1))
    const signal = vi.mocked(uploadMediaFile).mock.calls[0]![3]
    act(() => result.current.remove(result.current.entries[0]!.id))
    expect(signal.aborted).toBe(true)
    await act(async () => finish({ sessionId: 'session', asset: mediaFixtureAssets[0]! }))
    expect(onAsset).not.toHaveBeenCalled()
    unmount()
  })
})
