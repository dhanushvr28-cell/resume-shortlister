import React, { useState } from 'react';
import { Upload, FileText, Zap, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';

export default function ResumeShortlister() {
  const [activeTab, setActiveTab] = useState('upload');
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('standard');

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleResumeUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setResumes(prev => [...prev, ...files.map(file => ({
      file,
      name: file.name,
      id: Math.random()
    }))]);
  };

  const removeResume = (id) => {
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  const analyzeResumes = async () => {
    if (!jobDescription.trim() || resumes.length === 0) {
      alert('Please provide job description and upload resumes');
      return;
    }

    setLoading(true);
    try {
      // Simulated API call - replace with actual backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = resumes.map((resume, idx) => ({
        id: resume.id,
        name: resume.name,
        score: Math.floor(60 + Math.random() * 40),
        skills: ['Python', 'Machine Learning', 'Data Analysis', 'Communication'],
        strengths: ['Strong ML background', 'Relevant experience'],
        gaps: ['Missing cloud experience'],
        recommendation: Math.random() > 0.3 ? 'Interview' : 'Reject'
      })).sort((a, b) => b.score - a.score);

      setResults(mockResults);
      setActiveTab('results');
    } catch (error) {
      alert('Error analyzing resumes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                <Zap size={24} />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Resume Shortlister AI
              </h1>
            </div>
            <p className="text-slate-400 text-sm">Intelligent resume screening powered by AI</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'upload'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Upload & Configure
              {activeTab === 'upload' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!results}
              className={`px-4 py-3 font-medium transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === 'results'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Results & Rankings
              {activeTab === 'results' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              )}
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Job Description Section */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm hover:border-slate-600 transition-colors">
                <label className="block mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={20} className="text-blue-400" />
                    <span className="text-lg font-semibold">Job Description</span>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    placeholder="Paste the job description here. Include required skills, experience, and responsibilities..."
                    className="w-full h-48 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none transition-all"
                  />
                </label>
              </div>

              {/* Analysis Mode */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
                <label className="block mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-purple-400" />
                    <span className="text-lg font-semibold">Analysis Mode</span>
                  </div>
                  <div className="flex gap-4">
                    {['standard', 'detailed', 'custom'].map(mode => (
                      <label key={mode} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          value={mode}
                          checked={analysisMode === mode}
                          onChange={(e) => setAnalysisMode(e.target.value)}
                          className="w-4 h-4 accent-blue-400"
                        />
                        <span className="capitalize text-slate-300">{mode}</span>
                      </label>
                    ))}
                  </div>
                </label>
              </div>

              {/* Resume Upload Section */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Upload size={20} className="text-green-400" />
                  <span className="text-lg font-semibold">Upload Resumes</span>
                </div>

                {/* Upload Area */}
                <label className="block mb-6 cursor-pointer">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 hover:border-blue-400 transition-colors bg-slate-900/30 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <Upload size={32} className="text-slate-400" />
                      <div>
                        <p className="text-white font-medium mb-1">Drop resumes here or click to browse</p>
                        <p className="text-slate-400 text-sm">Supported: PDF, DOC, DOCX, TXT</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Resume List */}
                {resumes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400 mb-4">
                      {resumes.length} resume{resumes.length !== 1 ? 's' : ''} ready for analysis
                    </p>
                    {resumes.map(resume => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-blue-400" />
                          <span className="text-white truncate">{resume.name}</span>
                        </div>
                        <button
                          onClick={() => removeResume(resume.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeResumes}
                disabled={loading || !jobDescription.trim() || resumes.length === 0}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin">⏳</div>
                    Analyzing Resumes...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Analyze Resumes
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && results && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-slate-400">
                  Found <span className="text-blue-400 font-bold">{results.length}</span> candidate{results.length !== 1 ? 's' : ''} - ranked by relevance
                </p>
              </div>

              {results.map((result, idx) => (
                <div
                  key={result.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all hover:bg-slate-800/70 backdrop-blur-sm"
                  style={{
                    animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{result.name}</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden max-w-xs">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all"
                              style={{ width: `${result.score}%` }}
                            />
                          </div>
                          <span className="text-2xl font-bold text-blue-400">{result.score}%</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                      result.recommendation === 'Interview'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      <ChevronRight size={18} />
                      {result.recommendation}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Matching Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {result.strengths.map((strength, i) => (
                          <li key={i} className="text-green-400 text-sm flex items-center gap-2">
                            <span className="text-green-500">✓</span> {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">Gaps</p>
                      <ul className="space-y-1">
                        {result.gaps.map((gap, i) => (
                          <li key={i} className="text-yellow-400 text-sm flex items-center gap-2">
                            <AlertCircle size={14} /> {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        * {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
