import type { ProgressionTable } from '@rpg/contracts'

export const rageProgressionTableFixture: ProgressionTable = {
  id: 'rage-progression',
  name: 'Rage progression',
  kind: 'levelProgression',
  columns: [
    {
      id: 'uses',
      label: 'Rages',
      valueType: 'number',
      entries: [
        { level: 1, value: 2 },
        { level: 3, value: 3 },
        { level: 6, value: 4 },
      ],
    },
    {
      id: 'damage-bonus',
      label: 'Rage Damage',
      valueType: 'number',
      format: 'signed',
      entries: [
        { level: 1, value: 2 },
        { level: 9, value: 3 },
      ],
    },
  ],
}

export const martialArtsProgressionTableFixture: ProgressionTable = {
  id: 'martial-arts-progression',
  name: 'Martial Arts progression',
  kind: 'levelProgression',
  columns: [
    {
      id: 'die',
      label: 'Martial Arts',
      valueType: 'dice',
      entries: [
        { level: 1, value: { count: 1, faces: 6 } },
        { level: 5, value: { count: 1, faces: 8 } },
        { level: 11, value: { count: 1, faces: 10 } },
      ],
    },
  ],
}

export const mixedProgressionTableFixture: ProgressionTable = {
  id: 'mixed-progression',
  name: 'Mixed progression',
  kind: 'levelProgression',
  columns: [
    {
      id: 'uses',
      label: 'Uses',
      valueType: 'number',
      entries: [{ level: 1, value: 2 }],
    },
    {
      id: 'die',
      label: 'Die',
      valueType: 'dice',
      entries: [{ level: 1, value: { count: 1, faces: 6 } }],
    },
    {
      id: 'note',
      label: 'Note',
      valueType: 'text',
      entries: [{ level: 1, value: 'Special' }],
    },
  ],
}
