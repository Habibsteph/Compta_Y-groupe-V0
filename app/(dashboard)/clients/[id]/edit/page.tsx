"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const supabase = createClient() // ✅ AJOUT

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    commune: "",
    account_manager: "",
    service_category: "",
    opening_balance: "0",
    client_type: "company",
    status: "active",
    notes: "",
  })

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true)
        setError("")

        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .single()

        if (error) {
          setError(error.message)
          return
        }

        if (!data) {
          setError("Client introuvable.")
          return
        }

        setFormData({
          name: data.name ?? "",
          phone: data.phone ?? "",
          whatsapp: data.whatsapp ?? "",
          commune: data.commune ?? "",
          account_manager: data.account_manager ?? "",
          service_category: data.service_category ?? "",
          opening_balance: String(data.opening_balance ?? 0),
          client_type: data.client_type ?? "company",
          status: data.status ?? "active",
          notes: data.notes ?? "",
        })
      } catch {
        setError("Une erreur est survenue lors du chargement du client.")
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      fetchClient()
    }
  }, [clientId, supabase])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError("Le nom du client est obligatoire.")
      return
    }

    const parsedOpeningBalance =
      formData.opening_balance.trim() === ""
        ? 0
        : Number(formData.opening_balance)

    if (Number.isNaN(parsedOpeningBalance)) {
      setError("Le solde initial doit être un nombre valide.")
      return
    }

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const { error } = await supabase
        .from("clients")
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          whatsapp: formData.whatsapp.trim() || null,
          commune: formData.commune.trim() || null,
          account_manager: formData.account_manager.trim() || null,
          service_category: formData.service_category.trim() || null,
          opening_balance: parsedOpeningBalance,
          client_type: formData.client_type,
          status: formData.status,
          notes: formData.notes.trim() || null,
        })
        .eq("id", clientId)

      if (error) {
        setError(error.message)
        return
      }

      setSuccess("Client mis à jour avec succès.")

      setTimeout(() => {
        router.push(`/clients/${clientId}`)
      }, 700)
    } catch {
      setError("Une erreur est survenue pendant la mise à jour.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Chargement du client...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier le client
            </h1>
            <p className="text-sm text-gray-500">
              Mets à jour les informations du client.
            </p>
          </div>

          <Link
            href={`/clients/${clientId}`}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retour
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* tout ton form inchangé */}
        </form>
      </div>
    </div>
  )
}