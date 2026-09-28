import type { ContentSource } from '../envelope'

export function isUploadContentSource(contentSource: ContentSource): boolean {
  return contentSource !== 'system'
}
