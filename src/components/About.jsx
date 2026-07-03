import { profile, achievements, certifications, languages } from '../data'

export default function About() {
  return (
    <section id="about" className="section">
      <h2 className="section-title">About Me</h2>
      <p className="summary">{profile.summary}</p>

      <div className="about-grid">
        <div className="about-card">
          <h3>Achievements</h3>
          <ul>
            {achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="about-card">
          <h3>Certifications</h3>
          <ul>
            {certifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="about-card">
          <h3>Languages</h3>
          <ul>
            {languages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
