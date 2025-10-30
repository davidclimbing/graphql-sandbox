import { useState } from 'react';
import { todosApi } from '../api/todos';

interface TodoFormProps {
  onTodoCreated?: () => void;
}

export function TodoForm({ onTodoCreated }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await todosApi.create(title.trim());
      setTitle('');
      onTodoCreated?.(); // 부모 컴포넌트에 알림
    } catch (err) {
      console.error('투두 생성 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새로운 투두를 입력하세요..."
          className="flex-1 px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '추가 중...' : '추가'}
        </button>
      </div>
    </form>
  );
}

