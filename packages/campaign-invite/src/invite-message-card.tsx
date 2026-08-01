import { Heading, Text } from '@rpg/ui'

export function InviteMessageCard({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-6 py-12 text-center">
      <Heading variant="page" as="h1">
        {title}
      </Heading>
      <Text variant="muted">{body}</Text>
      {action ? <div className="flex flex-col items-stretch gap-3 pt-2">{action}</div> : null}
    </div>
  )
}
