/**
 * PM Copilot — lightweight international phone + email validation.
 *
 * The standalone tool used intl-tel-input (a CDN widget). Rebuilding natively we
 * keep a focused country table (dial code + national-number length rules) covering
 * AU/NZ and the common markets Harcourts deals with, defaulting to AU. This avoids
 * a heavy dependency while still validating per-country length and producing E.164.
 */

export interface Country {
  iso2: string;
  name: string;
  dialCode: string; // without "+"
  flag: string;
  /** Acceptable national-number digit lengths (after the dial code). */
  lengths: number[];
}

/** Ordered so AU/NZ sit at the top; rest alphabetical-ish by name. */
export const COUNTRIES: Country[] = [
  { iso2: "AU", name: "Australia", dialCode: "61", flag: "🇦🇺", lengths: [9] },
  { iso2: "NZ", name: "New Zealand", dialCode: "64", flag: "🇳🇿", lengths: [8, 9, 10] },
  { iso2: "GB", name: "United Kingdom", dialCode: "44", flag: "🇬🇧", lengths: [10] },
  { iso2: "US", name: "United States", dialCode: "1", flag: "🇺🇸", lengths: [10] },
  { iso2: "CA", name: "Canada", dialCode: "1", flag: "🇨🇦", lengths: [10] },
  { iso2: "IE", name: "Ireland", dialCode: "353", flag: "🇮🇪", lengths: [9] },
  { iso2: "IN", name: "India", dialCode: "91", flag: "🇮🇳", lengths: [10] },
  { iso2: "CN", name: "China", dialCode: "86", flag: "🇨🇳", lengths: [11] },
  { iso2: "PH", name: "Philippines", dialCode: "63", flag: "🇵🇭", lengths: [10] },
  { iso2: "SG", name: "Singapore", dialCode: "65", flag: "🇸🇬", lengths: [8] },
  { iso2: "HK", name: "Hong Kong", dialCode: "852", flag: "🇭🇰", lengths: [8] },
  { iso2: "ZA", name: "South Africa", dialCode: "27", flag: "🇿🇦", lengths: [9] },
  { iso2: "DE", name: "Germany", dialCode: "49", flag: "🇩🇪", lengths: [10, 11] },
  { iso2: "FR", name: "France", dialCode: "33", flag: "🇫🇷", lengths: [9] },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971", flag: "🇦🇪", lengths: [9] },
  { iso2: "JP", name: "Japan", dialCode: "81", flag: "🇯🇵", lengths: [9, 10] },
];

export const DEFAULT_COUNTRY = "AU";

export function findCountry(iso2: string): Country {
  return COUNTRIES.find((c) => c.iso2 === iso2) ?? COUNTRIES[0];
}

export interface PhoneValidation {
  valid: boolean;
  /** E.164-ish "+<dial><national>" when valid. */
  e164: string;
  message?: string;
}

/**
 * Validate a national number against a country's length rules.
 * `national` may contain spaces/dashes/brackets — they're stripped.
 */
export function validatePhone(national: string, iso2: string): PhoneValidation {
  const country = findCountry(iso2);
  const digits = (national || "").replace(/\D/g, "").replace(/^0+/, ""); // drop trunk 0
  if (!digits) return { valid: false, e164: "", message: "Enter a phone number." };
  if (!country.lengths.includes(digits.length)) {
    const expected = country.lengths.join(" or ");
    return {
      valid: false,
      e164: "",
      message: `That doesn't look right for ${country.name} (expected ${expected} digits).`,
    };
  }
  return { valid: true, e164: `+${country.dialCode}${digits}` };
}

/**
 * Email check mirroring the backend's stricter TLD pattern: local@domain.tld
 * with a 2+ char alphabetic TLD. Returns null when valid, else a message.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
export function validateEmail(value: string): string | null {
  const v = (value || "").trim();
  if (!v) return "Enter an email address.";
  if (!EMAIL_RE.test(v)) return "That doesn't look like a valid email address.";
  return null;
}
