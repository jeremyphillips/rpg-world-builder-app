import { Text } from '@rpg/ui'

export type NameGeneratorMatchSummaryProps = {
  matchCount: number
  matchCountLabel: string
}

export function NameGeneratorMatchSummary({
  matchCount,
  matchCountLabel,
}: NameGeneratorMatchSummaryProps) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant={matchCount === 0 ? 'destructive' : 'muted'}>{matchCountLabel}</Text>
      {matchCount === 0 ? (
        <Text variant="muted" className="text-sm">
          Remove a filter or reset the view.
        </Text>
      ) : null}
    </div>
  )
}
