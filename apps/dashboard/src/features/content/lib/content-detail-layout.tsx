import type { ReactNode } from 'react'

export type ContentDetailLayoutProps = {
  /** Resolved artwork URL for the content item. */
  imageUrl: string
  /** Accessible name for the image (e.g. the content item's name). */
  imageName: string
  /** Optional action elements rendered in the top-right action bar (e.g. Edit button). */
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
  actions,
  children,
}: ContentDetailLayoutProps) {
  return (
    <div className="space-y-6">
      {actions && (
        <div className="flex justify-end gap-2" role="toolbar" aria-label="Page actions">
          {actions}
        </div>
      )}
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
