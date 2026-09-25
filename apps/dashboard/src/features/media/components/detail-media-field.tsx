import { useState } from 'react'
import {
  emptyContentMediaSchema,
  type ContentMedia,
  type MediaAsset,
  type MediaScope,
} from '@rpg/contracts'
import { MediaFieldSummary } from '@rpg/ui'
import { Image } from 'lucide-react'

import { buildMediaFieldSummaryModel } from '../lib/build-media-field-summary-model'
import type { MediaFieldConfig } from '../lib/media-field-config'
import type { MediaManagerContentContext, MediaManagerSave } from '../lib/media-manager.types'
import { MediaManager } from './media-manager'

const CHARACTER_IMAGES_LABEL = 'Character images'

export type DetailMediaFieldProps = {
  config: MediaFieldConfig
  scope: MediaScope
  value?: ContentMedia
  label?: string
  readOnly?: boolean
  contentContext?: MediaManagerContentContext
  onSave: (change: MediaManagerSave) => void | Promise<void>
}

/** Non-form detail adapter — compact preview and detail-mode MediaManager. */
export function DetailMediaField({
  config,
  scope,
  value = emptyContentMediaSchema,
  label = CHARACTER_IMAGES_LABEL,
  readOnly = false,
  contentContext,
  onSave,
}: DetailMediaFieldProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const media = value ?? emptyContentMediaSchema
  const summary = buildMediaFieldSummaryModel({ config, media, contentContext })
  const canEdit = !readOnly
  const hasGalleryImages = summary.items.length > 0

  if (readOnly && !hasGalleryImages) {
    return null
  }

  const onOpen = (imageId?: string) => {
    if (!canEdit) return
    setSelectedId(imageId)
    setOpen(true)
  }

  return (
    <>
      <MediaFieldSummary
        label={label}
        layout="compact"
        items={summary.items}
        attachmentCount={summary.attachmentCount}
        representativeId={summary.representativeId}
        maxItems={summary.maxItems}
        countDisplay={config.presentation.countDisplay}
        readOnly={readOnly}
        onOpen={onOpen}
        emptyContent={readOnly ? <Image aria-hidden /> : undefined}
      />
      {canEdit ? (
        <MediaManager
          open={open}
          onOpenChange={setOpen}
          domain={config.domain}
          value={media}
          scope={scope}
          mode="detail"
          initialAssets={assets}
          initialSelectedImageId={selectedId}
          maxItems={summary.maxItems}
          contentContext={contentContext}
          onSave={async (change) => {
            await onSave(change)
            setAssets(change.assets)
          }}
        />
      ) : null}
    </>
  )
}
