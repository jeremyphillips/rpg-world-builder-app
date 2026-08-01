import { ROUTES } from '@/app/routes'
import type { CampaignCharacterNavModel } from '@/features/campaign'
import { isCampaignCharactersNavActive } from '@/features/campaign'
import { findVisibleSidebarContent, VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew'

import { buildAdminSidebarItems } from './build-admin-sidebar-items'
import { sidebarNavItem } from './sidebar-nav-icons'
import {
  compactSidebarSections,
  type CollapsibleSidebarNavSection,
  type SidebarNavItem,
} from './sidebar-nav-model'

const GAME_LIBRARY_CONTENT = VISIBLE_SIDEBAR_CONTENT.filter(
  (entry) => entry.contentType !== 'organizations',
)

export type BuildCampaignSidebarSectionsInput = {
  campaignId: string
  canManageCampaign: boolean
  isElevatedPlatformRole: boolean
  characterNav: CampaignCharacterNavModel
}

function buildCampaignSectionItems(
  campaignId: string,
  characterNav: CampaignCharacterNavModel,
): SidebarNavItem[] {
  const items: SidebarNavItem[] = [
    sidebarNavItem({
      id: 'overview',
      label: 'Overview',
      href: ROUTES.campaign.detail(campaignId),
      end: true,
    }),
  ]

  if (characterNav.showCharactersNav) {
    items.push(
      sidebarNavItem({
        id: 'characters',
        label: characterNav.label,
        href: characterNav.href,
        isActive: (pathname) => isCampaignCharactersNavActive(pathname, characterNav, campaignId),
      }),
    )
  }

  items.push(
    sidebarNavItem({
      id: 'sessions',
      label: 'Sessions',
      href: ROUTES.campaign.sessions(campaignId),
    }),
    sidebarNavItem({
      id: 'messages',
      label: 'Messages',
      href: ROUTES.messages.listScoped(campaignId),
    }),
  )

  return items
}

function buildWorldSectionItems(campaignId: string): SidebarNavItem[] {
  const items: SidebarNavItem[] = [
    sidebarNavItem({ id: 'npcs', label: 'NPCs', href: ROUTES.campaign.npcs.list(campaignId) }),
  ]

  const organizations = findVisibleSidebarContent('organizations')
  if (organizations) {
    items.push(
      sidebarNavItem({
        id: 'organizations',
        label: organizations.label,
        href: organizations.overview(campaignId),
      }),
    )
  }

  return items
}

function buildGameLibrarySectionItems(campaignId: string): SidebarNavItem[] {
  const items: SidebarNavItem[] = GAME_LIBRARY_CONTENT.map((entry) =>
    sidebarNavItem({
      id: entry.contentType,
      label: entry.label,
      href: entry.overview(campaignId),
    }),
  )

  items.push(
    sidebarNavItem({
      id: 'game-terms',
      label: 'Game Terms',
      href: ROUTES.gameTerms.hub(campaignId),
    }),
    sidebarNavItem({
      id: 'homebrew',
      label: 'Homebrew',
      href: ROUTES.homebrew.hub(campaignId),
    }),
  )

  return items
}

/** Pure campaign workspace sidebar sections for `CampaignLayoutRoute`. */
export function buildCampaignSidebarSections(
  input: BuildCampaignSidebarSectionsInput,
): CollapsibleSidebarNavSection[] {
  const { campaignId, canManageCampaign, isElevatedPlatformRole, characterNav } = input

  const sections: CollapsibleSidebarNavSection[] = [
    {
      id: 'campaign',
      label: 'Campaign',
      collapsible: true,
      items: buildCampaignSectionItems(campaignId, characterNav),
    },
    {
      id: 'world',
      label: 'World',
      collapsible: true,
      items: buildWorldSectionItems(campaignId),
    },
    {
      id: 'gameLibrary',
      label: 'Game Library',
      collapsible: true,
      items: buildGameLibrarySectionItems(campaignId),
    },
  ]

  if (canManageCampaign) {
    sections.push({
      id: 'manage',
      label: 'Manage',
      collapsible: true,
      items: [
        sidebarNavItem({
          id: 'campaign-settings',
          label: 'Campaign Settings',
          href: ROUTES.campaign.settings(campaignId),
        }),
      ],
    })
  }

  if (isElevatedPlatformRole) {
    sections.push({
      id: 'admin',
      label: 'Admin',
      collapsible: true,
      items: buildAdminSidebarItems(),
    })
  }

  return compactSidebarSections(sections)
}
