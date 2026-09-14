/** Maps persisted body-row availability to form state (omitted/true → true). */
export function mapBodyRowAvailableToForm(available: boolean | undefined): boolean {
  return available !== false
}

/** Maps form availability to persisted body shape (omit when true). */
export function mapBodyRowAvailableFromForm(available: boolean | undefined): boolean | undefined {
  return available === false ? false : undefined
}
