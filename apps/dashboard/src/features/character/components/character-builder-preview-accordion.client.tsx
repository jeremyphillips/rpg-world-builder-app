'use client'

import {
  ABILITY_IDS,
  type CharacterBuildCatalogIndex,
  type CharacterBuildPreview,
  type CharacterBuilderDraft,
  type CharacterNarrative,
  type ChoiceSet,
} from '@rpg/contracts'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  RichTextContent,
  Text,
} from '@rpg/ui'

import {
  countProficiencyChoicesRemaining,
  formatPreviewLanguagesSubsection,
  formatPreviewSavingThrowsSubsection,
  formatPreviewSkillsSubsection,
  formatPreviewToolsSubsection,
  type PreviewProficiencySubsection,
} from '../lib/format-preview-proficiency-subsection.lib'
import { getNarrativePreviewStatusLabel } from '../lib/narrative-preview'
import {
  formatPreviewAbilityCell,
  formatPreviewOptionalNumber,
  resolveEquipmentPreviewEmptyHint,
  resolveProficienciesSectionHint,
  resolveSpellsPreviewEmptyHint,
} from '../lib/character-builder-preview-panel.lib'
import {
  CHARACTER_BUILDER_PREVIEW_SECTIONS,
  type CharacterBuilderPreviewSectionId,
} from '../lib/character-builder-preview-panel.lib'
import {
  CharacterBuilderPreviewSectionContent,
  CharacterBuilderPreviewSubsection,
  CharacterBuilderPreviewSubsectionHint,
} from './character-builder-preview-section-content.client'
import {
  characterBuilderPreviewAbilityGridClasses,
  characterBuilderPreviewAccordionTriggerClasses,
  characterBuilderPreviewAccordionTriggerStackClasses,
  characterBuilderPreviewCombatGridClasses,
} from './character-builder-shell.variants'

