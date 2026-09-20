import { getContentTypeSentenceForm } from '../../content/lib/content-type-terms'
import { getLanguageProficiencySentenceForm } from '../../vocab/language'
import { getProficiencyDomainSentenceForm } from '../../vocab/proficiency'
import type { ChoiceSet } from './choice-set'

/** Stable drawer heading for builder ChoiceSet pickers — does not change with selection state. */
export function formatChoiceSetDrawerHeading(choiceType: ChoiceSet['choiceType']): string {
  switch (choiceType) {
    case 'skillProficiency':
      return `Choose ${getProficiencyDomainSentenceForm('skill', 1)}`
    case 'toolProficiency':
      return `Choose ${getProficiencyDomainSentenceForm('tool', 1)}`
    case 'weaponProficiency':
      return `Choose ${getProficiencyDomainSentenceForm('weapon', 1)}`
    case 'armorTraining':
      return `Choose ${getProficiencyDomainSentenceForm('armor', 1)}`
    case 'language':
      return `Choose ${getLanguageProficiencySentenceForm(1)}`
    case 'cantrip':
      return 'Choose cantrip'
    case 'spell':
      return 'Choose spell'
    case 'equipment':
      return `Choose ${getContentTypeSentenceForm('equipment', 1)}`
    case 'feat':
      return `Choose ${getContentTypeSentenceForm('feats', 1)}`
    default:
      return 'Choose'
  }
}

/** Progress label for proficiency choice-set counters (category aggregate and per-block). */
export function formatProficiencyChosenCounter(selectedCount: number, max: number): string {
  return `${selectedCount} / ${max} chosen`
}
