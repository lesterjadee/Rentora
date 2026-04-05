export function getCategoryEmoji(categoryName: string): string {
  const map: Record<string, string> = {
    'Books': '📚',
    'Electronics': '💻',
    'Laboratory Equipment': '🔬',
    'Sports & Recreation': '⚽',
    'Art & Design': '🎨',
    'Music Instruments': '🎸',
    'Clothing & Costumes': '👔',
    'Tools & Equipment': '🔧',
    'Photography': '📷',
    'Other': '📦',
  }
  return map[categoryName] || '📦'
}