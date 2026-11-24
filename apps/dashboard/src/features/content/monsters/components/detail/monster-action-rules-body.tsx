import type { StatBlockProse, StatBlockProseDocument } from '@rpg/contracts'
import { RichTextContent, StatBlockProseView, Text } from '@rpg/ui'

import { contentDetailProseProps } from '../../../lib/detail/page/content-detail-prose'

export type MonsterActionRulesBodyFields = {
  triggerProse?: StatBlockProse
  responseAttackProse?: StatBlockProse
  responseLeadProse?: StatBlockProse
  rulesProse?: StatBlockProseDocument
  descriptionHtml?: string
}

/** Shared mechanical rules body for monster detail and form previews. */
export function MonsterActionRulesBody({ item }: { item: MonsterActionRulesBodyFields }) {
  return (
    <>
      {item.triggerProse ? (
        <Text as="div" variant="body-compact">
          <StatBlockProseView prose={item.triggerProse} />
        </Text>
      ) : null}
      {item.responseAttackProse ? (
        <Text as="div" variant="body-compact">
          <StatBlockProseView prose={item.responseAttackProse} />
        </Text>
      ) : null}
      {item.responseLeadProse ? (
        <Text as="div" variant="body-compact">
          <StatBlockProseView prose={item.responseLeadProse} />
        </Text>
      ) : null}
      {item.rulesProse && item.rulesProse.length > 0 ? (
        <Text as="div" variant="body-compact">
          <StatBlockProseView document={item.rulesProse} />
        </Text>
      ) : null}
      {item.descriptionHtml ? (
        <RichTextContent html={item.descriptionHtml} {...contentDetailProseProps} />
      ) : null}
    </>
  )
}
