import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './About.css';

export default function About() {
  return (
    <div className="journal-page">
      <Navbar />

      <div className="journal-container">
        {/* HEADER SECTION */}
        <header className="journal-header">
          <div className="journal-metadata">
            HYGEIA Health Journal | Volume 1 | ISSN 133560879 | 2026
          </div>
          <h1 className="journal-title">The Legacy of Hygeia</h1>
          <div className="double-line"></div>
        </header>

        {/* MAIN MAGAZINE GRID */}
        <main className="journal-grid">
          
          {/* COLUMN I: THE HERITAGE */}
          <div className="journal-column">
            <h2 className="journal-subheading">I. The Ancient Guardian</h2>
            <p className="journal-text">
              In the heart of antiquity, while Asclepius was sought for his ability to mend the broken and heal the afflicted, 
              his daughter <strong>Hygieia</strong> represented a different kind of wisdom. She was the guardian of the healthy—the 
              embodiment of <span className="keyword-gold">Prevention</span> and the continuation of good health.
            </p>
            
            <div className="text-divider">§</div>

            <p className="journal-text">
              Her role in the <strong>Hippocratic Oath</strong> underscores her foundational status in medical history. 
              The oath, which begins by calling upon Apollo, Asclepius, and Hygieia, reminds us that the primary duty of the healer 
              is to maintain the natural state of wellness.
            </p>
          </div>

          {/* COLUMN II: PHILOSOPHY */}
          <div className="journal-column">
            <h2 className="journal-subheading">II. Philosophy of Wellness</h2>
            <p className="journal-text">
              Our name finds its essence in the philosophy that the maintenance of good health is a proactive journey. 
              In a world that often waits for illness to act, HYGEIA looks back to this ancient wisdom. We believe that true 
              well-being isn’t just about recovering from sickness—it’s about the daily choices that keep us vibrant and strong.
            </p>
            
            <div className="text-divider">§</div>

            <p className="journal-text">
              The continuation of health is a sacred duty. HYGEIA bridges the gap between ancient philosophy 
              and 21st-century technology, ensuring that prevention remains at the core of human wellness.
            </p>
          </div>

          {/* COLUMN III: THE EVOLUTION */}
          <div className="journal-column">
            <h2 className="journal-subheading">III. The Digital Evolution</h2>
            <p className="journal-text">
              Today, we are evolving this 2,500-year-old duty into the digital age. By leveraging 
              <strong> Artificial Intelligence</strong> and global connectivity, we have created a platform where 
              clinical expertise meets data-driven precision.
            </p>

            <div className="text-divider">§</div>

            <p className="journal-text">
              Every nutritionist and health coach on the HYGEIA platform is empowered by neural analysis tools, 
              ensuring that your path to <span className="keyword-gold">Maintenance</span> is as unique as your biology. 
              We combine human empathy with machine precision to ensure the continuation of health for all.
            </p>
          </div>

          {/* FULL WIDTH QUOTE SECTION */}
          <div className="journal-quote-large">
            <p>
              "Inspired by our namesake, HYGEIA is built on the belief that health is not merely the absence of disease, 
              but a proactive journey of conscious maintenance and prevention."
            </p>
            <span className="quote-author">— The HYGEIA Manifesto</span>
          </div>

        </main>

        <footer className="journal-footer">
          <p>The Modern Guardian of Wellness &bull; Empowering Proactive Health Since 2026</p>
        </footer>
      </div>
      <Footer />
    </div>
  );
}
