import type { Spell } from '@rpg/contracts'
import {
  collectActiveFormItemBindings,
  findFormItemBindingConflict,
  FormItems,
  FormRhythmStack,
  type FormItem,
} from '@rpg/ui/form'
import { useWatch } from 'react-hook-form'

import type { FacingHostConfig } from '../../facing/facing-host-config.types'
import { StructuredFacingHostPanel } from '../../facing/structured-facing-host-panel'
import { MonsterSpellPickerHost } from '../../monsters/components/form/spells/spell-picker-host'
import { MasterDetailDetailFormScope } from '../../lib/master-detail/master-detail-detail-form-scope'
import type { MasterDetailInlineTitle } from '../../lib/master-detail/master-detail-inline-title.types'
import { wrapMasterDetailDetailFields } from '../../lib/master-detail/wrap-master-detail-detail-fields'

export type MasterDetailItemFieldSections = {
  leading?: readonly FormItem[]
  primary: readonly FormItem[]
}

export type MasterDetailSpellPicker = {
  enabled: boolean
  catalog: ReadonlyMap<string, Spell> | undefined
}

export type MasterDetailDetailBodyProps = {
  leadingItemFields?: readonly FormItem[]
  primaryItemFields: readonly FormItem[]
  facing?: FacingHostConfig
  idPrefix: string
  selectedFieldId: string
  namePrefix: string
  inlineTitleField?: MasterDetailInlineTitle['field']
  spellPicker?: MasterDetailSpellPicker
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
  spellPicker,
}: Pick<
  MasterDetailDetailBodyProps,
  'primaryItemFields' | 'idPrefix' | 'selectedFieldId' | 'namePrefix' | 'spellPicker'
>) {
  const primaryFormItems = DetailBodyFormItemsContent({
    items: primaryItemFields,
    idPrefix,
    selectedFieldId,
    namePrefix,
    region: 'primary',
  })
  if (!primaryFormItems) return null

  return (
    <MasterDetailDetailFormScope>
      {spellPicker ? (
        <MonsterSpellPickerHost
          enabled={spellPicker.enabled}
          arrayName={`${namePrefix}.spells`}
          catalog={spellPicker.catalog}
        >
          {primaryFormItems}
        </MonsterSpellPickerHost>
      ) : (
        primaryFormItems
      )}
    </MasterDetailDetailFormScope>
  )
}

function MasterDetailFieldBindingGuard({
  leading,
  primary,
  namePrefix,
  inlineTitleField,
}: {
  leading: readonly FormItem[]
  primary: readonly FormItem[]
  namePrefix: string
  inlineTitleField?: MasterDetailInlineTitle['field']
}) {
  const values = useWatch()
  const bindings: (ReturnType<typeof collectActiveFormItemBindings>[number] & {
    region: string
  })[] = (
    [
      ['leading', leading],
      ['primary', primary],
    ] as const
  ).flatMap(([region, fields]) =>
    collectActiveFormItemBindings(fields, values, namePrefix).map((binding) => ({
      ...binding,
      region,
    })),
  )
  if (inlineTitleField) {
    bindings.unshift({
      path: `${namePrefix}.${inlineTitleField}`,
      region: 'inline title',
      kind: 'field',
    })
  }

  const conflict = findFormItemBindingConflict(bindings)
  if (conflict) {
    const { owner, binding } = conflict
    const regions = `(${owner.region}, ${binding.region})`
    if (owner.path === binding.path) {
      throw new Error(`Duplicate master–detail field binding "${binding.path}" ${regions}`)
    }
    throw new Error(
      `Overlapping master–detail field bindings "${owner.path}" and "${binding.path}" ${regions}`,
    )
  }
  return null
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
  inlineTitleField,
  spellPicker,
}: MasterDetailDetailBodyProps) {
  const hasLeading = Boolean(leadingItemFields?.length)
  const hasPrimary = primaryItemFields.length > 0

  if (!hasLeading && !facing && !hasPrimary) {
    return null
  }

  return (
    <FormRhythmStack>
      <MasterDetailFieldBindingGuard
        leading={leadingItemFields ?? []}
        primary={primaryItemFields}
        inlineTitleField={inlineTitleField}
        namePrefix={namePrefix}
      />
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
          spellPicker={spellPicker}
        />
      ) : null}
    </FormRhythmStack>
  )
}
