import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold underline">GraphQL Sandbox</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            React 앱이 정상적으로 작동합니다!
          </p>
        </div>
      </div>
    </>
  )
}

export default App

