"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type EmployeeFormData = {
  full_name: string
  phone: string
  role: string
  salary_base: string
  status: "active" | "inactive"
  notes: string
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
}

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<EmployeeFormData>({
    full_name: "",
    phone: "",
    role: "",
    salary_base: "",
    status: "active",
    notes: "",
  })

  useEffect(() => {
    const loadEmployee = async () => {
      if (!params?.id) return

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
        .eq("id", params.id)
        .single()

      if (error || !data) {
        setError("Impossible de charger cet employé.")
        setLoading(false)
        return
      }

      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        role: data.role || "",
        salary_base: String(data.salary_base ?? ""),
        status: data.status === "inactive" ? "inactive" : "active",
        notes: data.notes || "",
      })

      setLoading(false)
    }

    loadEmployee()
  }, [params?.id, router, supabase])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.full_name.trim()) {
      setError("Veuillez saisir le nom de l’employé.")
      return
    }

    const parsedSalary = Number(formData.salary_base || 0)

    if (Number.isNaN(parsedSalary) || parsedSalary < 0) {
      setError("Salaire de base invalide.")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    setSaving(true)

    const payload = {
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim() || null,
      role: formData.role.trim() || null,
      salary_base: parsedSalary,
      status: formData.status,
      notes: formData.notes.trim() || null,
    }

    // ✅ PLUS DE user_id
    const { error } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", params.id)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/employees/${params.id}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-white">Modifier employé</h1>

      {error && <p className="text-red-400">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            name="role"
            value={formData.role}
            onChange={handleChange}
          />

          <input
            type="number"
            name="salary_base"
            value={formData.salary_base}
            onChange={handleChange}
          />

          <button type="submit">
            {saving ? "Saving..." : "Save"}
          </button>

        </form>
      )}
    </div>
  )
}