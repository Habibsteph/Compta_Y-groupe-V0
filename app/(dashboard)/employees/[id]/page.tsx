"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Employee = {
  id: string
  full_name: string
  phone: string | null
  role: string | null
  salary_base: number | null
  status: string | null
  notes: string | null
  created_at: string
}

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  status: "paid" | "partial" | "pending" | "cancelled" | null
  payment_method: "cash" | "wave" | "orange_money" | "bank" | "other" | null
  transaction_date: string | null
  description: string | null
  employee_id: string | null
}

function formatAmount(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("fr-FR")
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!params?.id) return

      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // ✅ PLUS DE user_id
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", params.id)
        .single()

      if (employeeError || !employeeData) {
        router.push("/employees")
        return
      }

      // ✅ PLUS DE user_id
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("employee_id", params.id)
        .order("transaction_date", { ascending: false })

      setEmployee(employeeData)
      setTransactions((transactionsData || []) as Transaction[])
      setLoading(false)
    }

    loadEmployeeData()
  }, [params?.id, router, supabase])

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  }, [transactions])

  const totalIncomes = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  }, [transactions])

  const netBalance = totalIncomes - totalExpenses

  if (loading) return <div>Chargement...</div>
  if (!employee) return <div>Employé introuvable</div>

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">{employee.full_name}</h1>

      <p>Salaire : {formatAmount(Number(employee.salary_base || 0))}</p>
      <p>Solde net : {formatAmount(netBalance)}</p>

      <h2 className="text-xl font-semibold mt-6">Transactions</h2>

      {transactions.map((tx) => (
        <div key={tx.id} className="border p-3 rounded">
          <p>{tx.description}</p>
          <p>{formatAmount(tx.amount)}</p>
        </div>
      ))}
    </div>
  )
}