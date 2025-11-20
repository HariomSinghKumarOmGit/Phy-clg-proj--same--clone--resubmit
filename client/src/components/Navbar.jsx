import { Link } from 'react-router-dom'
import '../styles/Navbar.css'

export default function Navbar() {
  /*

  const urls = [
    "https://www.instagram.com/hariomsingh2036/",
    "https://www.youtube.com/watch?v=GfLmaHlaSTA",
    "https://x.com/HariomCreates"
  ];
    function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
     
  const onClick = async ()=>{
     urls.forEach((url)=>{
      window.open(url, "_blank", "noopener,noreferrer");
    })
    await sleep(100);
  }
*/
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚛️ Physics Lab Assistant
      </Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <a href="https://github.com/HariomSinghKumarOmGit/Chem-Clg-Proj" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://pbs.twimg.com/media/EWdmghFWoAA09ew.jpg" target='_balnk'>We</a>
             {/* <button
                onClick={onClick}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Continue
            </button>  */}
       

      </div>
    </nav>
  )
}


