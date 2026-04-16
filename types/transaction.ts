export type TransactionPartyType = "client" | "employee" | "internal"

export type TransactionType = "income" | "expense"

export type TransactionStatus = "paid" | "partial" | "pending" | "cancelled" | null

export type TransactionPaymentMethod =
  | "cash"
  | "wave"
  | "orange_money"
  | "bank"
  | "other"
  | null

export type TransactionClientRelation = {
  id: string
  name: string
}

export type TransactionEmployeeRelation = {
  id: string
  full_name: string
}

export type Transaction = {
  id: string
  user_id?: string
  amount: number
  type: TransactionType
  description: string | null
  created_at: string
  transaction_date: string | null

  client_id: string | null
  employee_id: string | null
  invoice_id: string | null
  party_type: TransactionPartyType | null

  status: TransactionStatus
  payment_method: TransactionPaymentMethod
  category: string | null

  is_locked: boolean
  approved_by: string | null
  approved_at: string | null

  clients?: TransactionClientRelation[] | null
  employees?: TransactionEmployeeRelation[] | null
}