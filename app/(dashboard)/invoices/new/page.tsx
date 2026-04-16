"use client"

import Link from "next/link"
import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Client = {
  id: string
  name: string
}

type InvoiceFormData = {
  client_id: string
  title: string
  description: string
  total_amount: string
  payment_mode: "full" | "installment"
  status: "pending" | "partial" | "paid" | "cancelled"
  due_date: string
}

function normalizeDate(value: string) {
  return value.trim() ? value : null
}

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [clients, setClients] = useState<Client[]>([])

  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: "",
    title: "",
    description: "",
    total_amount: "",
    payment_mode: "full",
    status: "pending",
    due_date: "",
  })

  useEffect(() => {
    const loadClients = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // ✅ PLUS DE user_id
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name", { ascending: true })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setClients(data || [])
      setLoading(false)
    }

    loadClients()
  }, [router, supabase])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    const parsedAmount = Number(formData.total_amount)

    if (!formData.client_id) {
      setError("Sélectionne un client.")
      setSaving(false)
      return
    }

    if (!formData.title.trim()) {
      setError("Le titre est requis.")
      setSaving(false)
      return
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Montant invalide.")
      setSaving(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Utilisateur non authentifié.")
      setSaving(false)
      router.push("/login")
      return
    }

    const payload = {
      client_id: formData.client_id,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      total_amount: parsedAmount,
      payment_mode: formData.payment_mode,
      status: formData.status,
      due_date: normalizeDate(formData.due_date),

      // ⚠️ organization_id arrive juste après
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert(payload)
      .select("id")
      .single()

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/invoices/${data.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* UI inchangée */}
    </div>
  )
}