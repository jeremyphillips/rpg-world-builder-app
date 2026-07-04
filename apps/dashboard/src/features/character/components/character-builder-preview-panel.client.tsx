'use client'

import { ABILITY_ENTRIES, ABILITY_IDS, type CharacterBuildPreview } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  characterBuilderPreviewAbilityGridClasses,
  characterBuilderPreviewPanelClasses,
  characterBuilderPreviewStatGridClasses,
} from './character-builder-shell.variants'

export type CharacterBuilderPreviewPanelProps = {
  preview: CharacterBuildPreview | null
}

export function CharacterBuilderPreviewPanel({ preview }: CharacterBuilderPreviewPanelProps) {
  return (
    <aside
      aria-labelledby="character-builder-preview-heading"
      className={characterBuilderPreviewPanelClasses}
    >
      <Heading variant="section" as="h2" id="character-builder-preview-heading">
        Preview
      </Heading>

      {!preview ? (
        <Text variant="muted">Preview will appear once builder context is ready.</Text>
      ) : (
        <div className="space-y-4">
          <div className={characterBuilderPreviewStatGridClasses}>
            <PreviewStat
              label="Proficiency"
              value={formatOptionalNumber(preview.proficiencyBonus, '+')}
            />
            <PreviewStat label="Max HP" value={formatOptionalNumber(preview.maxHp)} />
            <PreviewStat label="AC" value={formatOptionalNumber(preview.ac)} />
          </div>

          <div className="space-y-2">
            <Text as="p" variant="body" className="font-medium">
              Abilities
            </Text>
            <dl className={characterBuilderPreviewAbilityGridClasses}>
              {ABILITY_IDS.map((ability) => {
                const entry = preview.abilityScores[ability]
                return (
                  <div key={ability} className="rounded-md border border-border px-2 py-1.5">
                    <dt className="text-xs text-muted-foreground">
                      {ABILITY_ENTRIES[ability].label}
                    </dt>
                    <dd className="text-sm font-medium">
                      {formatAbilityScore(entry?.score, entry?.modifier)}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>

          {preview.warnings.length > 0 ? (
            <div className="space-y-1">
              <Text as="p" variant="body" className="font-medium">
                Warnings
              </Text>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {preview.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </aside>
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-2 py-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function formatOptionalNumber(value: number | undefined, prefix = ''): string {
  if (value === undefined) return '—'
  return `${prefix}${value}`
}

function formatAbilityScore(score: number | undefined, modifier: number | undefined): string {
  if (score === undefined) return '—'
  if (modifier === undefined) return String(score)
  const modLabel = modifier >= 0 ? `+${modifier}` : String(modifier)
  return `${score} (${modLabel})`
}
