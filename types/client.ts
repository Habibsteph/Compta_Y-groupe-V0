export type Client = {
  id: string
  user_id: string
  name: string
  phone: string | null
  created_at: string
  account_manager: string | null
  service_category: string | null
  opening_balance: number | null
  client_type: "company" | "individual" | null
  whatsapp: string | null
  commune: string | null
  notes: string | null
  status: "active" | "prospect" | "inactive" | null
}