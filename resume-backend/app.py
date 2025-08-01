from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import spacy
import re
import string
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import PyPDF2
import docx2txt
import random
from collections import Counter
import time

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('punkt_tab')  # <== Fix for your error
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_md")
except:
    os.system("python -m spacy download en_core_web_md")
    nlp = spacy.load("en_core_web_md")

TECHNICAL_SKILLS = {
    'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'golang', 'typescript', 'rust'],
    'web_dev': ['react', 'angular', 'vue', 'django', 'flask', 'nodejs', 'express', 'html', 'css', 'bootstrap', 'jquery', 'tailwind'],
    'data_science': ['numpy', 'pandas', 'tensorflow', 'pytorch', 'sklearn', 'scikit-learn', 'keras', 'matplotlib', 'seaborn', 'tableau', 'powerbi'],
    'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'cassandra', 'redis', 'elasticsearch', 'firebase', 'dynamodb'],
    'devops': ['docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'ci/cd'],
    'mobile': ['android', 'ios', 'react native', 'flutter', 'swift', 'objective-c', 'kotlin', 'xamarin'],
    'ai_ml': ['machine learning', 'deep learning', 'nlp', 'computer vision', 'reinforcement learning', 'neural networks', 'ai', 'artificial intelligence'],
}

SOFT_SKILLS = [
    'communication', 'teamwork', 'problem-solving', 'time management', 'leadership', 'adaptability', 'creativity', 
    'critical thinking', 'emotional intelligence', 'negotiation', 'conflict resolution', 'presentation', 'decision making',
    'collaboration', 'flexibility', 'reliability', 'work ethic', 'attention to detail', 'interpersonal'
]

ATS_KEYWORDS = [
    'achieved', 'improved', 'trained', 'managed', 'created', 'resolved', 'volunteered', 'influenced', 'increased', 'decreased',
    'researched', 'organized', 'developed', 'launched', 'implemented', 'designed', 'maintained', 'supervised', 'coordinated',
    'presented', 'negotiated', 'budget', 'revenue', 'profit', 'growth', 'success', 'user experience', 'results-driven', 'strategic'
]

def get_expected_skills(job_role=None):
    all_technical = []
    for category in TECHNICAL_SKILLS.values():
        all_technical.extend(category)
    return {
        'technical': list(set(all_technical)),
        'soft': list(set(SOFT_SKILLS))
    }

def extract_text_from_pdf(pdf_file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    for page_num in range(len(pdf_reader.pages)):
        text += pdf_reader.pages[page_num].extract_text()
    return text

def extract_text_from_docx(docx_file):
    return docx2txt.process(docx_file)

def extract_text_from_txt(txt_file):
    return txt_file.read().decode('utf-8')

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def check_contact_info(text):
    email_pattern = re.compile(r'\S+@\S+')
    phone_pattern = re.compile(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
    linkedin_pattern = re.compile(r'linkedin\.com/\S+')
    found_email = bool(email_pattern.search(text.lower()))
    found_phone = bool(phone_pattern.search(text))
    found_linkedin = bool(linkedin_pattern.search(text.lower()))
    return {
        'has_email': found_email,
        'has_phone': found_phone,
        'has_linkedin': found_linkedin,
        'score': (found_email + found_phone + found_linkedin) / 3 * 100
    }

def extract_skills(text):
    all_skills = []
    all_technical_skills = []
    for category in TECHNICAL_SKILLS.values():
        all_technical_skills.extend(category)
    skills_to_check = set(all_technical_skills + SOFT_SKILLS)
    tokens = word_tokenize(text.lower())
    for token in tokens:
        if token in skills_to_check and token not in all_skills:
            all_skills.append(token)
    for skill in skills_to_check:
        if ' ' in skill and skill.lower() in text.lower() and skill not in all_skills:
            all_skills.append(skill)
    return all_skills

def categorize_skills(skills):
    skill_categories = {
        'technical': [],
        'soft': [],
        'missing_technical': [],
        'missing_soft': []
    }
    expected_skills = get_expected_skills()
    for skill in skills:
        if skill in expected_skills['technical']:
            skill_categories['technical'].append(skill)
        elif skill in expected_skills['soft']:
            skill_categories['soft'].append(skill)
    for skill in expected_skills['technical']:
        if skill not in skills:
            skill_categories['missing_technical'].append(skill)
    for skill in expected_skills['soft']:
        if skill not in skills:
            skill_categories['missing_soft'].append(skill)
    return skill_categories

def analyze_education(text):
    education_keywords = ['degree', 'bachelor', 'master', 'phd', 'doctorate', 'mba', 'bs', 'ba', 'ms', 'ma', 'university', 'college', 'school', 'institute', 'gpa']
    education_score = sum(1 for keyword in education_keywords if keyword in text.lower())
    education_score = min(education_score / 3, 1) * 100
    return {
        'detected': education_score > 30,
        'score': education_score
    }

def analyze_work_experience(text):
    exp_patterns = [
        r'(\d+)(?:\+)?\s*(?:years?|yrs?)\s*(?:of)?\s*experience',
        r'experience\s*(?:of)?\s*(\d+)(?:\+)?\s*(?:years?|yrs?)',
        r'worked\s*(?:for)?\s*(\d+)(?:\+)?\s*(?:years?|yrs?)'
    ]
    years_of_exp = 0
    for pattern in exp_patterns:
        matches = re.findall(pattern, text.lower())
        if matches:
            years_of_exp = max(years_of_exp, int(matches[0]))
    job_titles = ['engineer', 'developer', 'manager', 'director', 'coordinator', 'specialist', 'analyst', 'assistant', 'consultant', 'intern']
    job_title_count = sum(1 for title in job_titles if title in text.lower())
    action_verbs = ['managed', 'developed', 'created', 'implemented', 'designed', 'led', 'organized', 'achieved', 'improved', 'increased']
    action_verb_count = sum(1 for verb in action_verbs if verb in text.lower())
    exp_score = min((years_of_exp * 10) + (job_title_count * 5) + (action_verb_count * 2), 100)
    return {
        'years_detected': years_of_exp,
        'job_titles_detected': job_title_count,
        'action_verbs': action_verb_count,
        'score': exp_score
    }

def analyze_ats_compatibility(text):
    keywords_found = [kw for kw in ATS_KEYWORDS if kw in text.lower()]
    has_tables = 'table' in text.lower() or '|' in text
    has_graphics = 'graphics' in text.lower() or 'chart' in text.lower()
    keyword_score = len(keywords_found) / len(ATS_KEYWORDS) * 70
    format_score = 30 if not (has_tables or has_graphics) else 15
    total_score = keyword_score + format_score
    return {
        'keywords_found': keywords_found,
        'formatting_issues': has_tables or has_graphics,
        'score': total_score
    }

def calculate_readability(text):
    sentences = len(re.split(r'[.!?]+', text))
    words = len(text.split())
    if sentences == 0 or words == 0:
        return 50
    words_per_sentence = words / max(sentences, 1)
    if words_per_sentence > 25:
        score = 40
    elif words_per_sentence < 10:
        score = 60
    else:
        score = 80
    return score

def analyze_length(text):
    words = len(text.split())
    if words < 200:
        return {'evaluation': 'Too short', 'score': 40}
    elif words > 1000:
        return {'evaluation': 'Too long', 'score': 60}
    else:
        return {'evaluation': 'Good length', 'score': 100}

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if file_extension not in ['pdf', 'docx', 'doc', 'txt']:
        return jsonify({'error': 'Unsupported file format'}), 400
    try:
        if file_extension == 'pdf':
            text = extract_text_from_pdf(file)
        elif file_extension in ['docx', 'doc']:
            text = extract_text_from_docx(file)
        elif file_extension == 'txt':
            text = extract_text_from_txt(file)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
    except Exception as e:
        return jsonify({'error': f'Error extracting text: {str(e)}'}), 500

    raw_text = text
    processed_text = preprocess_text(text)
    time.sleep(1)

    contact_info = check_contact_info(raw_text)
    skills = extract_skills(raw_text)
    categorized_skills = categorize_skills(skills)
    education = analyze_education(raw_text)
    experience = analyze_work_experience(raw_text)
    ats_compatibility = analyze_ats_compatibility(raw_text)
    readability = calculate_readability(raw_text)
    length_analysis = analyze_length(raw_text)

    overall_score = int((
        contact_info['score'] * 0.1 +
        (len(skills) / 15 * 100) * 0.2 +
        education['score'] * 0.15 +
        experience['score'] * 0.25 +
        ats_compatibility['score'] * 0.2 +
        readability * 0.05 +
        length_analysis['score'] * 0.05
    ))

    feedback = []
    if not contact_info['has_email']:
        feedback.append("Add an email address to your resume.")
    if not contact_info['has_phone']:
        feedback.append("Include a phone number for potential employers.")
    if not contact_info['has_linkedin']:
        feedback.append("Consider adding your LinkedIn profile.")
    if len(categorized_skills['technical']) < 5:
        feedback.append("Add more technical skills relevant to your target position.")
    if len(categorized_skills['soft']) < 3:
        feedback.append("Include more soft skills to demonstrate workplace compatibility.")
    if categorized_skills['missing_technical']:
        feedback.append(f"Consider adding these technical skills: {', '.join(categorized_skills['missing_technical'][:5])}...")
    if categorized_skills['missing_soft']:
        feedback.append(f"Consider adding these soft skills: {', '.join(categorized_skills['missing_soft'][:3])}...")
    if not education['detected']:
        feedback.append("Make your education section more prominent.")
    if experience['action_verbs'] < 5:
        feedback.append("Use more action verbs to describe your accomplishments.")
    if ats_compatibility['score'] < 70:
        feedback.append("Optimize your resume with more industry keywords for better ATS compatibility.")
    if length_analysis['evaluation'] == 'Too short':
        feedback.append("Your resume is too brief. Add more detailed information about your experience and skills.")
    elif length_analysis['evaluation'] == 'Too long':
        feedback.append("Consider condensing your resume to focus on the most relevant information.")

    response = {
        'overall_score': overall_score,
        'contact_info': contact_info,
        'skills': {
            'all': skills,
            'categorized': categorized_skills,
            'count': len(skills),
            'score': min(len(skills) / 15 * 100, 100)
        },
        'education': education,
        'experience': experience,
        'ats_compatibility': ats_compatibility,
        'readability': {
            'score': readability,
            'evaluation': 'Good' if readability > 70 else 'Needs improvement'
        },
        'length': length_analysis,
        'feedback': feedback
    }

    return jsonify(response)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
