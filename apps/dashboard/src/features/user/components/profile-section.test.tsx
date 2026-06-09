import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// TODO: install axe-core in apps/dashboard (it lives in packages/ui only)
// import axe from 'axe-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { SessionUser } from '@rpg/contracts'

vi.mock('@/features/auth/api/auth-client')
vi.mock('@/features/user/api/user-client')

import { fetchSession as fetchSessionFn } from '@/features/auth/api/auth-client'
import { updateProfile as updateProfileFn } from '@/features/user/api/user-client'
import * as apiClient from '@/lib/api-client'
import { ProfileSection } from './profile-section'

const fetchSession = vi.mocked(fetchSessionFn)
const updateProfile = vi.mocked(updateProfileFn)

const session: SessionUser = {
  id: 'u1',
  email: 'dm@example.com',
  displayName: 'Dungeon Master',
  role: 'user',
  lastSelectedCampaignId: null,
}

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileSection />
    </QueryClientProvider>,
  )
}

describe('ProfileSection', () => {
  beforeEach(() => {
    fetchSession.mockReset()
    updateProfile.mockReset()
    fetchSession.mockResolvedValue(session)
    vi.spyOn(apiClient, 'uploadFile').mockResolvedValue('uploaded-key.png')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pre-fills fields with the current session data', async () => {
    renderSection()
    expect(await screen.findByDisplayValue('Dungeon Master')).toBeInTheDocument()
    expect(screen.getByDisplayValue('dm@example.com')).toBeInTheDocument()
  })

  it('shows the saved avatar preview when the session has an avatarKey', async () => {
    fetchSession.mockResolvedValue({ ...session, avatarKey: 'saved-avatar.png' })
    renderSection()
    const img = await screen.findByRole('img', { name: 'Current avatar' })
    expect(img).toHaveAttribute('src', '/api/uploads/saved-avatar.png')
  })

  it('calls updateProfile with the current values on submit', async () => {
    const user = userEvent.setup()
    updateProfile.mockResolvedValue(session)
    renderSection()

    await screen.findByDisplayValue('Dungeon Master')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1))
    expect(updateProfile.mock.lastCall?.[0]).toMatchObject({
      displayName: 'Dungeon Master',
      email: 'dm@example.com',
    })
    expect(apiClient.uploadFile).not.toHaveBeenCalled()
  })

  it('uploads an avatar and includes avatarKey when a file is selected', async () => {
    const user = userEvent.setup()
    const avatar = new File(['img'], 'avatar.png', { type: 'image/png' })
    updateProfile.mockResolvedValue({ ...session, avatarKey: 'uploaded-key.png' })
    renderSection()

    await screen.findByDisplayValue('Dungeon Master')
    const dropZone = screen.getByRole('button', { name: /upload file/i })
    fireEvent.drop(dropZone, { dataTransfer: { files: [avatar] } })
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    await waitFor(() =>
      expect(apiClient.uploadFile).toHaveBeenCalledWith(avatar, 'Could not upload avatar.'),
    )
    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1))
    expect(updateProfile.mock.lastCall?.[0]).toMatchObject({
      displayName: 'Dungeon Master',
      email: 'dm@example.com',
      avatarKey: 'uploaded-key.png',
    })
  })

  it('shows a success message after saving', async () => {
    const user = userEvent.setup()
    updateProfile.mockResolvedValue(session)
    renderSection()

    await screen.findByDisplayValue('Dungeon Master')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument()
  })

  it('shows the API error message when saving fails', async () => {
    const user = userEvent.setup()
    updateProfile.mockRejectedValue(new Error('Email already in use'))
    renderSection()

    await screen.findByDisplayValue('Dungeon Master')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already in use')
  })

  // TODO: enable once axe-core is added to apps/dashboard devDependencies
  // it('has no axe accessibility violations', async () => {
  //   const { container } = renderSection()
  //   await screen.findByDisplayValue('Dungeon Master')
  //   const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  //   expect(results.violations).toEqual([])
  // })
})
