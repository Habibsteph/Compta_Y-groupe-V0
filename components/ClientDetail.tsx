import {
  Briefcase,
  MapPin,
  Phone,
  MessageCircle,
  StickyNote,
  UserCircle2,
  FolderKanban,
  Wallet,
} from "lucide-react"
import { Client } from "@/types/client"

type Props = {
  client: Client
}

function getClientTypeLabel(type: string | null | undefined) {
  return type === "company" ? "Entreprise" : "Particulier"
}

function getStatusMeta(status: string | null | undefined) {
  const value = (status || "").toLowerCase()

  if (value === "active") {
    return {
      label: "Actif",
      className:
        "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    }
  }

  if (value === "prospect") {
    return {
      label: "Prospect",
      className:
        "border border-amber-400/20 bg-amber-400/10 text-amber-300",
    }
  }

  return {
    label: "Inactif",
    className:
      "border border-white/10 bg-white/10 text-white/60",
  }
}

function formatAmount(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:scale-[1.02]">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-2 text-white/70">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-white/40">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ClientDetail({ client }: Props) {
  const clientTypeLabel = getClientTypeLabel(client.client_type)
  const statusMeta = getStatusMeta(client.status)

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
              {clientTypeLabel}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
              <MapPin className="h-3.5 w-3.5" />
              {client.commune || "Non renseigné"}
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-semibold text-white">
            {client.name}
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/50">
            Vue d’ensemble du client et des informations utiles pour le suivi.
          </p>
        </div>

        {/* SOLDE */}
        <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-black/30 p-5">
          <p className="text-xs uppercase text-white/40">
            Solde d’ouverture
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatAmount(client.opening_balance)}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Base comptable initiale du client.
          </p>
        </div>
      </div>

      {/* INFOS */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          icon={<Phone className="h-4 w-4" />}
          label="Téléphone"
          value={client.phone || "-"}
        />

        <InfoCard
          icon={<MessageCircle className="h-4 w-4" />}
          label="WhatsApp"
          value={client.whatsapp || "-"}
        />

        <InfoCard
          icon={<UserCircle2 className="h-4 w-4" />}
          label="Responsable"
          value={client.account_manager || "Non renseigné"}
        />

        <InfoCard
          icon={<FolderKanban className="h-4 w-4" />}
          label="Catégorie"
          value={client.service_category || "Non renseignée"}
        />

        <InfoCard
          icon={<Briefcase className="h-4 w-4" />}
          label="Type"
          value={clientTypeLabel}
        />

        <InfoCard
          icon={<Wallet className="h-4 w-4" />}
          label="Statut"
          value={statusMeta.label}
        />
      </div>

      {/* NOTES */}
      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-white/10 bg-black/30 p-2 text-white/70">
            <StickyNote className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs uppercase text-white/40">
              Notes
            </p>
            <p className="mt-2 text-sm text-white/70 whitespace-pre-line">
              {client.notes || "Aucune note"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}