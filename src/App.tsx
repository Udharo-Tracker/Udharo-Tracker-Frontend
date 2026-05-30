import { Button, Typography } from 'antd'

const { Title, Text } = Typography

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Title level={2}>Udharo Tracker</Title>
      <Text type="secondary">React · Vite · TypeScript · TanStack Query · Tailwind · Ant Design</Text>
      <Button type="primary">Get Started</Button>
    </div>
  )
}

export default App
