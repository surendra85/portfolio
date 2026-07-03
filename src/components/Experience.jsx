import { experience } from '../data'

export default function Experience() {
  return (
    <section id="experience" className="section">
      <h2 className="section-title">Work History</h2>
      <div className="timeline">
        {experience.map((job) => (
          <div key={`${job.role}-${job.period}`} className="timeline-item">
            <div className="timeline-marker" />
            <div className="timeline-content">
              <div className="timeline-header">
                <h3>{job.role}</h3>
                <span className="timeline-period">{job.period}</span>
              </div>
              <p className="timeline-company">{job.company}</p>
              {job.client && <p className="timeline-client">Client: {job.client}</p>}
              <ul>
                {job.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
