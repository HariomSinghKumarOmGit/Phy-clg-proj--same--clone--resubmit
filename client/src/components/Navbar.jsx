import { Link } from 'react-router-dom'
import '../styles/Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🧪 ChemAI Lab
      </Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </nav>
  )
}


