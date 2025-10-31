import { EmailTemplate } from './components/EmailTemplate'
import './App.css'

function EmailTemplatePage() {
  // API 엔드포인트
  const apiEndpoint = 'http://localhost:4000/api/email-template'

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-200">
          이메일 템플릿 테스트
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <EmailTemplate apiEndpoint={apiEndpoint} />
        </div>
      </div>
    </div>
  )
}

export default EmailTemplatePage
