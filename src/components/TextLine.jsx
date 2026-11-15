export default function TextLine({ label, value, onChange, big }) {
  return (
    <div className={`text-line ${big ? 'text-line-big' : ''}`}>
      <label>{label}</label>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
