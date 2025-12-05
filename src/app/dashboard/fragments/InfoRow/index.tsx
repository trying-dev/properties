interface InfoRowProps {
  label: string
  value?: string | number | null
  postfix?: string
}

export default function InfoRow({ label, value, postfix }: InfoRowProps) {
  return (
    <p>
      <strong>{label}:</strong> {value !== null && value !== undefined ? `${value} ${postfix ?? ''}` : 'N/A'}
    </p>
  )
}
