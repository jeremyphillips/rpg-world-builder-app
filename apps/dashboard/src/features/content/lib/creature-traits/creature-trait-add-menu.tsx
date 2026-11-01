import {
  DEFAULT_SYSTEM_RULESET_ID,
  getCreatureTraitTemplate,
  listCreatureTraitTemplatesForRuleset,
} from '@rpg/contracts'
import { ActionIcon, ButtonDropdown } from '@rpg/ui'

const TEMPLATE_GROUP_ID = 'templates'
const CUSTOM_GROUP_ID = 'custom'
const CUSTOM_ITEM_ID = 'custom'

export function creatureTraitTemplateRow(templateId: string, id: string): Record<string, unknown> {
  const config = templateId === 'legendary-resistance' ? { uses: 3 } : undefined
  return {
    id,
    kind: 'template',
    templateId,
    ...(config ? { config } : {}),
  }
}

export function CreatureTraitAddMenu({
  label,
  rulesetId,
  onCustom,
  onTemplate,
}: {
  label: string
  rulesetId?: string
  onCustom: () => void
  onTemplate: (templateId: string) => void
}) {
  const templateIds = listCreatureTraitTemplatesForRuleset(rulesetId ?? DEFAULT_SYSTEM_RULESET_ID)
  return (
    <ButtonDropdown
      label={label}
      leadingIcon={<ActionIcon action="add" size="sm" />}
      width="fit"
      size="sm"
      variant="outline"
      groups={[
        { id: TEMPLATE_GROUP_ID, label: 'Templates' },
        { id: CUSTOM_GROUP_ID, label: 'Custom' },
      ]}
      items={[
        ...templateIds.map((templateId) => ({
          id: `template:${templateId}`,
          label: getCreatureTraitTemplate(templateId)?.label ?? templateId,
          groupId: TEMPLATE_GROUP_ID,
        })),
        { id: CUSTOM_ITEM_ID, label: 'Custom trait', groupId: CUSTOM_GROUP_ID },
      ]}
      onSelectItem={(itemId) => {
        if (itemId === CUSTOM_ITEM_ID) {
          onCustom()
          return
        }
        if (itemId.startsWith('template:')) onTemplate(itemId.slice('template:'.length))
      }}
    />
  )
}
