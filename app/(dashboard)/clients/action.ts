"use server"

import { createClient } from "../../../lib/supabase/server"
import { getCurrentOrganization } from "@/lib/auth"

type CreateClientInput = {
  name: string
  client_type: string
  phone?: string | null
  whatsapp?: string | null
  commune?: string | null
  notes?: string | null
  status: string
}

export async function createClientAction(input: CreateClientInput) {
  const supabase = await createClient()
  const organization = await getCurrentOrganization()

  if (!organization) {
    throw new Error("Organisation introuvable")
  }

  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        name: input.name,
        client_type: input.client_type,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        commune: input.commune ?? null,
        notes: input.notes ?? null,
        status: input.status,
        organization_id: organization.id,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}