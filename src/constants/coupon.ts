export const validCoupons: Record<string, number> = {
  'SAVE10': 10,
  'GIAM20': 20,
  'SHOPEE50': 50
}

export function validateCoupon(code: string): number | null {
  return validCoupons[code.toUpperCase()] || null
}

export function getDiscountAmount(total: number, code: string): number {
  const discount = validateCoupon(code)
  if (!discount) return 0
  return Math.floor(total * discount / 100)
}