const API_BASE_URL = 'http://localhost:4000';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export const todosApi = {
  // GET /todos - 모든 투두 조회
  getAll: async (): Promise<Todo[]> => {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) {
      throw new Error('투두 조회 실패');
    }
    return response.json();
  },

  // GET /todos/:id - 특정 투두 조회
  getById: async (id: string): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`);
    if (!response.ok) {
      throw new Error('투두 조회 실패');
    }
    return response.json();
  },

  // POST /todos - 투두 생성
  create: async (title: string): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      throw new Error('투두 생성 실패');
    }
    return response.json();
  },

  // PUT /todos/:id - 투두 수정
  update: async (id: string, updates: { title?: string; completed?: boolean }): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('투두 수정 실패');
    }
    return response.json();
  },

  // PATCH /todos/:id/toggle - 투두 완료 상태 토글
  toggle: async (id: string): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('투두 토글 실패');
    }
    return response.json();
  },

  // DELETE /todos/:id - 투두 삭제
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('투두 삭제 실패');
    }
  },
};

