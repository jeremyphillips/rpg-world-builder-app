import { useNavigate } from 'react-router-dom'
import type { CampaignListItem } from '@rpg/contracts'
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
  Spinner,
} from '@rpg/ui'

import { useCampaigns } from '../hooks/use-campaigns'
import { useActiveCampaignId } from '../hooks/use-active-campaign-id'
import { useSwitchCampaign } from '../hooks/use-select-campaign'
import { buildCampaignDisplay, CAMPAIGN_UNKNOWN_NAME } from '../lib/campaign-display'
import {
  getCampaignSwitcherTriggerLabel,
  resolveCampaignSwitcherTriggerState,
} from '../lib/navigation/campaign-selection'
import { CampaignDisplayName } from './campaign-display-name'
import { campaignSwitcherDropdownContentClasses } from './campaign-switcher.variants'

interface CampaignSwitcherProps {
  showLabel?: boolean
}

interface CampaignSwitcherListProps {
  campaigns: CampaignListItem[] | undefined
  activeId: string | undefined
  onSelect: (campaignId: string) => void
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
            <CampaignDisplayName display={buildCampaignDisplay(campaign)} surface="menuItem" />
            {isActive ? <Check className="size-4 shrink-0" /> : null}
          </DropdownMenuItem>
        )
      })}
    </>
  )
}

/**
 * Large campaign switcher for the sidebar. The highlighted campaign follows the
 * current route when present, otherwise the user's stored preference.
 */
export function CampaignSwitcher({ showLabel = true }: CampaignSwitcherProps) {
  const activeCampaignId = useActiveCampaignId()
  const navigate = useNavigate()
  const switchCampaign = useSwitchCampaign()
  const { data: campaigns, isPending, isError } = useCampaigns()

  const triggerState = resolveCampaignSwitcherTriggerState(activeCampaignId, {
    isPending,
    isError,
    data: campaigns,
  })
  const triggerLabel = getCampaignSwitcherTriggerLabel(triggerState)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          'flex h-11 min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left',
          'transition-colors hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        disabled={triggerState.kind === 'loading' || triggerState.kind === 'error'}
        aria-label={
          triggerState.kind === 'resolved'
            ? buildCampaignDisplay(triggerState.campaign).name
            : triggerLabel
        }
      >
        <span className="flex min-w-0 flex-col">
          {showLabel && <Eyebrow>Campaign</Eyebrow>}
          {triggerState.kind === 'loading' ? (
            <Spinner />
          ) : triggerState.kind === 'resolved' ? (
            <CampaignDisplayName
              display={buildCampaignDisplay(triggerState.campaign)}
              surface="switcherTrigger"
              className="min-w-0"
            />
          ) : (
            <span className="truncate text-sm font-semibold">
              {triggerState.kind === 'missing' ? CAMPAIGN_UNKNOWN_NAME : triggerLabel}
            </span>
          )}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={campaignSwitcherDropdownContentClasses}>
        <DropdownMenuLabel>Campaigns</DropdownMenuLabel>
        <CampaignSwitcherList
          campaigns={campaigns}
          activeId={activeCampaignId ?? undefined}
          onSelect={switchCampaign}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate(ROUTES.campaign.create)}>
          <Plus className="size-4" />
          Create campaign
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
