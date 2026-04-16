export type ProfileRole = "admin" | "staff" | "viewer"

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: ProfileRole
  created_at: string
  updated_at: string
}