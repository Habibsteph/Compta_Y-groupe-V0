"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function NewEmployeePage() {
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

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

    // 🔐 Vérification session
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

      // ⚠️ organization_id sera injecté juste après
    }

    const { data, error } = await supabase
      .from("employees")
      .insert(payload)
      .select("id")
      .single()

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/employees/${data.id}`)
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Nouvel employé
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Ajoute un membre à ton équipe et commence à suivre ses opérations.
            </p>
          </div>

          <Link
            href="/employees"
            className="rounded-xl border border-white/10 px-4 py-2 text-white hover:bg-white/5"
          >
            Retour
          </Link>
        </div>
      </section>

      {/* FORM */}
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            name="full_name"
            placeholder="Nom complet"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="phone"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"
            />

            <input
              name="role"
              placeholder="Rôle"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              name="salary_base"
              placeholder="Salaire"
              value={formData.salary_base}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"
          />

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <p>Nom : {formData.full_name || "—"}</p>
            <p>Rôle : {formData.role || "—"}</p>
            <p>Status : {formData.status}</p>
            <p>
              Salaire :{" "}
              {formData.salary_base
                ? formatAmount(Number(formData.salary_base))
                : "0 FCFA"}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/employees"
              className="rounded-xl border border-white/10 px-4 py-2 text-white"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-white px-4 py-2 text-black"
            >
              {saving ? "Création..." : "Créer"}
            </button>
          </div>

        </form>
      </section>
    </div>
  )
}