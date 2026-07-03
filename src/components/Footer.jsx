import { profile } from '../data'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} {profile.name}. Built with React + Vite.</p>
    </footer>
  )
}
