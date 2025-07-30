import TaskList from '../component/TaskList'
import AddTaskForm from '../component/AddTaskForm'

export default function Home() {
  return (
    <main className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">📝 Mes Tâches</h1>
      <AddTaskForm />
      <TaskList />
    </main>
  );
}
