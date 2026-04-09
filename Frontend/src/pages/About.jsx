import React from 'react';
import { Link } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './About.css';

const TEAM = [
  { name: 'Shivam Thakur', role: 'Founder', initials: 'ST', color: '#0056D2', bio: 'Shivam is the mind behind Skill Orbit. With a deep passion for technology and innovation, he laid the foundation of this startup with a mission to make technical learning more accessible and practical. His leadership and vision continue to inspire the entire team to aim higher every day.' },
  { name: 'Anurag Roy', role: 'Director', initials: 'AR', color: '#7c3aed', bio: 'Anurag plays a vital role in managing the overall operations of Skill Orbit. From strategic planning to ensuring smooth execution of projects, his strong management skills and creative approach help the team stay focused and organized.' },
  { name: 'Roshan Kumar', role: 'Managing Director', initials: 'RK', color: '#00BFA5', bio: 'Roshan oversees the direction and development of various initiatives within the startup. His guidance, technical insights, and commitment to excellence ensure that Skill Orbit always maintains the highest standards in every project undertaken.' },
  { name: 'Sahil Kumar', role: 'Marketing Head', initials: 'SK', color: '#F5A623', bio: 'Sahil plays a crucial role in market management and traffic control and oversees the security algorithm.' },
];

const VALUES = [
  { icon: '🌍', title: 'Accessible Education', desc: 'Every person deserves world-class learning, regardless of location, background, or financial situation.' },
  { icon: '🏆', title: 'Excellence in Teaching', desc: 'We partner only with expert instructors who can explain complex ideas in engaging, practical ways.' },
  { icon: '🤝', title: 'Community First', desc: 'Learning is better together. Our global community supports every learner at every step.' },
  { icon: '🔬', title: 'Data-Driven Outcomes', desc: 'We measure what matters — career transitions, salary growth, and real skill acquisition.' },
  { icon: '🚀', title: 'Always Evolving', desc: 'Technology and skills change fast. We update content continuously to stay ahead of the curve.' },
  { icon: '❤️', title: 'Learner Obsessed', desc: 'Every product decision starts with one question: does this make learning better for students?' },
];

const TIMELINE = [
  { year: '2018', title: 'SkillOrbit Founded', desc: 'Started in a garage with 12 courses and a mission to democratize professional education.' },
  { year: '2019', title: 'First 100K Learners', desc: 'Hit 100,000 registered students. Launched mobile app for iOS and Android.' },
  { year: '2020', title: 'Global Expansion', desc: 'Expanded to 50+ countries. Launched multilingual courses. Raised Series A funding.' },
  { year: '2021', title: 'University Partnerships', desc: 'Partnered with 30 universities to offer accredited certificates and micro-degrees.' },
  { year: '2023', title: 'AI-Powered Learning', desc: 'Launched adaptive learning engine that personalizes the learning path for every student.' },
  { year: '2025', title: '5 Million Learners', desc: 'Reached 5 million active students, 15,000+ courses, and partners in 180 countries.' },
];

const PRESS = [
  { source: 'TechCrunch', quote: '"SkillOrbit is quietly becoming the most learner-focused platform in online education."' },
  { source: 'Forbes', quote: '"The startup disrupting online learning with personalized AI-powered pathways."' },
  { source: 'The Economist', quote: '"SkillOrbit demonstrates that quality education and commercial success are not in conflict."' },
];

export default function About() {
  const pageRef = useScrollAnimation();

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section className="about-hero">
        <div className="container animate">
          <h1>Learning Should Be for Everyone</h1>
          <p>SkillOrbit was founded on a simple belief: world-class education shouldn't be locked behind geography or tuition fees. We're on a mission to give every learner on Earth the skills to thrive.</p>
          <div>
            <Link to="/courses" className="btn btn-white btn-lg">Explore Courses</Link>
            <Link to="/contact" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', marginLeft: '0.75rem' }}>Partner With Us</Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section mission">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content animate-left">
              <div className="mission-label">Our Mission</div>
              <h2>Empowering the Next Generation of Professionals</h2>
              <p>We believe a high-quality education is a fundamental right, not a privilege. SkillOrbit partners with industry-leading experts, top universities, and forward-thinking companies to deliver skills that actually matter in the modern workforce.</p>
              <p>Our learners don't just watch videos — they build real projects, earn recognized credentials, and join a community of millions who are transforming their lives through learning.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Link to="/courses" className="btn btn-primary">Start Learning Free</Link>
                <Link to="/contact" className="btn btn-outline">Teach on SkillOrbit</Link>
              </div>
            </div>
            <div className="mission-visual animate-right stagger-children">
              {[
                { n: '5M+', l: 'Learners Worldwide' },
                { n: '92%', l: 'Report Career Impact' },
                { n: '180+', l: 'Countries Reached' },
              ].map(s => (
                <div key={s.l} className="mission-stat-card">
                  <div className="mstat-number">{s.n}</div>
                  <div className="mstat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section values">
        <div className="container">
          <div className="section-header animate" style={{ textAlign: 'center' }}>
            <h2>What We Stand For</h2>
            <p>The principles that guide every decision we make</p>
          </div>
          <div className="values-grid stagger-children">
            {VALUES.map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section team">
        <div className="container">
          <div className="section-header animate" style={{ textAlign: 'center' }}>
            <h2>Meet the Team</h2>
            <p>Builders, educators, and learners who are obsessed with your growth</p>
          </div>
          <div className="team-grid stagger-children">
            {TEAM.map(m => (
              <div key={m.name} className="team-card">
                <div className="team-avatar" style={{ background: m.color }}>{m.initials}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-bio">{m.bio}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section timeline-section">
        <div className="container">
          <div className="section-header animate">
            <h2>Our Story</h2>
            <p>From a garage startup to a global learning platform</p>
          </div>
          <div className="timeline stagger-children">
            {TIMELINE.map(t => (
              <div key={t.year} className="timeline-item">
                <div className="timeline-year">{t.year}</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="section press">
        <div className="container">
          <div className="section-header animate" style={{ textAlign: 'center' }}>
            <h2>As Seen In</h2>
            <p>What the world's top publications say about SkillOrbit</p>
          </div>
          <div className="press-grid stagger-children">
            {PRESS.map(p => (
              <div key={p.source} className="press-card">
                <div className="press-source">{p.source}</div>
                <div className="press-quote">{p.quote}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>Join the SkillOrbit Community</h2>
          <p>5 million learners and counting. Be part of something bigger.</p>
          <div>
            <Link to="/login" className="btn btn-white btn-lg">Sign Up — It's Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
