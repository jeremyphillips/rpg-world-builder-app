'use client'

import { Card } from '../../components/ui/card'
import {
  EntityRowInlineBadge,
  EntityRowInlineDensityProvider,
} from '../../components/ui/entity-row-inline-badge.client'
import { Icon } from '../../components/ui/icon/icon'
import { IconContainer } from '../../components/ui/icon-container.client'
import { IdentityRow } from '../../components/ui/identity-row.client'
import type { FormDisplayFeatureTableRowBlock } from '../field-config/display-config.types'

export function FormDisplayFeatureTableRow({
  title,
  metadata,
  typeLabel,
}: Omit<FormDisplayFeatureTableRowBlock, 'variant'>) {
  const lead = (
    <IconContainer>
      <Icon name="table" size="owner" />
    </IconContainer>
  )

  return (
    <Card tone="subtle" density="compact" leadMedia={lead}>
      <EntityRowInlineDensityProvider density="compact">
        <IdentityRow
          density="compact"
          heading={title}
          supporting={metadata}
          status={
            typeLabel ? (
              <EntityRowInlineBadge appearance="soft" tone="info">
                {typeLabel}
              </EntityRowInlineBadge>
            ) : undefined
          }
        />
      </EntityRowInlineDensityProvider>
    </Card>
  )
}
