import { EMPTY_VALUE, formatCompactUsd, formatDateTime, formatPercent, formatUsd } from '../format';

describe('formatUsd', () => {
  it('muestra 2 decimales y separador de miles para precios ≥ 1 (ejemplo de la spec)', () => {
    expect(formatUsd(63245.1234)).toBe('$63,245.12');
    expect(formatUsd(1)).toBe('$1.00');
  });

  it('muestra 4 cifras significativas para precios < 1 (ejemplo de la spec)', () => {
    expect(formatUsd(0.000123456)).toBe('$0.0001235');
    expect(formatUsd(0.48213)).toBe('$0.4821');
  });

  it('muestra cero con 2 decimales', () => {
    expect(formatUsd(0)).toBe('$0.00');
  });

  it('muestra "—" si el valor es null', () => {
    expect(formatUsd(null)).toBe(EMPTY_VALUE);
  });
});

describe('formatPercent', () => {
  it('agrega "+" a las variaciones positivas (ejemplo de la spec)', () => {
    expect(formatPercent(2.345)).toBe('+2.35%');
  });

  it('muestra "-" en las variaciones negativas (ejemplo de la spec)', () => {
    expect(formatPercent(-1.2)).toBe('-1.20%');
  });

  it('trata cero y -0 como positivos', () => {
    expect(formatPercent(0)).toBe('+0.00%');
    expect(formatPercent(-0)).toBe('+0.00%');
  });

  it('muestra "—" si el valor es null', () => {
    expect(formatPercent(null)).toBe(EMPTY_VALUE);
  });
});

describe('formatCompactUsd', () => {
  it('abrevia billones con T (ejemplo de la spec)', () => {
    expect(formatCompactUsd(1234567890123)).toBe('$1.23 T');
  });

  it('abrevia miles de millones, millones y miles', () => {
    expect(formatCompactUsd(29838710286)).toBe('$29.84 B');
    expect(formatCompactUsd(5430000)).toBe('$5.43 M');
    expect(formatCompactUsd(12340)).toBe('$12.34 K');
  });

  it('usa el formato de precio para valores menores a mil', () => {
    expect(formatCompactUsd(950)).toBe('$950.00');
  });

  it('muestra "—" si el valor es null', () => {
    expect(formatCompactUsd(null)).toBe(EMPTY_VALUE);
  });
});

describe('formatDateTime', () => {
  it('muestra la fecha y hora local como dd/mm/aaaa hh:mm', () => {
    // Fecha construida en hora local para que la prueba no dependa de la zona horaria.
    const local = new Date(2026, 8, 11, 6, 5);

    expect(formatDateTime(local.toISOString())).toBe('11/09/2026 06:05');
  });

  it('muestra "—" si el valor es null o no es una fecha válida', () => {
    expect(formatDateTime(null)).toBe(EMPTY_VALUE);
    expect(formatDateTime('no-es-fecha')).toBe(EMPTY_VALUE);
  });
});
