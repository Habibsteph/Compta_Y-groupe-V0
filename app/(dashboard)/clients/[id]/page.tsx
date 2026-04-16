"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  Landmark,
  Wallet,
  Receipt,
  CircleDollarSign,
  Pencil,
  Plus,
} from "lucide-react"

import ClientDetail from "@/components/ClientDetail"
import { createClient } from "@/lib/supabase/client"
import { Client } from "@/types/client"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  status: string | null
  payment_method: string | null
  transaction_date: string | null
  description: string | null
  client_id: string | null
}

const currencyFormatter = new Intl.NumberFormat("fr-FR")
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatAmount(value: number) {
  return `${currencyFormatter.format(value)} FCFA`
}

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateFormatter.format(date)
}

function getTransactionTypeMeta(type: Transaction["type"]) {
  if (type === "income") {
    return {
      label: "Entrée",
      className:
        "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      icon: <ArrowDownLeft className="h-3.5 w-3.5" />,
      amountClassName: "text-emerald-300",
      sign: "+",
    }
  }

  return {
    label: "Sortie",
    className: "border border-rose-400/20 bg-rose-400/10 text-rose-300",
    icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    amountClassName: "text-rose-300",
    sign: "-",
  }
}

function getStatusMeta(status: string | null) {
  const value = (status || "").toLowerCase()

  if (
    ["paid", "payé", "paye", "completed", "confirmé", "confirme"].includes(
      value
    )
  ) {
    return {
      label: "Payé",
      className:
        "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    }
  }

  if (["pending", "en attente", "attente"].includes(value)) {
    return {
      label: "En attente",
      className: "border border-amber-400/20 bg-amber-400/10 text-amber-300",
    }
  }

  if (["partial", "partiel"].includes(value)) {
    return {
      label: "Partiel",
      className: "border border-blue-400/20 bg-blue-400/10 text-blue-300",
    }
  }

  if (["cancelled", "annulé", "annule"].includes(value)) {
    return {
      label: "Annulé",
      className: "border border-white/10 bg-white/10 text-white/65",
    }
  }

  return {
    label: status || "-",
    className: "border border-white/10 bg-white/10 text-white/65",
  }
}

function getPaymentMethodMeta(method: string | null) {
  const value = (method || "").toLowerCase()

  if (["cash", "espèces", "especes"].includes(value)) {
    return {
      label: "Espèces",
      icon: <Wallet className="h-3.5 w-3.5" />,
      className:
        "border border-orange-400/20 bg-orange-400/10 text-orange-300",
    }
  }

  if (["bank", "virement", "banque", "transfer"].includes(value)) {
    return {
      label: "Virement",
      icon: <Landmark className="h-3.5 w-3.5" />,
      className: "border border-sky-400/20 bg-sky-400/10 text-sky-300",
    }
  }

  if (["card", "carte"].includes(value)) {
    return {
      label: "Carte",
      icon: <CreditCard className="h-3.5 w-3.5" />,
      className:
        "border border-violet-400/20 bg-violet-400/10 text-violet-300",
    }
  }

  return {
    label: method || "-",
    icon: <Receipt className="h-3.5 w-3.5" />,
    className: "border border-white/10 bg-white/10 text-white/65",
  }
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition duration-200 hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/50">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs text-white/40">{subtitle}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-white/70">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function ClientPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [client, setClient] = useState<Client | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClientData = async () => {
      if (!params?.id) return

      setLoading(true)

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select(
          "id, user_id, name, phone, client_type, whatsapp, commune, notes, status, opening_balance, account_manager, service_category, created_at"
        )
        .eq("id", params.id)
        .single()

      if (clientError || !clientData) {
        console.error("Erreur client :", clientError)
        setLoading(false)
        router.push("/clients")
        return
      }

      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("transactions")
          .select(
            "id, amount, type, status, payment_method, transaction_date, description, client_id"
          )
          .eq("client_id", params.id)
          .order("transaction_date", { ascending: false })

      if (transactionsError) {
        console.error("Erreur transactions :", transactionsError)
      }

      setClient(clientData as Client)
      setTransactions(transactionsData || [])
      setLoading(false)
    }

    loadClientData()
  }, [params?.id, router, supabase])

  const openingBalance = Number(client?.opening_balance || 0)

  const incomeTotal = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  }, [transactions])

  const expenseTotal = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  }, [transactions])

  const paidTransactionsCount = useMemo(() => {
    return transactions.filter((tx) => {
      const value = (tx.status || "").toLowerCase()
      return [
        "paid",
        "payé",
        "paye",
        "completed",
        "confirmé",
        "confirme",
      ].includes(value)
    }).length
  }, [transactions])

  const pendingTransactionsCount = useMemo(() => {
    return transactions.filter((tx) => {
      const value = (tx.status || "").toLowerCase()
      return ["pending", "en attente", "attente", "partial", "partiel"].includes(
        value
      )
    }).length
  }, [transactions])

  const currentBalance = openingBalance + incomeTotal - expenseTotal
  const transactionCount = transactions.length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
          <div className="space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-72 animate-pulse rounded bg-white/5" />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-white/70">
          Client introuvable.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
              Compta Y Groupe
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Fiche client
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Informations générales, situation financière et historique des
              transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>

            <Link
              href={`/clients/${client.id}/edit`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>

            <Link
              href={`/transactions/new?client_id=${client.id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
            >
              <Plus className="h-4 w-4" />
              Nouvelle transaction
            </Link>
          </div>
        </div>
      </section>

      <ClientDetail client={client} />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Solde actuel"
          value={formatAmount(currentBalance)}
          subtitle={`Solde initial inclus : ${formatAmount(openingBalance)}`}
          icon={<CircleDollarSign className="h-5 w-5" />}
        />

        <StatCard
          title="Total entrées"
          value={formatAmount(incomeTotal)}
          subtitle={`${transactionCount} transaction(s) enregistrée(s)`}
          icon={<ArrowDownLeft className="h-5 w-5" />}
        />

        <StatCard
          title="Total sorties"
          value={formatAmount(expenseTotal)}
          subtitle={`${paidTransactionsCount} payée(s) / ${pendingTransactionsCount} en attente`}
          icon={<ArrowUpRight className="h-5 w-5" />}
        />

        <StatCard
          title="Solde initial"
          value={formatAmount(openingBalance)}
          subtitle="Montant d’ouverture du compte client"
          icon={<Wallet className="h-5 w-5" />}
        />
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Historique des transactions
            </h2>
            <p className="text-sm text-white/50">
              Vue détaillée des opérations liées à ce client.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-medium text-white/70">
              {transactionCount} transaction(s)
            </span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-300">
              Entrées : {formatAmount(incomeTotal)}
            </span>
            <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 font-medium text-rose-300">
              Sorties : {formatAmount(expenseTotal)}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.03] text-left text-white/45">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Paiement</th>
                  <th className="px-4 py-3 text-right font-medium">Montant</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 bg-black/10">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-white/50"
                    >
                      Aucune transaction pour ce client.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const typeMeta = getTransactionTypeMeta(tx.type)
                    const statusMeta = getStatusMeta(tx.status)
                    const paymentMeta = getPaymentMethodMeta(tx.payment_method)

                    return (
                      <tr
                        key={tx.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-white/70">
                          {formatDate(tx.transaction_date)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="max-w-[320px]">
                            <p className="font-medium text-white">
                              {tx.description || "Transaction sans description"}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              ID: {tx.id.slice(0, 8)}...
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${typeMeta.className}`}
                          >
                            {typeMeta.icon}
                            {typeMeta.label}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${paymentMeta.className}`}
                          >
                            {paymentMeta.icon}
                            {paymentMeta.label}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <span
                            className={`text-sm font-semibold ${typeMeta.amountClassName}`}
                          >
                            {typeMeta.sign}
                            {formatAmount(Number(tx.amount || 0))}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}