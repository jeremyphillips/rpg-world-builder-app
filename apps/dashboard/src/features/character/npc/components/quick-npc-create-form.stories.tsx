import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { QuickNpcCreateForm } from './quick-npc-create-form.client'

const organization = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationKind: 'professional' as const,
}

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    organizations: [
      {
        id: organization.id,
        slug: 'lantern-guild',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'campaign-test-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: organization.name,
        organizationKind: organization.organizationKind,
        connections: { locations: [] },
      },
    ],
  },
})

const meta = {
  title: 'Dashboard/Character/QuickNpcCreateForm',
  component: QuickNpcCreateForm,
  parameters: { layout: 'padded' },
  args: {
    campaignId: 'campaign-test-1',
    buildContext,
    organization,
    onBack: () => undefined,
    onCreated: () => undefined,
  },
} satisfies Meta<typeof QuickNpcCreateForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Values restored after returning from the picker view in the same drawer session. */
export const RestoredSession: Story = {
  args: {
    initialValues: {
      name: 'Guild Quartermaster',
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: populatedBuilderCatalog.classes[0]!.id,
      level: 3,
      alignment: 'ln',
      membershipTitle: 'Guildmaster',
    },
  },
}

/** Class requiring two skills with only one authored option — automatic resolution cannot satisfy it. */
const unsatisfiableClass = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics'] }],
      },
    },
  },
}

/** Submission fails automatic resolution — builder issues surface as the inline form error. */
export const ResolutionError: Story = {
  args: {
    buildContext: createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [unsatisfiableClass],
        organizations: buildContext.catalog.organizations,
      },
    }),
    initialValues: {
      name: 'Stalled Recruit',
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: unsatisfiableClass.id,
      level: 1,
      alignment: 'ln',
      membershipTitle: 'Guildmaster',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Create NPC' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(/choose at least 2 options/i)
  },
}
