/** White rounded container. `padded={false}` for edge-to-edge content (images, lists). */
export default function Card({ as: Tag = 'div', padded = true, className = '', children, ...props }) {
  return (
    <Tag
      className={`rounded-2xl bg-white shadow-sm ${padded ? 'p-4' : 'overflow-hidden'} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
