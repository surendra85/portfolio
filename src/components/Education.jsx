import { GraduationCap } from 'lucide-react'
import { education } from '../data'
import Reveal from './Reveal'

export default function Education() {
  return (
    <section id="education" className="section">
      <Reveal>
        <h2 className="section-title">Education</h2>
      </Reveal>
      {education.map((edu) => (
        <Reveal key={edu.degree}>
          <div className="education-card">
            <div className="about-card-head">
              <GraduationCap size={18} className="about-card-icon" />
              <div className="timeline-header" style={{ flex: 1 }}>
                <h3>{edu.degree}</h3>
                <span className="timeline-period">{edu.period}</span>
              </div>
            </div>
            <p className="timeline-company">{edu.school}</p>
            <ul>
              {edu.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </section>
  )
}
