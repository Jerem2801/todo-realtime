// components/TaskList.js
'use client'

import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import { useState,useEffect } from 'react'

export default function TaskList() {
  // SWR fetcher
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  const { data: tasks,mutate } = useSWR('tasks', fetchTasks)

  // Realtime : écoute les ajouts et suppressions
  useEffect(() => {
    const channel = supabase
      .channel('realtime-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          mutate() // recharge les tâches quand quelque chose change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  // ➖ Supprimer une tâche
  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression :', error)
    } else {
      // recharge les tâches
      mutate()
    }
  }

   // État pour suivre quelle tâche est en édition
  const [editingId, setEditingId] = useState(null)
  const [editingContent, setEditingContent] = useState('')

  // Fonction pour lancer l’édition
  const startEditing = (task) => {
    setEditingId(task.id)
    setEditingContent(task.content)
  }

  // Fonction pour sauvegarder la modif
  const saveEdit = async () => {
    if (!editingContent.trim()) return

    const { error } = await supabase
      .from('tasks')
      .update({ content: editingContent })
      .eq('id', editingId)

    if (error) {
      console.error('Erreur lors de la modification :', error)
    } else {
      mutate()
      setEditingId(null)
      setEditingContent('')
    }
  }

  // Sauvegarder sur "Enter" ou quand on perd le focus
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit()
    }
    if (e.key === 'Escape') {
      setEditingId(null)
      setEditingContent('')
    }
  }

  if (!tasks) return <p>Chargement...</p>
  if (tasks.length === 0) return <p>Aucune tâche.</p>

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="border p-2 rounded bg-white shadow flex justify-between items-center"
        >
           {editingId === task.id ? (
            <input
              type="text"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="flex-grow border p-1 rounded"
              autoFocus
            />
          ) : (
            <span onDoubleClick={() => startEditing(task)} className="flex-grow cursor-pointer">
              {task.content}
            </span>)}
          <button
            onClick={() => deleteTask(task.id)}
            className="text-red-500 hover:text-red-700 text-lg"
            aria-label="Supprimer"
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  )
}
