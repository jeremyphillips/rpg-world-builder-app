'use client'

import {
  ABILITY_IDS,
  type CharacterBuildCatalogIndex,
  type CharacterBuildPreview,
  type CharacterNarrative,
  type ClassStored,
} from '@rpg/contracts'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  RichTextContent,
  Text,
} from '@rpg/ui'

import { resolveLanguagePreviewLabel } from '../lib/language-preview-label'
import { getNarrativePreviewStatusLabel } from '../lib/narrative-preview'
import {
  formatPreviewAbilityCell,
  formatPreviewOptionalNumber,
  formatPreviewSignedNumber,
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
  narrative: CharacterNarrative | undefined
  narrativeCount: number
  skillChoiceCount: number | undefined
  hasCharacterClass: boolean
  characterClass?: ClassStored
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

function PreviewProficienciesSection({
  preview,
  catalogIndex,
  hasCharacterClass,
  characterClass,
  skillChoiceCount,
}: {
  preview: CharacterBuildPreview
  catalogIndex: CharacterBuildCatalogIndex
  hasCharacterClass: boolean
  characterClass?: ClassStored
  skillChoiceCount: number | undefined
}) {
  const proficientSaves = preview.savingThrows.filter((save) => save.proficient)
  const sectionHint = resolveProficienciesSectionHint({
    hasCharacterClass,
    characterClass,
    skillChoiceCount,
  })

  return (
    <AccordionItem value="proficiencies">
      <AccordionTrigger className={characterBuilderPreviewAccordionTriggerClasses}>
        Proficiencies
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <CharacterBuilderPreviewSectionContent layout="subsections" hint={sectionHint || undefined}>
          <CharacterBuilderPreviewSubsection title="Saving throws">
            {proficientSaves.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {proficientSaves.map((save) => (
                  <li key={save.ability} className="text-muted-foreground">
                    {save.ability.toUpperCase()} {formatPreviewSignedNumber(save.bonus)}
                  </li>
                ))}
              </ul>
            ) : (
              <CharacterBuilderPreviewSubsectionHint>
                Class saving throws appear after you choose a class.
              </CharacterBuilderPreviewSubsectionHint>
            )}
          </CharacterBuilderPreviewSubsection>

          <CharacterBuilderPreviewSubsection title="Skills">
            {preview.proficiencies.skills.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {preview.proficiencies.skills.map((skill) => (
                  <li key={skill.skill} className="text-muted-foreground">
                    {skill.skill}
                  </li>
                ))}
              </ul>
            ) : (
              <CharacterBuilderPreviewSubsectionHint>
                No skills chosen yet.
              </CharacterBuilderPreviewSubsectionHint>
            )}
          </CharacterBuilderPreviewSubsection>

          <CharacterBuilderPreviewSubsection title="Languages">
            {preview.proficiencies.languages.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {preview.proficiencies.languages.map((entry) => (
                  <li key={entry.language} className="text-muted-foreground">
                    {resolveLanguagePreviewLabel(entry.language, catalogIndex)}
                  </li>
                ))}
              </ul>
            ) : (
              <CharacterBuilderPreviewSubsectionHint>
                No languages yet.
              </CharacterBuilderPreviewSubsectionHint>
            )}
          </CharacterBuilderPreviewSubsection>

          <CharacterBuilderPreviewSubsection title="Tools">
            {preview.proficiencies.tools.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {preview.proficiencies.tools.map((tool, index) => (
                  <li
                    key={tool.toolId ?? tool.toolCategory ?? index}
                    className="text-muted-foreground"
                  >
                    {tool.toolId ?? tool.toolCategory ?? 'Tool proficiency'}
                  </li>
                ))}
              </ul>
            ) : (
              <CharacterBuilderPreviewSubsectionHint>
                No tool proficiencies yet.
              </CharacterBuilderPreviewSubsectionHint>
            )}
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
  narrative,
  narrativeCount,
  skillChoiceCount,
  hasCharacterClass,
  characterClass,
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
        hasCharacterClass={hasCharacterClass}
        characterClass={characterClass}
        skillChoiceCount={skillChoiceCount}
      />
      <PreviewEquipmentSection preview={preview} hasCharacterClass={hasCharacterClass} />
      <PreviewSpellsSection
        hasCharacterClass={hasCharacterClass}
        spellcastingActive={spellcastingActive}
      />
    </Accordion>
  )
}
