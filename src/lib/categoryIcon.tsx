import {
  BookOpen, Laptop, FlaskConical, Dumbbell, Palette,
  Music, Shirt, Wrench, Camera, Package
} from 'lucide-react'

interface CategoryIconProps {
  name: string
  size?: number
  color?: string
}

export function CategoryIcon({ name, size = 24, color = '#26619C' }: CategoryIconProps) {
  const props = { size, color, strokeWidth: 1.8 }
  const map: Record<string, JSX.Element> = {
    'Books':                <BookOpen {...props} />,
    'Electronics':          <Laptop {...props} />,
    'Laboratory Equipment': <FlaskConical {...props} />,
    'Sports & Recreation':  <Dumbbell {...props} />,
    'Art & Design':         <Palette {...props} />,
    'Music Instruments':    <Music {...props} />,
    'Clothing & Costumes':  <Shirt {...props} />,
    'Tools & Equipment':    <Wrench {...props} />,
    'Photography':          <Camera {...props} />,
    'Other':                <Package {...props} />,
  }
  return map[name] || <Package {...props} />
}