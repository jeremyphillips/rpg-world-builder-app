import { SemanticText, Text, type SemanticTextProps } from '@rpg/ui'

type CharacterImportSemanticTextProps = SemanticTextProps & {
  /** Preview values use supporting (14px); metadata lines use caption (12px). */
  typography?: 'supporting' | 'caption'
}

export function CharacterImportSemanticText({
  typography = 'supporting',
  ...props
}: CharacterImportSemanticTextProps) {
  return (
    <Text as="span" variant={typography}>
      <SemanticText {...props} />
    </Text>
  )
}
