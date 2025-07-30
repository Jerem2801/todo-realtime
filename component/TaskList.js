// components/TaskList.js
'use client'

import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'

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

  const { data: tasks, mutate } = useSWR('tasks', fetchTasks)

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

  if (!tasks) return <p>Chargement...</p>
  if (tasks.length === 0) return <p>Aucune tâche.</p>

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="border p-2 rounded bg-white shadow">
          {task.content}
        </li>
      ))}
    </ul>
  )
}
