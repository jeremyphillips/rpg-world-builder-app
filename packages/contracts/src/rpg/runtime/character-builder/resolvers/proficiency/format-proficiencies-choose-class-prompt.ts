import { getContentTypeSentenceForm } from '../../../../content/lib/content-type-terms'
import { joinNaturalList } from '../../../../primitives/prose'
import {
  getProficiencyDomainCompactActionNoun,
  getProficiencyDomainSentenceForm,
  PROFICIENCY_TERM,
} from '../../../../vocab/proficiency'

const SAVING_THROWS_PHRASE = 'saving throws' as const

function proficiencyChooseClassPromptDeterminants(): readonly string[] {
  return [
    SAVING_THROWS_PHRASE,
    `${getProficiencyDomainCompactActionNoun('skill', 1)} choices`,
    getProficiencyDomainCompactActionNoun('armor', 1),
    getProficiencyDomainCompactActionNoun('weapon', 1),
    getProficiencyDomainSentenceForm('tool', 2),
  ]
}

/** Choose-class prompt heading for the proficiencies builder step. */
export function formatProficienciesChooseClassPromptHeading(): string {
  const classTerm = getContentTypeSentenceForm('classes')
  return `Choose a ${classTerm} to unlock ${classTerm} ${PROFICIENCY_TERM.sentence.plural}.`
}

/** Choose-class prompt description for the proficiencies builder step. */
export function formatProficienciesChooseClassPromptDescription(): string {
  const classTerm = getContentTypeSentenceForm('classes')
  return `Your ${classTerm} determines ${joinNaturalList(proficiencyChooseClassPromptDeterminants())}.`
}
