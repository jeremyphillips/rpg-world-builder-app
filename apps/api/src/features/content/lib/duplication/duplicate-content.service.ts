import { getContentWriteConfig } from '../../content-types'
import type { WriteEntityBase } from '../content-write-config'
import { createHomebrewContent, resolveContentEntityForWrite } from '../content-write.service'
import { resolveContentCreationDefaults } from '../resolve-content-creation-defaults'
import { resolveUniqueContentSlug } from '../slug/resolve-unique-content-slug'
import {
  assertIdempotencyRequestMatches,
  findDuplicateIdempotencyRecord,
  recordDuplicateIdempotency,
} from './content-duplication-idempotency'
import { assertDuplicateContentType } from './duplicate-content-policy'
import { transformDuplicateSource } from './duplicate-content-transform'
import type { DuplicateContentContext } from './duplicate-content.types'

export async function duplicateContentEntity({
  campaignId,
  contentType,
  entityId,
  requestedName,
  idempotencyKey,
}: DuplicateContentContext) {
  assertDuplicateContentType(contentType)
  const writeConfig = getContentWriteConfig(contentType)!

  if (idempotencyKey) {
    const stored = await findDuplicateIdempotencyRecord(campaignId, idempotencyKey)
    if (stored) {
      assertIdempotencyRequestMatches(stored, contentType, entityId)
      const { entity } = await resolveContentEntityForWrite(
        writeConfig,
        campaignId,
        stored.createdEntityId,
      )
      return { writeConfig, entity }
    }
  }

  const { entity: source } = await resolveContentEntityForWrite(writeConfig, campaignId, entityId)

  const destinationSlug = await resolveUniqueContentSlug({
    contentType,
    campaignId,
    name: requestedName,
    collisionPolicy: 'suffix',
  })

  const createInput = transformDuplicateSource({
    source,
    requestedName,
    destinationSlug,
    contentType,
    writeConfig,
  })

  const creationDefaults = resolveContentCreationDefaults({
    mode: 'duplicate',
    contentTypeKey: contentType,
  })

  const entity = await createHomebrewContent(writeConfig, campaignId, createInput, {
    status: creationDefaults.status,
    catalogLayer: creationDefaults.catalogLayer,
    resolvedSlug: destinationSlug,
    slugCollisionPolicy: 'suffix',
    preserveNestedIds: true,
    provenanceAuthority: 'carry',
    provenanceSourceEntity: source as unknown as Record<string, unknown>,
    contentTypeKey: contentType,
  })

  if (idempotencyKey) {
    await recordDuplicateIdempotency({
      campaignId,
      idempotencyKey,
      contentType,
      sourceEntityId: entityId,
      createdEntityId: (entity as WriteEntityBase).id,
    })
  }

  return { writeConfig, entity }
}
