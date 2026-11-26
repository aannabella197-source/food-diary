type Props = {
  onClick: () => void;
  className?: string;
};

export function BackButton({ onClick, className }: Props) {
  return <button className={className ? `back-button ${className}` : 'back-button'} onClick={onClick} aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg></button>;
}
