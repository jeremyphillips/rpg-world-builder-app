const PUBLISH_LABEL = 'Publish'
const PUBLISHING_LABEL = 'Publishing…'

export function resolveContentFormFooterPresentation({
  mode,
  submitLabel,
  pendingLabel,
}: {
  mode: 'create' | 'edit'
  submitLabel: string
  pendingLabel: string
}) {
  if (mode === 'create') {
    return {
      submitLabel: PUBLISH_LABEL,
      pendingLabel: PUBLISHING_LABEL,
      isSuccess: false,
      successMessage: undefined,
    }
  }

  return {
    submitLabel,
    pendingLabel,
    isSuccess: false,
    successMessage: undefined,
  }
}
