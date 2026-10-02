const DECIMAL_PATTERN = /^(?:\d+\.?\d*|\.\d+)$/

export function parsePositiveNumber(value) {
  const normalized = String(value).trim()
  if (!DECIMAL_PATTERN.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function finitePositiveResult(value) {
  return Number.isFinite(value) && value > 0 ? value : null
}
