/** On/off switch for rider settings (online, auto-accept). `label` names the setting for screen readers. */
export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="group grid h-11 w-16 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin"
    >
      <span
        className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${checked ? 'bg-success' : 'bg-neutral-300'}`}
      >
        <span
          className={`size-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`}
        />
      </span>
    </button>
  )
}
