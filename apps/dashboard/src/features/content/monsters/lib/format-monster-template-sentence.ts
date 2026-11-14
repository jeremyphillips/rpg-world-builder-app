import {
  formatCreatureTrait,
  formatMonsterStatBlockSubject,
  readCreatureTraitTemplateConfig,
} from '@rpg/contracts'

function withCreatureSubject(sentence: string, subject: string): string {
  const capital = subject.charAt(0).toUpperCase() + subject.slice(1)
  return sentence.replaceAll('This creature', capital).replaceAll('this creature', subject)
}

/** Stat-block sentence for a monster template trait, using the creature's name. */
export function formatMonsterTemplateSentence(input: {
  templateId: string
  config?: unknown
  monsterName: string
}): string | undefined {
  const subject = formatMonsterStatBlockSubject(input.monsterName)
  const config =
    input.config && typeof input.config === 'object'
      ? (input.config as Record<string, unknown>)
      : {}
  const formatted = formatCreatureTrait({
    subject,
    trait: { preset: input.templateId, ...config },
  })
  if (formatted?.sentence) return formatted.sentence

  const read = readCreatureTraitTemplateConfig(input.templateId, input.config)
  if (!read) return undefined
  return withCreatureSubject(read.template.formatDescription(read.config), subject)
}
