// Hand-drawn tag icons in the lucide style (24x24 view box, 1.8 stroke).
import type { LucideProps } from 'lucide-react';

export function TomatoIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 7c-1.4-2.4-3.1-3.2-5-3 1.1 1.5 2.5 2.4 5 3Z" />
    <path d="M12 7c1.1-2.6 2.8-3.5 4.8-3.3-.8 1.6-2.2 2.7-4.8 3.3Z" />
    <path d="M12 7c-1.8-1.2-3.5-1.2-5-.5" />
    <path d="M12 7c1.8-1.2 3.5-1.2 5-.5" />
    <path d="M12 7c-4.5-1.2-8 1.8-8 6.2 0 4.2 3.3 7.3 8 7.3s8-3.1 8-7.3C20 8.8 16.5 5.8 12 7Z" />
  </svg>;
}

export function CoffeeBeanIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
    <ellipse cx="10" cy="4.2" rx="1.7" ry="2.5" transform="rotate(25 10 4.2)" />
    <path d="M9.3 6c.1-1.2 1.4-2.3 1.5-3.6" />
  </svg>;
}

export function SmoothieIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 9h14l-1.5 11.2a1 1 0 0 1-1 .8h-9a1 1 0 0 1-1-.8z" />
    <path d="M14 9l1.5-6.5H18" />
    <path d="M12 12.6c-2.3 0-3.4 1.2-3.1 2.7.3 1.8 1.8 3.3 3.1 3.9 1.3-.6 2.8-2.1 3.1-3.9.3-1.5-.8-2.7-3.1-2.7z" />
    <path d="M10.4 12.7 12 11.4l1.6 1.3" />
    <path d="M11 14.9h.01M13 14.9h.01M12 16.6h.01" />
  </svg>;
}

export function BroomIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <g transform="rotate(35 12 12)">
      <path d="M12 1.5v8" />
      <path d="M9.5 9.5h5v2.5h-5z" />
      <path d="M9.5 12 6.5 21.5h11L14.5 12" />
      <path d="M10.6 15 9.5 21.5M12 15v6.5M13.4 15l1.1 6.5" />
    </g>
  </svg>;
}
