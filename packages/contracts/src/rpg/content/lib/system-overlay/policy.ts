/** How a stored overlay treats one schema node. Arrays and unions are never implied. */
export type OverlayPresence = 'required' | 'optional' | 'nullable' | 'nullish'

export type OverlayPolicyNode =
  | { kind: 'scalar'; presence: OverlayPresence }
  | { kind: 'atomic'; presence: OverlayPresence }
  | { kind: 'value-list'; ordered: boolean; presence: OverlayPresence }
  | {
      kind: 'identity'
      idKey: 'id' | 'entryId'
      missingSeedRow: 'restore' | 'delete'
      order: 'authored' | 'immaterial'
      row: OverlayPolicyNode
      presence: OverlayPresence
    }
  | { kind: 'deep'; fields: Readonly<Record<string, OverlayPolicyNode>>; presence: OverlayPresence }
  | { kind: 'union'; branches: readonly OverlayUnionBranch[]; presence: OverlayPresence }

export type OverlayUnionBranch = {
  discriminator: string
  value: string
  node: OverlayPolicyNode
}
