"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  CircleDollarSign,
  CreditCard,
  FileText,
  Landmark,
  Receipt,
  User,
  Users,
  Wallet,
} from "lucide-react"

type Client = {
  id: string
  name: string
}

type Invoice = {
  id: string
  title: string
  client_id: string
  total_amount: number
}

type Employee = {
  id: string
  full_name: string
}

type ExistingTransaction = {
  id: string
  invoice_id: string | null
  amount: number
  type: "income" | "expense"
}

type FormData = {
  party_type: "client" | "employee" | "internal"
  client_id: string
  employee_id: string
  invoice_id: string
  amount: string
  type: "income" | "expense"
  description: string
  transaction_date: string
  status: "paid" | "partial" | "pending" | "cancelled"
  payment_method: "cash" | "wave" | "orange_money" | "bank" | "other"
  category: string
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
}

export default function NewTransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [invoiceTransactions, setInvoiceTransactions] = useState<
    ExistingTransaction[]
  >([])

  const [formData, setFormData] = useState<FormData>({
    party_type: "client",
    client_id: "",
    employee_id: "",
    invoice_id: "",
    amount: "",
    type: "income",
    description: "",
    transaction_date: "",
    status: "paid",
    payment_method: "cash",
    category: "",
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError("")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/login")
        return
      }

      const [clientsRes, invoicesRes, employeesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .eq("status", "active")
          .order("name", { ascending: true }),

        supabase
          .from("invoices")
          .select("id, title, client_id, total_amount")
          .order("created_at", { ascending: false }),

        supabase
          .from("employees")
          .select("id, full_name")
          .eq("status", "active")
          .order("full_name", { ascending: true }),
      ])

      if (clientsRes.error) {
        setError(clientsRes.error.message)
        setLoading(false)
        return
      }

      if (invoicesRes.error) {
        setError(invoicesRes.error.message)
        setLoading(false)
        return
      }

      if (employeesRes.error) {
        setError(employeesRes.error.message)
        setLoading(false)
        return
      }

      setClients((clientsRes.data || []) as Client[])
      setInvoices((invoicesRes.data || []) as Invoice[])
      setEmployees((employeesRes.data || []) as Employee[])
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  useEffect(() => {
    const invoiceId = searchParams.get("invoice_id")
    const clientId = searchParams.get("client_id")
    const employeeId = searchParams.get("employee_id")
    const partyType = searchParams.get("party_type")

    setFormData((prev) => {
      const next = { ...prev }

      if (partyType === "employee" && employeeId) {
        next.party_type = "employee"
        next.employee_id = employeeId
        next.client_id = ""
        next.invoice_id = ""
        next.type = "expense"
      }

      if (partyType === "client" || invoiceId || clientId) {
        next.party_type = "client"
        next.employee_id = ""
        next.type = "income"

        if (clientId) {
          next.client_id = clientId
        }

        if (invoiceId) {
          next.invoice_id = invoiceId
        }
      }

      return next
    })
  }, [searchParams])

  useEffect(() => {
    const loadInvoiceTransactions = async () => {
      if (!formData.invoice_id) {
        setInvoiceTransactions([])
        return
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("id, invoice_id, amount, type")
        .eq("invoice_id", formData.invoice_id)

      if (error) {
        setError(error.message)
        return
      }

      setInvoiceTransactions((data || []) as ExistingTransaction[])
    }

    loadInvoiceTransactions()
  }, [formData.invoice_id, supabase])

  const filteredInvoices = useMemo(() => {
    if (formData.party_type !== "client" || !formData.client_id) return []
    return invoices.filter((invoice) => invoice.client_id === formData.client_id)
  }, [formData.party_type, formData.client_id, invoices])

  const selectedInvoice = useMemo(() => {
    if (!formData.invoice_id) return null
    return invoices.find((invoice) => invoice.id === formData.invoice_id) || null
  }, [formData.invoice_id, invoices])

  const amountAlreadyPaid = useMemo(() => {
    return invoiceTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  }, [invoiceTransactions])

  const remainingInvoiceAmount = useMemo(() => {
    if (!selectedInvoice) return null
    return Math.max(0, Number(selectedInvoice.total_amount || 0) - amountAlreadyPaid)
  }, [selectedInvoice, amountAlreadyPaid])

  const isInvoiceFullyPaid = useMemo(() => {
    if (remainingInvoiceAmount === null) return false
    return remainingInvoiceAmount <= 0
  }, [remainingInvoiceAmount])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      } as FormData

      if (name === "party_type") {
        if (value === "client") {
          next.employee_id = ""
          next.type = "income"
        }

        if (value === "employee") {
          next.client_id = ""
          next.invoice_id = ""
          next.type = "expense"
        }

        if (value === "internal") {
          next.client_id = ""
          next.employee_id = ""
          next.invoice_id = ""
        }
      }

      if (name === "client_id") {
        next.invoice_id = ""
      }

      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const parsedAmount = Number(formData.amount)

    if (!formData.amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Montant invalide.")
      return
    }

    if (formData.party_type === "client" && !formData.client_id) {
      setError("Veuillez sélectionner un client.")
      return
    }

    if (formData.party_type === "employee" && !formData.employee_id) {
      setError("Veuillez sélectionner un employé.")
      return
    }

    if (
      formData.party_type === "client" &&
      formData.invoice_id &&
      selectedInvoice &&
      isInvoiceFullyPaid
    ) {
      setError("Cette facture est déjà entièrement réglée.")
      return
    }

    if (
      formData.party_type === "client" &&
      formData.invoice_id &&
      selectedInvoice &&
      remainingInvoiceAmount !== null &&
      parsedAmount > remainingInvoiceAmount
    ) {
      setError(
        `Le montant dépasse le reste à payer (${formatAmount(
          remainingInvoiceAmount
        )}).`
      )
      return
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      router.push("/login")
      return
    }

    try {
      setSaving(true)

      const payload = {
        party_type: formData.party_type,
        client_id: formData.party_type === "client" ? formData.client_id : null,
        employee_id:
          formData.party_type === "employee" ? formData.employee_id : null,
        invoice_id:
          formData.party_type === "client" && formData.invoice_id
            ? formData.invoice_id
            : null,
        amount: parsedAmount,
        type: formData.type,
        description: formData.description || null,
        transaction_date: formData.transaction_date || null,
        status: formData.status,
        payment_method: formData.payment_method,
        category: formData.category || null,
      }

      const { error: insertError } = await supabase
        .from("transactions")
        .insert(payload)

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }

      if (formData.invoice_id) {
        router.push(`/invoices/${formData.invoice_id}`)
        return
      }

      router.push("/transactions")
    } catch {
      setError("Erreur lors de l’enregistrement.")
      setSaving(false)
    }
  }

  const paymentOptions = [
    { value: "cash", label: "Espèces", icon: Wallet },
    { value: "wave", label: "Wave", icon: CreditCard },
    { value: "orange_money", label: "Orange Money", icon: CreditCard },
    { value: "bank", label: "Banque", icon: Landmark },
    { value: "other", label: "Autre", icon: Receipt },
  ] as const

  return (
    <div className="w-full space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent">
        <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-start lg:justify-between lg:px-8 lg:py-8">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={16} />
              Retour
            </button>

            <p className="text-xs uppercase tracking-[0.28em] text-white/40">
              Compta Y Groupe
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Nouvelle transaction
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Enregistre une entrée, une dépense interne ou un paiement lié à
              un client ou un employé.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white/70">
                <CircleDollarSign size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Saisie comptable
                </p>
                <p className="text-xs text-white/45">
                  Formulaire de création d’opération
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        {error ? (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {selectedInvoice ? (
          <div className="mb-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Facture sélectionnée : {selectedInvoice.title}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Total : {formatAmount(Number(selectedInvoice.total_amount || 0))} ·
                  Déjà payé : {formatAmount(amountAlreadyPaid)} ·
                  Reste :{" "}
                  <span
                    className={
                      isInvoiceFullyPaid ? "text-emerald-400" : "text-amber-300"
                    }
                  >
                    {formatAmount(remainingInvoiceAmount || 0)}
                  </span>
                </p>
              </div>

              {isInvoiceFullyPaid ? (
                <span className="inline-flex w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Facture soldée
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Type de transaction
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                  />
                  <select
                    name="party_type"
                    value={formData.party_type}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/20"
                  >
                    <option value="client">Client</option>
                    <option value="employee">Employé</option>
                    <option value="internal">Interne</option>
                  </select>
                </div>
              </div>

              {formData.party_type === "client" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Client
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />
                    <select
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/20"
                    >
                      <option value="">Choisir un client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.party_type === "employee" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Employé
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />
                    <select
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-white/20"
                    >
                      <option value="">Choisir un employé</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.party_type === "client" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Marché / Facture
                  </label>
                  <div className="relative">
                    <FileText
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />
                    <select
                      name="invoice_id"
                      value={formData.invoice_id}
                      onChange={handleChange}
                      disabled={!formData.client_id}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
                    >
                      <option value="">
                        {!formData.client_id
                          ? "Sélectionnez d’abord un client"
                          : "Aucune facture liée"}
                      </option>

                      {filteredInvoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Nature
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={formData.party_type === "client"}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
                >
                  <option value="income">Entrée</option>
                  <option value="expense">Dépense</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Montant
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Montant"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={isInvoiceFullyPaid}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
                />
                {selectedInvoice &&
                remainingInvoiceAmount !== null &&
                !isInvoiceFullyPaid ? (
                  <p className="mt-2 text-xs text-white/45">
                    Maximum autorisé : {formatAmount(remainingInvoiceAmount)}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Date
                </label>
                <input
                  type="date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleChange}
                  disabled={isInvoiceFullyPaid}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Catégorie
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Ex: salaire, acompte, impression..."
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isInvoiceFullyPaid}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isInvoiceFullyPaid}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
                >
                  <option value="paid">Payé</option>
                  <option value="partial">Partiel</option>
                  <option value="pending">En attente</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Mode de paiement
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  disabled={isInvoiceFullyPaid}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Ajoute un contexte ou une note sur la transaction"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                disabled={isInvoiceFullyPaid}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/20"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
              <Link
                href={
                  formData.invoice_id
                    ? `/invoices/${formData.invoice_id}`
                    : "/transactions"
                }
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving || isInvoiceFullyPaid}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isInvoiceFullyPaid
                  ? "Facture déjà soldée"
                  : saving
                  ? "Enregistrement..."
                  : "Valider la transaction"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}