import { profile } from '../data'

export default function Contact() {
  return (
    <section id="contact" className="section">
      <h2 className="section-title">Get In Touch</h2>
      <p className="contact-intro">
        I'm always open to discussing digital banking architecture, micro-app platforms, or new opportunities.
      </p>
      <div className="contact-links">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>{profile.phone}</a>
        <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        <span>{profile.location}</span>
      </div>
    </section>
  )
}
