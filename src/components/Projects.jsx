import { motion } from 'framer-motion'
import { Landmark, GitBranch, Wrench, Waypoints } from 'lucide-react'
import { projects } from '../data'
import Reveal from './Reveal'

const icons = [Landmark, GitBranch, Wrench, Waypoints]

export default function Projects() {
  return (
    <section id="projects" className="section">
      <Reveal>
        <h2 className="section-title">Featured Work</h2>
      </Reveal>
      <div className="projects-grid">
        {projects.map((project, i) => {
          const Icon = icons[i % icons.length]
          return (
            <Reveal key={project.title} delay={i * 0.08}>
              <motion.article
                className="project-card"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <div className="project-icon">
                  <Icon size={20} />
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tag-row">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </motion.article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
