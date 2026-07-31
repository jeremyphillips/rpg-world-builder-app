export function resolveMessagesWorkspaceChromeVisibility(input: { isNewRoute: boolean }): {
  hideScopeChromeOnMobile: boolean
} {
  return {
    hideScopeChromeOnMobile: input.isNewRoute,
  }
}
