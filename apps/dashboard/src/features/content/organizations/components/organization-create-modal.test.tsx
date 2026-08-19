import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS, type ContentCampaignAccessPatch } from '@rpg/contracts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { OrganizationCreateModal } from './organization-create-modal.client'

const mutateAsync = vi.fn()

vi.mock('../../lib/list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useContentWriteMutation: () => ({
      mutateAsync,
      isPending: false,
    }),
  }
})

vi.mock('../../lib/forms/shells/content-form-shell-layout', () => ({
  ContentFormOptionsGate: ({ children }: { children: (ctx: object) => ReactNode }) =>
    children({
      campaignId: STORY_CAMPAIGN_ID,
      campaignRules: {},
      options: {},
    }),
}))

vi.mock('../../lib/campaign-access/campaign-access-section.client', () => ({
  CampaignAccessSection: ({
    onDraftChange,
  }: {
    onDraftChange?: (patch: ContentCampaignAccessPatch) => void
  }) => (
    <button type="button" onClick={() => onDraftChange?.(DEFAULT_CONTENT_CAMPAIGN_ACCESS)}>
      Use default campaign access
    </button>
  ),
}))

vi.mock('../lib/organization-authoring-context.client', () => ({
  OrganizationAuthoringProvider: ({ children }: { children: ReactNode }) => children,
  useOrganizationAuthoringContext: () => ({ practiceRecommendations: [] }),
}))

describe('OrganizationCreateModal', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({ id: 'org-new' })
  })

  it('calls onCreated after publish succeeds and closes the modal', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <QueryClientProvider client={makeTestQueryClient()}>
        <OrganizationCreateModal
          open
          onOpenChange={onOpenChange}
          campaignId={STORY_CAMPAIGN_ID}
          onCreated={onCreated}
        />
      </QueryClientProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'City Council')
    await user.click(screen.getByRole('radio', { name: /Government/i }))
    await user.click(screen.getByRole('button', { name: 'Create organization' }))

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith({ contentType: 'organizations', id: 'org-new' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('does not call onCreated when Cancel closes the modal', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <QueryClientProvider client={makeTestQueryClient()}>
        <OrganizationCreateModal
          open
          onOpenChange={onOpenChange}
          campaignId={STORY_CAMPAIGN_ID}
          onCreated={onCreated}
        />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
    expect(onCreated).not.toHaveBeenCalled()
  })
})
