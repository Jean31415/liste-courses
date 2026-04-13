import { useState } from 'react'

interface Props {
  onCreateFamily: (name: string) => Promise<void>
  onJoinFamily: (token: string) => Promise<void>
  error: string | null
  loading: boolean
}

export function FamilySetup({ onCreateFamily, onJoinFamily, error, loading }: Props) {
  const [familyName, setFamilyName] = useState('')
  const [token, setToken] = useState('')

  return (
    <div className="setup-card">
      <div className="setup-icon">🛒</div>
      <h2>Liste de Courses</h2>
      <p>Créez un foyer ou rejoignez-en un avec un code existant.</p>

      {error && <div className="setup-error">{error}</div>}

      <div className="setup-section">
        <input
          className="setup-input"
          type="text"
          placeholder="Nom du foyer"
          value={familyName}
          onChange={e => setFamilyName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && familyName.trim() && onCreateFamily(familyName.trim())}
          disabled={loading}
        />
        <button
          className="btn btn-accent"
          onClick={() => familyName.trim() && onCreateFamily(familyName.trim())}
          disabled={loading || !familyName.trim()}
        >
          {loading ? 'Création...' : 'Créer un foyer'}
        </button>
      </div>

      <div className="setup-divider">
        <span>ou</span>
      </div>

      <div className="setup-section">
        <input
          className="setup-input"
          type="text"
          placeholder="Code famille (ex: 1234)"
          maxLength={20}
          value={token}
          onChange={e => setToken(e.target.value.toLowerCase())}
          onKeyDown={e => e.key === 'Enter' && token.trim() && onJoinFamily(token.trim())}
          disabled={loading}
        />
        <button
          className="btn btn-accent"
          onClick={() => token.trim() && onJoinFamily(token.trim())}
          disabled={loading || !token.trim()}
        >
          {loading ? 'Connexion...' : 'Rejoindre'}
        </button>
      </div>
    </div>
  )
}
