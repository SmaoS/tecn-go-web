import { phrasesForAudience, type RatingAudience } from './ratingPhrases'

export function RatingPhraseChips({
  audience,
  selected,
  onChange,
}: {
  audience: RatingAudience
  selected: string[]
  onChange: (values: string[]) => void
}) {
  function toggle(value: string) {
    onChange(selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value])
  }

  return <div className="flex flex-wrap gap-2">
    {phrasesForAudience(audience).map((phrase) => {
      const active = selected.includes(phrase.text)
      return <button
        key={phrase.text}
        type="button"
        aria-pressed={active}
        onClick={() => toggle(phrase.text)}
        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
          active
            ? 'border-brand-400 bg-brand-500/15 text-brand-300'
            : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
        }`}
      >
        {active ? '✓ ' : ''}{phrase.text}
      </button>
    })}
  </div>
}
