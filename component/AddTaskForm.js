
'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { mutate } from 'swr'

export default function AddTaskForm() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.from('tasks').insert([{ content }])

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      // Recharge la liste des tâches (clé 'tasks')
      mutate('tasks')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nouvelle tâche..."
        className="flex-grow border rounded p-2"
        disabled={loading}
      />
      <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 rounded">
        {loading ? '...' : 'Ajouter'}
      </button>
      {error && <p className="text-red-500 mt-1">{error}</p>}
    </form>
  )
}
