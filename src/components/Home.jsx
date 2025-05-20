import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const fullText = "RESUME ANALYZER";

  // Typing animation
  useEffect(() => {
    let timeout;
    
    if (displayText.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayText(fullText.substring(0, displayText.length + 1));
      }, 150);
    } else {
      timeout = setTimeout(() => setDisplayText(''), 3000);
    }

    return () => clearTimeout(timeout);
  }, [displayText]);

  return (
    <div className="page-container">
      {/* Full-screen background image */}
      <div className="fullscreen-bg"></div>
      
      {/* Hero content */}
      <div className="hero-content">
        <h1 className="main-title">
          {displayText}
          <span className="blinking-cursor">|</span>
        </h1>
        <button 
          className="analyze-button"
          onClick={() => navigate('/upload')}
        >
          ANALYZE YOUR RESUME
          <span className="button-arrow">→</span>
        </button>
      </div>

      {/* Content section below */}
      <div className="content-section">
  <div className="content-wrapper">
    <h2 className="section-title">Why Use Our Resume Analyzer?</h2>
    
    <div className="features-grid">
      <div className="feature-card">
        <div className="feature-icon">📊</div>
        <h3>Instant Analysis</h3>
        <p>Get immediate feedback on your resume's strengths and areas for improvement with our AI-powered analysis</p>
      </div>
      
      <div className="feature-card">
        <div className="feature-icon">🤖</div>
        <h3>ATS Optimization</h3>
        <p>Ensure your resume passes through applicant tracking systems used by 99% of Fortune 500 companies</p>
      </div>
      
      <div className="feature-card">
        <div className="feature-icon">💼</div>
        <h3>Job Matching</h3>
        <p>Discover how well your resume aligns with your target positions and industry standards</p>
      </div>

      {/* New additional feature cards */}
      <div className="feature-card">
        <div className="feature-icon">✨</div>
        <h3>Tailored Suggestions</h3>
        <p>Receive personalized recommendations to enhance your resume's impact and readability</p>
      </div>
      
      <div className="feature-card">
        <div className="feature-icon">📈</div>
        <h3>Score Metrics</h3>
        <p>Get quantifiable scores for different resume aspects to track your improvements</p>
      </div>
      
      <div className="feature-card">
        <div className="feature-icon">🔍</div>
        <h3>Keyword Analysis</h3>
        <p>Identify missing industry keywords that help your resume stand out to recruiters</p>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Home;