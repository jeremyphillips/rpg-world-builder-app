import { useNavigate, useParams } from 'react-router-dom'
import type { Campaign } from '@rpg/contracts'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { ROUTES } from '@/app/routes'
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Eyebrow,
} from '@rpg/ui'

import { useCampaigns } from '../hooks/use-campaigns'
import { useSelectCampaign } from '../hooks/use-select-campaign'
import { getCampaignSwitcherLabel } from '../lib/campaign-selection'

interface CampaignSwitcherProps {
  showLabel?: boolean
}

interface CampaignSwitcherListProps {
  campaigns: Campaign[] | undefined
  activeId: string | undefined
  onSelect: (campaignId: string) => void
  showLabel?: boolean
}

/** The selectable campaign rows inside the switcher menu. */
function CampaignSwitcherList({ campaigns, activeId, onSelect }: CampaignSwitcherListProps) {
  if (!campaigns || campaigns.length === 0) {
    return <DropdownMenuItem disabled>No campaigns yet</DropdownMenuItem>
  }

  return (
    <>
      {campaigns.map((campaign) => {
        const isActive = campaign.id === activeId
        return (
          <DropdownMenuItem
            key={campaign.id}
            onSelect={() => onSelect(campaign.id)}
            className="justify-between gap-2"
          >
            <span className="truncate">{campaign.identity.name}</span>
            {isActive ? <Check className="size-4 shrink-0" /> : null}
          </DropdownMenuItem>
        )
      })}
    </>
  )
}

/**
 * Large campaign switcher for the sidebar. The active campaign is derived from
 * the URL (`/campaigns/:campaignId`) - selecting one simply navigates there.
 * Future per-campaign menu items will render below this control.
 */
export function CampaignSwitcher({ showLabel = true }: CampaignSwitcherProps) {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const selectCampaign = useSelectCampaign()
  const { data: campaigns, isPending, isError } = useCampaigns()

  const active = campaigns?.find((campaign) => campaign.id === campaignId)
  const triggerLabel = getCampaignSwitcherLabel({
    isPending,
    isError,
    activeName: active?.identity.name,
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex h-14 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-4 text-left',
          'transition-colors hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        disabled={isPending || isError}
      >
        <span className="flex min-w-0 flex-col">
          {showLabel && <Eyebrow>Campaign</Eyebrow>}
          <span className="truncate text-sm font-semibold">{triggerLabel}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56"
      >
        <DropdownMenuLabel>Campaigns</DropdownMenuLabel>
        <CampaignSwitcherList
          campaigns={campaigns}
          activeId={campaignId}
          onSelect={selectCampaign}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate(ROUTES.home)}>
          <Plus className="size-4" />
          Create campaign
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
