/** Decorative required marker — pair with native `required` / `aria-required` on the control. */
export function RequiredIndicator() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  )
}
