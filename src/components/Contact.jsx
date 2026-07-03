import { motion } from 'framer-motion'
import { Mail, Phone, MapPin } from 'lucide-react'
import GithubMark from './icons/GithubMark'
import { profile } from '../data'
import Reveal from './Reveal'

const links = [
  { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
  { icon: Phone, label: profile.phone, href: `tel:${profile.phone.replace(/[^+\d]/g, '')}` },
  { icon: GithubMark, label: 'GitHub', href: profile.github, external: true },
  { icon: MapPin, label: profile.location },
]

export default function Contact() {
  return (
    <section id="contact" className="section">
      <Reveal>
        <h2 className="section-title">Get In Touch</h2>
        <p className="contact-intro">
          I'm always open to discussing digital banking architecture, micro-app platforms, or new opportunities.
        </p>
      </Reveal>

      <div className="contact-grid">
        {links.map(({ icon: Icon, label, href, external }, i) => {
          const content = (
            <>
              <span className="contact-icon"><Icon size={18} /></span>
              <span>{label}</span>
            </>
          )
          return (
            <Reveal key={label} delay={i * 0.06}>
              {href ? (
                <motion.a
                  className="contact-card"
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  whileHover={{ y: -3 }}
                >
                  {content}
                </motion.a>
              ) : (
                <div className="contact-card contact-card-static">{content}</div>
              )}
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
