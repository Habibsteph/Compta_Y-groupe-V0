export type InvoicePaymentMode = "full" | "installment"

export type InvoiceStatus = "pending" | "partial" | "paid" | "cancelled"

export type InvoiceClientRelation = {
  id: string
  name: string
}

export type Invoice = {
  id: string
  user_id: string
  client_id: string
  title: string
  description: string | null
  total_amount: number
  payment_mode: InvoicePaymentMode
  status: InvoiceStatus
  due_date: string | null
  created_at: string

  clients?: InvoiceClientRelation[] | null
}