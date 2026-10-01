import type { CharacterNarrative } from '@rpg/contracts'
import type { GeneratedNarrative } from '@rpg/contracts/character-narrative'

export function escapeNarrativeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  )
}

/** Maps generator output to persisted character narrative (including backstory HTML). */
export function generatedNarrativeToCharacterNarrative(
  narrative: GeneratedNarrative,
): CharacterNarrative {
  return {
    personalityTraits: narrative.personalityTraits,
    ideals: narrative.ideals,
    bonds: narrative.bonds,
    flaws: narrative.flaws,
    backstory: narrative.backstoryParagraphs
      .map((paragraph) => `<p>${escapeNarrativeHtml(paragraph)}</p>`)
      .join(''),
  }
}
