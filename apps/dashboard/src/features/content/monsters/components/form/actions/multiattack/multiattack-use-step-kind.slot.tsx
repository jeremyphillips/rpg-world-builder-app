import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

/** Keeps `kind: 'use'` on multiattack use-clause rows without showing a control. */
export function MonsterMultiattackUseStepKindSlot({ namePrefix }: { namePrefix?: string }) {
  const { register, setValue } = useFormContext()
  useEffect(() => {
    if (!namePrefix) return
    const field = `${namePrefix}.kind`
    register(field, { shouldUnregister: false })
    setValue(field, 'use', { shouldDirty: false, shouldValidate: false })
  }, [namePrefix, register, setValue])
  return null
}
