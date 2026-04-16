"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Invoice = {
  id: string
  client_id: string
  title: string
  description: string | null
  total_amount: number
  payment_mode: "full" | "installment"
  status: "pending" | "partial" | "paid" | "cancelled"
  due_date: string | null
  created_at: string
  clients: {
    id: string
    name: string
  }[] | null
}

type Transaction = {
  id: string
  invoice_id: string | null
  amount: number
  type: "income" | "expense"
  status: string | null
}

type EnrichedInvoice = Invoice & {
  amountPaid: number
  remaining: number
  computedStatus: "pending" | "partial" | "paid"
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
}

export default function InvoicesPage() {
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setErrorMessage("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // ✅ PLUS DE user_id → RLS fait le boulot
      const [invoicesRes, transactionsRes] = await Promise.all([
        supabase
          .from("invoices")
          .select(`*, clients(id, name)`)
          .order("created_at", { ascending: false }),

        supabase
          .from("transactions")
          .select("id, invoice_id, amount, type, status"),
      ])

      if (invoicesRes.error) {
        setErrorMessage(invoicesRes.error.message)
        setLoading(false)
        return
      }

      if (transactionsRes.error) {
        setErrorMessage(transactionsRes.error.message)
        setLoading(false)
        return
      }

      setInvoices((invoicesRes.data ?? []) as Invoice[])
      setTransactions((transactionsRes.data ?? []) as Transaction[])
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const amountPaidByInvoice = useMemo(() => {
    const map = new Map<string, number>()

    for (const tx of transactions) {
      if (!tx.invoice_id) continue
      if (tx.type !== "income") continue

      const current = map.get(tx.invoice_id) ?? 0
      map.set(tx.invoice_id, current + Number(tx.amount || 0))
    }

    return map
  }, [transactions])

  const enrichedInvoices = useMemo<EnrichedInvoice[]>(() => {
    return invoices.map((invoice) => {
      const amountPaid = amountPaidByInvoice.get(invoice.id) ?? 0
      const remaining = Math.max(0, Number(invoice.total_amount) - amountPaid)

      const computedStatus =
        amountPaid <= 0 ? "pending" : remaining > 0 ? "partial" : "paid"

      return {
        ...invoice,
        amountPaid,
        remaining,
        computedStatus,
      }
    })
  }, [invoices, amountPaidByInvoice])

  const filteredInvoices = useMemo(() => {
    return enrichedInvoices.filter((invoice) => {
      const title = invoice.title?.toLowerCase() || ""
      const clientName = invoice.clients?.[0]?.name?.toLowerCase() || ""
      const query = search.toLowerCase().trim()

      const matchesSearch =
        !query || title.includes(query) || clientName.includes(query)

      const matchesStatus =
        !statusFilter || invoice.computedStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [enrichedInvoices, search, statusFilter])

  return (
    <div className="w-full space-y-6">
      {/* ton UI reste identique */}
    </div>
  )
}