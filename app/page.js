import TaskList from '../component/TaskList'

export default function Home() {
  return (
    <main className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">📝 Mes Tâches</h1>
      <TaskList />
    </main>
  );
}
