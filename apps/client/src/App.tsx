import { useState } from 'react'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import './App.css'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTodoCreated = () => {
    // TodoList를 강제로 새로고침하기 위한 키 변경
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-200">
          투두 앱
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <TodoForm onTodoCreated={handleTodoCreated} />
          <TodoList key={refreshKey} />
        </div>
      </div>
    </div>
  )
}

export default App

