/** Opens a dialog-presentation CampaignAvailabilityField from an external Change control. */
export function openCampaignAvailabilityDialog(container: HTMLElement | null | undefined): void {
  const trigger = container?.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')
  trigger?.click()
}
