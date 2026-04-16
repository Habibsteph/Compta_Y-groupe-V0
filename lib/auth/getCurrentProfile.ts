import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/getCurrentUser"
import { Profile } from "@/types/auth"

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at, updated_at")
    .eq("id", user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Profile
}