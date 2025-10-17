// lib/utils/format.ts
export function formatCurrency(n: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function ratingLabel(rating: number, reviews: number) {
  return `${rating.toFixed(1)} (${reviews})`;
}
