import { useEffect, useId, useRef, useState } from 'react'
import { useFormContext, useWatch, type FieldValues } from 'react-hook-form'
import {
  emptyContentMediaSchema,
  resolveContentDisplayFallbackForDomain,
  type MediaAsset,
  type MediaScope,
} from '@rpg/contracts'
import { CollectionAddControl, MediaFieldSummary, resolveExpandedCapacityHint } from '@rpg/ui'
import { ArrayLikeSectionHeader, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'

import { buildMediaFieldSummaryModel } from '../lib/build-media-field-summary-model'
import { resolveMediaFieldCapacity, type MediaFieldConfig } from '../lib/media-field-config'
import type { MediaManagerContentContext } from '../lib/media-manager.types'
import { MediaManager } from './media-manager'

const MEDIA_FIELD_ADD_IMAGES_LABEL = 'Add images'
const MEDIA_FIELD_MANAGE_LABEL = 'Manage'

export type ManagedMediaFieldProps = {
  config: MediaFieldConfig
  scope: MediaScope
  name?: string
  label?: string
  contentContext?: MediaManagerContentContext
  /** Opens the manager once on mount — used for deep links from failed banner upload alerts. */
  initialOpen?: boolean
}

/** RHF-aware dashboard adapter around the API-free UI summary primitive. */
export function ManagedMediaField({
  config,
  scope,
  name = 'media',
  label = 'Images',
  contentContext,
  initialOpen = false,
}: ManagedMediaFieldProps) {
  const headingId = useId()
  const { density } = useFormSectionContext()
  const { size } = resolveFormDensity(density)
  const form = useFormContext<FieldValues>()
  const watched = useWatch({ control: form.control, name })
  const media = watched ?? emptyContentMediaSchema
  const [open, setOpen] = useState(initialOpen)
  const handledInitialOpenRef = useRef(false)

  useEffect(() => {
    if (!initialOpen || handledInitialOpenRef.current) return
    handledInitialOpenRef.current = true
    setOpen(true)
  }, [initialOpen])
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const summary = buildMediaFieldSummaryModel({ config, media, contentContext })
  const maxItems = resolveMediaFieldCapacity(config)
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
            hint={
              summary.galleryCount > 0
                ? resolveExpandedCapacityHint(summary.attachmentCount, maxItems)
                : undefined
            }
            action={
              <CollectionAddControl
                label={
                  summary.attachmentCount > 0 ||
                  summary.items.some((item) => item.id.startsWith('system:'))
                    ? MEDIA_FIELD_MANAGE_LABEL
                    : MEDIA_FIELD_ADD_IMAGES_LABEL
                }
                enabled
                showIcon={
                  summary.attachmentCount === 0 &&
                  !summary.items.some((item) => item.id.startsWith('system:'))
                }
                onClick={() => onOpen(summary.representativeId)}
              />
            }
          />
          <MediaFieldSummary
            label={label}
            layout="expanded"
            showHeader={false}
            items={summary.items}
            attachmentCount={summary.attachmentCount}
            representativeId={summary.representativeId}
            maxItems={maxItems}
            countDisplay={config.presentation.countDisplay}
            emptyFallback={resolveContentDisplayFallbackForDomain(config.domain)}
            onOpen={onOpen}
          />
        </div>
      ) : (
        <MediaFieldSummary
          label={label}
          layout="compact"
          items={summary.items}
          attachmentCount={summary.attachmentCount}
          representativeId={summary.representativeId}
          maxItems={maxItems}
          countDisplay={config.presentation.countDisplay}
          emptyFallback={resolveContentDisplayFallbackForDomain(config.domain)}
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
        contentContext={contentContext}
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
