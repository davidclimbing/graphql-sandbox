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

  // Email template 엔드포인트
  fastify.get('/api/email-template', async (request, reply) => {
    const htmlContent = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <!-- NAME: 1 COLUMN -->
  <!--[if gte mso 15]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>You have successfully registered for the conference</title>

  <style type="text/css">
    p {
      margin: 10px 0;
      padding: 0;
    }

    table {
      border-collapse: collapse;
    }

    h1, h2, h3, h4, h5, h6 {
      display: block;
      margin: 0;
      padding: 0;
    }

    img, a img {
      border: 0;
      height: auto;
      outline: none;
      text-decoration: none;
    }

    body, #bodyTable, #bodyCell {
      height: 100%;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .mcnPreviewText {
      display: none !important;
    }

    #outlook a {
      padding: 0;
    }

    img {
      -ms-interpolation-mode: bicubic;
    }

    table {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    p, a, li, td, blockquote {
      mso-line-height-rule: exactly;
    }

    a[href^=tel], a[href^=sms] {
      color: inherit;
      cursor: default;
      text-decoration: none;
    }

    p, a, li, td, body, table, blockquote {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    .ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font {
      line-height: 100%;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    #bodyCell {
      padding: 10px;
    }

    .templateContainer {
      max-width: 600px !important;
    }

    a.mcnButton {
      display: block;
    }

    .mcnImage, .mcnRetinaImage {
      vertical-align: bottom;
    }

    .mcnTextContent {
      word-break: break-word;
    }

    .mcnTextContent img {
      height: auto !important;
    }

    .mcnDividerBlock {
      table-layout: fixed !important;
    }

    /*
    @tab Page
    @section Background Style
    @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
    */
    body, #bodyTable {
      /*@editable*/
      background-color: #FAFAFA;
    }

    /*
    @tab Page
    @section Background Style
    @tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
    */
    #bodyCell {
      /*@editable*/
      border-top: 0;
    }

    /*
    @tab Page
    @section Email Border
    @tip Set the border for your email.
    */
    .templateContainer {
      /*@editable*/
      border: 0;
    }

    /*
    @tab Page
    @section Heading 1
    @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.
    @style heading 1
    */
    h1 {
      /*@editable*/
      color: #202020;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 26px;
      /*@editable*/
      font-style: normal;
      /*@editable*/
      font-weight: bold;
      /*@editable*/
      line-height: 125%;
      /*@editable*/
      letter-spacing: normal;
      /*@editable*/
      text-align: left;
    }

    /*
    @tab Page
    @section Heading 2
    @tip Set the styling for all second-level headings in your emails.
    @style heading 2
    */
    h2 {
      /*@editable*/
      color: #202020;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 22px;
      /*@editable*/
      font-style: normal;
      /*@editable*/
      font-weight: bold;
      /*@editable*/
      line-height: 125%;
      /*@editable*/
      letter-spacing: normal;
      /*@editable*/
      text-align: left;
    }

    /*
    @tab Page
    @section Heading 3
    @tip Set the styling for all third-level headings in your emails.
    @style heading 3
    */
    h3 {
      /*@editable*/
      color: #202020;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 20px;
      /*@editable*/
      font-style: normal;
      /*@editable*/
      font-weight: bold;
      /*@editable*/
      line-height: 125%;
      /*@editable*/
      letter-spacing: normal;
      /*@editable*/
      text-align: left;
    }

    /*
    @tab Page
    @section Heading 4
    @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.
    @style heading 4
    */
    h4 {
      /*@editable*/
      color: #202020;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 18px;
      /*@editable*/
      font-style: normal;
      /*@editable*/
      font-weight: bold;
      /*@editable*/
      line-height: 125%;
      /*@editable*/
      letter-spacing: normal;
      /*@editable*/
      text-align: left;
    }

    /*
    @tab Preheader
    @section Preheader Style
    @tip Set the background color and borders for your email's preheader area.
    */
    #templatePreheader {
      /*@editable*/
      background-color: #FAFAFA;
      /*@editable*/
      background-image: none;
      /*@editable*/
      background-repeat: no-repeat;
      /*@editable*/
      background-position: center;
      /*@editable*/
      background-size: cover;
      /*@editable*/
      border-top: 0;
      /*@editable*/
      border-bottom: 0;
      /*@editable*/
      padding-top: 9px;
      /*@editable*/
      padding-bottom: 9px;
    }

    /*
    @tab Preheader
    @section Preheader Text
    @tip Set the styling for your email's preheader text. Choose a size and color that is easy to read.
    */
    #templatePreheader .mcnTextContent, #templatePreheader .mcnTextContent p {
      /*@editable*/
      color: #656565;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 12px;
      /*@editable*/
      line-height: 150%;
      /*@editable*/
      text-align: left;
    }

    /*
    @tab Preheader
    @section Preheader Link
    @tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text.
    */
    #templatePreheader .mcnTextContent a, #templatePreheader .mcnTextContent p a {
      /*@editable*/
      color: #656565;
      /*@editable*/
      font-weight: normal;
      /*@editable*/
      text-decoration: underline;
    }

    /*
    @tab Header
    @section Header Style
    @tip Set the background color and borders for your email's header area.
    */
    #templateHeader {
      /*@editable*/
      background-color: #ffffff;
      /*@editable*/
      background-image: none;
      /*@editable*/
      background-repeat: no-repeat;
      /*@editable*/
      background-position: center;
      /*@editable*/
      background-size: cover;
      /*@editable*/
      border-top: 0;
      /*@editable*/
      border-bottom: 0;
      /*@editable*/
      padding-top: 9px;
      /*@editable*/
      padding-bottom: 0;
    }

    /*
    @tab Header
    @section Header Text
    @tip Set the styling for your email's header text. Choose a size and color that is easy to read.
    */
    #templateHeader .mcnTextContent, #templateHeader .mcnTextContent p {
      /*@editable*/
      color: #202020;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 16px;
      /*@editable*/
      line-height: 150%;
      /*@editable*/
      text-align: left;
    }

    /*
    @tab Header
    @section Header Link
    @tip Set the styling for your email's header links. Choose a color that helps them stand out from your text.
    */
    #templateHeader .mcnTextContent a, #templateHeader .mcnTextContent p a {
      /*@editable*/
      color: #007C89;
      /*@editable*/
      font-weight: normal;
      /*@editable*/
      text-decoration: underline;
    }

    /*
    @tab Body
    @section Body Style
    @tip Set the background color and borders for your email's body area.
    */
    #templateBody {
      /*@editable*/
      background-color: #FFFFFF;
      /*@editable*/
      background-image: none;
      /*@editable*/
      background-repeat: no-repeat;
      /*@editable*/
      background-position: center;
      /*@editable*/
      background-size: cover;
      /*@editable*/
      border-top: 0;
      /*@editable*/
      border-bottom: 2px solid #EAEAEA;
      /*@editable*/
      padding-top: 0;
      /*@editable*/
      padding-bottom: 9px;
    }

    /*
    @tab Body
    @section Body Text
    @tip Set the styling for your email's body text. Choose a size and color that is easy to read.
    */
    #templateBody .mcnTextContent, #templateBody .mcnTextContent p {
      /*@editable*/
      color: #202020;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 16px;
      /*@editable*/
      line-height: 150%;
      /*@editable*/
      text-align: left;
    }

    /*
    @tab Body
    @section Body Link
    @tip Set the styling for your email's body links. Choose a color that helps them stand out from your text.
    */
    #templateBody .mcnTextContent a, #templateBody .mcnTextContent p a {
      /*@editable*/
      color: #007C89;
      /*@editable*/
      font-weight: normal;
      /*@editable*/
      text-decoration: underline;
    }

    /*
    @tab Footer
    @section Footer Style
    @tip Set the background color and borders for your email's footer area.
    */
    #templateFooter {
      /*@editable*/
      background-color: #fafafa;
      /*@editable*/
      background-image: none;
      /*@editable*/
      background-repeat: no-repeat;
      /*@editable*/
      background-position: center;
      /*@editable*/
      background-size: cover;
      /*@editable*/
      border-top: 0;
      /*@editable*/
      border-bottom: 0;
      /*@editable*/
      padding-top: 9px;
      /*@editable*/
      padding-bottom: 9px;
    }

    /*
    @tab Footer
    @section Footer Text
    @tip Set the styling for your email's footer text. Choose a size and color that is easy to read.
    */
    #templateFooter .mcnTextContent, #templateFooter .mcnTextContent p {
      /*@editable*/
      color: #656565;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      font-size: 12px;
      /*@editable*/
      line-height: 150%;
      /*@editable*/
      text-align: center;
    }

    /*
    @tab Footer
    @section Footer Link
    @tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text.
    */
    #templateFooter .mcnTextContent a, #templateFooter .mcnTextContent p a {
      /*@editable*/
      color: #656565;
      /*@editable*/
      font-weight: normal;
      /*@editable*/
      text-decoration: underline;
    }

    @media only screen and (min-width: 768px) {
      .templateContainer {
        width: 600px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: none !important;
      }

    }

    @media only screen and (max-width: 480px) {
      body {
        width: 100% !important;
        min-width: 100% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnRetinaImage {
        max-width: 100% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnImage {
        width: 100% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnCartContainer, .mcnCaptionTopContent, .mcnRecContentContainer, .mcnCaptionBottomContent, .mcnTextContentContainer, .mcnBoxedTextContentContainer, .mcnImageGroupContentContainer, .mcnCaptionLeftTextContentContainer, .mcnCaptionRightTextContentContainer, .mcnCaptionLeftImageContentContainer, .mcnCaptionRightImageContentContainer, .mcnImageCardLeftTextContentContainer, .mcnImageCardRightTextContentContainer, .mcnImageCardLeftImageContentContainer, .mcnImageCardRightImageContentContainer {
        max-width: 100% !important;
        width: 100% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnBoxedTextContentContainer {
        min-width: 100% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnImageGroupContent {
        padding: 9px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnCaptionLeftContentOuter .mcnTextContent, .mcnCaptionRightContentOuter .mcnTextContent {
        padding-top: 9px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnImageCardTopImageContent, .mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent, .mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent {
        padding-top: 18px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnImageCardBottomImageContent {
        padding-bottom: 9px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnImageGroupBlockInner {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnImageGroupBlockOuter {
        padding-top: 9px !important;
        padding-bottom: 9px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnTextContent, .mcnBoxedTextContentColumn {
        padding-right: 18px !important;
        padding-left: 18px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcnImageCardLeftImageContent, .mcnImageCardRightImageContent {
        padding-right: 18px !important;
        padding-bottom: 0 !important;
        padding-left: 18px !important;
      }

    }

    @media only screen and (max-width: 480px) {
      .mcpreview-image-uploader {
        display: none !important;
        width: 100% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Heading 1
      @tip Make the first-level headings larger in size for better readability on small screens.
      */
      h1 {
        /*@editable*/
        font-size: 22px !important;
        /*@editable*/
        line-height: 125% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Heading 2
      @tip Make the second-level headings larger in size for better readability on small screens.
      */
      h2 {
        /*@editable*/
        font-size: 20px !important;
        /*@editable*/
        line-height: 125% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Heading 3
      @tip Make the third-level headings larger in size for better readability on small screens.
      */
      h3 {
        /*@editable*/
        font-size: 18px !important;
        /*@editable*/
        line-height: 125% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Heading 4
      @tip Make the fourth-level headings larger in size for better readability on small screens.
      */
      h4 {
        /*@editable*/
        font-size: 16px !important;
        /*@editable*/
        line-height: 150% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Boxed Text
      @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
      */
      .mcnBoxedTextContentContainer .mcnTextContent, .mcnBoxedTextContentContainer .mcnTextContent p {
        /*@editable*/
        font-size: 14px !important;
        /*@editable*/
        line-height: 150% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Preheader Visibility
      @tip Set the visibility of the email's preheader on small screens. You can hide it to save space.
      */
      #templatePreheader {
        /*@editable*/
        display: block !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Preheader Text
      @tip Make the preheader text larger in size for better readability on small screens.
      */
      #templatePreheader .mcnTextContent, #templatePreheader .mcnTextContent p {
        /*@editable*/
        font-size: 14px !important;
        /*@editable*/
        line-height: 150% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Header Text
      @tip Make the header text larger in size for better readability on small screens.
      */
      #templateHeader .mcnTextContent, #templateHeader .mcnTextContent p {
        /*@editable*/
        font-size: 16px !important;
        /*@editable*/
        line-height: 150% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Body Text
      @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
      */
      #templateBody .mcnTextContent, #templateBody .mcnTextContent p {
        /*@editable*/
        font-size: 16px !important;
        /*@editable*/
        line-height: 150% !important;
      }

    }

    @media only screen and (max-width: 480px) {
      /*
      @tab Mobile Styles
      @section Footer Text
      @tip Make the footer content text larger in size for better readability on small screens.
      */
      #templateFooter .mcnTextContent, #templateFooter .mcnTextContent p {
        /*@editable*/
        font-size: 14px !important;
        /*@editable*/
        line-height: 150% !important;
      }

    }</style>
</head>
<body>
<center>
  <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
    <tr>
      <td align="center" valign="top" id="bodyCell">
        <!-- BEGIN TEMPLATE // -->
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
          <tr>
            <td align="center" valign="top" width="600" style="width:600px;">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
          <tr>
            <td valign="top" id="templatePreheader"></td>
          </tr>
          <tr>
            <td valign="top" id="templateHeader">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;">
                <tbody class="mcnImageBlockOuter">
                <tr>
                  <td valign="top" style="padding:0px" class="mcnImageBlockInner">
                    <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;">
                    </table>
                  </td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td valign="top" id="templateBody">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                <tbody class="mcnTextBlockOuter">
                <tr>
                  <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                    <!--[if mso]>
                    <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                      <tr>
                    <![endif]-->

                    <!--[if mso]>
                    <td valign="top" width="600" style="width:600px;">
                    <![endif]-->
                    <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                      <tbody>
                      <tr>

                        <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">

                          <h1>Lorem Ipsum Dolor Sit Amet</h1>

                          <p style="margin-top: 40px; margin-bottom: 40px;">
                            Lorem ipsum dolor sit amet, <strong>consectetur adipiscing elit</strong> sed do eiusmod.
                          </p>
                          <p>
                            Tempor incididunt: <strong>ut labore et dolore magna aliqua</strong>
                          </p>
                          <p>
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. <strong>Duis aute irure</strong> dolor in reprehenderit in <strong>voluptate velit esse cillum dolore</strong> eu fugiat nulla pariatur.
                          </p>
                          <p>
                            Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.
                          </p>
                          <p>
                          Deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae.
                          </p>
                          <p>
                          Vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                          </p>
                          <p>
                          Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur.
                          </p>
                          <p>
                          Adipisci velit sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                          </p>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                    <!--[if mso]>
                    </td>
                    <![endif]-->

                    <!--[if mso]>
                    </tr>
                    </table>
                    <![endif]-->
                  </td>
                </tr>
                </tbody>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width:100%;">
                <tbody class="mcnButtonBlockOuter">
                <tr>
                  <td style="padding-top:0; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top" align="center" class="mcnButtonBlockInner">
                    <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse: separate !important;border-radius: 12px;background-color: #333333;">
                      <tbody>
                      <tr>
                        <td align="center" valign="middle" class="mcnButtonContent" style="font-family: Arial; font-size: 16px; padding: 18px 55px;">
                          <a class="mcnButton " title="lorem ipsum" href="#" target="_blank"
                             style="font-weight: bold;letter-spacing: normal;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;">Lorem Ipsum Button</a>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
        <!-- // END TEMPLATE -->
      </td>
    </tr>
  </table>
</center>
</html>`;

    return { htmlContent };
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

