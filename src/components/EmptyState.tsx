export function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="10" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 22h16M16 30h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="36" cy="14" r="6" fill="var(--accent)" />
          <path d="M34 14h4M36 12v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="empty-state-text">
        La liste est vide
      </p>
      <p className="empty-state-sub">
        Scannez des produits depuis le module pour les ajouter
      </p>
    </div>
  )
}
