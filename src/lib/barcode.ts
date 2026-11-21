// Product barcodes (GTIN family: EAN-8, UPC-A, EAN-13, GTIN-14).

/** Digits only, capped at the longest product barcode. */
export const cleanBarcode = (s: string) => s.replace(/\D/g, "").slice(0, 14);

/**
 * The same product can be written with or without leading zeros: a 12-digit UPC-A is the
 * 13-digit EAN with a 0 in front. Scanners report either form, so compare without the padding.
 */
const key = (s: string) => s.replace(/\D/g, "").replace(/^0+/, "");

export function sameBarcode(a?: string, b?: string) {
  if (!a || !b) return false;
  const ka = key(a);
  return ka !== "" && ka === key(b);
}

/**
 * False only when a 12, 13 or 14-digit code fails its check digit, which means a typo.
 * Other lengths pass: 8-digit codes may be UPC-E, whose check digit is worked out differently.
 */
export function checkDigitOk(code: string) {
  if (![12, 13, 14].includes(code.length)) return true;
  let sum = 0;
  for (let i = code.length - 2, w = 3; i >= 0; i--, w = 4 - w) sum += Number(code[i]) * w;
  return (10 - (sum % 10)) % 10 === Number(code[code.length - 1]);
}
