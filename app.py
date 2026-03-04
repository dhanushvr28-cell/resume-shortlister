"""
Resume Shortlister AI - Backend API
Flask application for resume screening using AI
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import PyPDF2
from typing import List, Dict, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from various file formats
    Supports: PDF, TXT, DOC, DOCX
    """
    text = ""
    file_ext = file_path.rsplit('.', 1)[1].lower()

    try:
        if file_ext == 'pdf':
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()

        elif file_ext == 'txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()

        elif file_ext in ['doc', 'docx']:
            # For DOCX files
            if file_ext == 'docx':
                from docx import Document
                doc = Document(file_path)
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
            # For older DOC format, you may need python-docx2txt or similar
            else:
                logger.warning(f"DOC format not fully supported yet: {file_path}")
                text = ""

    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {str(e)}")
        raise

    return text.strip()


def analyze_resume(job_description: str, resume_text: str, analysis_mode: str = 'standard') -> Dict:
    """
    Analyze a single resume against job description using AI
    
    Args:
        job_description: The job posting text
        resume_text: The extracted resume text
        analysis_mode: 'standard', 'detailed', or 'custom'
    
    Returns:
        Dictionary with analysis results
    """
    try:
        # Import here to handle optional dependencies
        import anthropic  # or openai, ollama, etc.

        client = anthropic.Anthropic()

        prompt = f"""Analyze this resume against the provided job description.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Provide analysis in JSON format with the following structure:
{{
    "match_score": <0-100>,
    "matching_skills": [<list of skills that match>],
    "missing_skills": [<list of required skills not found>],
    "strengths": [<list of candidate strengths>],
    "gaps": [<list of potential gaps>],
    "experience_level": "<junior/mid/senior>",
    "recommendation": "<Interview/Further Review/Reject>",
    "summary": "<brief assessment>"
}}

Be objective and thorough in your analysis."""

        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text

        # Parse JSON from response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
        else:
            analysis = {
                "match_score": 50,
                "matching_skills": [],
                "missing_skills": [],
                "strengths": ["Unable to parse response"],
                "gaps": ["Review manually"],
                "recommendation": "Further Review"
            }

        return analysis

    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        return {
            "match_score": 0,
            "matching_skills": [],
            "missing_skills": [],
            "strengths": [],
            "gaps": ["Error during analysis"],
            "recommendation": "Error",
            "error": str(e)
        }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "version": "1.0.0"})


@app.route('/api/analyze', methods=['POST'])
def analyze_resumes():
    """
    Main endpoint for resume analysis
    
    Request body:
    {
        "job_description": "...",
        "analysis_mode": "standard|detailed|custom",
        "files": [resume files]
    }
    """
    try:
        # Validate request
        if 'job_description' not in request.form:
            return jsonify({"error": "Job description is required"}), 400

        if 'files' not in request.files or len(request.files.getlist('files')) == 0:
            return jsonify({"error": "At least one resume file is required"}), 400

        job_description = request.form.get('job_description')
        analysis_mode = request.form.get('analysis_mode', 'standard')
        files = request.files.getlist('files')

        results = []

        # Process each resume
        for file in files:
            if file.filename == '':
                continue

            if not allowed_file(file.filename):
                logger.warning(f"File not allowed: {file.filename}")
                continue

            try:
                # Save file temporarily
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)

                # Extract text
                resume_text = extract_text_from_file(filepath)

                if not resume_text:
                    results.append({
                        "filename": filename,
                        "error": "Could not extract text from file"
                    })
                    continue

                # Analyze
                analysis = analyze_resume(job_description, resume_text, analysis_mode)

                results.append({
                    "filename": filename,
                    "original_filename": file.filename,
                    **analysis
                })

                # Clean up
                os.remove(filepath)

            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {str(e)}")
                results.append({
                    "filename": file.filename,
                    "error": str(e)
                })

        # Sort by match score
        results.sort(key=lambda x: x.get('match_score', 0), reverse=True)

        return jsonify({
            "status": "success",
            "count": len(results),
            "results": results
        })

    except Exception as e:
        logger.error(f"Error in analyze endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Batch analysis endpoint for processing multiple jobs
    
    Request body:
    {
        "jobs": [
            {
                "job_id": "...",
                "job_description": "...",
                "files": [...]
            }
        ]
    }
    """
    try:
        data = request.get_json()

        if 'jobs' not in data:
            return jsonify({"error": "Jobs array is required"}), 400

        batch_results = []

        for job in data['jobs']:
            job_id = job.get('job_id', 'unknown')
            job_desc = job.get('job_description', '')

            # Process resumes for this job
            job_results = []

            if 'resumes' in job:
                for resume_text in job['resumes']:
                    analysis = analyze_resume(job_desc, resume_text)
                    job_results.append(analysis)

            batch_results.append({
                "job_id": job_id,
                "results_count": len(job_results),
                "results": sorted(job_results, 
                                key=lambda x: x.get('match_score', 0), 
                                reverse=True)
            })

        return jsonify({
            "status": "success",
            "jobs_processed": len(batch_results),
            "results": batch_results
        })

    except Exception as e:
        logger.error(f"Error in batch-analyze: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/resume-preview', methods=['POST'])
def resume_preview():
    """
    Preview endpoint to extract and return resume text
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "File is required"}), 400

        file = request.files['file']

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        text = extract_text_from_file(filepath)
        os.remove(filepath)

        return jsonify({
            "status": "success",
            "filename": file.filename,
            "text": text[:2000]  # Return first 2000 chars for preview
        })

    except Exception as e:
        logger.error(f"Error in preview: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({"error": f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.0f}MB"}), 413


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
