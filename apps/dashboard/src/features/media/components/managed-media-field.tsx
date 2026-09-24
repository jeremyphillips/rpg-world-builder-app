import { useId, useState } from 'react'
import { useFormContext, useWatch, type FieldValues } from 'react-hook-form'
import {
  emptyContentMediaSchema,
  getContentMediaPolicy,
  resolveRepresentativeImageId,
  type MediaAsset,
  type MediaScope,
} from '@rpg/contracts'
import { CollectionAddControl, MediaFieldSummary } from '@rpg/ui'
import { ArrayLikeSectionHeader, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'

import { mediaImageUrl, MEDIA_SOURCE_CROP } from '../lib/media-display'
import { resolveMediaFieldCapacity, type MediaFieldConfig } from '../lib/media-field-config'
import { MediaManager } from './media-manager'

const MEDIA_FIELD_ADD_IMAGES_LABEL = 'Add images'
const MEDIA_FIELD_MANAGE_LABEL = 'Manage'

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
  const headingId = useId()
  const { density } = useFormSectionContext()
  const { size } = resolveFormDensity(density)
  const form = useFormContext<FieldValues>()
  const watched = useWatch({ control: form.control, name })
  const media = watched ?? emptyContentMediaSchema
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const policy = getContentMediaPolicy(config.domain)
  const representativeId = resolveRepresentativeImageId(media, policy)
  const maxItems = resolveMediaFieldCapacity(config)
  const items = media.images.map((image: { id: string; assetId: string; alt?: string }) => ({
    id: image.id,
    alt: image.alt,
    src: mediaImageUrl(image.assetId, 'gallery-thumbnail', MEDIA_SOURCE_CROP),
  }))
  const count = items.length
  const onOpen = (imageId?: string) => {
    setSelectedId(imageId)
    setOpen(true)
  }
  const isExpanded = config.presentation.layout === 'expanded'

  return (
    <>
      {isExpanded ? (
        <div className="space-y-3" role="group" aria-labelledby={headingId}>
          <ArrayLikeSectionHeader
            wrapper="none"
            id={headingId}
            label={label}
            size={size}
            hint={count > 0 ? `${count} of ${maxItems} images` : undefined}
            action={
              <CollectionAddControl
                label={count > 0 ? MEDIA_FIELD_MANAGE_LABEL : MEDIA_FIELD_ADD_IMAGES_LABEL}
                enabled
                showIcon={count === 0}
                onClick={() => onOpen(representativeId)}
              />
            }
          />
          <MediaFieldSummary
            label={label}
            layout="expanded"
            showHeader={false}
            items={items}
            representativeId={representativeId}
            maxItems={maxItems}
            countDisplay={config.presentation.countDisplay}
            onOpen={onOpen}
          />
        </div>
      ) : (
        <MediaFieldSummary
          label={label}
          layout="compact"
          items={items}
          representativeId={representativeId}
          maxItems={maxItems}
          countDisplay={config.presentation.countDisplay}
          onOpen={onOpen}
        />
      )}
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
