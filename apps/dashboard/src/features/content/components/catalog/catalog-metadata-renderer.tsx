import { Badge, InlineMetadata, Text, type InlineMetadataDensity } from '@rpg/ui'

import type { CatalogMetadataLine, CatalogMetadataSegment } from './catalog-metadata.types'
import {
  CATALOG_METADATA_LINE_CLASSES,
  CATALOG_METADATA_TEXT_CLASSES,
  CATALOG_METADATA_WRAPPER_CLASSES,
} from './catalog-metadata-renderer.variants'

export type CatalogMetadataRendererProps = {
  lines: readonly CatalogMetadataLine[]
  density: InlineMetadataDensity
}

function isSegmentEmpty(segment: CatalogMetadataSegment): boolean {
  return segment.text.trim().length === 0
}

function filterEmptySegments(line: CatalogMetadataLine): CatalogMetadataLine {
  return {
    segments: line.segments.filter((segment) => !isSegmentEmpty(segment)),
  }
}

function CatalogMetadataSegmentView({ segment }: { segment: CatalogMetadataSegment }) {
  if (segment.type === 'badge') {
    return (
      <Badge appearance={segment.appearance} tone={segment.tone} size="sm">
        {segment.text}
      </Badge>
    )
  }

  return (
    <Text as="span" className={CATALOG_METADATA_TEXT_CLASSES}>
      {segment.text}
    </Text>
  )
}

export function CatalogMetadataRenderer({ lines, density }: CatalogMetadataRendererProps) {
  const renderedLines = lines.map(filterEmptySegments).filter((line) => line.segments.length > 0)

  if (renderedLines.length === 0) return null

  return (
    <div className={CATALOG_METADATA_WRAPPER_CLASSES}>
      {renderedLines.map((line, lineIndex) => (
        <InlineMetadata
          key={lineIndex}
          role="supporting"
          density={density}
          wrap
          className={CATALOG_METADATA_LINE_CLASSES}
        >
          {line.segments.map((segment, index) => (
            <InlineMetadata.Item key={`${segment.type}-${index}`}>
              <CatalogMetadataSegmentView segment={segment} />
            </InlineMetadata.Item>
          ))}
        </InlineMetadata>
      ))}
    </div>
  )
}
