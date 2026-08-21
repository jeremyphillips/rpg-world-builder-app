'use client'

import { Fragment } from 'react'

import { Badge, Text } from '@rpg/ui'

import type {
  CatalogPickerMetadataLine,
  CatalogPickerMetadataSegment,
} from './catalog-picker-metadata.types'
import {
  CATALOG_PICKER_METADATA_LINE_CLASSES,
  CATALOG_PICKER_METADATA_TEXT_CLASSES,
  CATALOG_PICKER_METADATA_TEXT_SEPARATOR,
  CATALOG_PICKER_METADATA_WRAPPER_CLASSES,
} from './catalog-picker-metadata-renderer.variants'

export type CatalogPickerMetadataRendererProps = {
  lines: readonly CatalogPickerMetadataLine[]
}

function isSegmentEmpty(segment: CatalogPickerMetadataSegment): boolean {
  return segment.text.trim().length === 0
}

function filterEmptySegments(line: CatalogPickerMetadataLine): CatalogPickerMetadataLine {
  return {
    segments: line.segments.filter((segment) => !isSegmentEmpty(segment)),
  }
}

function CatalogPickerMetadataSegmentView({ segment }: { segment: CatalogPickerMetadataSegment }) {
  if (segment.type === 'badge') {
    return (
      <Badge appearance={segment.appearance} tone={segment.tone} size="sm">
        {segment.text}
      </Badge>
    )
  }

  return (
    <Text as="span" className={CATALOG_PICKER_METADATA_TEXT_CLASSES}>
      {segment.text}
    </Text>
  )
}

export function CatalogPickerMetadataRenderer({ lines }: CatalogPickerMetadataRendererProps) {
  const renderedLines = lines.map(filterEmptySegments).filter((line) => line.segments.length > 0)

  if (renderedLines.length === 0) return null

  return (
    <div className={CATALOG_PICKER_METADATA_WRAPPER_CLASSES}>
      {renderedLines.map((line, lineIndex) => (
        <div key={lineIndex} className={CATALOG_PICKER_METADATA_LINE_CLASSES}>
          {line.segments.map((segment, index) => {
            const previousSegment = line.segments[index - 1]
            const showTextSeparator =
              index > 0 && segment.type === 'text' && previousSegment?.type === 'text'

            return (
              <Fragment key={`${segment.type}-${index}`}>
                {showTextSeparator ? (
                  <span aria-hidden className={CATALOG_PICKER_METADATA_TEXT_CLASSES}>
                    {CATALOG_PICKER_METADATA_TEXT_SEPARATOR}
                  </span>
                ) : null}
                <CatalogPickerMetadataSegmentView segment={segment} />
              </Fragment>
            )
          })}
        </div>
      ))}
    </div>
  )
}
