import type { ContentMedia } from './content-media'
import type { ContentMediaSystemSource } from './content-media-source'
import type { SourceDimensions } from './geometry'
import {
  projectAvailableContentImages,
  type ResolveAvailableContentMediaSourcesInput,
  resolveAvailableContentMediaSources,
} from './resolve-available-content-media-sources'

export type AvailableContentUploadImage = {
  kind: 'upload'
  id: string
  attachment: ContentMedia['images'][number]
}

export type AvailableContentSystemImage = {
  kind: 'system'
  id: string
  source: ContentMediaSystemSource
  srcPath: string
  sourceDimensions: SourceDimensions
}

export type AvailableContentImage = AvailableContentUploadImage | AvailableContentSystemImage

export type GetAvailableContentImagesInput = ResolveAvailableContentMediaSourcesInput

/** Workspace gallery projection over canonical source availability (layer 4). */
export function getAvailableContentImages(
  input: GetAvailableContentImagesInput,
): AvailableContentImage[] {
  const availability = resolveAvailableContentMediaSources(input)
  return projectAvailableContentImages(availability.sources)
}

export { projectAvailableContentImages } from './resolve-available-content-media-sources'
