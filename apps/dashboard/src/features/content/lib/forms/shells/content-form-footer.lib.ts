const PUBLISHED_MESSAGE = 'Published.'
const PUBLISH_LABEL = 'Publish'
const PUBLISHING_LABEL = 'Publishing…'

export function resolveContentFormFooterPresentation({
  mode,
  submitLabel,
  pendingLabel,
  publishSuccess,
}: {
  mode: 'create' | 'edit'
  submitLabel: string
  pendingLabel: string
  publishSuccess: boolean
}) {
  if (mode === 'create') {
    return {
      submitLabel: PUBLISH_LABEL,
      pendingLabel: PUBLISHING_LABEL,
      isSuccess: publishSuccess,
      successMessage: publishSuccess ? PUBLISHED_MESSAGE : undefined,
    }
  }

  return {
    submitLabel,
    pendingLabel,
    isSuccess: false,
    successMessage: undefined,
  }
}
