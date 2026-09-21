import { getContentTypeSentenceForm } from '../../../../content/lib/content-type-terms'

/** Choose-class prompt heading for the spells builder step. */
export function formatSpellsChooseClassPromptHeading(): string {
  const classTerm = getContentTypeSentenceForm('classes')
  const spellTerm = getContentTypeSentenceForm('spells')
  return `Choose a ${classTerm} to see ${spellTerm} options.`
}

/** Choose-class prompt description for the spells builder step. */
export function formatSpellsChooseClassPromptDescription(): string {
  const classTerm = getContentTypeSentenceForm('classes')
  const spellTerm = getContentTypeSentenceForm('spells', 2)
  return `Your ${classTerm} determines whether you can cast ${spellTerm} and which ${spellTerm} are available.`
}
