export default function AssimilationStars({ value = 0, onChange }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="assimilation-container">
      <span className="eyebrow">Assimilação</span>
      <div className="assimilation-stars" role="group" aria-label="Nível de Assimilação">
        {stars.map((starNum) => {
          const filled = starNum <= value
          return (
            <span
              key={starNum}
              onClick={() => onChange(value === starNum ? starNum - 1 : starNum)}
              className={`assimilation-star ${filled ? 'filled' : ''}`}
              title={`Assimilação ${starNum}`}
            >
              {filled ? '★' : '☆'}
            </span>
          )
        })}
      </div>
    </div>
  )
}
