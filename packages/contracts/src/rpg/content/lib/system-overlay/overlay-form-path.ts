/** Turn a walker path into the dotted path content forms use for master-detail fields. */
export function overlayPathToFormFieldPath(walkerPath: string): string {
  if (!walkerPath || walkerPath === '<root>') return ''
  return walkerPath
    .replace(/\{[^}]+\}/g, '')
    .replace(/\[\]/g, '')
    .replace(/\.+$/g, '')
}
