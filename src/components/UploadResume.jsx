import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Upload.css';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 300);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile) {
      // Check file extension
      const fileExtension = droppedFile.name.split('.').pop().toLowerCase();
      if (['pdf', 'doc', 'docx', 'txt'].includes(fileExtension)) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files only.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send file to backend API
      const response = await fetch('http://192.168.1.9:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze resume');
      }

      const analysisData = await response.json();

      // Store analysis results in localStorage to pass to the score page
      localStorage.setItem('resumeAnalysis', JSON.stringify(analysisData));

      // Navigate to score page
      setTimeout(() => {
        setIsLoading(false);
        navigate('/score');
      }, 1000);

    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Error analyzing your resume. Please try again.');
      console.error('Analysis error:', err);
    }
  };

  return (
    <div className={`upload-container ${isReady ? 'ready' : ''}`}>
      {/* Fixed full-screen video background */}
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src="/videos/hii.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="bg-video-overlay"></div>
      
      {/* Content container */}
      <div className="resume-content-wrapper">
        <h2 className="uploadd-title">PROFESSIONAL RESUME ANALYZER</h2>
        <p className="upload-subtitle">
          Upload your resume for <span>AI-powered career insights</span> and elevate your professional profile
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div 
          className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="dropzone-content">
            <div className="upload-icon-wrapper">
              <svg className="upload-icon" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
            </div>
            <p className="dropzone-text">
              {file ? (
                <>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </>
              ) : (
                'Drag & drop your resume or CV here'
              )}
            </p>
            <input 
              type="file" 
              id="resume-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="resume-upload" className="browse-button">
              {file ? 'Change File' : 'Select File'}
            </label>
          </div>
        </div>

        <div className="file-requirements">
          <div className="requirement">
            <svg className="check-icon" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span>PDF, DOC, DOCX formats</span>
          </div>
          <div className="requirement">
            <svg className="check-icon" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span>Max 5MB file size</span>
          </div>
        </div>

        <button 
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <>
              <span className="button-loader"></span>
              <span>Analyzing Your Resume...</span>
            </>
          ) : (
            <>
              <span className="button-text">Analyze Now</span>
              <span className="button-arrow">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadResume;
