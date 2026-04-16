import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const fullName = String(body.fullName || "").trim()
    const companyName = String(body.companyName || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "").trim()

    if (!fullName || !companyName || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Impossible de créer le compte." },
        { status: 400 }
      )
    }

    const user = authData.user

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      full_name: fullName,
      role: "admin",
    })

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    const baseSlug = slugify(companyName)
    const organizationSlug = `${baseSlug}-${user.id.slice(0, 8)}`

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .insert({
        name: companyName,
        slug: organizationSlug,
        owner_user_id: user.id,
      })
      .select("id")
      .single()

    if (organizationError || !organization) {
      return NextResponse.json(
        {
          error:
            organizationError?.message ||
            "Impossible de créer l’organisation.",
        },
        { status: 400 }
      )
    }

    const { error: membershipError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: "admin",
      })

    if (membershipError) {
      return NextResponse.json(
        { error: membershipError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message:
        "Compte créé avec succès. Vérifiez votre email si une confirmation est requise.",
    })
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue." },
      { status: 500 }
    )
  }
}