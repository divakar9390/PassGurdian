import React, { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Shield, Eye, EyeOff, Download, AlertTriangle, CheckCircle, XCircle, Key, User, Calendar, Heart } from 'lucide-react';

const PasswordSecuritySuite = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [wordlistInputs, setWordlistInputs] = useState({
    name: '', birthdate: '', pet: '', company: '', hobby: '', location: ''
  });
  const [generatedWordlist, setGeneratedWordlist] = useState([]);
  const [activeTab, setActiveTab] = useState('analyzer');

  const analyzePassword = useCallback((pwd) => {
    if (!pwd) return null;
    const length = pwd.length;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    let charsetSize = 0;
    if (hasLower) charsetSize += 26;
    if (hasUpper) charsetSize += 26;
    if (hasNumbers) charsetSize += 10;
    if (hasSpecial) charsetSize += 32;
    const entropy = length * Math.log2(charsetSize);
    const commonPatterns = [
      { pattern: /123456|password|qwerty|admin|letmein/i, name: 'Common passwords' },
      { pattern: /(.)\1{2,}/, name: 'Repeated characters' },
      { pattern: /012|123|234|345|456|567|678|789|890/, name: 'Sequential numbers' },
      { pattern: /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, name: 'Sequential letters' }
    ];
    const detectedPatterns = commonPatterns.filter(p => p.pattern.test(pwd));
    let score = 0;
    if (length >= 8) score += 25;
    if (length >= 12) score += 25;
    if (hasLower && hasUpper) score += 20;
    if (hasNumbers) score += 15;
    if (hasSpecial) score += 15;
    score -= detectedPatterns.length * 10;
    score = Math.max(0, Math.min(100, score));
    let strength = 'Very Weak';
    let color = 'danger';
    if (score >= 80) { strength = 'Very Strong'; color = 'success'; }
    else if (score >= 60) { strength = 'Strong'; color = 'primary'; }
    else if (score >= 40) { strength = 'Moderate'; color = 'warning'; }
    else if (score >= 20) { strength = 'Weak'; color = 'warning'; }
    return {
      score,
      strength,
      color,
      entropy: Math.round(entropy),
      characteristics: { length, hasLower, hasUpper, hasNumbers, hasSpecial },
      patterns: detectedPatterns,
      timeToCrack: calculateTimeToCrack(entropy)
    };
  }, []);

  const calculateTimeToCrack = (entropy) => {
    const attemptsPerSecond = 1e9;
    const combinations = Math.pow(2, entropy);
    const seconds = combinations / (2 * attemptsPerSecond);
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    return `${Math.round(seconds / 31536000)} years`;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setAnalysis(analyzePassword(pwd));
  };

  const generateLeetspeak = (word) => {
    const leetMap = {
      'a': ['@', '4'], 'e': ['3'], 'i': ['1', '!'], 'o': ['0'], 's': ['5', '$'],
      't': ['7'], 'l': ['1'], 'g': ['9'], 'b': ['6'], 'z': ['2']
    };
    const variations = [word];
    for (let char in leetMap) {
      const newVariations = [];
      variations.forEach(variation => {
        leetMap[char].forEach(replacement => {
          newVariations.push(variation.replace(new RegExp(char, 'gi'), replacement));
        });
      });
      variations.push(...newVariations);
    }
    return [...new Set(variations)];
  };

  const generateWordlist = () => {
    const baseWords = Object.values(wordlistInputs).filter(val => val.trim());
    let wordlist = [...baseWords];
    baseWords.forEach(word => {
      const cleanWord = word.toLowerCase().trim();
      wordlist.push(cleanWord);
      wordlist.push(cleanWord.toUpperCase());
      wordlist.push(cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1));
      wordlist.push(...generateLeetspeak(cleanWord));
      const suffixes = ['123', '!', '2023', '2024', '01'];
      suffixes.forEach(suffix => {
        wordlist.push(cleanWord + suffix);
        wordlist.push(cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1) + suffix);
      });
      const prefixes = ['my', 'the', 'i', 'love'];
      prefixes.forEach(prefix => {
        wordlist.push(prefix + cleanWord);
        wordlist.push(prefix + cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1));
      });
    });
    if (baseWords.length > 1) {
      for (let i = 0; i < baseWords.length; i++) {
        for (let j = i + 1; j < baseWords.length; j++) {
          wordlist.push(baseWords[i] + baseWords[j]);
          wordlist.push(baseWords[j] + baseWords[i]);
        }
      }
    }
    setGeneratedWordlist([...new Set(wordlist)].filter(word => word.length > 0));
  };

  const downloadWordlist = () => {
    const content = generatedWordlist.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_wordlist.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInputChange = (field, value) => {
    setWordlistInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-5 text-primary"><Shield className="me-2" />PassGurdian</h1>
        <p className="text-muted">Analyze your password and generate custom wordlists</p>
        <div className="btn-group mt-3">
          <button className={`btn btn-${activeTab === 'analyzer' ? 'primary' : 'outline-primary'}`} onClick={() => setActiveTab('analyzer')}>Password Analyzer</button>
          <button className={`btn btn-${activeTab === 'wordlist' ? 'primary' : 'outline-primary'}`} onClick={() => setActiveTab('wordlist')}>Wordlist Generator</button>
        </div>
      </div>

      {activeTab === 'analyzer' && (
        <div className="card p-4 shadow">
          <h4 className="mb-3">Password Analyzer</h4>
          <div className="input-group mb-3">
            <input type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={handlePasswordChange} placeholder="Enter your password..." />
            <button className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {analysis && (
            <>
              <h5>Strength: <span className={`text-${analysis.color}`}>{analysis.strength}</span></h5>
              <div className="progress mb-3">
                <div className={`progress-bar bg-${analysis.color}`} style={{ width: `${analysis.score}%` }}>{analysis.score}%</div>
              </div>
              <ul className="list-group mb-3">
                <li className="list-group-item d-flex justify-content-between"><span>Entropy</span><span>{analysis.entropy} bits</span></li>
                <li className="list-group-item d-flex justify-content-between"><span>Time to Crack</span><span>{analysis.timeToCrack}</span></li>
              </ul>
              <h6>Characteristics:</h6>
              <ul className="list-group">
                {Object.entries(analysis.characteristics).map(([key, val]) => (
                  <li key={key} className="list-group-item d-flex justify-content-between">
                    <span>{key}</span>
                    {val ? <CheckCircle color="green" size={16} /> : <XCircle color="red" size={16} />}
                  </li>
                ))}
              </ul>
              {analysis.patterns.length > 0 && (
                <div className="alert alert-danger mt-3">
                  <AlertTriangle className="me-2" /> Common patterns detected:
                  <ul className="mt-2">
                    {analysis.patterns.map((p, i) => <li key={i}>{p.name}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'wordlist' && (
        <div className="card p-4 shadow">
          <h4 className="mb-3">Wordlist Generator</h4>
          <div className="row g-3">
            {[
              { key: 'name', label: 'Name', icon: User },
              { key: 'birthdate', label: 'Birth Date', icon: Calendar },
              { key: 'pet', label: 'Pet Name', icon: Heart },
              { key: 'company', label: 'Company', icon: User },
              { key: 'hobby', label: 'Hobby', icon: User },
              { key: 'location', label: 'Location', icon: User }
            ].map(field => (
              <div className="col-md-6" key={field.key}>
                <label className="form-label"><field.icon className="me-2" />{field.label}</label>
                <input
                  type="text"
                  className="form-control"
                  value={wordlistInputs[field.key]}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-3" onClick={generateWordlist}>Generate Wordlist</button>
          {generatedWordlist.length > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Generated Wordlist ({generatedWordlist.length})</h5>
                <button className="btn btn-success" onClick={downloadWordlist}><Download className="me-2" size={16} />Download</button>
              </div>
              <textarea className="form-control" rows="10" value={generatedWordlist.join('\n')} readOnly />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordSecuritySuite;
