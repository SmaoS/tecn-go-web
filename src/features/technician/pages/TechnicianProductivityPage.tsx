import { PrivateImage } from '../../../components/PrivateImage'
import { QueryState } from '../../shared/components/QueryState'
import { useTechnicianProfile, useTechnicianRatings } from '../hooks'

const RATING_VISIBILITY_DELAY_DAYS = 2

export function TechnicianProductivityPage() {
  const profile = useTechnicianProfile()
  const ratings = useTechnicianRatings(profile.data?.userId)
  const visibleRatings = (ratings.data ?? []).filter((item) => isVisibleRating(item.createdAt))

  return <section className="max-w-3xl">
    <h2 className="mb-4 text-2xl font-bold">Productividad</h2>
    <QueryState pending={profile.isPending} error={profile.error}>
      {profile.data && <article className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-4">
          {profile.data.profilePhotoUrl
            ? <PrivateImage src={profile.data.profilePhotoUrl} alt={profile.data.fullName} className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-500" />
            : <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-500/10 text-2xl font-black text-brand-300">{profile.data.fullName.charAt(0)}</div>}
          <div>
            <h3 className="text-lg font-bold">{profile.data.fullName}</h3>
            <p className="text-brand-300">★ {profile.data.averageRating.toFixed(1)}</p>
            <p className="text-sm text-slate-400">{profile.data.completedServicesCount} servicios completados</p>
          </div>
        </div>
      </article>}
    </QueryState>

    <h3 className="mb-1 text-xl font-bold">Opiniones y apreciaciones</h3>
    <p className="mb-4 text-sm text-slate-400">Por privacidad operativa, las calificaciones se muestran con dos días de retraso.</p>
    <QueryState pending={ratings.isPending} error={ratings.error} empty={visibleRatings.length === 0}>
      <div className="grid gap-3">
        {visibleRatings.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-400">{new Date(item.createdAt).toLocaleDateString('es-CO')}</span>
            <span className="text-brand-300">{'★'.repeat(item.score)}{'☆'.repeat(Math.max(0, 5 - item.score))}</span>
          </div>
          <strong>Cliente</strong>
          <p className="mt-1 text-sm text-slate-400">{item.comment || 'Sin comentario.'}</p>
        </article>)}
      </div>
    </QueryState>
  </section>
}

function isVisibleRating(createdAt: string) {
  const value = Date.parse(createdAt)
  if (Number.isNaN(value)) return false
  return value <= Date.now() - RATING_VISIBILITY_DELAY_DAYS * 24 * 60 * 60 * 1000
}
