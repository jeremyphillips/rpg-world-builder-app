import type {
  ContentCampaignAccessPatch,
  CreateSubclassInput,
  Subclass,
  UpdateSubclassInput,
} from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import { notifyCoordinatedContentSaveSuccess } from '@/lib/notify'
import { updateContentCampaignAccess } from '../../../lib/campaign-access/campaign-access-api'
import type { CampaignAccessSaveResult } from '../../../lib/campaign-access/campaign-access-form-context'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR } from '../../../lib/campaign-access/campaign-access-labels'
import { isDefaultCampaignAccessPatch } from '../../../lib/campaign-access/campaign-access-state'
import {
  runCoordinatedContentSave,
  type CoordinatedContentSaveResult,
} from '../../../lib/forms/shells/session/content-save-session.lib'
import { buildSystemOverlayUpdatePayload } from '../../../lib/forms/registry/build-system-overlay-intent'
import {
  assertSystemOverlayWriteReady,
  assertSystemOverlayWriteSnapshotMatchesEntity,
} from '../../../lib/forms/registry/system-overlay-write-readiness.lib'
import type { SubclassFormValues } from './subclass-form-fields'
import { subclassFormDef } from './subclass-form-values'

export type SubclassDraftSaveInput = {
  campaignId: string
  classId: string
  draftId: string
  values: SubclassFormValues
  existingEntity?: Subclass
  pendingAccess?: ContentCampaignAccessPatch | null
  create: (input: CreateSubclassInput) => Promise<Subclass>
  onDraftSaved: (draftId: string, saved: Subclass) => void
  onDeferredAccessError: (message: string) => void
}

export type SubclassExistingSaveInput = {
  subclassId: string
  classId: string
  values: SubclassFormValues
  existingEntity?: Subclass
  accessOnly?: boolean
  bodyWasDirty: boolean
  accessWasDirty: boolean
  readPendingAvailable?: () => boolean | undefined
  readAccessAvailabilityChanged?: () => boolean | undefined
  saveAccess: () => Promise<CampaignAccessSaveResult>
  updateBody: (args: { subclassId: string; input: UpdateSubclassInput }) => Promise<Subclass>
  onBodySaved: (subclassId: string) => void
  overlayBaseline?: Record<string, unknown>
  catalogSeed?: Record<string, unknown>
  expectedOverlayRevision?: number
  rulesetId?: string
  seedRowIdsByPath?: Readonly<Record<string, readonly string[]>>
}

export async function persistSubclassCampaignAccess(args: {
  campaignId: string
  classId: string
  subclassId: string
  pendingAccess: ContentCampaignAccessPatch | null | undefined
  onDeferredError: (message: string) => void
}): Promise<void> {
  const { campaignId, classId, subclassId, pendingAccess, onDeferredError } = args
  if (!pendingAccess || isDefaultCampaignAccessPatch(pendingAccess, 'subclasses')) return

  try {
    await updateContentCampaignAccess(campaignId, 'subclasses', subclassId, pendingAccess, {
      classId,
    })
  } catch {
    onDeferredError(CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR)
  }
}

export async function saveDraftSubclass(input: SubclassDraftSaveInput): Promise<void> {
  const entityInput = subclassFormDef.toInput(
    input.values,
    input.classId,
    input.existingEntity ? { entity: input.existingEntity } : undefined,
  )
  const saved = await input.create(entityInput)
  await persistSubclassCampaignAccess({
    campaignId: input.campaignId,
    classId: input.classId,
    subclassId: saved.id,
    pendingAccess: input.pendingAccess,
    onDeferredError: input.onDeferredAccessError,
  })
  input.onDraftSaved(input.draftId, saved)
}

export async function saveExistingSubclass(
  input: SubclassExistingSaveInput,
): Promise<CoordinatedContentSaveResult> {
  return runCoordinatedContentSave({
    accessWasDirty: input.accessWasDirty,
    bodyWasDirty: !input.accessOnly && input.bodyWasDirty,
    readPendingAvailable: input.readPendingAvailable,
    readAccessAvailabilityChanged: input.readAccessAvailabilityChanged,
    access: {
      save: input.saveAccess,
    },
    body: {
      save: async () => {
        const entityCtx = input.existingEntity ? { entity: input.existingEntity } : undefined
        let entityInput: UpdateSubclassInput
        if (input.existingEntity?.catalogLayer === 'system') {
          const snapshot = assertSystemOverlayWriteReady({
            operation: 'update',
            catalogLayer: 'system',
            participantId: 'subclasses',
            entityId: input.subclassId,
            rulesetId: input.rulesetId,
            hasNormalizer: Boolean(subclassFormDef.normalizeOverlayBody),
            catalogSeed: input.catalogSeed,
            overlayBaseline: input.overlayBaseline,
            expectedOverlayRevision: input.expectedOverlayRevision,
            seedRowIdsByPath: input.seedRowIdsByPath,
          })
          assertSystemOverlayWriteSnapshotMatchesEntity({
            snapshotEntityId: snapshot.entityId,
            snapshotRevision: snapshot.expectedOverlayRevision,
            entityId: input.existingEntity.id,
            entityRevision: (input.existingEntity as { overlayRevision?: number }).overlayRevision,
          })
          entityInput = buildSystemOverlayUpdatePayload({
            participantId: snapshot.participantId,
            catalogSeed: snapshot.catalogSeed,
            baseline: snapshot.overlayBaseline,
            draft: subclassFormDef.normalizeOverlayBody!(input.values, input.classId, entityCtx),
            validationIntent: 'publish',
            expectedOverlayRevision: snapshot.expectedOverlayRevision,
          }) as UpdateSubclassInput
        } else {
          entityInput = subclassFormDef.toInput(
            input.values,
            input.classId,
            entityCtx,
          ) as UpdateSubclassInput
        }
        await input.updateBody({ subclassId: input.subclassId, input: entityInput })
        input.onBodySaved(input.subclassId)
        return { status: 'saved' as const }
      },
    },
  })
}

export function reportSubclassSaveResult(
  result: CoordinatedContentSaveResult,
  entityName: string,
  setSaveError: (message: string | null) => void,
): void {
  if (result.status === 'saved') {
    notifyCoordinatedContentSaveSuccess(result.saved, entityName)
    return
  }

  if (result.status === 'body_failed') {
    setSaveError(getErrorMessage(result.error, 'Could not save subclass.'))
    return
  }

  if (result.status === 'access_invalid' || result.status === 'body_invalid') {
    setSaveError('Could not save subclass campaign access.')
  }
}
