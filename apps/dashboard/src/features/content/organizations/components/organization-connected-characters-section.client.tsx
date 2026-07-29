'use client'

import { CharacterListCardPreview } from '@/features/character'
import { Heading, Text } from '@rpg/ui'

import { ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR } from '../lib/organization-connected-characters.constants'
import {
  formatConnectedCharactersCount,
  ORGANIZATION_SECTION_LABELS,
  type OrganizationConnectedCharactersViewModel,
} from '../lib/organization-display'

export type OrganizationConnectedCharactersSectionProps = {
  connectedCharacters: OrganizationConnectedCharactersViewModel
  isPending?: boolean
  isError?: boolean
  errorText?: string
}

export function OrganizationConnectedCharactersSection({
  connectedCharacters,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR,
}: OrganizationConnectedCharactersSectionProps) {
  const { previewItems, total, emptyText } = connectedCharacters

  return (
    <section aria-labelledby="organization-connected-characters-heading" className="space-y-4">
      <Heading variant="group" as="h2" id="organization-connected-characters-heading">
        {ORGANIZATION_SECTION_LABELS.connectedCharacters}
      </Heading>

      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : isError ? (
        <Text variant="muted">{errorText}</Text>
      ) : total === 0 ? (
        <Text variant="muted">{emptyText}</Text>
      ) : (
        <div className="space-y-3">
          <Text variant="muted">{formatConnectedCharactersCount(total)}</Text>
          <CharacterListCardPreview items={previewItems} total={total} />
        </div>
      )}
    </section>
  )
}
