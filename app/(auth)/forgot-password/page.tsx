"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AuthShell from "@/components/auth/AuthShell"
import AuthCard from "@/components/auth/AuthCard"
import AuthInput from "@/components/auth/AuthInput"
import AuthSubmitButton from "@/components/auth/AuthSubmitButton"

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      setErrorMessage(error.message || "Impossible d’envoyer l’email.")
      setLoading(false)
      return
    }

    setSuccessMessage(
      "Un email de réinitialisation a été envoyé si cette adresse existe."
    )
    setLoading(false)
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Entrez votre adresse email pour recevoir un lien de réinitialisation."
    >
      <AuthCard>
        <form onSubmit={handleReset} className="space-y-5">
          <AuthInput
            label="Adresse email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {errorMessage ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          <AuthSubmitButton loading={loading}>
            Envoyer le lien
          </AuthSubmitButton>

          <p className="text-center text-sm text-white/55">
            Retour à{" "}
            <Link href="/login" className="text-white/85 hover:text-white">
              la connexion
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  )
}