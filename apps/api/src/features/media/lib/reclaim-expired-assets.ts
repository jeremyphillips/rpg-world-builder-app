import {
  claimExpiredMediaAssetForDeletion,
  deleteMediaAssetRecord,
  findExpiredUnreferencedMediaAssetIds,
  markExpiredUnreferencedMediaAssets,
} from '../media.repository'
import { deleteMediaAssetDir } from './storage.lib'

export type ReclaimExpiredAssetsResult = {
  markedExpired: number
  reclaimedAssetIds: string[]
}

/** Mark lease-expired uploads and delete unreferenced expired assets with CAS cleanup. */
export async function reclaimExpiredAssets(now = new Date()): Promise<ReclaimExpiredAssetsResult> {
  const markedExpired = await markExpiredUnreferencedMediaAssets(now)
  const candidateIds = await findExpiredUnreferencedMediaAssetIds()
  const reclaimedAssetIds: string[] = []

  for (const assetId of candidateIds) {
    const claimed = await claimExpiredMediaAssetForDeletion(assetId)
    if (!claimed) continue

    try {
      await deleteMediaAssetDir(assetId)
      await deleteMediaAssetRecord(assetId)
      reclaimedAssetIds.push(assetId)
    } catch {
      // Leave lifecycle at deleting so a later reclaim pass can retry file removal.
    }
  }

  return { markedExpired, reclaimedAssetIds }
}