export type CharacterBuilderPreviewAccordionProps = {
  preview: CharacterBuildPreview
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  narrative: CharacterNarrative | undefined
  narrativeCount: number
  hasCharacterClass: boolean
  spellcastingActive: boolean
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-2 py-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function PreviewNarrativeSection({
  narrative,
  narrativeCount,
}: {
  narrative: CharacterNarrative | undefined
  narrativeCount: number
}) {
  return (
    <AccordionItem value="narrative">
      <AccordionTrigger className={characterBuilderPreviewAccordionTriggerClasses}>
        <span className={characterBuilderPreviewAccordionTriggerStackClasses}>
          <span>Narrative</span>
          <Text as="span" variant="muted" className="text-xs font-normal">
            {getNarrativePreviewStatusLabel(narrativeCount)}
          </Text>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {narrativeCount === 0 ? (
          <CharacterBuilderPreviewSectionContent>
            <CharacterBuilderPreviewSubsectionHint>
              {getNarrativePreviewStatusLabel(0)}
            </CharacterBuilderPreviewSubsectionHint>
          </CharacterBuilderPreviewSectionContent>
        ) : (
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
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

function PreviewCombatSection({ preview }: { preview: CharacterBuildPreview }) {
  return (
    <AccordionItem value="combat">
      <AccordionTrigger className={characterBuilderPreviewAccordionTriggerClasses}>
        Combat
      </AccordionTrigger>
      <AccordionContent>
        <CharacterBuilderPreviewSectionContent>
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
        </CharacterBuilderPreviewSectionContent>
      </AccordionContent>
    </AccordionItem>
  )
}

function PreviewAbilitiesSection({ preview }: { preview: CharacterBuildPreview }) {
  return (
    <AccordionItem value="abilities">
      <AccordionTrigger className={characterBuilderPreviewAccordionTriggerClasses}>
        Abilities
      </AccordionTrigger>
      <AccordionContent>
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
      </AccordionContent>
    </AccordionItem>
  )
}

function PreviewProficiencySubsectionContent({
  subsection,
}: {
  subsection: PreviewProficiencySubsection
}) {
  return (
    <div className="space-y-1">
      {subsection.resolvedText ? (
        <p className="text-sm text-muted-foreground">{subsection.resolvedText}</p>
      ) : null}
      {subsection.emptyHint ? (
        <CharacterBuilderPreviewSubsectionHint>
          {subsection.emptyHint}
        </CharacterBuilderPreviewSubsectionHint>
      ) : null}
      {subsection.remainingText ? (
        <CharacterBuilderPreviewSubsectionHint>
          {subsection.remainingText}
        </CharacterBuilderPreviewSubsectionHint>
      ) : null}
    </div>
  )
}

function PreviewProficienciesSection({
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
  const sectionHint = resolveProficienciesSectionHint({
    hasCharacterClass,
  })

  return (
    <AccordionItem value="proficiencies">
      <AccordionTrigger className={characterBuilderPreviewAccordionTriggerClasses}>
        Proficiencies
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <CharacterBuilderPreviewSectionContent layout="subsections" hint={sectionHint || undefined}>
          <CharacterBuilderPreviewSubsection title="Saving throws">
            <PreviewProficiencySubsectionContent
              subsection={formatPreviewSavingThrowsSubsection(preview, hasCharacterClass)}
            />
          </CharacterBuilderPreviewSubsection>

          <CharacterBuilderPreviewSubsection title="Skills">
            <PreviewProficiencySubsectionContent
              subsection={formatPreviewSkillsSubsection(preview, skillChoicesRemaining)}
            />
          </CharacterBuilderPreviewSubsection>

          <CharacterBuilderPreviewSubsection title="Languages">
            <PreviewProficiencySubsectionContent
              subsection={formatPreviewLanguagesSubsection(
                preview,
                catalogIndex,
                languageChoicesRemaining,
              )}
            />
          </CharacterBuilderPreviewSubsection>

          <CharacterBuilderPreviewSubsection title="Tools">
            <PreviewProficiencySubsectionContent
              subsection={formatPreviewToolsSubsection(preview, catalogIndex, toolChoicesRemaining)}
            />
          </CharacterBuilderPreviewSubsection>
        </CharacterBuilderPreviewSectionContent>
      </AccordionContent>
    </AccordionItem>
  )
}

function PreviewEquipmentSection({
  preview,
  hasCharacterClass,
}: {
  preview: CharacterBuildPreview
  hasCharacterClass: boolean
}) {
  return (
    <AccordionItem value="equipment">
      <AccordionTrigger className={characterBuilderPreviewAccordionTriggerClasses}>
        Equipment
      </AccordionTrigger>
      <AccordionContent className="p-0">
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
      </AccordionContent>
    </AccordionItem>
  )
}

function PreviewSpellsSection({
  hasCharacterClass,
  spellcastingActive,
}: {
  hasCharacterClass: boolean
  spellcastingActive: boolean
}) {
  return (
    <AccordionItem value="spells">
      <AccordionTrigger className={characterBuilderPreviewAccordionTriggerClasses}>
        Spells
      </AccordionTrigger>
      <AccordionContent>
        <CharacterBuilderPreviewSectionContent>
          <CharacterBuilderPreviewSubsectionHint>
            {resolveSpellsPreviewEmptyHint(hasCharacterClass, spellcastingActive)}
          </CharacterBuilderPreviewSubsectionHint>
        </CharacterBuilderPreviewSectionContent>
      </AccordionContent>
    </AccordionItem>
  )
}

export function CharacterBuilderPreviewAccordion({
  preview,
  catalogIndex,
  draft,
  resolvedChoiceSets,
  narrative,
  narrativeCount,
  hasCharacterClass,
  spellcastingActive,
}: CharacterBuilderPreviewAccordionProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={
        [...CHARACTER_BUILDER_PREVIEW_SECTIONS] satisfies CharacterBuilderPreviewSectionId[]
      }
      variant="section"
    >
      <PreviewNarrativeSection narrative={narrative} narrativeCount={narrativeCount} />
      <PreviewCombatSection preview={preview} />
      <PreviewAbilitiesSection preview={preview} />
      <PreviewProficienciesSection
        preview={preview}
        catalogIndex={catalogIndex}
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        hasCharacterClass={hasCharacterClass}
      />
      <PreviewEquipmentSection preview={preview} hasCharacterClass={hasCharacterClass} />
      <PreviewSpellsSection
        hasCharacterClass={hasCharacterClass}
        spellcastingActive={spellcastingActive}
      />
    </Accordion>
  )
}
