import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { ROUTES } from '@/app/routes'

import { CHARACTER_SHEET_ERROR_LABELS } from '../../lib/character-sheet-error-labels'
import { CharacterSheetDetailShell } from './character-sheet-detail-shell'

const meta = {
  title: 'Character/CharacterSheetDetailShell',
  component: CharacterSheetDetailShell,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterSheetDetailShell>

export default meta
type Story = StoryObj<typeof CharacterSheetDetailShell>

export const StandaloneLoading: Story = {
  args: {
    scope: 'standalone',
    isPending: true,
    isError: false,
  },
}

export const StandaloneNotFound: Story = {
  args: {
    scope: 'standalone',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.standaloneNotFound,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.standaloneNotFound,
    )
  },
}

export const StandaloneLoadFailed: Story = {
  args: {
    scope: 'standalone',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.loadFailed,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.loadFailed,
    )
  },
}

export const CampaignLoading: Story = {
  args: {
    scope: 'campaign',
    isPending: true,
    isError: false,
  },
}

export const CampaignNotFoundInCampaign: Story = {
  args: {
    scope: 'campaign',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.campaignNotFoundInCampaign,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Campaign character' })).toBeInTheDocument()
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.campaignNotFoundInCampaign,
    )
  },
}

export const CampaignNotFound: Story = {
  args: {
    scope: 'campaign',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.campaignNotFoundInCampaign,
  },
}

export const CampaignNotFoundCampaign: Story = {
  args: {
    scope: 'campaign',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.campaignNotFound,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.campaignNotFound,
    )
  },
}

export const CampaignPermissionDenied: Story = {
  args: {
    scope: 'campaign',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.campaignPermissionDenied,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.campaignPermissionDenied,
    )
  },
}

export const CampaignLoadFailed: Story = {
  args: {
    scope: 'campaign',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.loadFailed,
  },
}

export const CampaignCatalogLoadFailed: Story = {
  args: {
    scope: 'campaign',
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.catalogLoadFailed,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Campaign character' })).toBeInTheDocument()
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      CHARACTER_SHEET_ERROR_LABELS.catalogLoadFailed,
    )
  },
}

export const CampaignErrorWithBackLink: Story = {
  args: {
    scope: 'campaign',
    errorBackLink: {
      href: ROUTES.campaign.characters.list('camp-1'),
      label: 'My Character',
    },
    isPending: false,
    isError: true,
    errorLabel: CHARACTER_SHEET_ERROR_LABELS.campaignNotFoundInCampaign,
  },
}
