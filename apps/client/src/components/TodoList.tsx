import { useState, useEffect } from 'react';
import { todosApi, Todo } from '../api/todos';

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todosApi.getAll();
      setTodos(data);
    } catch (err) {
      setError('투두를 불러오는데 실패했습니다.');
      console.error('투두 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await todosApi.toggle(id);
      await fetchTodos(); // 목록 새로고침
    } catch (err) {
      console.error('투두 토글 실패:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await todosApi.delete(id);
      await fetchTodos(); // 목록 새로고침
    } catch (err) {
      console.error('투두 삭제 실패:', err);
    }
  };

  if (loading) return <p className="text-center">로딩 중...</p>;
  if (error) return <p className="text-red-500 text-center">에러: {error}</p>;

  return (
    <div className="space-y-2">
      {todos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">투두가 없습니다. 새로운 투두를 추가해보세요!</p>
      ) : (
        todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              todo.completed ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
                className="w-5 h-5 cursor-pointer"
              />
              <span
                className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
              >
                {todo.title}
              </span>
            </div>
            <button
              onClick={() => handleDelete(todo.id)}
              className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              삭제
            </button>
          </div>
        ))
      )}
    </div>
  );
}

