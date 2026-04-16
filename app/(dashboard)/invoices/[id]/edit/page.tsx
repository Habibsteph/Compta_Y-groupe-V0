"use client"

import Link from "next/link"
import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
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

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>()
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
    const loadData = async () => {
      if (!params?.id) return

      setLoading(true)
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const [clientsRes, invoiceRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .order("name", { ascending: true }),

        supabase
          .from("invoices")
          .select("*")
          .eq("id", params.id)
          .single(),
      ])

      if (clientsRes.error) {
        setError(clientsRes.error.message)
        setLoading(false)
        return
      }

      if (invoiceRes.error) {
        setError(invoiceRes.error.message)
        setLoading(false)
        return
      }

      if (!invoiceRes.data) {
        router.push("/invoices")
        return
      }

      const invoice = invoiceRes.data

      setClients(clientsRes.data || [])
      setFormData({
        client_id: invoice.client_id || "",
        title: invoice.title || "",
        description: invoice.description || "",
        total_amount: invoice.total_amount ? String(invoice.total_amount) : "",
        payment_mode: invoice.payment_mode || "full",
        status: invoice.status || "pending",
        due_date: invoice.due_date || "",
      })

      setLoading(false)
    }

    loadData()
  }, [params?.id, router, supabase])

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
    }

    const { error } = await supabase
      .from("invoices")
      .update(payload)
      .eq("id", params.id)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/invoices/${params.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* UI inchangée */}
    </div>
  )
}