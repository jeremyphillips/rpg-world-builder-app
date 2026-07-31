export function resolveMessagesWorkspaceChromeVisibility(input: { isNewRoute: boolean }): {
  hideNewMessageActionOnMobile: boolean
  hideScopeChromeOnMobile: boolean
} {
  return {
    hideNewMessageActionOnMobile: input.isNewRoute,
    hideScopeChromeOnMobile: input.isNewRoute,
  }
}
