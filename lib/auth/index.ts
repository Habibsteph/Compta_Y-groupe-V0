import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getCurrentMembership() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) return null

  return data
}

export async function getCurrentOrganization() {
  const membership = await getCurrentMembership()

  if (!membership) return null

  return {
    id: membership.organization_id,
    role: membership.role,
  }
}