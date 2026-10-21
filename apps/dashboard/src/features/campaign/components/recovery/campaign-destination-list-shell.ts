import type { DestinationListProps } from '@rpg/ui'

/** Spacious list density for campaign destination rows, including entry badges. */
export const CAMPAIGN_DESTINATION_LIST_DENSITY = 'spacious' as const

/** Shared filled list chrome for campaign recovery destination groups. */
export const campaignDestinationListProps: Pick<
  DestinationListProps,
  'appearance' | 'tone' | 'elevation' | 'density'
> = {
  appearance: 'filled',
  tone: 'strong',
  elevation: 'subtle',
  density: CAMPAIGN_DESTINATION_LIST_DENSITY,
}
