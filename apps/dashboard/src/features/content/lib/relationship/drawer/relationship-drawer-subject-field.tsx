import { Heading, Text } from '@rpg/ui'

export type RelationshipDrawerSubjectFieldProps = {
  label: string
  value: string
}

export function RelationshipDrawerSubjectField({
  label,
  value,
}: RelationshipDrawerSubjectFieldProps) {
  return (
    <div className="space-y-1">
      <Heading variant="label" as="p">
        {label}
      </Heading>
      <Text>{value}</Text>
    </div>
  )
}
