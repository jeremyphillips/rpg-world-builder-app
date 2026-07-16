'use client'

import type { CharacterNarrative } from '@rpg/contracts'
import { RichTextContent, Text } from '@rpg/ui'

import { narrativeFieldCount } from '../lib/narrative-preview'

export type CharacterDetailNarrativeSectionProps = {
  narrative: CharacterNarrative | undefined
}

export function CharacterDetailNarrativeSection({
  narrative,
}: CharacterDetailNarrativeSectionProps) {
  if (narrativeFieldCount(narrative) === 0) return null

  return (
    <div className="space-y-2">
      <Text as="p" variant="body" className="font-medium">
        Narrative
      </Text>
      <dl className="space-y-2 text-sm">
        {narrative?.personalityTraits?.length ? (
          <div>
            <dt className="text-muted-foreground">Personality traits</dt>
            <dd>{narrative.personalityTraits.join(', ')}</dd>
          </div>
        ) : null}
        {narrative?.ideals?.length ? (
          <div>
            <dt className="text-muted-foreground">Ideals</dt>
            <dd>{narrative.ideals.join(', ')}</dd>
          </div>
        ) : null}
        {narrative?.bonds?.length ? (
          <div>
            <dt className="text-muted-foreground">Bonds</dt>
            <dd>{narrative.bonds.join(', ')}</dd>
          </div>
        ) : null}
        {narrative?.flaws?.length ? (
          <div>
            <dt className="text-muted-foreground">Flaws</dt>
            <dd>{narrative.flaws.join(', ')}</dd>
          </div>
        ) : null}
        {narrative?.backstory?.trim() ? (
          <div>
            <dt className="text-muted-foreground">Backstory</dt>
            <dd>
              <RichTextContent html={narrative.backstory} size="sm" tone="muted" />
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
