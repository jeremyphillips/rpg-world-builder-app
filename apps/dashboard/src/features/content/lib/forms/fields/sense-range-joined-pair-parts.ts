import {
  SENSE_RANGE_PLACEHOLDER,
  SENSE_RANGE_UNIT,
  SENSE_RANGE_UNIT_LABEL,
  senseRangeAmountOptions,
  senseRangeUnitOptions,
} from './content-sense-range-form-fields'

/** Shared joined-pair anatomy for preset sense range authoring. */
export function senseRangeJoinedPairParts() {
  return {
    amountOptions: senseRangeAmountOptions,
    digits: 3 as const,
    placeholder: SENSE_RANGE_PLACEHOLDER,
    unitOptions: [...senseRangeUnitOptions],
    unitDefault: SENSE_RANGE_UNIT,
    unitLabel: SENSE_RANGE_UNIT_LABEL,
  }
}
