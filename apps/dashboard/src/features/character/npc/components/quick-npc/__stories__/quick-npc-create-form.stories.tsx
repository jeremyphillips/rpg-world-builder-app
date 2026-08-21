import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../../lib/fixtures/character-builder-fixtures'
import {
  quickNpcMemberSetupWithNoTitle,
  quickNpcOrganizationMemberCreateContext,
  quickNpcTestOrganization,
} from '../../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcAuthoringForm } from '../quick-npc-authoring-form'

const createContext = quickNpcOrganizationMemberCreateContext(quickNpcTestOrganization)

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    organizations: [
      {
        id: createContext.organization.id,
        slug: 'lantern-guild',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'campaign-test-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: createContext.organization.name,
        organizationDomain: createContext.organization.organizationDomain,
        functions: [],
        practices: [],
        members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
        connections: { locations: [] },
      },
    ],
  },
})

const setup = quickNpcMemberSetupWithNoTitle({
  speciesId: populatedBuilderCatalog.species[0]!.id,
  classId: populatedBuilderCatalog.classes[0]!.id,
  level: 1,
})

const meta = {
  title: 'Dashboard/Character/QuickNpcAuthoringForm',
  component: QuickNpcAuthoringForm,
  parameters: { layout: 'padded' },
  args: {
    campaignId: 'campaign-test-1',
    buildContext,
    createContext,
    setup,
    onCancel: () => undefined,
    onChangeSetup: () => undefined,
    onSetupSummaryEdit: () => undefined,
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
    setup: quickNpcMemberSetupWithNoTitle({
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: unsatisfiableClass.id,
      level: 1,
    }),
    initialValues: {
      name: 'Stalled Recruit',
      alignment: 'ln',
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
