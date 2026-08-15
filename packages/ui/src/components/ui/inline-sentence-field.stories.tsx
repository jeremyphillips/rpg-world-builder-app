import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineSentenceField } from './inline-sentence-field.client'

const meta = {
  title: 'UI/InlineSentenceField',
  component: InlineSentenceField,
  parameters: { layout: 'padded' },
  args: {
    id: 'inline-sentence',
    label: 'Granted at',
    labelVisibility: 'srOnly',
    segments: [
      { kind: 'text', value: 'Granted at', tone: 'label' },
      {
        kind: 'select',
        name: 'unlockLevel',
        options: [
          { value: 'default', label: 'When feature is gained' },
          { value: '4', label: 'Level 4' },
        ],
        width: 'lg',
      },
    ],
    controls: [
      {
        kind: 'select',
        id: 'unlock-level',
        name: 'unlockLevel',
        value: 'default',
        options: [
          { value: 'default', label: 'When feature is gained' },
          { value: '4', label: 'Level 4' },
        ],
        width: 'lg',
        ariaLabel: 'Granted at',
        onChange: action('onUnlockChange'),
      },
    ],
  },
} satisfies Meta<typeof InlineSentenceField>

export default meta
type Story = StoryObj<typeof meta>

export const SelectOnly: Story = {}

export const NumberAndSelect: Story = {
  args: {
    id: 'equipment-choose',
    label: 'Equipment choice',
    labelVisibility: 'srOnly',
    segments: [
      { kind: 'text', value: 'Character chooses', tone: 'label' },
      { kind: 'number', name: 'choose' },
      { kind: 'text', value: 'item(s) from', tone: 'label' },
      { kind: 'select', name: 'poolSource', options: [] },
    ],
    controls: [
      {
        kind: 'number',
        id: 'choose-count',
        name: 'choose',
        value: 1,
        min: 1,
        digits: 1,
        onChange: action('onChooseChange'),
      },
      {
        kind: 'select',
        id: 'pool-source',
        name: 'poolSource',
        value: 'filtered',
        options: [
          { value: 'filtered', label: 'A category of equipment' },
          { value: 'explicit', label: 'A list of specific items' },
        ],
        ariaLabel: 'Pool source',
        onChange: action('onPoolSourceChange'),
      },
    ],
  },
}

export const WithBelowChips: Story = {
  args: {
    id: 'skill-proficiencies',
    label: 'Skill proficiencies',
    labelVisibility: 'srOnly',
    segments: [
      { kind: 'text', value: 'Character chooses', tone: 'label' },
      { kind: 'number', name: 'choose' },
      { kind: 'text', value: 'Skill Proficiencies from:', tone: 'label' },
    ],
    controls: [
      {
        kind: 'number',
        id: 'choose-count',
        name: 'choose',
        value: 2,
        min: 0,
        digits: 1,
        onChange: action('onChooseChange'),
      },
    ],
    below: {
      kind: 'chips',
      name: 'skills',
      options: [
        { value: 'athletics', label: 'Athletics' },
        { value: 'stealth', label: 'Stealth' },
      ],
    },
    belowControl: {
      kind: 'chips',
      id: 'skills',
      name: 'skills',
      value: ['athletics'],
      options: [
        { value: 'athletics', label: 'Athletics' },
        { value: 'stealth', label: 'Stealth' },
      ],
      onChange: action('onSkillsChange'),
    },
  },
}
