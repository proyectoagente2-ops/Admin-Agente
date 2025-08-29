'use server'

import { redirect } from 'next/navigation'

export async function navigateToNewDocument() {
  redirect('/dashboard/documents/new')
}
