import type { FormDisplayBlock, FormDisplayTextRole } from '../../field-config/display-config.types'
import { AdvisoryAlert } from '../../../components/ui/advisory-alert'
import { RulesPreview } from '../../../components/ui/rules-preview'
import { Text } from '../../../components/ui/text'
import { FormDisplayFeatureTableRow } from '../../display/form-display-feature-table-row.client'

function textVariantForRole(role: FormDisplayTextRole | undefined) {
  return role ?? 'supporting'
}

export function FormDisplayBlockView({ block }: { block: FormDisplayBlock }) {
  switch (block.variant) {
    case 'text':
      return (
        <Text
          variant={textVariantForRole(block.role)}
          as="p"
          {...(block.live === 'polite' ? { 'aria-live': 'polite' as const } : {})}
        >
          {block.text}
        </Text>
      )
    case 'notice':
      return <AdvisoryAlert {...block.notice} />
    case 'rulesPreview':
      return <RulesPreview {...block.preview} />
    case 'featureTableRow':
      return (
        <FormDisplayFeatureTableRow
          title={block.title}
          metadata={block.metadata}
          typeLabel={block.typeLabel}
        />
      )
    default: {
      const _exhaustive: never = block
      return _exhaustive
    }
  }
}
