import Link from "next/link"

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06070a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent,rgba(255,255,255,0.01))]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold shadow-lg backdrop-blur-xl">
                CY
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">
                  Compta Y Groupe
                </p>
                <p className="text-xs text-white/45">
                  Gestion comptable moderne
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </header>

        <section className="flex flex-1 items-center">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/55 backdrop-blur-xl">
                SaaS · Comptabilité · Gestion
              </div>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Gère tes clients, factures et transactions dans une interface{" "}
                <span className="text-white/70">simple, moderne et premium.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/60 sm:text-lg">
                Compta Y Groupe centralise ta gestion financière avec une
                expérience fluide pensée pour suivre tes encaissements, tes
                dépenses, tes employés et tes créances sans friction.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Commencer maintenant
                </Link>

                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-white/85 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
                >
                  Accéder à mon espace
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-sm font-medium text-white">Clients</p>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Suivi clair des fiches et soldes.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-sm font-medium text-white">Factures</p>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Vision rapide sur les montants dus.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-sm font-medium text-white">Transactions</p>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Entrées et sorties suivies proprement.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[32px] bg-white/5 blur-3xl" />
              <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Aperçu de l’espace
                    </p>
                    <p className="text-xs text-white/45">
                      Tableau de bord Compta Y Groupe
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Actif
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                      Encaissements
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      2 450 000 FCFA
                    </p>
                    <p className="mt-2 text-sm text-white/45">
                      Vue synthétique de vos entrées.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                      Dépenses
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      845 000 FCFA
                    </p>
                    <p className="mt-2 text-sm text-white/45">
                      Contrôle rapide des sorties.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                      Modules disponibles
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Clients", "Transactions", "Factures", "Employés"].map(
                        (item) => (
                          <span
                            key={item}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/50">
                      Une base solide pour piloter ton activité avec une logique
                      claire, moderne et évolutive.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}