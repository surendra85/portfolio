import { motion } from 'framer-motion'
import { ArrowDown, Mail, MapPin } from 'lucide-react'
import GithubMark from './icons/GithubMark'
import { profile } from '../data'

const initials = profile.name
  .split(' ')
  .map((part) => part[0])
  .slice(0, 2)
  .join('')

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-blob hero-blob-a" aria-hidden="true" />
      <div className="hero-blob hero-blob-b" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <motion.div
        className="hero-inner"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="avatar-badge" variants={item}>
          {initials}
        </motion.div>

        <motion.p className="eyebrow" variants={item}>Hello, I'm</motion.p>
        <motion.h1 variants={item}>{profile.name}</motion.h1>
        <motion.h2 variants={item}>{profile.title}</motion.h2>

        <motion.div className="hero-meta" variants={item}>
          <span><MapPin size={15} /> {profile.location}</span>
          <span><Mail size={15} /> {profile.email}</span>
        </motion.div>

        <motion.div className="hero-actions" variants={item}>
          <a className="btn btn-primary" href="#projects">View Projects</a>
          <a className="btn btn-outline" href="#contact">Contact Me</a>
          <a className="btn btn-icon" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GithubMark size={18} />
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        className="scroll-cue"
        aria-label="Scroll to content"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ArrowDown size={20} />
      </motion.a>
    </section>
  )
}
