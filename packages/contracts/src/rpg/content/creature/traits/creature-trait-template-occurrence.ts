import { getCreatureTraitTemplate, type CreatureTraitTemplate } from './templates'

export function creatureTraitTemplateOccurrenceMessage(label: string): string {
  return `Only one ${label} is allowed.`
}

export function creatureTraitTemplateAllowsOnlyOne(
  template: Pick<CreatureTraitTemplate, 'occurrence'>,
): boolean {
  return template.occurrence === 'one'
}

export function creatureTraitTemplateAtOccurrenceLimit(
  templateId: string,
  seenTemplateIds: ReadonlySet<string>,
): { atLimit: true; message: string } | { atLimit: false } {
  const template = getCreatureTraitTemplate(templateId)
  if (!template || !creatureTraitTemplateAllowsOnlyOne(template)) return { atLimit: false }
  if (!seenTemplateIds.has(templateId)) return { atLimit: false }
  return { atLimit: true, message: creatureTraitTemplateOccurrenceMessage(template.label) }
}
