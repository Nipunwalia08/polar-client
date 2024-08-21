export const normalizeHeader = (header: string): string => {
  const lowerHeader = header.toLowerCase()
  if (lowerHeader.includes('name')) return 'name'
  if (lowerHeader.includes('email')) return 'email'
  if (
    lowerHeader.includes('phone') ||
    lowerHeader.includes('contact') ||
    lowerHeader.includes('mobile') ||
    lowerHeader.includes('number')
  )
    return 'phone'
  return header
}
