"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Client = {
  id: string
  name: string
}

export default function EditTransactionPage() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string

  const supabase = createClient() // ✅ FIX

  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [description, setDescription] = useState("")
  const [clientId, setClientId] = useState("")
  const [clients, setClients] = useState<Client[]>([])

  const [status, setStatus] = useState<"paid" | "partial" | "pending">("paid")
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "wave" | "orange_money" | "bank" | "other"
  >("cash")
  const [transactionDate, setTransactionDate] = useState("")

  const [pageLoading, setPageLoading] = useState(true)
  const [clientsLoading, setClientsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const amountNumber = useMemo(() => Number(amount), [amount])
  const isAmountValid =
    amount.trim() !== "" && !Number.isNaN(amountNumber) && amountNumber > 0

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setPageLoading(true)
      setClientsLoading(true)
      setErrorMessage("")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        if (isMounted) {
          setErrorMessage("Impossible de vérifier la session utilisateur.")
          setPageLoading(false)
          setClientsLoading(false)
        }
        return
      }

      if (!user) {
        router.push("/login")
        return
      }

      const [
        { data: clientsData, error: clientsError },
        { data: transactionData, error: transactionError },
      ] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .order("created_at", { ascending: false }),

        supabase
          .from("transactions")
          .select(
            "id, amount, type, description, client_id, status, payment_method, transaction_date"
          )
          .eq("id", transactionId)
          .single(),
      ])

      if (!isMounted) return

      if (clientsError) {
        setErrorMessage("Erreur clients : " + clientsError.message)
      } else {
        setClients(clientsData || [])
      }

      if (transactionError || !transactionData) {
        setErrorMessage("Transaction introuvable")
        setPageLoading(false)
        setClientsLoading(false)
        return
      }

      setAmount(String(transactionData.amount ?? ""))
      setType(transactionData.type)
      setDescription(transactionData.description || "")
      setClientId(transactionData.client_id || "")
      setStatus(transactionData.status || "paid")
      setPaymentMethod(transactionData.payment_method || "cash")
      setTransactionDate(
        transactionData.transaction_date
          ? String(transactionData.transaction_date).split("T")[0]
          : ""
      )

      setPageLoading(false)
      setClientsLoading(false)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [router, transactionId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!isAmountValid) {
      setErrorMessage("Montant invalide.")
      return
    }

    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setLoading(false)
      router.push("/login")
      return
    }

    const payload = {
      amount: amountNumber,
      type,
      description: description.trim() || null,
      client_id: clientId || null,
      status,
      payment_method: paymentMethod,
      transaction_date: transactionDate || null,
    }

    const { error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", transactionId) // ✅ plus de user_id

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setSuccessMessage("Transaction mise à jour")

    setTimeout(() => {
      router.push("/transactions")
    }, 700)
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Modifier transaction</h1>

        {errorMessage && <p className="text-red-400">{errorMessage}</p>}
        {successMessage && <p className="text-green-400">{successMessage}</p>}

        {pageLoading ? (
          <p>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded bg-black/30"
            />

            <button type="submit" disabled={loading}>
              {loading ? "..." : "Enregistrer"}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}