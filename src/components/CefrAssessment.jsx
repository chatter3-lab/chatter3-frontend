import { useState, useEffect } from 'react';

const API_URL = 'https://api.chatter3.com';

const getToken = () => localStorage.getItem('chatter3_token') || '';
const authFetch = (url, opts = {}) => {
  const token = getToken();
  const headers = { ...opts.headers, 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...opts, headers });
};

export default function CefrAssessment({ user, onComplete, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    authFetch(`${API_URL}/api/assessment/questions`)
      .then(r => r.json())
      .then(d => { if (d.success) setQuestions(d.questions); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (questionId, selectedIdx) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedIdx }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([question_id, selected]) => ({ question_id, selected }));
      const r = await authFetch(`${API_URL}/api/assessment/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: answerArray })
      });
      const d = await r.json();
      if (d.success) {
        setResult(d);
        if (onComplete) onComplete(d);
      }
    } catch (e) {
      console.error('Assessment submit error:', e);
    }
    setSubmitting(false);
  };

  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          Loading assessment...
        </div>
      </div>
    );
  }

  if (result) {
    const levelColors = { A1: '#94a3b8', A2: '#60a5fa', B1: '#34d399', B2: '#fbbf24', C1: '#f97316', C2: '#ef4444' };
    return (
      <div style={{ maxWidth: 500, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>🎓</div>
          <h2 style={{ margin: '0 0 .5rem', fontSize: '1.5rem' }}>Assessment Complete!</h2>
          <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: 20, background: levelColors[result.level] || '#4f46e5', color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>
            {result.level}
          </div>
          <p style={{ color: '#6b7280', margin: '0 0 .5rem' }}>
            Score: {result.score}% ({result.correct}/{result.total} correct)
          </p>
          <p style={{ color: '#6b7280', margin: '0 0 1.5rem', fontSize: '.85rem' }}>
            Your level has been updated to <strong>{result.level}</strong>
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '.9rem' }}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: '2rem auto', padding: '0 1rem', textAlign: 'center', color: '#94a3b8' }}>
        No questions available. Please try again later.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header with exit button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onBack} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '.85rem', color: '#6b7280' }}>
          ✕ Exit
        </button>
        <span style={{ fontSize: '.8rem', color: '#9ca3af' }}>Question {currentIdx + 1} / {questions.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.8rem', color: '#6b7280' }}>
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#4f46e5', borderRadius: 3, transition: 'width .3s' }} />
        </div>
      </div>

      {/* Question card */}
      {currentQuestion && (
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
          <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', fontSize: '.75rem', fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>
            {currentQuestion.level} · {currentQuestion.type}
          </div>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', lineHeight: 1.4 }}>{currentQuestion.question}</h3>

          {currentQuestion.type === 'open_ended' ? (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here..."
              style={{ width: '100%', minHeight: 120, padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: '.9rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentQuestion.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQuestion.id, idx)}
                  style={{
                    padding: '12px 16px', borderRadius: 8, border: '2px solid',
                    borderColor: answers[currentQuestion.id] === idx ? '#4f46e5' : '#e5e7eb',
                    background: answers[currentQuestion.id] === idx ? '#eef2ff' : 'white',
                    textAlign: 'left', cursor: 'pointer', fontSize: '.9rem',
                    color: answers[currentQuestion.id] === idx ? '#4f46e5' : '#374151'
                  }}
                >
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</span> {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.5 : 1, fontSize: '.9rem' }}
        >
          Previous
        </button>
        {currentIdx === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < 5}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: 'white', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting || Object.keys(answers).length < 5 ? 0.5 : 1, fontSize: '.9rem', fontWeight: 600 }}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer', fontSize: '.9rem', fontWeight: 600 }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}