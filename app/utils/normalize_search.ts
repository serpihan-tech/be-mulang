/**
 * Options for text normalization.
 *
 * Only one of `lowercase` or `uppercase` can be set at a time.
 */
type Options =
  | { lowercase: true; uppercase?: never }
  | { lowercase?: never; uppercase: true }
  | undefined
  
/**
 * Normalizes the given text by trimming whitespace,
 * and optionally converting it to lowercase or uppercase.
 *
 * @param text - The text to normalize.
 * @param options - Normalization options (either lowercase or uppercase, not both).
 * @returns The normalized text.
 */
export default function normalizeSearch(text: string, options?: Options): string {
  if (!text) return ''

  let result = text.trim()

  if (options) {
    if ('lowercase' in options && options.lowercase) {
      result = result.toLowerCase()
    }

    if ('uppercase' in options && options.uppercase) {
      result = result.toUpperCase()
    }
  }

  return result
}
