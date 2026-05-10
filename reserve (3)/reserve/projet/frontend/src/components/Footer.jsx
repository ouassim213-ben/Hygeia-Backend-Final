import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';
import footerLogo from '../assets/footer_logo.png';

export default function Footer() {
  return (
    <footer className="hygeia-footer">
      <div className="footer-main-content">
        {/* Left Side: Brand & Description */}
        <div className="footer-column footer-brand">
          <div className="footer-logo-wrapper">
            <img src={footerLogo} alt="HYGEIA Logo" className="footer-logo-img" />
            <span className="footer-brand-name">HYGEIA</span>
          </div>
          <p className="footer-description">
            Advanced AI-driven nutrition tracking and health consultation platform.
          </p>
        </div>

        {/* Center: Contact Info */}
        <div className="footer-column footer-contact">
          <h3 className="footer-column-title">Contact</h3>
          <ul className="footer-contact-list">
            <li className="footer-contact-item">
              <MapPin size={18} className="contact-icon" />
              <span>Constantine, Algeria</span>
            </li>
            <li className="footer-contact-item">
              <Phone size={18} className="contact-icon" />
              <span>+213 (0) 555 000 000</span>
            </li>
            <li className="footer-contact-item">
              <Mail size={18} className="contact-icon" />
              <a href="mailto:contact@hygeia.dz">contact@hygeia.dz</a>
            </li>
          </ul>
        </div>

        {/* Right Side: Quick Links */}
        <div className="footer-column footer-links">
          <h3 className="footer-column-title">Quick Links</h3>
          <ul className="footer-links-list">
            <li><Link to="/#home">Home</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><Link to="/#programs">Programs</Link></li>
            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">
          <div className="footer-copyright-text">
            © 2026 HYGEIA | Faculty of NTIC | Constantine 2 University
          </div>
          <div className="footer-legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="separator">|</span>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
