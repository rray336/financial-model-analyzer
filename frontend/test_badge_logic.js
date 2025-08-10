/**
 * Test the badge logic for period classification
 */

// Simulate the getPeriodType function
const getPeriodType = (period) => {
  // Test quarterly patterns: Q1, Q2, 1Q25, 2Q25E, FY1Q25, FY2Q25E, etc.
  if (/^Q\d|^\d+Q\d|^FY\d+Q/i.test(period)) {
    return 'quarterly'
  } 
  // Test annual patterns: FY2024, 2024, 2024E, etc. (but not FY1Q25 which is quarterly)
  else if (/^FY\d{4}|^\d{4}[E]?$/.test(period) && !/Q/i.test(period)) {
    return 'annual'
  } 
  else {
    return 'other'
  }
}

const getPeriodTypeBadge = (period) => {
  const type = getPeriodType(period)
  if (type === 'quarterly') return { label: 'Q', color: 'bg-blue-100 text-blue-700' }
  if (type === 'annual') return { label: 'Y', color: 'bg-green-100 text-green-700' }
  return { label: '?', color: 'bg-gray-100 text-gray-700' }
}

// Test with the actual periods we found
const testPeriods = [
  // Annual periods
  'FY1999', 'FY2024', 'FY2025E', '2024', '2024E',
  // Quarterly periods that were showing magnifying glass
  'FY1Q25', 'FY2Q25', 'FY3Q25E', 'FY4Q25E',
  'FY1Q17', 'FY2Q17', 'FY3Q17', 'FY4Q17',
  // Traditional quarterly formats
  'Q1 2024', '1Q25', '2Q25E'
]

console.log('=== Testing Badge Logic ===')

testPeriods.forEach(period => {
  const badge = getPeriodTypeBadge(period)
  console.log(`${period.padEnd(12)} -> ${badge.label} (${getPeriodType(period)})`)
})

// Verify the problematic cases
console.log('\n=== Focus on Previously Problematic Cases ===')
const problematic = ['FY1Q25', 'FY2Q25', 'FY3Q25E', 'FY4Q25E']

problematic.forEach(period => {
  const badge = getPeriodTypeBadge(period)
  const isCorrect = badge.label === 'Q'
  console.log(`${period} -> ${badge.label} ${isCorrect ? '✓' : '✗'}`)
})