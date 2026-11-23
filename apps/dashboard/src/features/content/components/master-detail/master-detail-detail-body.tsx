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

export type MasterDetailDetailBodyProps = {
  leadingItemFields?: readonly FormItem[]
  primaryItemFields: readonly FormItem[]
  facing?: FacingHostConfig
  idPrefix: string
  selectedFieldId: string
  namePrefix: string
  /** Domain composites that must sit inside the outer rhythm stack after primary fields. */
  additionalDetails?: ReactNode
  renderPrimary?: (ctx: { namePrefix: string }) => ReactNode
}

function DetailBodyFormItems({
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
    <MasterDetailDetailFormScope>
      <FormItems
        items={wrapMasterDetailDetailFields(items)}
        idPrefix={`${idPrefix}-${selectedFieldId}-${region}`}
        namePrefix={namePrefix}
      />
    </MasterDetailDetailFormScope>
  )
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
  renderPrimary,
}: MasterDetailDetailBodyProps) {
  const hasLeading = Boolean(leadingItemFields?.length)
  const hasPrimary = primaryItemFields.length > 0 || Boolean(renderPrimary)

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
      {renderPrimary ? (
        <MasterDetailDetailFormScope>{renderPrimary({ namePrefix })}</MasterDetailDetailFormScope>
      ) : (
        <DetailBodyFormItems
          items={primaryItemFields}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          namePrefix={namePrefix}
          region="primary"
        />
      )}
      {additionalDetails ?? null}
    </FormRhythmStack>
  )
}
