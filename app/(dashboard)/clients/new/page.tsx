"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Plus } from "lucide-react"

type ClientForm = {
  name: string
  client_type: string
  phone: string
  whatsapp: string
  commune: string
  notes: string
  status: string
}

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<ClientForm>({
    name: "",
    client_type: "company",
    phone: "",
    whatsapp: "",
    commune: "",
    notes: "",
    status: "active",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 🔥 IMPORTANT : vérifier session
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Utilisateur non connecté")
        router.push("/login")
        return
      }

      // ✅ INSERT SANS user_id
      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            name: form.name,
            client_type: form.client_type,
            phone: form.phone || null,
            whatsapp: form.whatsapp || null,
            commune: form.commune || null,
            notes: form.notes || null,
            status: form.status,
            // ⚠️ organization_id sera ajouté juste après (prochaine étape)
          },
        ])
        .select()
        .single()

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      router.push(`/clients/${data.id}`)
    } catch {
      alert("Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="mb-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <h1 className="text-3xl font-semibold">Nouveau client</h1>
          <p className="mt-2 text-sm text-white/50">
            Ajoute un client rapidement à ton système.
          </p>
        </section>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Infos */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-sm uppercase text-white/40">
              Informations
            </h2>

            <div className="space-y-4">
              <input
                name="name"
                placeholder="Nom ou raison sociale"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  name="client_type"
                  value={form.client_type}
                  onChange={handleChange}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                >
                  <option value="company">Entreprise</option>
                  <option value="individual">Particulier</option>
                </select>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                >
                  <option value="active">Actif</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-sm uppercase text-white/40">Contact</h2>

            <div className="space-y-4">
              <input
                name="phone"
                placeholder="Téléphone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              />

              <input
                name="whatsapp"
                placeholder="WhatsApp"
                value={form.whatsapp}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-sm uppercase text-white/40">
              Localisation
            </h2>

            <input
              name="commune"
              placeholder="Commune"
              value={form.commune}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
            />
          </div>

          {/* Notes */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-sm uppercase text-white/40">Notes</h2>

            <textarea
              name="notes"
              placeholder="Ajouter une note..."
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white h-28"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-white hover:bg-white/5"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-black hover:opacity-90"
            >
              <Plus size={16} />
              {loading ? "Création..." : "Créer le client"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}