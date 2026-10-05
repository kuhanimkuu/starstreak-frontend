import './App.css'
import starstreak_logo from './assets/starstreak_logo.png'

export default function App() {
  return (
    <div className="app-container">
      <img 
        src={starstreak_logo} 
        className="logo" 
        alt="Starstreak logo"
      />
    </div>
  )
}
