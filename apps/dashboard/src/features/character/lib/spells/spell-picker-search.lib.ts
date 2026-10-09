import {
  buildSpellPickerSearchText,
  getSpellSearchDescription,
  getSpellSearchLevelLabels,
  getSpellSearchName,
  getSpellSearchSchoolLabel,
  getSpellSearchTags,
  type Spell,
  type SpellPickerItem,
} from '@rpg/contracts'
import type { SearchDocument, SearchField } from '@rpg/search'

import type { SpellPickerRow } from '../../components/spells/picker/spell-picker-drawer.types'

function keywordField(key: string, text: string): SearchField {
  return { key, text, role: 'keyword' }
}

/** Assembles a role-weighted spell picker search document from contracts field helpers. */
export function assembleSpellPickerSearchDocument(spell: Spell): SearchDocument {
  const description = getSpellSearchDescription(spell)
  const fields: SearchField[] = [
    { key: 'name', text: getSpellSearchName(spell), role: 'primary' },
    { key: 'school', text: getSpellSearchSchoolLabel(spell), role: 'keyword' },
    ...getSpellSearchLevelLabels(spell).map((label, index) =>
      keywordField(`level:${index}`, label),
    ),
    ...getSpellSearchTags(spell).map((tag, index) => keywordField(`tag:${index}`, tag)),
  ]

  if (description) {
    fields.push({ key: 'description', text: description, role: 'secondary' })
  }

  fields.push({
    key: 'combined',
    text: buildSpellPickerSearchText(spell),
    role: 'secondary',
  })

  return { id: spell.id, fields }
}

/** Attaches assembled search documents to resolver rows for the spell picker. */
export function enrichSpellPickerItems(items: readonly SpellPickerItem[]): SpellPickerRow[] {
  return items.map((item) => ({
    ...item,
    searchDocument: assembleSpellPickerSearchDocument(item.spell),
  }))
}
