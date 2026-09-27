export type InPageNavLeaf = {
  id: string
  label: string
}

export type InPageNavSection = {
  id: string
  label: string
  leaves?: readonly InPageNavLeaf[]
}
