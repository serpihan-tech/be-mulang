export default function normalizeSearch(text: string, options?: { lowercase?: boolean }): string {
  if (!text) return ''

  let result = text.trim()

  if (options?.lowercase) {
    result = result.toLowerCase()
  }

  return result
}
