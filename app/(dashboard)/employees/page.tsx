"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "active":
      return "Actif"
    case "inactive":
      return "Inactif"
    default:
      return "Non défini"
  }
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case "active":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    case "inactive":
      return "border-white/10 bg-white/5 text-white/60"
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-300"
  }
}

export default function EmployeesPage() {
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const loadEmployees = async () => {
    setLoading(true)
    setErrorMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    // ✅ PLUS DE user_id
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setErrorMessage("Erreur lors du chargement des employés : " + error.message)
      setEmployees([])
      setLoading(false)
      return
    }

    setEmployees((data || []) as Employee[])
    setLoading(false)
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.trim().toLowerCase()

      const matchSearch =
        searchValue === "" ||
        employee.full_name.toLowerCase().includes(searchValue) ||
        (employee.phone || "").toLowerCase().includes(searchValue) ||
        (employee.role || "").toLowerCase().includes(searchValue)

      const matchStatus =
        statusFilter === "" || (employee.status || "") === statusFilter

      return matchSearch && matchStatus
    })
  }, [employees, search, statusFilter])

  const totalSalaryBase = useMemo(() => {
    return filteredEmployees.reduce(
      (sum, employee) => sum + Number(employee.salary_base || 0),
      0
    )
  }, [filteredEmployees])

  const activeEmployeesCount = useMemo(() => {
    return filteredEmployees.filter((employee) => employee.status === "active").length
  }, [filteredEmployees])

  const inactiveEmployeesCount = useMemo(() => {
    return filteredEmployees.filter((employee) => employee.status === "inactive").length
  }, [filteredEmployees])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer cet employé ?")
    if (!confirmed) return

    setDeletingId(id)

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id) // ✅ PLUS DE user_id

    setDeletingId(null)

    if (error) {
      setErrorMessage("Erreur suppression : " + error.message)
      return
    }

    setEmployees((prev) => prev.filter((employee) => employee.id !== id))
  }

  return (
    <div className="w-full space-y-6">
      {/* tout ton JSX reste IDENTIQUE */}
    </div>
  )
}