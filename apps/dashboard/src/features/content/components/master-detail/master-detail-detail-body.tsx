import type { ReactNode } from 'react'
import { FormItems, FormRhythmStack, type FormItem } from '@rpg/ui/form'

import type { FacingHostConfig } from '../../facing/facing-host-config.types'
import { StructuredFacingHostPanel } from '../../facing/structured-facing-host-panel'
import { MasterDetailDetailFormScope } from '../../lib/master-detail/master-detail-detail-form-scope'
import { wrapMasterDetailDetailFields } from '../../lib/master-detail/wrap-master-detail-detail-fields'

export type MasterDetailItemFieldSections = {
  /** Rendered above the facing preview when both are present. */
  leading?: readonly FormItem[]
  primary: readonly FormItem[]
}

export type MasterDetailPrimaryScopeProps = {
  namePrefix: string
  children: ReactNode
}

export type MasterDetailDetailBodyProps = {
  leadingItemFields?: readonly FormItem[]
  primaryItemFields: readonly FormItem[]
  facing?: FacingHostConfig
  idPrefix: string
  selectedFieldId: string
  namePrefix: string
  /** Domain composites that must sit inside the outer rhythm stack after primary fields. */
  additionalDetails?: ReactNode
  /**
   * Wraps shell-owned primary `FormItems` (context + drawer only — must render `children` unchanged).
   */
  primaryScope?: (ctx: MasterDetailPrimaryScopeProps) => ReactNode
}

function DetailBodyFormItemsContent({
  items,
  idPrefix,
  selectedFieldId,
  namePrefix,
  region,
}: {
  items: readonly FormItem[]
  idPrefix: string
  selectedFieldId: string
  namePrefix: string
  region: 'leading' | 'primary'
}) {
  if (items.length === 0) return null
  return (
    <FormItems
      items={wrapMasterDetailDetailFields(items)}
      idPrefix={`${idPrefix}-${selectedFieldId}-${region}`}
      namePrefix={namePrefix}
    />
  )
}

function DetailBodyFormItems(props: Parameters<typeof DetailBodyFormItemsContent>[0]) {
  const content = DetailBodyFormItemsContent(props)
  if (!content) return null
  return <MasterDetailDetailFormScope>{content}</MasterDetailDetailFormScope>
}

function DetailBodyPrimaryRegion({
  primaryItemFields,
  idPrefix,
  selectedFieldId,
  namePrefix,
  primaryScope,
}: Pick<
  MasterDetailDetailBodyProps,
  'primaryItemFields' | 'idPrefix' | 'selectedFieldId' | 'namePrefix' | 'primaryScope'
>) {
  const primaryFormItems = DetailBodyFormItemsContent({
    items: primaryItemFields,
    idPrefix,
    selectedFieldId,
    namePrefix,
    region: 'primary',
  })
  if (!primaryFormItems) return null

  const scoped = primaryScope
    ? primaryScope({ namePrefix, children: primaryFormItems })
    : primaryFormItems
  return <MasterDetailDetailFormScope>{scoped}</MasterDetailDetailFormScope>
}

/**
 * Canonical structured-row detail body: one outer `FormRhythmStack` for leading fields,
 * facing preview, and primary fields. The shell owns spacing; domains supply slot content.
 */
export function MasterDetailDetailBody({
  leadingItemFields,
  primaryItemFields,
  facing,
  idPrefix,
  selectedFieldId,
  namePrefix,
  additionalDetails,
  primaryScope,
}: MasterDetailDetailBodyProps) {
  const hasLeading = Boolean(leadingItemFields?.length)
  const hasPrimary = primaryItemFields.length > 0

  if (!hasLeading && !facing && !hasPrimary && !additionalDetails) {
    return null
  }

  return (
    <FormRhythmStack>
      {hasLeading ? (
        <DetailBodyFormItems
          items={leadingItemFields!}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          namePrefix={namePrefix}
          region="leading"
        />
      ) : null}
      {facing ? <StructuredFacingHostPanel facing={facing} /> : null}
      {hasPrimary ? (
        <DetailBodyPrimaryRegion
          primaryItemFields={primaryItemFields}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          namePrefix={namePrefix}
          primaryScope={primaryScope}
        />
      ) : null}
      {additionalDetails ?? null}
    </FormRhythmStack>
  )
}
