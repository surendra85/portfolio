import { motion } from 'framer-motion'
import { skillGroups } from '../data'
import Reveal from './Reveal'

export default function Skills() {
  return (
    <section id="skills" className="section">
      <Reveal>
        <h2 className="section-title">Skills</h2>
      </Reveal>

      <div className="skills-groups">
        {skillGroups.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.06}>
            <div className="skill-group">
              <p className="skill-group-title">{group.category}</p>
              <div className="skills-grid">
                {group.items.map((skill) => (
                  <motion.span
                    key={skill}
                    className="skill-pill"
                    whileHover={{ y: -3, scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
