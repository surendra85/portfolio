import { skills } from '../data'

export default function Skills() {
  return (
    <section id="skills" className="section">
      <h2 className="section-title">Skills</h2>
      <div className="skills-grid">
        {skills.map((skill) => (
          <span key={skill} className="skill-pill">{skill}</span>
        ))}
      </div>
    </section>
  )
}
