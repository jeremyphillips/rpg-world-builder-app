'use client'

import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  abilityModifier,
  getAlignmentLabel,
  getCharacterTotalLevel,
  type PcCharacter,
} from '@rpg/contracts'
import { Heading, RichTextContent, Text } from '@rpg/ui'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'

import { narrativeFieldCount } from '../lib/narrative-preview'

import {
  characterBuilderPreviewAbilityGridClasses,
  characterBuilderPreviewStatGridClasses,
} from './character-builder-shell.variants'

export type CharacterDetailContentProps = {
  character: PcCharacter
}

/** Minimal read-only character sheet stopgap until the full detail view lands. */
export function CharacterDetailContent({ character }: CharacterDetailContentProps) {
  useSetBreadcrumbLabel(character.name)

  const level = getCharacterTotalLevel(character)
  const primaryClass = character.classes[0]

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Heading variant="page" as="h1">
          {character.name}
        </Heading>
        <Text variant="muted">
          Level {level}
          {primaryClass ? ` · ${primaryClass.classId}` : null}
          {' · '}
          {getAlignmentLabel(character.alignment)}
        </Text>
      </header>

      <dl className={characterBuilderPreviewStatGridClasses}>
        <DetailStat label="Max HP" value={String(character.hitPoints.base)} />
        <DetailStat label="Species" value={character.species.id} />
      </dl>

      <div className="space-y-2">
        <Text as="p" variant="body" className="font-medium">
          Abilities
        </Text>
        <dl className={characterBuilderPreviewAbilityGridClasses}>
          {ABILITY_IDS.map((ability) => {
            const score = character.abilityScores[ability]
            const modifier = abilityModifier(score)
            return (
              <div key={ability} className="rounded-md border border-border px-2 py-1.5">
                <dt className="text-xs text-muted-foreground">{ABILITY_ENTRIES[ability].label}</dt>
                <dd className="text-sm font-medium">
                  {score} ({modifier >= 0 ? `+${modifier}` : modifier})
                </dd>
              </div>
            )
          })}
        </dl>
      </div>

      {narrativeFieldCount(character.narrative) > 0 ? (
        <div className="space-y-2">
          <Text as="p" variant="body" className="font-medium">
            Narrative
          </Text>
          <dl className="space-y-2 text-sm">
            {character.narrative?.personalityTraits?.length ? (
              <div>
                <dt className="text-muted-foreground">Personality traits</dt>
                <dd>{character.narrative.personalityTraits.join(', ')}</dd>
              </div>
            ) : null}
            {character.narrative?.ideals?.length ? (
              <div>
                <dt className="text-muted-foreground">Ideals</dt>
                <dd>{character.narrative.ideals.join(', ')}</dd>
              </div>
            ) : null}
            {character.narrative?.bonds?.length ? (
              <div>
                <dt className="text-muted-foreground">Bonds</dt>
                <dd>{character.narrative.bonds.join(', ')}</dd>
              </div>
            ) : null}
            {character.narrative?.flaws?.length ? (
              <div>
                <dt className="text-muted-foreground">Flaws</dt>
                <dd>{character.narrative.flaws.join(', ')}</dd>
              </div>
            ) : null}
            {character.narrative?.backstory?.trim() ? (
              <div>
                <dt className="text-muted-foreground">Backstory</dt>
                <dd>
                  <RichTextContent html={character.narrative.backstory} size="sm" tone="muted" />
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}
