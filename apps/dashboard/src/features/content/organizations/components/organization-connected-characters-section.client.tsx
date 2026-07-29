'use client'

import { Heading, Text } from '@rpg/ui'

import { CharacterListCardPreview } from '@/features/character/components/character-list-card-preview.client'

import {
  ORGANIZATION_SECTION_LABELS,
  type OrganizationConnectedCharactersViewModel,
} from '../lib/organization-display'

export type OrganizationConnectedCharactersSectionProps = {
  connectedCharacters: OrganizationConnectedCharactersViewModel
}

export function OrganizationConnectedCharactersSection({
  connectedCharacters,
}: OrganizationConnectedCharactersSectionProps) {
  const { previewItems, total, emptyText } = connectedCharacters

  return (
    <section aria-labelledby="organization-connected-characters-heading" className="space-y-4">
      <Heading variant="group" as="h2" id="organization-connected-characters-heading">
        {ORGANIZATION_SECTION_LABELS.connectedCharacters}
      </Heading>

      {total === 0 ? (
        <Text variant="muted">{emptyText}</Text>
      ) : (
        <CharacterListCardPreview items={previewItems} total={total} />
      )}
    </section>
  )
}
