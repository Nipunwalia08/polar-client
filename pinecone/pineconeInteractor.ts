'use client'

import { toast } from 'react-toastify'

export const deletePineconeDocsByNamespace = async (namespace: string) => {
  try {
    console.log(namespace)
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pinecone/delete-all-docs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace: namespace,
        }),
      },
    )
  } catch (err) {
    console.log('Error while deleting docs', err)
    return false
  }
}

export const deletePineconeDocsByNamespaceAndId = async (
  namespace: string,
  docs: string[],
) => {
  try {
    console.log(namespace)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pinecone/delete-docs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace: namespace,
          docs: docs,
        }),
      },
    )
    const res = await response.json()
    if (!res.success) {
      toast.error('Error while deletings documents')
      console.error('Error:', res.error)
      return
    }
    return res.vecIds
  } catch {
    console.log('Error deleting docs')
    return false
  }
}
