import { profile } from '../data'

export default function Hero() {
  return (
    <section id="top" className="hero">
      <p className="eyebrow">Hello, I'm</p>
      <h1>{profile.name}</h1>
      <h2>{profile.title}</h2>
      <p className="hero-location">{profile.location}</p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#projects">View Projects</a>
        <a className="btn btn-outline" href="#contact">Contact Me</a>
      </div>
    </section>
  )
}
