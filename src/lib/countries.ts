import type { Country, ISO2 } from '../types'

export const DEFAULT_COUNTRIES: Country[] = [
  { code: 'CZ', name: 'Czechia' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'UK', name: 'United Kingdom' },
].sort((a, b) => a.code.localeCompare(b.code))

export const sortCountriesByCode = (list: Country[]) =>
  [...list].sort((a, b) => a.code.localeCompare(b.code))

export const ensureUniqueByCode = (list: Country[]) => {
  const seen = new Set<string>()
  return list.filter(c => {
    const code = c.code.toUpperCase()
    if (seen.has(code)) return false
    seen.add(code)
    return true
  })
}

export const isISO2 = (v: string): v is ISO2 => /^[A-Z]{2}$/.test(v)

export const formatCountryDisplay = (code: ISO2, countries: Country[]): string => {
  const country = countries.find(c => c.code === code)
  return country ? `${country.code} — ${country.name}` : code
}


