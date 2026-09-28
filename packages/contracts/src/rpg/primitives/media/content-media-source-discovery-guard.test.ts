import { describe, expect, it } from 'vitest'

import buildMediaFieldSummaryModelSource from '../../../../../../apps/dashboard/src/features/media/lib/build-media-field-summary-model.ts?raw'
import useMediaManagerSource from '../../../../../../apps/dashboard/src/features/media/hooks/use-media-manager.tsx?raw'
import getAvailableContentImagesSource from '../../content/lib/media/get-available-content-images.ts?raw'
import resolveContentDisplayImageSource from '../../content/lib/media/resolve-content-display-image.ts?raw'
import resolveEffectiveImageRolesSource from '../../content/lib/media/resolve-effective-image-roles.ts?raw'

const guardedSources = [
  [
    'packages/contracts/src/rpg/content/lib/media/resolve-content-display-image.ts',
    resolveContentDisplayImageSource,
  ],
  [
    'packages/contracts/src/rpg/content/lib/media/get-available-content-images.ts',
    getAvailableContentImagesSource,
  ],
  [
    'packages/contracts/src/rpg/content/lib/media/resolve-effective-image-roles.ts',
    resolveEffectiveImageRolesSource,
  ],
  ['apps/dashboard/src/features/media/hooks/use-media-manager.tsx', useMediaManagerSource],
  [
    'apps/dashboard/src/features/media/lib/build-media-field-summary-model.ts',
    buildMediaFieldSummaryModelSource,
  ],
] as const

const forbiddenPatterns = [/\bderiveSystemContentImage\b/, /\bresolveSystemContentImage\b/]

describe('content media source discovery drift guard', () => {
  for (const [relativePath, source] of guardedSources) {
    it(`forbids direct registry discovery in ${relativePath}`, () => {
      for (const pattern of forbiddenPatterns) {
        expect(source, `${relativePath} must not match ${pattern}`).not.toMatch(pattern)
      }
    })
  }
})
