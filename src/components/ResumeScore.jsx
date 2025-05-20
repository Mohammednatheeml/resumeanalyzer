import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '../styles/ResumeScore.css';

const ResumeScore = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    // Get analysis data from localStorage
    const storedAnalysis = localStorage.getItem('resumeAnalysis');
    
    if (storedAnalysis) {
      // Simulate loading for better UX
      setTimeout(() => {
        setAnalysisData(JSON.parse(storedAnalysis));
        setIsLoading(false);
      }, 1000);
    } else {
      // If no data found, redirect to upload page
      navigate('/');
    }
  }, [navigate]);

  const handleNewUpload = () => {
    navigate('/');
  };

  const getFeedbackClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'needs-improvement';
  };

  // Calculate how many areas need improvement
  const getImprovementAreas = () => {
    if (!analysisData) return 0;
    
    let count = 0;
    if (analysisData.contact_info.score < 70) count++;
    if (analysisData.skills.score < 70) count++;
    if (analysisData.education.score < 70) count++;
    if (analysisData.experience.score < 70) count++;
    if (analysisData.ats_compatibility.score < 70) count++;
    if (analysisData.readability.score < 70) count++;
    if (analysisData.length.score < 70) count++;
    
    return count;
  };

  // Function to handle the download report button click
  const handleDownloadReport = () => {
    if (!analysisData) return;
    
    // Format date for the filename
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Create the report content
    const reportContent = `
# RESUME ANALYSIS REPORT
Generated on: ${new Date().toLocaleString()}

## OVERALL SCORE: ${analysisData.overall_score}%
${analysisData.overall_score >= 80 
  ? "Your resume is in the top tier! Minor tweaks could make it perfect."
  : analysisData.overall_score >= 60 
  ? "Solid foundation with room for strategic improvements."
  : "Significant opportunities for enhancement to be competitive."}

## DETAILED ANALYSIS

### Contact Information: ${Math.round(analysisData.contact_info.score)}%
- Email: ${analysisData.contact_info.has_email ? 'Present' : 'Missing'}
- Phone: ${analysisData.contact_info.has_phone ? 'Present' : 'Missing'}
- LinkedIn: ${analysisData.contact_info.has_linkedin ? 'Present' : 'Missing'}

### Skills: ${Math.round(analysisData.skills.score)}%
- Total Skills Detected: ${analysisData.skills.count}
- Technical Skills: ${analysisData.skills.categorized.technical.join(', ')}
- Soft Skills: ${analysisData.skills.categorized.soft.join(', ')}
- Missing Technical Skills: ${analysisData.skills.categorized.missing_technical?.join(', ') || 'None'}
- Missing Soft Skills: ${analysisData.skills.categorized.missing_soft?.join(', ') || 'None'}

### Education: ${Math.round(analysisData.education.score)}%
- Status: ${analysisData.education.detected ? 'Well Presented' : 'Needs Improvement'}

### Experience: ${Math.round(analysisData.experience.score)}%
- Years of Experience Detected: ${analysisData.experience.years_detected}
- Job Titles Detected: ${analysisData.experience.job_titles_detected}
- Action Verbs Used: ${analysisData.experience.action_verbs}

### ATS Compatibility: ${Math.round(analysisData.ats_compatibility.score)}%
- Keywords Found: ${analysisData.ats_compatibility.keywords_found.join(', ')}
- Formatting Issues: ${analysisData.ats_compatibility.formatting_issues ? 'Yes' : 'No'}

### Readability: ${Math.round(analysisData.readability.score)}%
- Evaluation: ${analysisData.readability.evaluation}

### Length: ${Math.round(analysisData.length.score)}%
- Evaluation: ${analysisData.length.evaluation}

## IMPROVEMENT SUGGESTIONS
${analysisData.feedback.length > 0 
  ? analysisData.feedback.map((item, index) => `${index + 1}. ${item}`).join('\n')
  : 'Great job! Your resume is well-optimized.'}
`;
    
    // Create a Blob with the report content
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${formattedDate}.md`;
    
    // Append to the document, click, and remove
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Render missing skills section
  const renderMissingSkills = () => {
    if (!analysisData?.skills?.categorized?.missing_technical && 
        !analysisData?.skills?.categorized?.missing_soft) {
      return null;
    }

    const missingTech = analysisData.skills.categorized.missing_technical || [];
    const missingSoft = analysisData.skills.categorized.missing_soft || [];

    if (missingTech.length === 0 && missingSoft.length === 0) {
      return null;
    }

    return (
      <div className="missing-skills-section">
        <h3>Recommended Skills to Add</h3>
        <div className="missing-skills-wrapper">
          {missingTech.length > 0 && (
            <div className="missing-skills-column">
              <h4>Technical Skills</h4>
              <div className="skills-tags">
                {missingTech.slice(0, 10).map((skill, index) => (
                  <span key={`missing-tech-${index}`} className="skill-tag missing">
                    {skill}
                  </span>
                ))}
                {missingTech.length > 10 && (
                  <span className="skill-tag more">+{missingTech.length - 10} more</span>
                )}
              </div>
            </div>
          )}
          {missingSoft.length > 0 && (
            <div className="missing-skills-column">
              <h4>Soft Skills</h4>
              <div className="skills-tags">
                {missingSoft.slice(0, 5).map((skill, index) => (
                  <span key={`missing-soft-${index}`} className="skill-tag missing">
                    {skill}
                  </span>
                ))}
                {missingSoft.length > 5 && (
                  <span className="skill-tag more">+{missingSoft.length - 5} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="score-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating particles background */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ 
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0
            }}
            animate={{ 
              x: Math.random() * 100,
              y: Math.random() * 100,
              opacity: Math.random() * 0.3 + 0.2,
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        ))}
      </div>

      <div className="score-header">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Resume Analysis Results
        </motion.h1>
        <motion.p
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Your <span className="highlight">AI-powered</span> resume assessment is ready
        </motion.p>
      </div>

      {isLoading ? (
        <motion.div 
          className="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p>Generating your personalized resume analysis...</p>
        </motion.div>
      ) : (
        <>
          <motion.div 
            className="score-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div 
              className="score-circle"
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <svg className="circle-chart" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2ecc71" />
                    <stop offset="100%" stopColor="#27ae60" />
                  </linearGradient>
                </defs>
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="circle-fill"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${analysisData?.overall_score || 0}, 100` }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </svg>
              <div className="score-value">
                {analysisData?.overall_score || 0}
                <span>%</span>
              </div>
              <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    className="score-tooltip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {analysisData?.overall_score >= 80 ? "Excellent!" : analysisData?.overall_score >= 60 ? "Good!" : "Needs Improvement"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="score-description">
              <h3>Your Resume Score</h3>
              <p>
                {analysisData?.overall_score >= 80 
                  ? "Your resume is in the top tier! Minor tweaks could make it perfect."
                  : analysisData?.overall_score >= 60 
                  ? "Solid foundation with room for strategic improvements."
                  : "Significant opportunities for enhancement to be competitive."}
              </p>
              <div className="improvement-status">
                <span className={getFeedbackClass(analysisData?.overall_score || 0)}>
                  {getImprovementAreas()} areas need improvement
                </span>
              </div>
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feedback')}
                >
                  Feedback
                </button>
              </div>
            </div>
          </motion.div>

          {activeTab === 'overview' ? (
            <motion.div 
              className="analysis-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h2>Detailed Analysis</h2>
              <div className="analysis-grid">
                {analysisData && [
                  { category: 'Contact Information', score: analysisData.contact_info.score, 
                    feedback: analysisData.contact_info.has_email && analysisData.contact_info.has_phone ? 
                      'Great job including your contact details!' : 'Consider adding more contact information.' },
                  { category: 'Skills', score: analysisData.skills.score, 
                    feedback: `${analysisData.skills.count} skills detected. ${analysisData.skills.count > 10 ? 'Excellent range of skills!' : 'Consider adding more relevant skills.'}` },
                  { category: 'Education', score: analysisData.education.score, 
                    feedback: analysisData.education.detected ? 'Education section well presented.' : 'Education section needs improvement.' },
                  { category: 'Experience', score: analysisData.experience.score, 
                    feedback: `${analysisData.experience.action_verbs} action verbs detected. ${analysisData.experience.years_detected > 0 ? `${analysisData.experience.years_detected} years of experience shown.` : ''}` },
                  { category: 'ATS Compatibility', score: analysisData.ats_compatibility.score, 
                    feedback: analysisData.ats_compatibility.score > 70 ? 'Good ATS optimization!' : 'Improve keyword optimization for ATS.' },
                  { category: 'Readability', score: analysisData.readability.score, 
                    feedback: analysisData.readability.evaluation }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="analysis-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  >
                    <h3>{item.category}</h3>
                    <div className="progress-container">
                      <motion.div 
                        className={`progress-bar ${getFeedbackClass(item.score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                      />
                    </div>
                    <div className="score-percentage">{Math.round(item.score)}%</div>
                    <p>{item.feedback}</p>
                    <motion.div 
                      className="card-decoration"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="feedback-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h2>Improvement Suggestions</h2>
              {analysisData?.feedback.length > 0 ? (
                <div className="feedback-list">
                  {analysisData.feedback.map((item, index) => (
                    <motion.div 
                      key={index}
                      className="feedback-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    >
                      <div className="feedback-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="feedback-text">{item}</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="no-feedback">
                  <p>Great job! Your resume is well-optimized.</p>
                </div>
              )}

              <div className="skills-section">
                <h3>Skills Detected</h3>
                <div className="skills-wrapper">
                  <div className="skills-column">
                    <h4>Technical Skills</h4>
                    <div className="skills-tags">
                      {analysisData?.skills.categorized.technical.map((skill, index) => (
                        <span key={index} className="skill-tag technical">{skill}</span>
                      ))}
                      {analysisData?.skills.categorized.technical.length === 0 && (
                        <span className="no-skills">No technical skills detected</span>
                      )}
                    </div>
                  </div>
                  <div className="skills-column">
                    <h4>Soft Skills</h4>
                    <div className="skills-tags">
                      {analysisData?.skills.categorized.soft.map((skill, index) => (
                        <span key={index} className="skill-tag soft">{skill}</span>
                      ))}
                      {analysisData?.skills.categorized.soft.length === 0 && (
                        <span className="no-skills">No soft skills detected</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Render missing skills section */}
                {renderMissingSkills()}
              </div>
            </motion.div>
          )}

          <motion.div 
            className="action-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <motion.button 
              className="download-button"
              onClick={handleDownloadReport}
              whileHover={{ 
                scale: 1.05,
                background: "linear-gradient(45deg, #2ecc71, #27ae60)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Download Full Report
            </motion.button>
            <motion.button 
              className="upload-new-button"
              onClick={handleNewUpload}
              whileHover={{ 
                scale: 1.05,
                background: "linear-gradient(45deg, #e74c3c, #c0392b)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Analyze Another Resume
            </motion.button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default ResumeScore;