import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/getCurrentUser"
import { OrganizationMember } from "@/types/organization"

export async function getCurrentMembership(): Promise<OrganizationMember | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organization_members")
    .select("id, organization_id, user_id, role, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as OrganizationMember
}