export function extractEquipmentCategoryId(record: { kind: string }): readonly string[] {
  return [record.kind]
}

export function extractWeaponPropertyIds(record: {
  kind: string
  properties?: readonly string[]
}): readonly string[] {
  if (record.kind !== 'weapon') return []
  return record.properties ?? []
}
