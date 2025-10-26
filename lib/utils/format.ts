// lib/utils/format.ts
export function formatCurrency(amountInCents: number): string {
  // Convert cents to dollars
  const amountInDollars = amountInCents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInDollars);
}

export function ratingLabel(rating: number, reviews: number): string {
  const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  return `${stars} ${rating.toFixed(1)} (${reviews})`;
}