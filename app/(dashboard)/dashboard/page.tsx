"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  description: string | null
  created_at: string
  transaction_date: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [clientsCount, setClientsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // ✅ SANS user_id → RLS fait le job
      const [transactionsRes, clientsRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .order("transaction_date", { ascending: true })
          .limit(12),

        supabase.from("clients").select("id"),
      ])

      setTransactions(transactionsRes.data || [])
      setClientsCount((clientsRes.data || []).length)

      setLoading(false)
    }

    loadDashboard()
  }, [router, supabase])

  const incomeTotal = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [transactions])

  const expenseTotal = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [transactions])

  const balance = incomeTotal - expenseTotal

  const chartData = transactions.map((t) => ({
    date: new Date(
      t.transaction_date || t.created_at
    ).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
    income: t.type === "income" ? Number(t.amount) : 0,
    expense: t.type === "expense" ? Number(t.amount) : 0,
  }))

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value) + " FCFA"

  return (
    <div className="space-y-6">

      {/* HERO */}
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6">
        <h1 className="text-3xl font-semibold">
          Pilote ta trésorerie 🚀
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Vue globale de ton activité financière en temps réel.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/clients/new" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black">
            + Client
          </Link>

          <Link href="/transactions/new" className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white">
            + Transaction
          </Link>

          <Link href="/invoices/new" className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white">
            + Facture
          </Link>

          <Link href="/employees/new" className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white">
            + Employé
          </Link>
        </div>
      </section>

      {/* KPI */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Solde" value={formatAmount(balance)} icon={<Wallet />} />
        <Card title="Entrées" value={formatAmount(incomeTotal)} icon={<TrendingUp />} />
        <Card title="Sorties" value={formatAmount(expenseTotal)} icon={<TrendingDown />} />
        <Card title="Clients" value={clientsCount.toString()} icon={<Users />} />
      </section>

      {/* GRAPH */}
      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-semibold mb-4">Évolution</h2>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#34d399" />
              <Line type="monotone" dataKey="expense" stroke="#fb7185" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* TRANSACTIONS */}
      <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-semibold mb-4">
          Transactions récentes
        </h2>

        {loading ? (
          <p className="text-white/50">Chargement...</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex justify-between rounded-2xl border border-white/10 p-4"
              >
                <div>
                  <p className="text-white">
                    {t.description || "Transaction"}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>

                <p
                  className={
                    t.type === "income"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatAmount(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Card({ title, value, icon }: any) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-white/50">{title}</p>
          <p className="mt-2 text-2xl text-white">{value}</p>
        </div>
        <div className="text-white/70">{icon}</div>
      </div>
    </div>
  )
}