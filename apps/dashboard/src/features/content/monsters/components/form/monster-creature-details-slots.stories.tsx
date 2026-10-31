import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterCreatureDetailsSkillsSlot } from './monster-creature-details-skills-slot'
import {
  MonsterCreatureDetailsLanguagesSlot,
  MonsterCreatureDetailsSensesSlot,
  MonsterTelepathyRangeField,
} from './monster-creature-details-slots'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'

const mockCtx: ContentFormCtx = {
  campaignId: 'campaign-1',
  skillCatalogStatus: 'ready',
  senseVocabulary: {
    activeIds: new Set(['darkvision', 'blindsight']),
    labelById: { darkvision: 'Darkvision', blindsight: 'Blindsight' },
  },
  languageVocabulary: {
    activeIds: new Set(['common', 'draconic']),
    labelById: { common: 'Common', draconic: 'Draconic' },
    categoryById: {},
  },
  creatureTypeVocabulary: {
    activeIds: new Set(['dragon']),
    labelById: { dragon: 'Dragon' },
    languageAffinitiesById: { dragon: ['draconic'] },
  },
  options: {
    skills: {
      visible: [
        {
          id: 'stealth',
          slug: 'stealth',
          name: 'Stealth',
          description: 'Make a Dexterity (Stealth) check.',
          ability: 'dex',
          catalogLayer: 'system',
        } as never,
      ],
    } as never,
  },
  equipmentCatalogStatus: 'ready',
}

function FormHarness({
  children,
  defaultValues,
}: {
  children: ReactNode
  defaultValues: Partial<MonsterFormValues>
}) {
  const form = useForm<MonsterFormValues>({ defaultValues: defaultValues as MonsterFormValues })
  return <FormProvider {...form}>{children}</FormProvider>
}

const meta = {
  title: 'Features/Content/Monsters/Creature details slots',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj

export const SkillRows: Story = {
  render: () => (
    <FormHarness
      defaultValues={{
        abilityScores: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 },
        proficiencies: {
          skills: [{ skill: 'stealth', rank: 'proficient' }],
          savingThrows: [],
          languages: [],
          weapons: { categories: [], items: [] },
        },
        challengeRating: '1',
      }}
    >
      <MonsterCreatureDetailsSkillsSlot ctx={mockCtx} />
    </FormHarness>
  ),
}

export const SkillRowsWithoutChallengeRating: Story = {
  render: () => (
    <FormHarness
      defaultValues={{
        abilityScores: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 },
        proficiencies: {
          skills: [{ skill: 'stealth', rank: 'proficient' }],
          savingThrows: [],
          languages: [],
          weapons: { categories: [], items: [] },
        },
      }}
    >
      <MonsterCreatureDetailsSkillsSlot ctx={mockCtx} />
    </FormHarness>
  ),
}

export const SenseRows: Story = {
  render: () => (
    <FormHarness defaultValues={{ senses: [{ type: 'darkvision', range: 60 }] }}>
      <MonsterCreatureDetailsSensesSlot ctx={mockCtx} />
    </FormHarness>
  ),
}

export const TelepathyRange: Story = {
  render: () => (
    <FormHarness defaultValues={{ communication: { telepathy: 5280 } }}>
      <MonsterTelepathyRangeField />
    </FormHarness>
  ),
}

export const LanguageRows: Story = {
  render: () => (
    <FormHarness
      defaultValues={{
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [{ language: 'common' }],
          weapons: { categories: [], items: [] },
        },
      }}
    >
      <MonsterCreatureDetailsLanguagesSlot ctx={mockCtx} />
    </FormHarness>
  ),
}

export const LanguageRecommendation: Story = {
  render: () => (
    <FormHarness
      defaultValues={{
        creatureType: 'dragon',
        proficiencies: {
          savingThrows: [],
          skills: [],
          languages: [],
          weapons: { categories: [], items: [] },
        },
      }}
    >
      <MonsterCreatureDetailsLanguagesSlot ctx={mockCtx} />
    </FormHarness>
  ),
}
