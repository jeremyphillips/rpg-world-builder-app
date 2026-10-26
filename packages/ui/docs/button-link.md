# ButtonLink

Button-shaped **navigation** — same visual contract as `Button`, but the interactive root is an app-supplied link element.

Source: `packages/ui/src/components/ui/button-link.tsx`, `resolve-button-appearance.ts`, `navigable-link-root.lib.ts`.

## When to use

| Need                                    | Component                         |
| --------------------------------------- | --------------------------------- |
| Submit, toggle, or run a handler        | `Button`                          |
| Navigate with button chrome             | `ButtonLink`                      |
| Inline or prose text navigation         | `Link` (`@rpg/ui`)                |
| Whole card or entity surface navigation | `Card` / `EntityCard` `link` prop |

## API

```tsx
<ButtonLink link={<Link to="/campaigns" />} variant="outline" size="sm">
  Campaigns
</ButtonLink>
```

- **`link`** (required): a single React element (`<a>`, React Router `Link`, Next.js `Link`, …). Put `href` / `to`, `aria-label`, `onClick`, and refs on this element — not on `ButtonLink`.
- **`children`**: visible label (replaces any children on `link`).
- **Visual props**: `variant`, `size`, and `tone` (only when `variant="text"`) — same as `Button`.
- **`className`**: merged onto the link root after button chrome.

`ButtonLink` does not support `type`, `disabled`, or button-only handlers on the wrapper. When navigation is unavailable, omit the control instead of faking a disabled anchor.

## Styling parity

`resolveButtonAppearance()` is the shared class resolver for `Button` and `ButtonLink`. It composes `buttonVariants()` with `textActionVariants({ context: 'standalone' })` when `variant="text"`, so link roots match `<Button>` for the same props.

For styling-only cases (no link root), `buttonVariants()` or `resolveButtonAppearance()` remain valid escape hatches — prefer `ButtonLink` for real navigation.

## Implementation

`renderNavigableLinkRoot` clones `link`, merges `resolveButtonAppearance(...)` with any `className` on `link`, composes refs, and injects `children`. Same machinery as navigable `Card` and `DestinationItem` — see [destination-list.md](./destination-list.md#navigation).
