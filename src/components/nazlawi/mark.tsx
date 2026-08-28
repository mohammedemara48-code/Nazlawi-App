export function LeafMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3c4.5 2.2 7 6 7 11.2-.1 3.4-2.6 6.2-6.1 6.8 1.6-1.7 2.4-3.7 2.3-6.1C15 9.6 13.2 6.4 12 3Zm0 0C7.5 5.2 5 9 5 14.2c.1 3.4 2.6 6.2 6.1 6.8C9.5 19.3 8.7 17.3 8.8 14.9 9 9.6 10.8 6.4 12 3Z"
      />
    </svg>
  );
}
