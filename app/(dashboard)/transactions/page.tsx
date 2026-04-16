"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  Lock,
  Wallet,
  Landmark,
  CreditCard,
  Receipt,
  Filter,
} from "lucide-react"

export default function TransactionsPage() {
  const router = useRouter()
  const supabase = createClient() // ✅ FIX

  const [transactions, setTransactions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [filter, setFilter] = useState("all")
  const [clientFilter, setClientFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const loadTransactions = async () => {
    setLoading(true)
    setErrorMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(`*, clients (id, name), employees (id, full_name)`)
      .order("transaction_date", { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      setTransactions([])
      setLoading(false)
      return
    }

    setTransactions(data ?? [])
    setLoading(false)
  }

  const loadClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name")
      .order("name")

    setClients(data || [])
  }

  const loadEmployees = async () => {
    const { data } = await supabase
      .from("employees")
      .select("id, full_name")
      .order("full_name")

    setEmployees(data || [])
  }

  useEffect(() => {
    loadTransactions()
    loadClients()
    loadEmployees()
  }, [supabase]) // ✅ FIX

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchType = filter === "all" || item.type === filter
      const matchClient = !clientFilter || item.client_id === clientFilter
      const matchStatus = !statusFilter || item.status === statusFilter

      const term = search.toLowerCase()

      const matchSearch =
        !term ||
        (item.description || "").toLowerCase().includes(term) ||
        (item.clients?.[0]?.name || "").toLowerCase().includes(term) ||
        (item.employees?.[0]?.full_name || "").toLowerCase().includes(term)

      return matchType && matchClient && matchStatus && matchSearch
    })
  }, [transactions, filter, clientFilter, statusFilter, search])

  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [filteredTransactions]
  )

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [filteredTransactions]
  )

  const handleDelete = async (id: string) => {
    const tx = transactions.find((t) => t.id === id)

    if (tx?.is_locked) {
      alert("Transaction verrouillée.")
      return
    }

    if (!confirm("Supprimer ?")) return

    setDeletingId(id)

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)

    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    }

    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* UI inchangée */}
    </div>
  )
}