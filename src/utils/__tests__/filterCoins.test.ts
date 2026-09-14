import { filterCoins } from '../filterCoins';

const coins = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth' },
  { id: 'wrapped-bitcoin', name: 'Wrapped Bitcoin', symbol: 'wbtc' },
  { id: 'tether', name: 'Tether', symbol: 'usdt' },
];

const ids = (list: readonly { id: string }[]) => list.map((coin) => coin.id);

describe('filterCoins', () => {
  it('filtra por nombre sin distinguir mayúsculas (ejemplo de la spec: "BIT")', () => {
    expect(ids(filterCoins(coins, 'BIT'))).toEqual(['bitcoin', 'wrapped-bitcoin']);
  });

  it('filtra por símbolo', () => {
    expect(ids(filterCoins(coins, 'usdt'))).toEqual(['tether']);
    expect(ids(filterCoins(coins, 'WBTC'))).toEqual(['wrapped-bitcoin']);
  });

  it('incluye coincidencias en el nombre aunque el texto sea un símbolo', () => {
    // "ETH" es el símbolo de Ethereum y también aparece dentro de "Tether".
    expect(ids(filterCoins(coins, 'ETH'))).toEqual(['ethereum', 'tether']);
  });

  it('devuelve una lista vacía si nada coincide', () => {
    expect(filterCoins(coins, 'dogecoin')).toEqual([]);
  });

  it('devuelve la lista completa con texto vacío o solo espacios', () => {
    expect(filterCoins(coins, '')).toBe(coins);
    expect(filterCoins(coins, '   ')).toBe(coins);
  });

  it('ignora espacios al inicio y al final del texto', () => {
    expect(ids(filterCoins(coins, '  tether '))).toEqual(['tether']);
  });
});
