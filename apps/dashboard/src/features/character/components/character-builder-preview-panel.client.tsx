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
          <dl className={characterBuilderPreviewStatGridClasses}>
            <PreviewStat
              label="Proficiency"
              value={formatOptionalNumber(preview.proficiencyBonus, '+')}
            />
            <PreviewStat label="Max HP" value={formatOptionalNumber(preview.maxHp)} />
            <PreviewStat label="AC" value={formatOptionalNumber(preview.ac)} />
          </dl>

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

          {preview.savingThrows.some((save) => save.bonus !== undefined) ? (
            <div className="space-y-2">
              <Text as="p" variant="body" className="font-medium">
                Saving throws
              </Text>
              <dl className="space-y-1">
                {preview.savingThrows.map((save) => (
                  <div
                    key={save.ability}
                    className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-sm"
                  >
                    <dt className="text-muted-foreground">
                      {ABILITY_ENTRIES[save.ability].label}
                      {save.proficient ? <span className="sr-only">, proficient</span> : null}
                    </dt>
                    <dd className="font-medium">
                      {formatSignedNumber(save.bonus)}
                      {save.proficient ? (
                        <span aria-hidden className="ml-1 text-xs text-muted-foreground">
                          prof
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {preview.skills.length > 0 ? (
            <div className="space-y-2">
              <Text as="p" variant="body" className="font-medium">
                Skills
              </Text>
              <dl className="space-y-1">
                {preview.skills.map((skill) => (
                  <div
                    key={skill.skillId}
                    className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-sm"
                  >
                    <dt className="text-muted-foreground">{skill.label}</dt>
                    <dd className="font-medium">{formatSignedNumber(skill.modifier)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

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
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function formatOptionalNumber(value: number | undefined, prefix = ''): string {
  if (value === undefined) return '—'
  return `${prefix}${value}`
}

function formatSignedNumber(value: number | undefined): string {
  if (value === undefined) return '—'
  return value >= 0 ? `+${value}` : String(value)
}

function formatAbilityScore(score: number | undefined, modifier: number | undefined): string {
  if (score === undefined) return '—'
  if (modifier === undefined) return String(score)
  const modLabel = modifier >= 0 ? `+${modifier}` : String(modifier)
  return `${score} (${modLabel})`
}
