import { education } from '../data'

export default function Education() {
  return (
    <section id="education" className="section">
      <h2 className="section-title">Education</h2>
      {education.map((edu) => (
        <div key={edu.degree} className="education-card">
          <div className="timeline-header">
            <h3>{edu.degree}</h3>
            <span className="timeline-period">{edu.period}</span>
          </div>
          <p className="timeline-company">{edu.school}</p>
          <ul>
            {edu.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
