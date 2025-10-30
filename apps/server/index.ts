import { ApolloServer } from '@apollo/server';
import { fastifyApolloHandler } from '@as-integrations/fastify';
import Fastify from 'fastify';
import { gql } from 'graphql-tag';
import cors from '@fastify/cors';

// Todo 타입 인터페이스 정의
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// 인메모리 데이터 저장소
let todos: Todo[] = [
  { id: '1', title: 'GraphQL 학습하기', completed: false, createdAt: new Date().toISOString() },
  { id: '2', title: '투두 앱 만들기', completed: true, createdAt: new Date().toISOString() },
];

// GraphQL 스키마 정의 (convention에 맞게 작성)
const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    createdAt: String!
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!): Todo!
    updateTodo(id: ID!, title: String, completed: Boolean): Todo
    toggleTodo(id: ID!): Todo
    deleteTodo(id: ID!): Boolean!
  }
`;

// 리졸버 (타입을 명시적으로 추가)
const resolvers = {
  Query: {
    todos: (): Todo[] => todos,
    todo: (_: any, { id }: { id: string }): Todo | undefined => todos.find(todo => todo.id === id),
  },
  Mutation: {
    createTodo: (_: any, { title }: { title: string }): Todo => {
      const newTodo: Todo = {
        id: String(Date.now()),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      todos.push(newTodo);
      return newTodo;
    },
    updateTodo: (_: any, { id, title, completed }: { id: string; title?: string; completed?: boolean }): Todo | null => {
      const todo = todos.find(todo => todo.id === id);
      if (todo) {
        if (title !== undefined) todo.title = title;
        if (completed !== undefined) todo.completed = completed;
        return todo;
      }
      return null;
    },
    toggleTodo: (_: any, { id }: { id: string }): Todo | null => {
      const todo = todos.find(todo => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        return todo;
      }
      return null;
    },
    deleteTodo: (_: any, { id }: { id: string }): boolean => {
      const index = todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.splice(index, 1);
        return true;
      }
      return false;
    },
  },
};

// 서버 초기화
async function startServer() {
  const fastify = Fastify({
    logger: true,
  });

  // CORS 설정
  await fastify.register(cors, {
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // Apollo Server 생성
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // GraphQL 엔드포인트 등록 (convention: /graphql)
  fastify.post('/graphql', fastifyApolloHandler(server));
  fastify.get('/graphql', fastifyApolloHandler(server));

  // REST API 엔드포인트 (RESTful convention)
  // GET /todos - 모든 투두 조회
  fastify.get('/todos', async (request, reply) => {
    return todos;
  });

  // GET /todos/:id - 특정 투두 조회
  fastify.get('/todos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      reply.code(404);
      return { error: 'Todo not found' };
    }
    return todo;
  });

  // POST /todos - 투두 생성
  fastify.post('/todos', async (request, reply) => {
    const { title } = request.body as { title: string };
    if (!title) {
      reply.code(400);
      return { error: 'Title is required' };
    }
    const newTodo: Todo = {
      id: String(Date.now()),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todos.push(newTodo);
    reply.code(201);
    return newTodo;
  });

  // PUT /todos/:id - 투두 수정
  fastify.put('/todos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title, completed } = request.body as { title?: string; completed?: boolean };
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      reply.code(404);
      return { error: 'Todo not found' };
    }
    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;
    return todo;
  });

  // PATCH /todos/:id/toggle - 투두 완료 상태 토글
  fastify.patch('/todos/:id/toggle', async (request, reply) => {
    const { id } = request.params as { id: string };
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      reply.code(404);
      return { error: 'Todo not found' };
    }
    todo.completed = !todo.completed;
    return todo;
  });

  // DELETE /todos/:id - 투두 삭제
  fastify.delete('/todos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) {
      reply.code(404);
      return { error: 'Todo not found' };
    }
    todos.splice(index, 1);
    reply.code(204);
    return;
  });

  // Health check 엔드포인트
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // 서버 시작
  const port = 4000;
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 GraphQL 서버가 http://localhost:${port}/graphql 에서 실행 중입니다.`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();

