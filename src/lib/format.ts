// Helper di formattazione numerica condivisi.
// Usano sempre il separatore delle migliaia (it-IT: punto) per leggibilita.

export function formatEuro(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: "always",
  }).format(amount);
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(value);
}
