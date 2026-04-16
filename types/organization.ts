export type OrganizationRole = "admin" | "staff" | "viewer"

export type Organization = {
  id: string
  name: string
  slug: string | null
  owner_user_id: string | null
  created_at: string
  updated_at: string
}

export type OrganizationMember = {
  id: string
  organization_id: string
  user_id: string
  role: OrganizationRole
  created_at: string
}