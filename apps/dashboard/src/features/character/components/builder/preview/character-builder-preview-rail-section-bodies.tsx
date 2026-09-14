import {
  ABILITY_IDS,
  getProficiencyDomainCompactLabel,
  type CharacterBuildCatalogIndex,
  type CharacterBuildPreview,
  type CharacterBuilderDraft,
  type CharacterNarrative,
  type ChoiceSet,
} from '@rpg/contracts'
import { RichTextContent, Text } from '@rpg/ui'

import {
  countProficiencyChoicesRemaining,
  formatPreviewLanguagesSubsection,
  formatPreviewSavingThrowsSubsection,
  formatPreviewSkillsSubsection,
  formatPreviewToolsSubsection,
} from '../../../lib/builder-preview/format-preview-proficiency-subsection.lib'
import {
  formatPreviewAbilityCell,
  formatPreviewOptionalNumber,
  formatPreviewSpellsSubsection,
  resolveEquipmentPreviewEmptyHint,
  resolveProficienciesSectionHint,
} from '../../../lib/builder-preview/character-builder-preview-panel.lib'
import {
  CharacterBuilderPreviewSectionContent,
  CharacterBuilderPreviewSubsection,
  CharacterBuilderPreviewSubsectionHint,
} from './character-builder-preview-section-content'
import {
  characterBuilderPreviewAbilityGridClasses,
  characterBuilderPreviewCombatGridClasses,
  characterBuilderPreviewCombatStackClasses,
} from '../character-builder-shell.variants'

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-2 py-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function PreviewProficiencySubsectionContent({
  resolvedText,
  emptyHint,
  remainingText,
}: {
  resolvedText: string | null
  emptyHint: string | null
  remainingText?: string | null
}) {
  return (
    <div className="space-y-1">
      {resolvedText ? <p className="text-sm text-muted-foreground">{resolvedText}</p> : null}
      {emptyHint ? (
        <CharacterBuilderPreviewSubsectionHint>{emptyHint}</CharacterBuilderPreviewSubsectionHint>
      ) : null}
      {remainingText ? (
        <CharacterBuilderPreviewSubsectionHint>
          {remainingText}
        </CharacterBuilderPreviewSubsectionHint>
      ) : null}
    </div>
  )
}

export function CharacterBuilderPreviewNarrativeBody({
  narrative,
}: {
  narrative: CharacterNarrative | undefined
}) {
  return (
    <CharacterBuilderPreviewSectionContent>
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
    </CharacterBuilderPreviewSectionContent>
  )
}

export function CharacterBuilderPreviewCombatBody({ preview }: { preview: CharacterBuildPreview }) {
  return (
    <CharacterBuilderPreviewSectionContent>
      <div className={characterBuilderPreviewCombatStackClasses}>
        <dl className={characterBuilderPreviewCombatGridClasses}>
          <PreviewStat label="HP" value={formatPreviewOptionalNumber(preview.maxHp)} />
          <PreviewStat label="AC" value={formatPreviewOptionalNumber(preview.ac)} />
        </dl>
        <dl>
          <PreviewStat
            label="Proficiency bonus"
            value={formatPreviewOptionalNumber(preview.proficiencyBonus, '+')}
          />
        </dl>
      </div>
    </CharacterBuilderPreviewSectionContent>
  )
}

export function CharacterBuilderPreviewAbilitiesBody({
  preview,
}: {
  preview: CharacterBuildPreview
}) {
  return (
    <CharacterBuilderPreviewSectionContent>
      <dl className={characterBuilderPreviewAbilityGridClasses}>
        {ABILITY_IDS.map((ability) => {
          const entry = preview.abilityScores[ability]
          return (
            <div key={ability} className="rounded-md border border-border px-2 py-1.5">
              <dt className="text-xs text-muted-foreground">{ability.toUpperCase()}</dt>
              <dd className="text-sm font-medium">
                {formatPreviewAbilityCell(entry?.score, entry?.modifier)}
              </dd>
            </div>
          )
        })}
      </dl>
    </CharacterBuilderPreviewSectionContent>
  )
}

export function CharacterBuilderPreviewProficienciesBody({
  preview,
  catalogIndex,
  draft,
  resolvedChoiceSets,
  hasCharacterClass,
}: {
  preview: CharacterBuildPreview
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  hasCharacterClass: boolean
}) {
  const skillChoicesRemaining = countProficiencyChoicesRemaining(
    resolvedChoiceSets,
    draft,
    'skillProficiency',
  )
  const languageChoicesRemaining = countProficiencyChoicesRemaining(
    resolvedChoiceSets,
    draft,
    'language',
  )
  const toolChoicesRemaining = countProficiencyChoicesRemaining(
    resolvedChoiceSets,
    draft,
    'toolProficiency',
  )
  const sectionHint = resolveProficienciesSectionHint({ hasCharacterClass })

  return (
    <CharacterBuilderPreviewSectionContent layout="subsections" hint={sectionHint || undefined}>
      <CharacterBuilderPreviewSubsection title="Saving throws">
        <PreviewProficiencySubsectionContent
          {...formatPreviewSavingThrowsSubsection(preview, hasCharacterClass)}
        />
      </CharacterBuilderPreviewSubsection>

      <CharacterBuilderPreviewSubsection title={getProficiencyDomainCompactLabel('skill')}>
        <PreviewProficiencySubsectionContent
          {...formatPreviewSkillsSubsection(preview, skillChoicesRemaining)}
        />
      </CharacterBuilderPreviewSubsection>

      <CharacterBuilderPreviewSubsection title="Languages">
        <PreviewProficiencySubsectionContent
          {...formatPreviewLanguagesSubsection(preview, catalogIndex, languageChoicesRemaining)}
        />
      </CharacterBuilderPreviewSubsection>

      <CharacterBuilderPreviewSubsection title="Tools">
        <PreviewProficiencySubsectionContent
          {...formatPreviewToolsSubsection(preview, catalogIndex, toolChoicesRemaining)}
        />
      </CharacterBuilderPreviewSubsection>
    </CharacterBuilderPreviewSectionContent>
  )
}

export function CharacterBuilderPreviewEquipmentBody({
  preview,
  hasCharacterClass,
}: {
  preview: CharacterBuildPreview
  hasCharacterClass: boolean
}) {
  return (
    <CharacterBuilderPreviewSectionContent>
      {preview.equipmentSummary.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {preview.equipmentSummary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <CharacterBuilderPreviewSubsectionHint>
          {resolveEquipmentPreviewEmptyHint(hasCharacterClass)}
        </CharacterBuilderPreviewSubsectionHint>
      )}
    </CharacterBuilderPreviewSectionContent>
  )
}

export function CharacterBuilderPreviewSpellsBody({
  draft,
  resolvedChoiceSets,
  hasCharacterClass,
  spellcastingActive,
}: {
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  hasCharacterClass: boolean
  spellcastingActive: boolean
}) {
  const subsection = formatPreviewSpellsSubsection(
    draft,
    resolvedChoiceSets,
    hasCharacterClass,
    spellcastingActive,
  )

  return (
    <CharacterBuilderPreviewSectionContent>
      {subsection.resolvedText ? (
        <p className="text-sm text-muted-foreground">{subsection.resolvedText}</p>
      ) : subsection.emptyHint ? (
        <CharacterBuilderPreviewSubsectionHint>
          {subsection.emptyHint}
        </CharacterBuilderPreviewSubsectionHint>
      ) : null}
    </CharacterBuilderPreviewSectionContent>
  )
}

export function CharacterBuilderPreviewRailPlaceholder() {
  return <Text variant="muted">Preview will appear once builder context is ready.</Text>
}
