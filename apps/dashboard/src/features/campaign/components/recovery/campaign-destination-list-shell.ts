import type { DestinationListProps } from '@rpg/ui'

/** Shared filled list chrome for campaign recovery destination groups. */
export const campaignDestinationListProps: Pick<
  DestinationListProps,
  'appearance' | 'tone' | 'elevation'
> = {
  appearance: 'filled',
  tone: 'strong',
  elevation: 'subtle',
}
