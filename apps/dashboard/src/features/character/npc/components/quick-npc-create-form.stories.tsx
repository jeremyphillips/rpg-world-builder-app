import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { QuickNpcAuthoringForm } from './quick-npc-authoring-form.client'

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

const setup = {
  speciesId: populatedBuilderCatalog.species[0]!.id,
  classId: populatedBuilderCatalog.classes[0]!.id,
  level: 1,
}

const setupSummaryLine = 'Dwarf · Level 1 Fighter'

const meta = {
  title: 'Dashboard/Character/QuickNpcAuthoringForm',
  component: QuickNpcAuthoringForm,
  parameters: { layout: 'padded' },
  args: {
    campaignId: 'campaign-test-1',
    buildContext,
    organization,
    setup,
    setupSummaryLine,
    onCancel: () => undefined,
    onChangeSetup: () => undefined,
    onCreated: () => undefined,
  },
} satisfies Meta<typeof QuickNpcAuthoringForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

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

export const ResolutionError: Story = {
  args: {
    buildContext: createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [unsatisfiableClass],
        organizations: buildContext.catalog.organizations,
      },
    }),
    setup: {
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: unsatisfiableClass.id,
      level: 1,
    },
    initialValues: {
      name: 'Stalled Recruit',
      alignment: 'ln',
      membershipTitle: 'Guildmaster',
      requiredWeaponIds: [],
      requiredSpellIds: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Create NPC' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(/choose at least 2 options/i)
  },
}
