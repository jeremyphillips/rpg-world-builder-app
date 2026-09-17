import type { ContentTable } from '@rpg/contracts'
import { Heading, RichTextContent } from '@rpg/ui'

import { ContentTableView } from '../../../components/tables/content-table-view'

type ClassFeatureItemProps = {
  feature: {
    level: number
    name: string
    description?: string
    tables?: readonly ContentTable[]
  }
}

function featureHeading(level: number, name: string): string {
  return `Level ${level}: ${name}`
}

function hasFeatureDescription(description: string | undefined): description is string {
  return description !== undefined && description.trim() !== ''
}

export function ClassFeatureItem({ feature }: ClassFeatureItemProps) {
  const heading = featureHeading(feature.level, feature.name)
  // Progression tables aggregate on ClassProgressionTable; inline render is for general tables only.
  const inlineTables = (feature.tables ?? []).filter((table) => table.kind === 'general')

  return (
    <li className="space-y-2">
      <Heading variant="label" as="h3">
        {heading}
      </Heading>
      {hasFeatureDescription(feature.description) && (
        <RichTextContent html={feature.description} size="md" tone="muted" />
      )}
      {inlineTables.length > 0 ? (
        <div className="space-y-4">
          {inlineTables.map((table) => (
            <ContentTableView key={table.id} table={table} />
          ))}
        </div>
      ) : null}
    </li>
  )
}
