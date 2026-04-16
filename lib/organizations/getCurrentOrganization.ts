import { createClient } from "@/lib/supabase/server"
import { getCurrentMembership } from "@/lib/organizations/getCurrentMembership"
import { Organization } from "@/types/organization"

export async function getCurrentOrganization(): Promise<Organization | null> {
  const membership = await getCurrentMembership()
  if (!membership) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, owner_user_id, created_at, updated_at")
    .eq("id", membership.organization_id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Organization
}