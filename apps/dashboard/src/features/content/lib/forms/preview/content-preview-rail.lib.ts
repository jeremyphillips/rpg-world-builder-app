import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import type { PreviewRailAvailability, PreviewRailStatusPanelVariant } from '@rpg/ui'
import type { FieldGroupSummary } from '@rpg/ui/form'
import type { LucideIcon } from 'lucide-react'

import {
  SIDEBAR_NAV_ICONS,
  type SidebarNavIconId,
} from '@/components/layout/sidebar/lib/sidebar-nav-icons'
import {
  AVAILABILITY_STATUS_AVAILABLE,
  AVAILABILITY_STATUS_UNAVAILABLE,
} from '@/lib/campaign-availability/availability-status-summary.lib'
import {
  CONTENT_PREVIEW_NOT_READY_BODY,
  CONTENT_PREVIEW_NOT_READY_TITLE,
  CONTENT_PREVIEW_READY_BODY,
  CONTENT_PREVIEW_READY_TITLE,
  contentPreviewAttentionTitle,
} from './content-form-preview-copy'

export type ContentPreviewReadinessPanel = {
  variant: PreviewRailStatusPanelVariant
  title: string
  description?: string
}

export function resolveContentPreviewReadinessPanel(
  valid: boolean,
  hasAttemptedSubmit: boolean,
  attentionCount: number,
): ContentPreviewReadinessPanel {
  if (valid) {
    return {
      variant: 'success',
      title: CONTENT_PREVIEW_READY_TITLE,
      description: CONTENT_PREVIEW_READY_BODY,
    }
  }

  if (hasAttemptedSubmit) {
    return {
      variant: 'warning',
      title: contentPreviewAttentionTitle(attentionCount),
    }
  }

  return {
    variant: 'default',
    title: CONTENT_PREVIEW_NOT_READY_TITLE,
    description: CONTENT_PREVIEW_NOT_READY_BODY,
  }
}

export function resolvePreviewRailFallbackIcon(contentTypeKey: string): LucideIcon {
  if (contentTypeKey in SIDEBAR_NAV_ICONS) {
    return SIDEBAR_NAV_ICONS[contentTypeKey as SidebarNavIconId]
  }
  return SIDEBAR_NAV_ICONS.classes
}

export function resolvePreviewRailOpenSection(
  activeTabId: string,
  manualSection: { forTabId: string; value: string } | null,
): string {
  if (manualSection?.forTabId === activeTabId) {
    return manualSection.value
  }
  return activeTabId
}

export function resolveContentPreviewAvailability(
  access: Pick<ContentCampaignAccessPatch, 'available'>,
  accessSummary: FieldGroupSummary,
): PreviewRailAvailability {
  return {
    available: access.available,
    statusLabel:
      accessSummary.status?.label ??
      (access.available
        ? AVAILABILITY_STATUS_AVAILABLE.label
        : AVAILABILITY_STATUS_UNAVAILABLE.label),
    detail: accessSummary.detail,
  }
}
