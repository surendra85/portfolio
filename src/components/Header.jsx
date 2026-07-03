import { useState } from 'react'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import { useActiveSection } from '../useActiveSection'

const links = [
  { href: '#about', id: 'about', label: 'About' },
  { href: '#skills', id: 'skills', label: 'Skills' },
  { href: '#projects', id: 'projects', label: 'Projects' },
  { href: '#experience', id: 'experience', label: 'Experience' },
  { href: '#education', id: 'education', label: 'Education' },
  { href: '#contact', id: 'contact', label: 'Contact' },
]

const sectionIds = links.map((l) => l.id)

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const active = useActiveSection(sectionIds)

  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={() => setOpen(false)}>SNG</a>

      <nav className="nav-desktop">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={active === link.id ? 'nav-active' : ''}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button
          className="icon-btn"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="icon-btn nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="nav-mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={active === link.id ? 'nav-active' : ''}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
