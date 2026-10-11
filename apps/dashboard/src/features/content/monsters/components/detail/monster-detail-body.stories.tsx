import type { Meta, StoryObj } from '@storybook/react-vite'

import { pickEquipment, pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

import {
  buildMonsterDetailViewModel,
  buildMonsterEquipmentCatalog,
  tryDeriveMonsterStatBlock,
} from '../../lib/monster-display'
import { MonsterDetailBody } from './monster-detail-body'

const monster = pickMonster('kobold-warrior')
const equipment = [pickEquipment('dagger')]
const derived = tryDeriveMonsterStatBlock(monster, equipment, [pickSkillProficiency('perception')])

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterDetailBody',
  component: MonsterDetailBody,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MonsterDetailBody>

export default meta

type Story = StoryObj<typeof meta>

export const KoboldWarrior: Story = {
  args: {
    name: monster.name,
    imageName: monster.name,
    campaignId: 'camp_story',
    displayFallback: 'monster',
    descriptionHtml: monster.description,
    viewModel: buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: buildMonsterEquipmentCatalog(equipment),
      catalogState: 'ready',
      derived,
    }),
  },
}
