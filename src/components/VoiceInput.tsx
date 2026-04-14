import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  onTranscript: (text: string) => void
  onClose: () => void
}

export function VoiceInput({ onTranscript, onClose }: Props) {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    return Ctor ? null : "La reconnaissance vocale n'est pas disponible sur ce navigateur."
  })
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')

  const onTranscriptRef = useRef(onTranscript)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
    onCloseRef.current = onClose
  }, [onTranscript, onClose])

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = finalTranscriptRef.current
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const piece = result[0].transcript
        if (result.isFinal) {
          finalText += piece
        } else {
          interim += piece
        }
      }
      finalTranscriptRef.current = finalText
      setTranscript((finalText + interim).trim())
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError("Je n'ai rien entendu. Réessaie.")
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError("Permission micro refusée. Autorise le micro dans les réglages du navigateur.")
      } else if (event.error === 'network') {
        setError("Erreur réseau pendant la reconnaissance.")
      } else if (event.error !== 'aborted') {
        setError(`Erreur : ${event.error}`)
      }
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // start() throws if already started — safe to ignore
    }

    return () => {
      try { recognition.abort() } catch { /* noop */ }
      recognitionRef.current = null
    }
  }, [])

  const handleRestart = useCallback(() => {
    finalTranscriptRef.current = ''
    setTranscript('')
    setError(null)
    const recognition = recognitionRef.current
    if (recognition) {
      try { recognition.abort() } catch { /* noop */ }
      try { recognition.start() } catch { /* noop */ }
    }
  }, [])

  const handleStop = useCallback(() => {
    const recognition = recognitionRef.current
    if (recognition) {
      try { recognition.stop() } catch { /* noop */ }
    }
  }, [])

  const handleValidate = useCallback(() => {
    const text = transcript.trim()
    if (!text) return
    const recognition = recognitionRef.current
    if (recognition) {
      try { recognition.abort() } catch { /* noop */ }
    }
    onTranscriptRef.current(text)
  }, [transcript])

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <span>Dicter un produit</span>
        <button className="scanner-close" onClick={onClose}>✕</button>
      </div>

      <div className="voice-body">
        <div className={`voice-pulse${listening ? ' voice-pulse-active' : ''}`}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>

        <div className="voice-transcript">
          {error
            ? <span className="voice-error">{error}</span>
            : transcript
              ? transcript
              : <span className="voice-hint">{listening ? 'Parle maintenant…' : 'Prêt à écouter'}</span>}
        </div>

        <div className="voice-actions">
          {listening ? (
            <button className="btn btn-ghost" onClick={handleStop}>
              Arrêter
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={handleRestart} disabled={!!error && error.includes('refusée')}>
              Réessayer
            </button>
          )}
          <button
            className="btn btn-accent"
            onClick={handleValidate}
            disabled={!transcript.trim()}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  )
}
