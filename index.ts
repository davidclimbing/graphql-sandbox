import { ApolloServer, gql } from 'apollo-server';

// Post 타입 인터페이스 정의
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  published: boolean;
}

// 인메모리 데이터 저장소
let posts: Post[] = [
  { id: '1', title: 'GraphQL 기본', content: 'GraphQL 소개.', author: 'Alice', published: true },
  { id: '2', title: 'API 구축', content: 'GraphQL로 API 만드는 법.', author: 'Bob', published: false },
];

// 스키마 정의
const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    author: String!
    published: Boolean!
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    createPost(title: String!, content: String!, author: String!): Post!
    updatePost(id: ID!, title: String, content: String, published: Boolean): Post!
    deletePost(id: ID!): Boolean!
  }
`;

// 리졸버 (타입을 명시적으로 추가)
const resolvers = {
  Query: {
    posts: (): Post[] => posts,
    post: (_: any, { id }: { id: string }): Post | undefined => posts.find(post => post.id === id),
  },
  Mutation: {
    createPost: (_: any, { title, content, author }: { title: string; content: string; author: string }): Post => {
      const newPost: Post = { id: String(posts.length + 1), title, content, author, published: false };
      posts.push(newPost);
      return newPost;
    },
    updatePost: (_: any, { id, title, content, published }: { id: string; title?: string; content?: string; published?: boolean }): Post | null => {
      const post = posts.find(post => post.id === id);
      if (post) {
        if (title) post.title = title;
        if (content) post.content = content;
        if (published !== undefined) post.published = published;
        return post;
      }
      return null;
    },
    deletePost: (_: any, { id }: { id: string }): boolean => {
      const index = posts.findIndex(post => post.id === id);
      if (index !== -1) {
        posts.splice(index, 1);
        return true;
      }
      return false;
    },
  },
};

// 서버 시작
const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }: { url: string }) => {
  console.log(`서버가 ${url}에서 준비되었습니다.`);
});
