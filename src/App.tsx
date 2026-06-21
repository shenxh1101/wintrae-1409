import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import ReviewPage from './pages/ReviewPage'
import AchievementsPage from './pages/AchievementsPage'
import TeacherPage from './pages/TeacherPage'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:mapType" element={<GamePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
      </Routes>
    </div>
  )
}

export default App
