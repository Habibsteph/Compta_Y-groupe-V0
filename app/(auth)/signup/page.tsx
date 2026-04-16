"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"
import AuthShell from "@/components/auth/AuthShell"
import AuthCard from "@/components/auth/AuthCard"
import AuthInput from "@/components/auth/AuthInput"
import AuthSubmitButton from "@/components/auth/AuthSubmitButton"

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const passwordMismatch = useMemo(() => {
    return confirmPassword.length > 0 && password !== confirmPassword
  }, [password, confirmPassword])

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          companyName,
          email,
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.error || "Inscription impossible.")
        setLoading(false)
        return
      }

      setSuccessMessage(
        result.message ||
          "Compte créé avec succès. Vérifiez votre email si une confirmation est requise."
      )

      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch {
      setErrorMessage("Une erreur inattendue est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Commencez avec une expérience de gestion simple, moderne et pensée pour votre activité."
    >
      <AuthCard>
        <form onSubmit={handleSignup} className="space-y-5">
          <AuthInput
            label="Nom complet"
            type="text"
            placeholder="Votre nom"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <AuthInput
            label="Nom de l’organisation"
            type="text"
            placeholder="Ex: Y Groupe"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <AuthInput
            label="Adresse email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthInput
            label="Mot de passe"
            type="password"
            placeholder="Créer un mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <AuthInput
            label="Confirmer le mot de passe"
            type="password"
            placeholder="Répéter le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={passwordMismatch ? "Les mots de passe ne correspondent pas." : ""}
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
            Créer mon compte
          </AuthSubmitButton>

          <p className="text-center text-sm text-white/55">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-white/85 hover:text-white">
              Se connecter
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  )
}