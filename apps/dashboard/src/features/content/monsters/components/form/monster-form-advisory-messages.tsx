import { SemanticText, Text } from '@rpg/ui'

/** Supporting-text rendering shared by monster editors that show form advisories. */
export function MonsterFormAdvisoryMessages({ messages }: { messages: readonly string[] }) {
  if (messages.length === 0) return null
  return (
    <>
      {messages.map((message) => (
        <Text key={message} as="p" variant="supporting">
          <SemanticText>{message}</SemanticText>
        </Text>
      ))}
    </>
  )
}
