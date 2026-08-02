export type CharacterContentReferenceDescriptor = {
  owner: 'character'
  path: string
  matchKey: 'id' | 'slug'
}

export function createCharacterContentReferenceDescriptor(
  input: Pick<CharacterContentReferenceDescriptor, 'path' | 'matchKey'>,
): CharacterContentReferenceDescriptor {
  return { owner: 'character', ...input }
}

export const CLASS_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'classes.classId',
  matchKey: 'id',
})

export const SUBCLASS_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'classes.subclassId',
  matchKey: 'id',
})

export const SPECIES_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'species.id',
  matchKey: 'id',
})

export const SPELL_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'spells.spellId',
  matchKey: 'id',
})

export const FEAT_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'feats.featId',
  matchKey: 'id',
})

export const ORGANIZATION_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'connections.organizations.organizationId',
  matchKey: 'id',
})

export const SKILL_PROFICIENCY_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'proficiencies.skills.skill',
  matchKey: 'slug',
})

/** Build Mongo equality fragment — single construction site. */
export function characterContentReferenceMatch(
  descriptor: CharacterContentReferenceDescriptor,
  value: string,
): Record<string, unknown> {
  return { [descriptor.path]: value }
}
