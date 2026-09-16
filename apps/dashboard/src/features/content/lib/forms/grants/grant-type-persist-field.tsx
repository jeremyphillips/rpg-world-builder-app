import { useArrayFieldContext } from '@rpg/ui/form'
import { useController, useFormContext } from 'react-hook-form'

const GRANT_TYPE_FIELD_NAME = 'grantType'

/**
 * Keeps `grantType` registered on each grant array row. Grant type is set via
 * the add menu template, not an editable control — without this, the form's
 * `shouldUnregister` policy drops the discriminator and row validation never runs.
 */
export function GrantTypePersistField() {
  const { control } = useFormContext()
  const arrayContext = useArrayFieldContext()
  const name =
    arrayContext?.fullArrayName != null
      ? `${arrayContext.fullArrayName}.${arrayContext.rowIndex}.${GRANT_TYPE_FIELD_NAME}`
      : GRANT_TYPE_FIELD_NAME

  useController({ name, control, shouldUnregister: false })

  return null
}
