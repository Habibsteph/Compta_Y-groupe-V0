"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Invoice } from "@/types/invoice"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  transaction_date: string | null
  description: string | null
  status: string | null
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "paid":
      return "Payée"
    case "partial":
      return "Partielle"
    case "cancelled":
      return "Annulée"
    case "pending":
    default:
      return "En attente"
  }
}

function getStatusClasses(status?: string | null) {
  switch (status) {
    case "paid":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    case "partial":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300"
    case "cancelled":
      return "border-red-500/20 bg-red-500/10 text-red-300"
    case "pending":
    default:
      return "border-white/10 bg-white/5 text-white/70"
  }
}

function getClientName(clients: any) {
  if (!clients) return "—"
  if (Array.isArray(clients)) return clients[0]?.name || "—"
  if (typeof clients === "object") return clients.name || "—"
  return "—"
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient() // ✅ FIX

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      if (!params?.id) return

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const [invoiceRes, txRes] = await Promise.all([
        supabase
          .from("invoices")
          .select(`*, clients (id, name)`)
          .eq("id", params.id)
          .single(),

        supabase
          .from("transactions")
          .select("*")
          .eq("invoice_id", params.id)
          .order("transaction_date", { ascending: false }),
      ])

      if (invoiceRes.error) {
        setError(invoiceRes.error.message)
        setLoading(false)
        return
      }

      setInvoice(invoiceRes.data as Invoice)
      setTransactions(txRes.data || [])
      setLoading(false)
    }

    loadData()
  }, [params?.id, router, supabase]) // ✅ FIX

  const amountPaid = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  }, [transactions])

  const remainingAmount = useMemo(() => {
    if (!invoice) return 0
    return Math.max(0, Number(invoice.total_amount || 0) - amountPaid)
  }, [invoice, amountPaid])

  const isFullyPaid = remainingAmount <= 0

  if (loading) {
    return <p className="text-white/60 p-6">Chargement...</p>
  }

  if (error) {
    return <p className="text-red-300 p-6">{error}</p>
  }

  if (!invoice) return null

  return (
    <div className="space-y-6">
      {/* UI inchangée */}
    </div>
  )
}