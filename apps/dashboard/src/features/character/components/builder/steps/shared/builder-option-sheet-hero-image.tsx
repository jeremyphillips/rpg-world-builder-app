import type { ContentDisplayImage } from '@rpg/contracts'

import { ContentMediaImage } from '@/features/content'

export type BuilderOptionSheetHeroImageProps = {
  display: ContentDisplayImage
  alt?: string
}

/** Builder details sheet hero — full-bleed primary crop above padded sheet content. */
export function BuilderOptionSheetHeroImage({
  display,
  alt = '',
}: BuilderOptionSheetHeroImageProps) {
  return <ContentMediaImage display={display} alt={alt} frame="builderSheetHero" />
}
