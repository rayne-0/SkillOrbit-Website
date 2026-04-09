import React, { useState } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './Contact.css';

const FAQS = [
  { q: 'Are courses on SkillOrbit free?', a: 'Many courses are free. Premium courses range from $9.99–$24.99, and we regularly offer discounts. Financial aid is available for students who qualify.' },
  { q: 'Do I get a certificate after completing a course?', a: 'Yes! Every paid course and most free courses include a shareable Certificate of Completion you can add to LinkedIn or your CV.' },
  { q: 'How do I become an instructor?', a: 'Apply through our instructor portal. We review your subject expertise, teaching ability, and course outline before approving new instructors.' },
  { q: 'Can businesses purchase for teams?', a: 'Yes. SkillOrbit for Teams offers volume licensing, progress tracking, and custom learning paths for organizations of any size.' },
  { q: 'Is there a mobile app?', a: 'Yes! SkillOrbit is available on iOS and Android. You can download lessons for offline viewing.' },
  { q: 'What is your refund policy?', a: 'We offer a 30-day money-back guarantee on all paid courses, no questions asked.' },
];

const OFFICES = [
  { city: 'Gaur Yamuna City', address: 'Office no 201310, Q-Tower\nGaur Yamuna City, Uttar Pradesh', emoji: '🏢' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const pageRef = useScrollAnimation();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <div className="contact-hero">
        <div className="container">
          <h1>How Can We Help?</h1>
          <p>Our team typically responds within 24 hours. We'd love to hear from you.</p>
        </div>
      </div>

      {/* Main */}
      <div style={{ background: 'var(--bg-off)' }}>
        <div className="container">
          <div className="contact-layout">
            {/* Form */}
            <div className="contact-form-card animate-left">
              {submitted ? (
                <div className="form-success">
                  <div className="form-success-icon">✅</div>
                  <h3>Message Sent!</h3>
                  <p>Thanks for reaching out, {form.name}. We'll get back to you at {form.email} within 24 hours.</p>
                  <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2>Send Us a Message</h2>
                  <p>Fill in the form and our team will be in touch shortly.</p>
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="contact-name">Your Name</label>
                        <input id="contact-name" name="name" type="text" placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-email">Email Address</label>
                        <input id="contact-email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-subject">What can we help with?</label>
                      <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange}>
                        <option>General Inquiry</option>
                        <option>Course Technical Issue</option>
                        <option>Billing & Payments</option>
                        <option>Become an Instructor</option>
                        <option>Enterprise / Teams</option>
                        <option>Partnership Opportunity</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-message">Your Message</label>
                      <textarea id="contact-message" name="message" placeholder="Tell us more about how we can help…" value={form.message} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                      Send Message →
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Info */}
            <div className="animate-right">
              <div className="contact-info-card">
                <h2>Contact Information</h2>
                <p>Reach us directly or use the form. We're always happy to help learners, instructors, and partners.</p>

                {[
                  { icon: '📧', label: 'Email', value: 'helpdesk@skillorbit.online', sub: 'Response within 24 hours' },
                  { icon: '📞', label: 'Mobile', value: '+91 8683045908', sub: 'Mon–Sat, 10am–7pm IST' },
                  { icon: '🏢', label: 'Office', value: 'Office no 201310, Q-Tower', sub: 'Gaur Yamuna City, Uttar Pradesh' },
                ].map(d => (
                  <div key={d.label} className="contact-detail-item">
                    <div className="contact-detail-icon">{d.icon}</div>
                    <div>
                      <div className="contact-detail-label">{d.label}</div>
                      <div className="contact-detail-value">{d.value}</div>
                      <div className="contact-detail-sub">{d.sub}</div>
                    </div>
                  </div>
                ))}

                <div className="contact-socials">
                  {['𝕏', 'in', '▶', 'f', '📸'].map((s, i) => (
                    <button key={i} className="contact-social-btn">{s}</button>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="contact-info-card" style={{ marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Quick Links</h2>
                {[
                  { label: '📚 Help Center', link: '#' },
                  { label: '💬 Community Forum', link: '#' },
                  { label: '🏢 Teach on SkillOrbit', link: '#' },
                  { label: '🤝 Enterprise Solutions', link: '#' },
                ].map(l => (
                  <a key={l.label} href={l.link} style={{ display: 'block', padding: '0.5rem 0', fontSize: '0.875rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)' }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="container">
          <div className="section-header animate" style={{ textAlign: 'center' }}>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>
          <div className="faq-grid stagger-children">
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <div className={`faq-q ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span className="faq-icon">+</span>
                </div>
                {openFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="section offices">
        <div className="container">
          <div className="section-header animate" style={{ textAlign: 'center' }}>
            <h2>Our Offices</h2>
            <p>We're a global team with hubs in three time zones</p>
          </div>
          <div className="offices-grid stagger-children">
            {OFFICES.map(o => (
              <div key={o.city} className="office-card">
                <div className="office-map">{o.emoji}</div>
                <div className="office-body">
                  <div className="office-city">{o.city}</div>
                  <div className="office-address">{o.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
