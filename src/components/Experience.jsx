import { experience } from '../data'
import Reveal from './Reveal'

export default function Experience() {
  return (
    <section id="experience" className="section">
      <Reveal>
        <h2 className="section-title">Work History</h2>
      </Reveal>
      <div className="timeline">
        {experience.map((job, i) => {
          const isCurrent = job.period.toLowerCase().includes('current')
          return (
            <Reveal key={`${job.role}-${job.period}`} delay={Math.min(i * 0.05, 0.3)} y={16}>
              <div className="timeline-item">
                <div className={`timeline-marker ${isCurrent ? 'timeline-marker-current' : ''}`} />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3>
                      {job.role}
                      {isCurrent && <span className="current-badge">Current</span>}
                    </h3>
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
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
