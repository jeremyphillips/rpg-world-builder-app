import { getContentWriteConfig } from '../../content-types'
import { createHomebrewContent, resolveContentEntityForWrite } from '../content-write.service'
import { resolveContentCreationDefaults } from '../resolve-content-creation-defaults'
import { resolveUniqueContentSlug } from '../slug/resolve-unique-content-slug'
import { assertDuplicateContentType } from './duplicate-content-policy'
import { transformDuplicateSource } from './duplicate-content-transform'
import type { DuplicateContentContext } from './duplicate-content.types'

// TODO: POST idempotency key support — duplicate is especially susceptible because
// suffix collision policy allows two successful requests to create two valid records.

export async function duplicateContentEntity({
  campaignId,
  contentType,
  entityId,
  requestedName,
}: DuplicateContentContext) {
  assertDuplicateContentType(contentType)
  const writeConfig = getContentWriteConfig(contentType)!
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

  const creationDefaults = resolveContentCreationDefaults({ mode: 'duplicate' })

  const entity = await createHomebrewContent(writeConfig, campaignId, createInput, {
    status: creationDefaults.status,
    source: creationDefaults.source,
    resolvedSlug: destinationSlug,
    slugCollisionPolicy: 'suffix',
    preserveNestedIds: true,
  })

  // TODO: duplicatedFrom — record provenance at the success point.

  return { writeConfig, entity }
}
