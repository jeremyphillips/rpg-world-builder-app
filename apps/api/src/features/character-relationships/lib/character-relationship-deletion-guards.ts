import { HttpError } from '../../../lib/http-error'
import { CharacterRelationshipModel } from '../character-relationship.model'

export async function countCharacterRelationshipReferences(
  campaignId: string,
  characterId: string,
): Promise<number> {
  return CharacterRelationshipModel.countDocuments({
    campaignId,
    $or: [{ characterId }, { relatedCharacterId: characterId }],
  })
}

export async function assertNoCharacterRelationshipReferences(
  campaignId: string,
  characterId: string,
): Promise<void> {
  const count = await countCharacterRelationshipReferences(campaignId, characterId)
  if (count > 0) {
    throw new HttpError(
      409,
      'conflict',
      'Character cannot be deleted while relationship edges still reference them. Remove or unlink relationships first.',
    )
  }
}
