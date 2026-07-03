import { Award, BadgeCheck, Languages } from 'lucide-react'
import { profile, achievements, certifications, languages } from '../data'
import Reveal from './Reveal'

const cards = [
  { title: 'Achievements', icon: Award, items: achievements },
  { title: 'Certifications', icon: BadgeCheck, items: certifications },
  { title: 'Languages', icon: Languages, items: languages },
]

export default function About() {
  return (
    <section id="about" className="section">
      <Reveal>
        <h2 className="section-title">About Me</h2>
        <p className="summary">{profile.summary}</p>
      </Reveal>

      <div className="about-grid">
        {cards.map(({ title, icon: Icon, items }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <div className="about-card">
              <div className="about-card-head">
                <Icon size={18} className="about-card-icon" />
                <h3>{title}</h3>
              </div>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
