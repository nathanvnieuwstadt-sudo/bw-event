import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'

const inputCls =
  'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none'

const DEV_ACCOUNTS = [
  { email: 'dev@bwevent.local',     role: 'DEV' },
  { email: 'manager@bwevent.local', role: 'Directeur général' },
  { email: 'floor@bwevent.local',   role: 'Responsable de salle' },
  { email: 'kitchen@bwevent.local', role: 'Cuisine' },
  { email: 'owner@bwevent.local',   role: 'Propriétaire' },
]
const DEV_PASSWORD = 'devpassword'

export function LoginPage() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await login({ email, password })
      setAuth(response)
      navigate('/', { replace: true })
    } catch {
      setError('Adresse e-mail ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  function quickLogin(accountEmail: string) {
    setEmail(accountEmail)
    setPassword(DEV_PASSWORD)
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-[420px] lg:flex-col lg:justify-between border-r border-neutral-900 bg-neutral-950 px-10 py-12">
        <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-neutral-100">
          BW Event
        </span>
        <div>
          <p className="text-2xl font-semibold leading-snug text-neutral-100">
            Gestion de banquets pour toute l'équipe.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Cuisine, salle, direction — une plateforme, chaque événement.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { role: 'Responsable de salle', note: 'Créer et confirmer des banquets' },
            { role: 'Cuisine',              note: 'Consulter les menus à venir' },
            { role: 'Direction',            note: 'Vue d\'ensemble et rapports' },
          ].map((r) => (
            <div key={r.role} className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span className="text-sm text-neutral-500">
                <span className="font-medium text-neutral-300">{r.role}</span>
                {' — '}{r.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-neutral-950 px-6 gap-6">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <p className="mb-8 text-[13px] font-semibold uppercase tracking-[0.1em] text-neutral-500 lg:hidden">
            BW Event
          </p>

          <h1 className="text-xl font-semibold text-neutral-100">Connexion</h1>
          <p className="mt-1 text-sm text-neutral-500">Saisissez vos identifiants pour continuer.</p>

          {error && (
            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                Mot de passe
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>
            <Button type="submit" className="w-full mt-2" size="md" loading={loading}>
              Se connecter
            </Button>
          </form>
        </div>

        {/* Dev accounts */}
        <div className="w-full max-w-sm rounded-lg border border-dashed border-neutral-700 bg-neutral-900 p-4">
          <p className="section-label mb-3">Comptes de test — mot de passe : {DEV_PASSWORD}</p>
          <div className="space-y-1">
            {DEV_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => quickLogin(a.email)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors duration-75 hover:bg-neutral-800 active:bg-neutral-800/70 active:scale-[0.99]"
              >
                <span className="text-sm text-neutral-300 font-mono">{a.email}</span>
                <span className="text-xs text-neutral-500">{a.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
