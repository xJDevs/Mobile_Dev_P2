export const colors = {
  background: '#FFFFFF',
  surface: '#F4F5F7',
  border: '#E3E5E8',
  text: '#111827',
  textMuted: '#6B7280',
  primary: '#208AEF',
  onPrimary: '#FFFFFF',
  positive: '#16A34A',
  negative: '#DC2626',
  favorite: '#F5B400',
  noticeBackground: '#FFF4E0',
  noticeText: '#7A4E00',
} as const;

/** Verde si la variación es ≥ 0, rojo si es negativa y gris si no hay dato. */
export function colorForChange(change: number | null): string {
  if (change === null) {
    return colors.textMuted;
  }
  return change >= 0 ? colors.positive : colors.negative;
}
