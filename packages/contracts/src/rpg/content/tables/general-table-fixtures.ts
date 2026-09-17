import type { GeneralTable } from './general-table'

/** CC SRD 5.2.1 Reincarnate species roll table — ten authored rows, no range row. */
export const reincarnateSpeciesTableFixture: GeneralTable = {
  id: 'reincarnate-species',
  name: 'Reincarnation',
  kind: 'general',
  columns: [
    { id: 'roll', label: '1d10', valueType: 'number' },
    { id: 'species', label: 'Species', valueType: 'text' },
  ],
  rows: [
    { id: 'row-1', cells: { roll: 1, species: 'Roll again.' } },
    { id: 'row-2', cells: { roll: 2, species: 'Dragonborn' } },
    { id: 'row-3', cells: { roll: 3, species: 'Dwarf' } },
    { id: 'row-4', cells: { roll: 4, species: 'Elf' } },
    { id: 'row-5', cells: { roll: 5, species: 'Gnome' } },
    { id: 'row-6', cells: { roll: 6, species: 'Goliath' } },
    { id: 'row-7', cells: { roll: 7, species: 'Halfling' } },
    { id: 'row-8', cells: { roll: 8, species: 'Human' } },
    { id: 'row-9', cells: { roll: 9, species: 'Orc' } },
    { id: 'row-10', cells: { roll: 10, species: 'Tiefling' } },
  ],
}
