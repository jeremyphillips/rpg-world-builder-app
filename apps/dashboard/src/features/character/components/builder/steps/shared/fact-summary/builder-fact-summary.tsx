import type {
  BuilderFactSummaryIconKey,
  BuilderFactSummaryRow,
  GrantedProficiencySummaryRow,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, IconContainer } from '@rpg/ui'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  builderFactSummaryCategoryLabelClasses,
  builderFactSummaryGrantedRowClasses,
  builderFactSummaryGrantedRowsClasses,
  builderFactSummaryIconRowClasses,
  builderFactSummaryIconRowLabelClasses,
  builderFactSummaryIconRowSetValueClasses,
  builderFactSummaryIconRowUnsetValueClasses,
  builderFactSummaryIconRowsClasses,
  builderFactSummaryUnsetValueClasses,
  builderFactSummaryRowDividerClasses,
  builderFactSummaryRowsClasses,
  builderFactSummarySimpleLabelClasses,
  builderFactSummarySimpleRowClasses,
  builderFactSummarySimpleValueClasses,
  builderFactSummaryValueLabelsClasses,
} from './builder-fact-summary.variants'

export type BuilderFactSummarySimpleProps = {
  heading: string
  subhead?: string
  rows: readonly BuilderFactSummaryRow[]
  rowIcons?: Partial<Record<BuilderFactSummaryIconKey, LucideIcon>>
  showSourceColumn?: false
}

export type BuilderFactSummaryGrantedProps = {
  heading: string
  subhead?: string
  grantedRows: readonly GrantedProficiencySummaryRow[]
  showSourceColumn: true
  categoryIcons: Record<GrantedProficiencySummaryRow['kind'], LucideIcon>
}

export type BuilderFactSummaryProps = BuilderFactSummarySimpleProps | BuilderFactSummaryGrantedProps

type FactSummaryValueProps = {
  value?: string
  unsetText?: string
  setValueClassName: string
  unsetValueClassName: string
}

function FactSummaryValue({
  value,
  unsetText,
  setValueClassName,
  unsetValueClassName,
}: FactSummaryValueProps) {
  if (value) {
    return <p className={setValueClassName}>{value}</p>
  }

  if (unsetText) {
    return <p className={unsetValueClassName}>{unsetText}</p>
  }

  return null
}

type BuilderFactSummaryShellProps = {
  heading: string
  subhead?: string
  children: ReactNode
}

function BuilderFactSummaryShell({ heading, subhead, children }: BuilderFactSummaryShellProps) {
  return (
    <Card tone="subtle" density="comfortable">
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
        {subhead ? <CardDescription>{subhead}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function SimpleFactSummary({ heading, subhead, rows, rowIcons }: BuilderFactSummarySimpleProps) {
  if (rows.length === 0) return null

  const usesIconRows = rows.some((row) => row.icon && rowIcons?.[row.icon])

  return (
    <BuilderFactSummaryShell heading={heading} subhead={subhead}>
      {usesIconRows ? (
        <div className={builderFactSummaryIconRowsClasses}>
          {rows.map((row, index) => {
            const Icon = row.icon ? rowIcons?.[row.icon] : undefined
            if (!Icon) return null

            return (
              <div key={row.id}>
                <div className={builderFactSummaryIconRowClasses}>
                  <IconContainer shape="circle">
                    <Icon aria-hidden />
                  </IconContainer>
                  <p className={builderFactSummaryIconRowLabelClasses}>{row.label}</p>
                  <FactSummaryValue
                    value={row.value}
                    unsetText={row.unsetText}
                    setValueClassName={builderFactSummaryIconRowSetValueClasses}
                    unsetValueClassName={builderFactSummaryIconRowUnsetValueClasses}
                  />
                </div>
                {index < rows.length - 1 ? (
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
      ) : (
        <dl className={builderFactSummaryRowsClasses}>
          {rows.map((row) => (
            <div key={row.id} className={builderFactSummarySimpleRowClasses}>
              <dt className={builderFactSummarySimpleLabelClasses}>{row.label}</dt>
              <dd>
                <FactSummaryValue
                  value={row.value}
                  unsetText={row.unsetText}
                  setValueClassName={builderFactSummarySimpleValueClasses}
                  unsetValueClassName={builderFactSummaryUnsetValueClasses}
                />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </BuilderFactSummaryShell>
  )
}

function grantedRowDisplay(row: GrantedProficiencySummaryRow): {
  value?: string
  unsetText?: string
} {
  const valueLabels = row.sourceGroups.flatMap((group) => group.valueLabels)
  if (valueLabels.length > 0) {
    return { value: joinInlineMetadata(valueLabels) }
  }

  return { unsetText: row.sourceGroups.find((group) => group.unsetText)?.unsetText }
}

function GrantedFactSummary({
  heading,
  subhead,
  grantedRows,
  categoryIcons,
}: BuilderFactSummaryGrantedProps) {
  if (grantedRows.length === 0) return null

  return (
    <BuilderFactSummaryShell heading={heading} subhead={subhead}>
      <div className={builderFactSummaryGrantedRowsClasses}>
        {grantedRows.map((row, index) => {
          const Icon = categoryIcons[row.kind]
          const display = grantedRowDisplay(row)

          return (
            <div key={row.kind}>
              <div className={builderFactSummaryGrantedRowClasses}>
                <IconContainer shape="circle">
                  <Icon aria-hidden />
                </IconContainer>
                <p className={builderFactSummaryCategoryLabelClasses}>{row.label}</p>
                <FactSummaryValue
                  value={display.value}
                  unsetText={display.unsetText}
                  setValueClassName={builderFactSummaryValueLabelsClasses}
                  unsetValueClassName={builderFactSummaryUnsetValueClasses}
                />
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
    </BuilderFactSummaryShell>
  )
}

export function BuilderFactSummary(props: BuilderFactSummaryProps) {
  if (props.showSourceColumn) {
    return <GrantedFactSummary {...props} />
  }
  return <SimpleFactSummary {...props} />
}
