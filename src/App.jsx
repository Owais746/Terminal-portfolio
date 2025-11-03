import { useEffect } from 'react'
import Terminal from './components/Terminal'

function App() {
  useEffect(()=>{
    alert("Welcome to Owais's Dev Terminal Portfolio 🚀\n\nIf you’re not comfortable using the terminal, no worries!\nYou can check out my previous portfolios using the two links at the top. 👆 ");
  }, [])
  return <Terminal />
}

export default App
