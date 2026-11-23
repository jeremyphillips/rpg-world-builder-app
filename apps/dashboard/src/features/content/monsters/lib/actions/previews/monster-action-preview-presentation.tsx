import { RulesPreview, type RulesPreviewContent, type RulesPreviewProps } from '@rpg/ui'

type MonsterActionRulesPreviewProps = Pick<RulesPreviewProps, 'label' | 'title' | 'context'> & {
  content: RulesPreviewContent
}

export function MonsterActionRulesPreview({
  label,
  title,
  context,
  content,
}: MonsterActionRulesPreviewProps) {
  return (
    <RulesPreview
      {...(label !== undefined ? { label } : {})}
      title={title}
      context={context}
      content={content}
    />
  )
}

export function MonsterActionUnavailableRulesPreview({
  label,
  title,
  guidance,
}: {
  label?: string
  title?: string
  guidance: string
}) {
  return (
    <MonsterActionRulesPreview
      {...(label !== undefined ? { label } : {})}
      title={title}
      content={{ kind: 'guidance', message: guidance }}
    />
  )
}
