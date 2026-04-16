type AuthSubmitButtonProps = {
  loading?: boolean
  children: React.ReactNode
}

export default function AuthSubmitButton({
  loading,
  children,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Chargement..." : children}
    </button>
  )
}