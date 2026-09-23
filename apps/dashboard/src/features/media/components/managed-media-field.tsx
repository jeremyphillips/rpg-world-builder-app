import { useState } from 'react'
import { useFormContext, useWatch, type FieldValues } from 'react-hook-form'
import {
  emptyContentMediaSchema,
  getContentMediaPolicy,
  type MediaAsset,
  type MediaScope,
} from '@rpg/contracts'
import { MediaFieldSummary } from '@rpg/ui'

import { mediaImageUrl, MEDIA_SOURCE_CROP } from '../lib/media-display'
import { resolveMediaFieldCapacity, type MediaFieldConfig } from '../lib/media-field-config'
import { MediaManager } from './media-manager'

export type ManagedMediaFieldProps = {
  config: MediaFieldConfig
  scope: MediaScope
  name?: string
  label?: string
}

/** RHF-aware dashboard adapter around the API-free UI summary primitive. */
export function ManagedMediaField({
  config,
  scope,
  name = 'media',
  label = 'Images',
}: ManagedMediaFieldProps) {
  const form = useFormContext<FieldValues>()
  const watched = useWatch({ control: form.control, name })
  const media = watched ?? emptyContentMediaSchema
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const policy = getContentMediaPolicy(config.domain)
  const representativeId =
    media.roles[policy.representativeRole]?.imageId ??
    media.roles.primary?.imageId ??
    media.images[0]?.id
  const maxItems = resolveMediaFieldCapacity(config)
  const items = media.images.map((image: { id: string; assetId: string; alt?: string }) => ({
    id: image.id,
    alt: image.alt,
    src: mediaImageUrl(image.assetId, 'gallery-thumbnail', MEDIA_SOURCE_CROP),
  }))
  const onOpen = (imageId?: string) => {
    setSelectedId(imageId)
    setOpen(true)
  }

  return (
    <>
      <MediaFieldSummary
        label={label}
        layout={config.presentation.layout}
        items={items}
        representativeId={representativeId}
        maxItems={maxItems}
        countDisplay={config.presentation.countDisplay}
        onOpen={onOpen}
      />
      <MediaManager
        open={open}
        onOpenChange={setOpen}
        domain={config.domain}
        value={media}
        scope={scope}
        mode="form"
        initialAssets={assets}
        initialSelectedImageId={selectedId}
        maxItems={maxItems}
        onSave={(change) => {
          setAssets(change.assets)
          form.setValue(name, change.media, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }}
      />
    </>
  )
}
