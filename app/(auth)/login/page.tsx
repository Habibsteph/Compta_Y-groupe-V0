"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AuthShell from "@/components/auth/AuthShell"
import AuthCard from "@/components/auth/AuthCard"
import AuthInput from "@/components/auth/AuthInput"
import AuthSubmitButton from "@/components/auth/AuthSubmitButton"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient() // ✅ AJOUT IMPORTANT

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message || "Connexion impossible.")
      setLoading(false)
      return
    }

    setSuccessMessage("Connexion réussie. Redirection...")

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace Compta Y Groupe pour gérer votre activité en toute fluidité."
    >
      <AuthCard>
        <form onSubmit={handleLogin} className="space-y-5">
          <AuthInput
            label="Adresse email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pr-24 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.07] focus:ring-2 focus:ring-white/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/55 transition hover:text-white"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

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
            Se connecter
          </AuthSubmitButton>

          <div className="flex items-center justify-between gap-4 text-sm">
            <Link
              href="/forgot-password"
              className="text-white/55 transition hover:text-white"
            >
              Mot de passe oublié ?
            </Link>

            <Link
              href="/signup"
              className="text-white/80 transition hover:text-white"
            >
              Créer un compte
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  )
}