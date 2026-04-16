"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FileText,
  User,
  LogOut,
} from "lucide-react"

type DashboardShellProps = {
  children: React.ReactNode
}

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: string
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient() // ✅ FIX

  const [email, setEmail] = useState("")
  const [clientsCount, setClientsCount] = useState<number | null>(null)
  const [transactionsCount, setTransactionsCount] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true

    const loadShellData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      if (mounted) {
        setEmail(user.email || "")
      }

      // ✅ PLUS DE user_id → RLS gère
      const [clientsRes, transactionsRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("transactions")
          .select("id", { count: "exact", head: true }),
      ])

      if (!mounted) return

      setClientsCount(clientsRes.count ?? 0)
      setTransactionsCount(transactionsRes.count ?? 0)
    }

    loadShellData()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  const firstNameFromEmail = useMemo(() => {
    return email ? email.split("@")[0] : "Utilisateur"
  }, [email])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "Clients",
      href: "/clients",
      icon: Users,
      badge: clientsCount !== null ? String(clientsCount) : undefined,
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: ArrowLeftRight,
      badge: transactionsCount !== null ? String(transactionsCount) : undefined,
    },
    { label: "Factures", href: "/invoices", icon: FileText },
    { label: "Employés", href: "/employees", icon: User },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-72 border-r border-white/10 bg-black/40 lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <h1 className="text-2xl font-semibold">Compta Y Groupe</h1>
            <p className="text-sm text-white/50 mt-2">
              Back Office
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(item.href)

              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                    isActive
                      ? "bg-white text-black"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </div>

                  {item.badge && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full py-3 border rounded-2xl"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="flex-1">
          <header className="border-b border-white/10 p-4">
            <h2 className="text-xl">Bonjour {firstNameFromEmail}</h2>
            <p className="text-sm text-white/50">{email}</p>
          </header>

          <div className="p-6">{children}</div>
        </div>
      </div>
    </main>
  )
}