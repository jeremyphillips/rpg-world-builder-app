import type { BuilderFactSummaryRow, GrantedProficiencySummaryRow } from '@rpg/contracts'
import { cn, Heading, IconContainer, Text } from '@rpg/ui'
import type { LucideIcon } from 'lucide-react'

import {
  builderFactSummaryCategoryLabelClasses,
  builderFactSummaryClasses,
  builderFactSummaryDividerClasses,
  builderFactSummaryGrantedRowClasses,
  builderFactSummaryGrantedRowsClasses,
  builderFactSummaryHeaderClasses,
  builderFactSummaryRowDividerClasses,
  builderFactSummaryRowsClasses,
  builderFactSummarySimpleLabelClasses,
  builderFactSummarySimpleRowClasses,
  builderFactSummarySimpleValueClasses,
  builderFactSummarySourceGroupClasses,
  builderFactSummarySourceGroupsClasses,
  builderFactSummarySourceLabelClasses,
  builderFactSummaryStackedSourceGroupClasses,
  builderFactSummaryValueLabelsClasses,
} from './builder-fact-summary.variants'

export type BuilderFactSummarySimpleProps = {
  heading: string
  subhead?: string
  rows: readonly BuilderFactSummaryRow[]
  showSourceColumn?: false
}

export type BuilderFactSummaryGrantedProps = {
  heading: string
  subhead?: string
  grantedRows: readonly GrantedProficiencySummaryRow[]
  showSourceColumn: true
  sourceWidthStyle?: React.CSSProperties
  measureSlot?: React.ReactNode
  categoryIcons: Record<GrantedProficiencySummaryRow['kind'], LucideIcon>
}

export type BuilderFactSummaryProps = BuilderFactSummarySimpleProps | BuilderFactSummaryGrantedProps

function SimpleFactSummary({ heading, subhead, rows }: BuilderFactSummarySimpleProps) {
  if (rows.length === 0) return null

  return (
    <section aria-labelledby="builder-fact-summary-heading" className={builderFactSummaryClasses}>
      <div className={builderFactSummaryHeaderClasses}>
        <Heading variant="subsection" as="h3" id="builder-fact-summary-heading">
          {heading}
        </Heading>
        {subhead ? (
          <Text as="p" variant="muted">
            {subhead}
          </Text>
        ) : null}
      </div>

      <div className={builderFactSummaryDividerClasses} role="presentation" aria-hidden />

      <dl className={builderFactSummaryRowsClasses}>
        {rows.map((row) => (
          <div key={row.id} className={builderFactSummarySimpleRowClasses}>
            <dt className={builderFactSummarySimpleLabelClasses}>{row.label}</dt>
            <dd className={builderFactSummarySimpleValueClasses}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function GrantedFactSummary({
  heading,
  subhead,
  grantedRows,
  sourceWidthStyle,
  measureSlot,
  categoryIcons,
}: BuilderFactSummaryGrantedProps) {
  if (grantedRows.length === 0) return null

  return (
    <section
      aria-labelledby="builder-fact-summary-heading"
      className={builderFactSummaryClasses}
      style={sourceWidthStyle}
    >
      {measureSlot}
      <div className={builderFactSummaryHeaderClasses}>
        <Heading variant="subsection" as="h3" id="builder-fact-summary-heading">
          {heading}
        </Heading>
        {subhead ? (
          <Text as="p" variant="muted">
            {subhead}
          </Text>
        ) : null}
      </div>

      <div className={builderFactSummaryDividerClasses} role="presentation" aria-hidden />

      <div className={builderFactSummaryGrantedRowsClasses}>
        {grantedRows.map((row, index) => {
          const Icon = categoryIcons[row.kind]
          const hasMultipleSourceGroups = row.sourceGroups.length > 1

          return (
            <div key={row.kind}>
              <div className={builderFactSummaryGrantedRowClasses}>
                <IconContainer shape="circle">
                  <Icon aria-hidden />
                </IconContainer>
                <p className={builderFactSummaryCategoryLabelClasses}>{row.label}</p>
                <div className={builderFactSummarySourceGroupsClasses}>
                  {row.sourceGroups.map((sourceGroup) => (
                    <div
                      key={`${row.kind}:${sourceGroup.sourceLabel}`}
                      className={cn(
                        builderFactSummarySourceGroupClasses,
                        hasMultipleSourceGroups && builderFactSummaryStackedSourceGroupClasses,
                      )}
                    >
                      <p className={builderFactSummaryValueLabelsClasses}>
                        {sourceGroup.valueLabels.join(' · ')}
                      </p>
                      <p className={builderFactSummarySourceLabelClasses}>
                        {sourceGroup.sourceLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {index < grantedRows.length - 1 ? (
                <div
                  className={builderFactSummaryRowDividerClasses}
                  role="presentation"
                  aria-hidden
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function BuilderFactSummary(props: BuilderFactSummaryProps) {
  if (props.showSourceColumn) {
    return <GrantedFactSummary {...props} />
  }
  return <SimpleFactSummary {...props} />
}
