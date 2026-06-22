import type { ReactNode } from 'react'

import { useCanManageCampaign } from '@/features/campaign'

import { ContentDetailEditAction } from './content-detail-edit-action'

export type ContentDetailLayoutProps = {
  /** Resolved artwork URL for the content item. */
  imageUrl: string
  /** Accessible name for the image (e.g. the content item's name). */
  imageName: string
  /** Campaign context for edit-button gating. */
  campaignId?: string
  /** When set and the user can manage the campaign, renders a standard Edit action. */
  editHref?: string
  /** Optional extra action elements rendered alongside Edit in the top-right toolbar. */
  actions?: ReactNode
  /** Main content occupying the 2/3-width left column. */
  children: ReactNode
}

/**
 * Reusable two-column detail layout for catalog content types.
 *
 * Left column (2/3): children (name, description, features, etc.)
 * Right column (1/3): artwork image
 *
 * Used by ClassDetail and intended as the standard pattern for all future
 * content type detail routes (species, spells, monsters, equipment…).
 */
export function ContentDetailLayout({
  imageUrl,
  imageName,
  campaignId,
  editHref,
  actions,
  children,
}: ContentDetailLayoutProps) {
  const canManage = useCanManageCampaign(campaignId)
  const showEdit = Boolean(canManage && editHref)
  const toolbar = showEdit || actions

  return (
    <div className="space-y-6">
      {toolbar ? (
        <div className="flex justify-end gap-2" role="toolbar" aria-label="Page actions">
          {showEdit && editHref ? <ContentDetailEditAction to={editHref} /> : null}
          {actions}
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">{children}</div>
        <div className="col-span-1">
          <img
            src={imageUrl}
            alt={imageName}
            className="w-full rounded-lg object-cover shadow-sm"
          />
        </div>
      </div>
    </div>
  )
}
