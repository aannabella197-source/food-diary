import { Tag } from 'lucide-react';
import { tagIconOptions } from '../tagIcons';

export function TagGlyph({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = tagIconOptions.find((option) => option.value === name)?.Icon || Tag;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
