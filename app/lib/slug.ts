// utils/slug.ts
export type SlugifyOptions = {
  lowercase?: boolean;
  separator?: string;
  trim?: boolean;
  maxLength?: number | null;
  removeNonWord?: RegExp | null; // custom pattern for removal
};

export function slugify(input: string, opts: SlugifyOptions = {}): string {
  const {
    lowercase = true,
    separator = '-',
    trim = true,
    maxLength = 200,
    removeNonWord = /[^\w\s-]/g, // keep letters, numbers, underscore, whitespace, hyphen
  } = opts;

  if (!input) return '';

  // 1. Normalize (remove accents)
  let s = input.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // 2. Remove characters we don't want (punctuation, emojis, etc.)
  if (removeNonWord) s = s.replace(removeNonWord, '');

  // 3. Replace whitespace and underscores with separator
  const sep = separator;
  s = s.replace(/[_\s]+/g, sep);

  // 4. Remove any remaining characters except alnum and separator
  const allowed = new RegExp(`[^a-zA-Z0-9${escapeRegExp(sep)}]+`, 'g');
  s = s.replace(allowed, '');

  // 5. Collapse multiple separators
  const multiSep = new RegExp(`${escapeRegExp(sep)}{2,}`, 'g');
  s = s.replace(multiSep, sep);

  // 6. Trim separators from ends
  s = s.replace(new RegExp(`^${escapeRegExp(sep)}|${escapeRegExp(sep)}$`, 'g'), '');

  if (trim) s = s.trim();
  if (lowercase) s = s.toLowerCase();
  if (maxLength && typeof maxLength === 'number') s = s.slice(0, maxLength);

  return s || 'n-a';
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * generateUniqueSlug
 * - baseText: teks yang di-slugify
 * - exists: function (slug) => boolean | Promise<boolean>  (cek apakah slug sudah ada)
 * - maxAttempts: berapa kali mencoba menambahkan suffix -1, -2, ...
 */
export async function generateUniqueSlug(
  baseText: string,
  exists: (slug: string) => boolean | Promise<boolean>,
  opts: {
    separator?: string;
    maxAttempts?: number;
    slugOptions?: SlugifyOptions;
  } = {}
): Promise<string> {
  const { separator = '-', maxAttempts = 100, slugOptions = {} } = opts;
  const base = slugify(baseText, { ...slugOptions, separator });

  if (!(await Promise.resolve(exists(base)))) {
    return base;
  }

  // try suffixes: base-1, base-2, ...
  for (let i = 1; i <= maxAttempts; i++) {
    const candidate = `${base}${separator}${i}`;
    if (!(await Promise.resolve(exists(candidate)))) {
      return candidate;
    }
  }

  // fallback — append timestamp
  return `${base}${separator}${Date.now()}`;
}
