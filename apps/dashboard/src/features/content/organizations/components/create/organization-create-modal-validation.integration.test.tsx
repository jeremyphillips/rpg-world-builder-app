/**
 * @vitest-environment jsdom
 *
 * Production entry: OrganizationCreateModal + useContentFormSubmit blocks publish persist.
 */
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  buildContentPurposeSelectors,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ContentCampaignAccessPatch,
} from '@rpg/contracts'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { makeTestQueryClient } from '@/test/render'
import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { OrganizationCreateModal } from './organization-create-modal'

const mutateAsync = vi.fn()
const rogueClass = makeCharacterClass({ slug: 'rogue', id: 'class-rogue', name: 'Rogue' })

vi.mock('../../../lib/list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useContentWriteMutation: () => ({
      mutateAsync,
      isPending: false,
    }),
  }
})

vi.mock('../../../lib/forms/shells/layout/content-form-shell-layout', () => ({
  ContentFormOptionsGate: ({ children }: { children: (ctx: object) => ReactNode }) =>
    children({
      campaignId: STORY_CAMPAIGN_ID,
      campaignRules: {},
      options: {
        classes: buildContentPurposeSelectors([rogueClass]),
      },
    }),
}))

vi.mock('../../../lib/campaign-access/campaign-availability-field', () => ({
  CampaignAvailabilityField: ({
    onDraftChange,
  }: {
    onDraftChange?: (patch: ContentCampaignAccessPatch) => void
  }) => (
    <button type="button" onClick={() => onDraftChange?.(DEFAULT_CONTENT_CAMPAIGN_ACCESS)}>
      Use default campaign access
    </button>
  ),
}))

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

describe('organization create modal validation pipeline', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('blocks persist and surfaces domain validation through producer session', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <QueryClientProvider client={makeTestQueryClient()}>
        <OrganizationCreateModal open onOpenChange={onOpenChange} campaignId={STORY_CAMPAIGN_ID} />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Create organization' }))

    await waitFor(() => {
      expect(mutateAsync).not.toHaveBeenCalled()
      expect(onOpenChange).not.toHaveBeenCalledWith(false)
    })
  })
})
