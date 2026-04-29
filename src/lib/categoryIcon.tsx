import {
  BookOpen,
  Laptop,
  FlaskConical,
  Dumbbell,
  Palette,
  Music,
  Shirt,
  Wrench,
  Camera,
  Package
} from 'lucide-react'

interface CategoryIconProps {
  name: string
  size?: number
  color?: string
}

export function CategoryIcon({ name, size = 24, color = '#26619C' }: CategoryIconProps) {
  const iconProps = { size, color, strokeWidth: 1.8 }

  if (name === 'Books') return <BookOpen {...iconProps} />
  if (name === 'Electronics') return <Laptop {...iconProps} />
  if (name === 'Laboratory Equipment') return <FlaskConical {...iconProps} />
  if (name === 'Sports & Recreation') return <Dumbbell {...iconProps} />
  if (name === 'Art & Design') return <Palette {...iconProps} />
  if (name === 'Music Instruments') return <Music {...iconProps} />
  if (name === 'Clothing & Costumes') return <Shirt {...iconProps} />
  if (name === 'Tools & Equipment') return <Wrench {...iconProps} />
  if (name === 'Photography') return <Camera {...iconProps} />
  return <Package {...iconProps} />
}