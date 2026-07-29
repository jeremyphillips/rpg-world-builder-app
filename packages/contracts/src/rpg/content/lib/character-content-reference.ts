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

export const ORGANIZATION_CHARACTER_REFERENCE = createCharacterContentReferenceDescriptor({
  path: 'connections.organizations.organizationId',
  matchKey: 'id',
})

/** Build Mongo equality fragment — single construction site. */
export function characterContentReferenceMatch(
  descriptor: CharacterContentReferenceDescriptor,
  value: string,
): Record<string, unknown> {
  return { [descriptor.path]: value }
}
