/** Title-cases a content reference id when no catalog record name is available. */
export function formatContentReferenceLabel(referenceId: string): string {
  const slug = referenceId.includes(':')
    ? (referenceId.split(':').pop() ?? referenceId)
    : referenceId

  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
