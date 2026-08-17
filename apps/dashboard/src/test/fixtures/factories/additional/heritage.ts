import type { HeritageForm } from '@/features/content/species/lib/species-heritage-form-fields'

const DEFAULT_HERITAGE_OPTION = {
  kind: 'custom' as const,
  overrideDisplay: false,
  name: 'Test Option',
  description: '',
  grants: [],
}

const DEFAULT_HERITAGE_FORM = {
  name: 'Test Heritage',
  description: '',
  choose: 1,
  options: [DEFAULT_HERITAGE_OPTION],
} satisfies HeritageForm

/** Synthetic species heritage form row for heritage tab and form tests. */
export function makeHeritageForm(overrides: Partial<HeritageForm> = {}): HeritageForm {
  return {
    ...DEFAULT_HERITAGE_FORM,
    ...overrides,
    options: overrides.options ?? DEFAULT_HERITAGE_FORM.options,
  }
}

/** Pre-filled draconic ancestry heritage used in species heritage tab tests. */
export const draconicHeritageForm = makeHeritageForm({
  id: 'hc1',
  name: 'Draconic Ancestry',
  options: [
    {
      id: 'o1',
      kind: 'custom',
      overrideDisplay: false,
      name: 'Breath Weapon',
      description: '',
      grants: [],
    },
  ],
})
