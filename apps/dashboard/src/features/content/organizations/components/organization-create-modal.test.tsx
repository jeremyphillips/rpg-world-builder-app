import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
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
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { OrganizationCreateModal } from './organization-create-modal.client'

const mutateAsync = vi.fn()

const rogueClass = makeCharacterClass({ slug: 'rogue', id: 'class-rogue', name: 'Rogue' })

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
      options: {
        classes: buildContentPurposeSelectors([rogueClass]),
      },
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
  useOrganizationAuthoringContext: () => ({
    practiceRecommendations: [],
    setPracticeRecommendations: vi.fn(),
    clearPracticeRecommendations: vi.fn(),
  }),
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

async function selectComboboxOption(
  user: ReturnType<typeof userEvent.setup>,
  fieldName: RegExp,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: fieldName }))
  await user.click(screen.getByRole('option', { name: optionName }))
}

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

  it('applies familiar type preset through the modal form', async () => {
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={makeTestQueryClient()}>
        <OrganizationCreateModal
          open
          onOpenChange={() => undefined}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </QueryClientProvider>,
    )

    await selectComboboxOption(user, /Start from familiar type/i, /Thieves' guild/i)

    const presetCombobox = screen.getByRole('combobox', { name: /Start from familiar type/i })
    expect(presetCombobox).toHaveTextContent(/Search familiar types/i)
    expect(presetCombobox).not.toHaveTextContent(/Thieves' guild/i)

    expect(screen.getByRole('radio', { name: /Criminal/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('combobox', { name: /^Form$/i })).toHaveTextContent(/Guild/i)

    const functionsFieldset = screen.getByRole('group', { name: /Functions/i })
    expect(within(functionsFieldset).queryAllByRole('radio', { checked: true })).toHaveLength(0)

    expect(screen.getByRole('combobox', { name: /Practices/i })).toHaveTextContent(/1 selected/i)

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Dockside Ring')
    await user.click(screen.getByRole('button', { name: 'Create organization' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled()
    })

    const createInput = mutateAsync.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(createInput).toMatchObject({
      sourcePresetId: 'thieves_guild',
      organizationDomain: 'criminal',
      organizationForm: 'guild',
      functions: [],
      practices: ['theft'],
    })
    expect(createInput).not.toHaveProperty('authoringPresetId')
  })
})
