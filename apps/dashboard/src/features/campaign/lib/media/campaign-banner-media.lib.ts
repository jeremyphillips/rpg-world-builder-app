import {
  createDefaultRolePresentation,
  emptyContentMediaSchema,
  type ContentMedia,
  type MediaAsset,
} from '@rpg/contracts'

import { createUploadSession, uploadMediaFile } from '@/features/media/api/media-api'

/** Read oriented pixel dimensions from a local image file. */
export function readImageFileDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image dimensions.'))
    }
    image.src = url
  })
}

/** Build draft media with one gallery image assigned as banner. */
export function buildCampaignBannerMedia(
  asset: MediaAsset,
  source: { width: number; height: number },
): ContentMedia {
  const imageId = crypto.randomUUID()
  return {
    revision: 0,
    images: [{ id: imageId, assetId: asset.id }],
    roles: {
      banner: {
        imageId,
        presentation: createDefaultRolePresentation('banner', source),
      },
    },
  }
}

/** Upload a banner file and return media ready to patch onto campaign identity. */
export async function attachCampaignBannerMedia(
  campaignId: string,
  file: File,
): Promise<{ media: ContentMedia; asset: MediaAsset }> {
  const source = await readImageFileDimensions(file)
  const session = await createUploadSession({ kind: 'campaign-identity', campaignId })
  const upload = await uploadMediaFile(
    session.id,
    file,
    crypto.randomUUID(),
    new AbortController().signal,
  )
  return {
    media: buildCampaignBannerMedia(upload.asset, source),
    asset: upload.asset,
  }
}

export function resolveCampaignMediaOrEmpty(media: ContentMedia | undefined): ContentMedia {
  return media ?? emptyContentMediaSchema
}
