import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '@/features/character'
import { renderWithProviders } from '@/test/render'

import { QuickNpcCreateModal } from '../quick-npc-create-modal'
import { quickNpcStandaloneCreateContext } from '../../../lib/quick-npc/quick-npc-test-fixtures'
import { QUICK_NPC_PREVIEW_NPC_LABEL } from '../../../lib/quick-npc/quick-npc-preview-copy'

const resolveQuickNpcAuthoringCreateInputMock = vi.hoisted(() => vi.fn())

vi.mock('../../../lib/quick-npc/quick-npc-narrative-on-create.lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    resolveQuickNpcAuthoringCreateInput: resolveQuickNpcAuthoringCreateInputMock,
  }
})

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

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: populatedBuilderCatalog,
})

describe('Quick NPC sheet preview', () => {
  it('keeps the create modal open when Escape closes the nested preview', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <QuickNpcCreateModal
        open
        onOpenChange={() => undefined}
        campaignId="campaign-test-1"
        buildContext={buildContext}
        context={quickNpcStandaloneCreateContext()}
        onCancel={() => undefined}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /guard/i }))
    await user.click(screen.getByRole('radio', { name: /dwarf/i }))

    const previewButton = await screen.findByRole('button', { name: QUICK_NPC_PREVIEW_NPC_LABEL })
    await user.click(previewButton)

    expect(screen.getByRole('dialog', { name: QUICK_NPC_PREVIEW_NPC_LABEL })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: QUICK_NPC_PREVIEW_NPC_LABEL }),
      ).not.toBeInTheDocument()
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await waitFor(() => {
      expect(previewButton).toHaveFocus()
    })
  })
})
