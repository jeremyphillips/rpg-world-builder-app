import type { SpellStepModel } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import {
  SPELLCASTING_FACT_SUMMARY_HEADING,
  SPELLCASTING_FACT_SUMMARY_SUBHEAD,
} from '../../../../lib/spells/spells-step.lib'
import { SpellLevelTabs, SpellLevelTabsHeader } from './spell-level-tabs'
import { SpellsStepChoiceSection } from './spells-step-choice-section'
import { BuilderFactSummary } from '../shared/fact-summary/builder-fact-summary'
import { spellcastingFactSummaryRowIcons } from './spellcasting-fact-summary-icons'

type SpellsStepInteractiveContentProps = {
  model: SpellStepModel
  activeSpellLevel: number
  validationIssues: readonly CharacterBuildValidationIssue[]
  onActiveLevelChange: (level: number) => void
  onOpenChoiceSet: (choiceSetId: string, initialSpellLevel?: number) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

export function SpellsStepInteractiveContent({
  model,
  activeSpellLevel,
  validationIssues,
  onActiveLevelChange,
  onOpenChoiceSet,
  onRemoveChoice,
}: SpellsStepInteractiveContentProps) {
  const activeLevelSection =
    model.spellLevelSections.find((section) => section.spellLevel === activeSpellLevel) ??
    model.spellLevelSections[0]

  return (
    <div className="space-y-8">
      <BuilderFactSummary
        heading={SPELLCASTING_FACT_SUMMARY_HEADING}
        subhead={SPELLCASTING_FACT_SUMMARY_SUBHEAD}
        rows={model.summaryRows}
        rowIcons={spellcastingFactSummaryRowIcons}
        showSourceColumn={false}
      />

      {model.cantripsSection ? (
        <SpellsStepChoiceSection
          section={model.cantripsSection}
          validationIssues={validationIssues}
          onOpenChoiceSet={(choiceSetId) => onOpenChoiceSet(choiceSetId)}
          onRemoveChoice={onRemoveChoice}
        />
      ) : null}

      {model.maxSelectableSpellLevel >= 2 && model.acquisitionHeader ? (
        <div className="space-y-4">
          <SpellLevelTabsHeader acquisitionHeader={model.acquisitionHeader} />
          <SpellLevelTabs
            tabs={model.levelTabs}
            activeLevel={activeSpellLevel}
            onActiveLevelChange={onActiveLevelChange}
          />
        </div>
      ) : null}

      {activeLevelSection ? (
        <SpellsStepChoiceSection
          section={activeLevelSection}
          validationIssues={validationIssues}
          onOpenChoiceSet={(choiceSetId) =>
            onOpenChoiceSet(choiceSetId, activeLevelSection.spellLevel)
          }
          onRemoveChoice={onRemoveChoice}
        />
      ) : null}

      {model.deferredPreparedSection ? (
        <SpellsStepChoiceSection
          section={model.deferredPreparedSection}
          validationIssues={validationIssues}
          onOpenChoiceSet={(choiceSetId) => onOpenChoiceSet(choiceSetId)}
          onRemoveChoice={onRemoveChoice}
        />
      ) : null}
    </div>
  )
}
