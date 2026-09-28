import { systemImageSourcesEqual, type ContentMediaSystemSource } from './content-media-source'

export function systemDerivedImageMatchesAssignment(
  derived: Pick<ContentMediaSystemSource, 'imageSetId' | 'subject' | 'assetRole' | 'slug'>,
  assignment: ContentMediaSystemSource,
): boolean {
  return systemImageSourcesEqual(assignment, derived)
}
