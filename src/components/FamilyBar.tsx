import { useState } from 'react'

interface Props {
  familyName: string
  familyToken: string
  onCopyToken: () => Promise<void>
  onLeave: () => void
}

export function FamilyBar({ familyName, familyToken, onCopyToken, onLeave }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await onCopyToken()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="family-bar">
      <span className="family-bar-label">Foyer</span>
      <strong className="family-bar-name">{familyName}</strong>
      <span className="family-bar-sep">&mdash;</span>
      <span className="family-bar-label">Code</span>
      <button className="token-display" onClick={handleCopy} title="Copier le code">
        {copied ? 'copié !' : familyToken}
      </button>
      <button className="btn btn-sm btn-ghost family-bar-leave" onClick={onLeave}>
        Quitter
      </button>
    </div>
  )
}
