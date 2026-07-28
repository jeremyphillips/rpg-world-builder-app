import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import { formatFieldMessage } from '../../../../validation/define-message'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { builderTestContext } from '../test-fixtures'
import { minimalStartingWealthSeedCoveringStandardMax } from '../../../../test/fixtures/starting-wealth-minimal'
import { resolveCharacterCreationPatch } from '../../../campaign/patches/campaign-character-creation-patch'
import { magicItemGrantIncompleteIssueCode } from '../resolvers/equipment/resolve-equipment-magic-item-grant-step-issues'
import { validateEquipment } from './validate-equipment'

const commonPotion = equipmentSchema.parse({
  id: 'srd-cc-5.2.1:potion-of-healing',
  slug: 'potion-of-healing',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Potion of Healing',
  description: '',
  kind: 'magic_item',
  rarity: 'common',
  magicItemCategory: 'potion',
  cost: { amount: 50, currency: 'gp' },
  weight: { value: 0.5, unit: 'lb' },
})

describe('validateEquipment', () => {
  it('emits one issue per unfilled exact allowance', () => {
    const context = {
      ...builderTestContext,
      characterCreationRules: {
        ...builderTestContext.characterCreationRules,
        ...resolveCharacterCreationPatch(undefined, minimalStartingWealthSeedCoveringStandardMax),
      },
      catalog: {
        ...builderTestContext.catalog,
        equipment: [commonPotion],
      },
    }

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 2 },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
        magicItemSelections: [],
      },
    }

    const issues = validateEquipment(draft, context)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      stepId: 'equipment',
      allowanceId: expect.stringContaining(':common'),
      code: magicItemGrantIncompleteIssueCode(issues[0]!.allowanceId!),
      message: formatFieldMessage(
        characterBuilderValidationMessages.magicItemGrantIncomplete({
          rarityLabel: 'Common',
          remaining: 1,
        }),
      ),
    })
  })
})
