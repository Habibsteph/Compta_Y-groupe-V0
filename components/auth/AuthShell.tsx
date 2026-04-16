import { ReactNode } from "react"
import Link from "next/link"

type AuthShellProps = {
  children: ReactNode
  title: string
  subtitle: string
}

export default function AuthShell({
  children,
  title,
  subtitle,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06070a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent,rgba(255,255,255,0.01))]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-white/[0.02] p-10">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-medium text-white/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg">
                CY
              </div>
              <span>Compta Y Groupe</span>
            </Link>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">
              SaaS de gestion
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white">
              Une gestion comptable simple, moderne et cohérente avec votre activité.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60">
              Centralisez vos clients, transactions, factures et employés dans une
              interface premium pensée pour aller vite.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold">Clients</p>
                <p className="mt-1 text-sm text-white/50">Gestion structurée</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold">Factures</p>
                <p className="mt-1 text-sm text-white/50">Suivi clair</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold">Cashflow</p>
                <p className="mt-1 text-sm text-white/50">Vision immédiate</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-white/35">
            © {new Date().getFullYear()} Compta Y Groupe
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-sm font-medium text-white/90"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg">
                  CY
                </div>
                <span>Compta Y Groupe</span>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}