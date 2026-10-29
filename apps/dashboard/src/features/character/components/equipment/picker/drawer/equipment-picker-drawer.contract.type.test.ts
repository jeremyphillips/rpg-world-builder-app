import { describe, expectTypeOf, it } from 'vitest'

import type {
  EquipmentPickerAcquisitionDrawerProps,
  EquipmentPickerCommitAdd,
  EquipmentPickerDrawerProps,
  EquipmentPickerSelection,
  EquipmentPickerSelectionDrawerProps,
} from './equipment-picker-drawer.types'

const openDrawer = {
  open: true,
  onOpenChange: () => undefined,
  items: [],
} satisfies Pick<EquipmentPickerDrawerProps, 'open' | 'onOpenChange' | 'items'>

const selection = {
  value: null,
  onValueChange: () => undefined,
} satisfies EquipmentPickerSelection

describe('EquipmentPickerDrawer prop contract', () => {
  it('requires onCommitAdd for acquisition and rejects selection', () => {
    expectTypeOf<
      EquipmentPickerAcquisitionDrawerProps['onCommitAdd']
    >().toEqualTypeOf<EquipmentPickerCommitAdd>()
    expectTypeOf<EquipmentPickerAcquisitionDrawerProps['selection']>().toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerAcquisitionDrawerProps['onSetRowQuantity']
    >().not.toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerAcquisitionDrawerProps['onReleaseChoice']
    >().not.toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerAcquisitionDrawerProps['onRemovePurchaseOne']
    >().not.toEqualTypeOf<undefined>()
  })

  it('rejects acquisition callbacks on selection', () => {
    expectTypeOf<EquipmentPickerSelectionDrawerProps['onCommitAdd']>().toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerSelectionDrawerProps['onSetPurchasedQuantity']
    >().toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerSelectionDrawerProps['onSetRowQuantity']
    >().toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerSelectionDrawerProps['onReleaseChoice']
    >().toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerSelectionDrawerProps['onRemovePurchaseOne']
    >().toEqualTypeOf<undefined>()
    expectTypeOf<
      EquipmentPickerSelectionDrawerProps['selection']
    >().toEqualTypeOf<EquipmentPickerSelection>()
  })

  it('rejects a drawer that is neither acquisition nor selection', () => {
    // @ts-expect-error acquisition requires onCommitAdd; selection requires selection
    const _neither: EquipmentPickerDrawerProps = openDrawer
    expectTypeOf(_neither).toEqualTypeOf<EquipmentPickerDrawerProps>()
  })

  it('rejects selection combined with an acquisition callback', () => {
    // @ts-expect-error selection and onCommitAdd are mutually exclusive
    const _both: EquipmentPickerDrawerProps = {
      ...openDrawer,
      selection,
      onCommitAdd: () => undefined,
    }
    expectTypeOf(_both).toEqualTypeOf<EquipmentPickerDrawerProps>()
  })

  it('rejects a quantity callback on selection', () => {
    const _quantity: EquipmentPickerSelectionDrawerProps = {
      ...openDrawer,
      selection,
      // @ts-expect-error selection does not accept row quantity changes
      onSetRowQuantity: () => undefined,
    }
    expectTypeOf(_quantity).toEqualTypeOf<EquipmentPickerSelectionDrawerProps>()
  })
})
