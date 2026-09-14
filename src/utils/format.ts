// Formato de valores monetarios (design D8). Todos devuelven "—" cuando el valor es null.

export const EMPTY_VALUE = '—';

const usdTwoDecimals = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdSignificant = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 4,
});

const twoDecimals = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Precio en USD: 2 decimales si es ≥ 1 (o cero) y 4 cifras significativas si es < 1. */
export function formatUsd(value: number | null): string {
  if (value === null) {
    return EMPTY_VALUE;
  }
  return Math.abs(value) >= 1 || value === 0
    ? usdTwoDecimals.format(value)
    : usdSignificant.format(value);
}

/** Variación porcentual con 2 decimales y signo explícito: "+2.35%" o "-1.20%". */
export function formatPercent(value: number | null): string {
  if (value === null) {
    return EMPTY_VALUE;
  }
  // Signo agregado a mano: signDisplay de Intl no está garantizado en Hermes. -0 cuenta como cero.
  const normalized = Object.is(value, -0) ? 0 : value;
  const sign = normalized >= 0 ? '+' : '';
  return `${sign}${twoDecimals.format(normalized)}%`;
}

const COMPACT_UNITS: readonly (readonly [number, string])[] = [
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
];

/** Cifras grandes abreviadas con 2 decimales: "$1.23 T". Menos de mil usa formatUsd. */
export function formatCompactUsd(value: number | null): string {
  if (value === null) {
    return EMPTY_VALUE;
  }
  for (const [unit, suffix] of COMPACT_UNITS) {
    if (Math.abs(value) >= unit) {
      return `${usdTwoDecimals.format(value / unit)} ${suffix}`;
    }
  }
  return formatUsd(value);
}
