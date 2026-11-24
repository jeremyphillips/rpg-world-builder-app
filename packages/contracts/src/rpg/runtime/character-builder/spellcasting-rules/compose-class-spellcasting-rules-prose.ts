import type { Spell } from '../../../content/spell'
import type {
  StatBlockProse,
  StatBlockProseDocument,
  StatBlockProseSegment,
} from '../../prose/stat-block-prose'
import { statBlockProseSpacing } from '../../prose/stat-block-prose'
export function rulesTextSegment(value: string, emphasis?: 'italic'): StatBlockProseSegment {
  return emphasis ? { kind: 'text', value, emphasis } : { kind: 'text', value }
}

export function rulesParagraphLead(
  lead: string,
  body: readonly StatBlockProseSegment[],
): StatBlockProse {
  return [{ kind: 'lead', treatment: 'paragraph', label: lead }, ...body]
}

export function rulesPlainParagraph(sentence: string): StatBlockProse {
  return [rulesTextSegment(sentence)]
}

export function appendRulesSentence(paragraph: StatBlockProse, sentence: string): StatBlockProse {
  if (!sentence.trim()) return paragraph
  return [...paragraph, statBlockProseSpacing(), rulesTextSegment(sentence)]
}

export function appendRulesRecommendations(
  paragraph: StatBlockProse,
  spellIds: readonly string[],
  spellsById: ReadonlyMap<string, Spell> | undefined,
): StatBlockProse {
  if (spellIds.length === 0) return paragraph

  const labels = spellIds.flatMap((spellId) => {
    if (spellsById) {
      const name = spellsById.get(spellId)?.name
      return name ? [name] : []
    }
    return []
  })

  if (spellsById && labels.length === 0) return paragraph
  if (!spellsById) return paragraph

  const segments: StatBlockProseSegment[] = [rulesTextSegment(' ')]
  for (let index = 0; index < labels.length; index += 1) {
    if (index > 0) {
      const conjunction = index === labels.length - 1 ? ' and ' : ', '
      segments.push(rulesTextSegment(conjunction))
    }
    segments.push(rulesTextSegment(labels[index]!, 'italic'))
  }

  const verb = labels.length === 1 ? ' is' : ' are'
  segments.push(rulesTextSegment(`${verb} recommended.`))
  return [...paragraph, ...segments]
}

export function rulesDocumentFromParagraphs(
  paragraphs: readonly StatBlockProse[],
): StatBlockProseDocument {
  return paragraphs.filter((paragraph) => paragraph.length > 0)
}
