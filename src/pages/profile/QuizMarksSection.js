import { useNavigate } from "react-router-dom";

const canRetakeQuiz = (timestamp) => {
  if (!timestamp) return true;
  const oneHour = 60 * 60 * 1000;
  const timeSinceQuiz = Date.now() - timestamp;
  return timeSinceQuiz >= oneHour;
};

const getRetakeTime = (timestamp) => {
  if (!timestamp) return "Now";
  const oneHour = 60 * 60 * 1000;
  const timeSinceQuiz = Date.now() - timestamp;
  const remaining = oneHour - timeSinceQuiz;
  
  if (remaining <= 0) return "Now";
  
  const minutes = Math.floor(remaining / (60 * 1000));
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const QuizMarksSection = ({ quizMarks, showAllQuizzes, setShowAllQuizzes }) => {
  const navigate = useNavigate();

  if (quizMarks.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(78, 209, 177, 0.1), rgba(78, 170, 209, 0.1))',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '2px solid rgba(78, 209, 177, 0.3)',
      boxShadow: '0 8px 32px rgba(78, 209, 177, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#4ED1B1', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏆 Quiz Results & Scores
        </h3>
        <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
          Total Quizzes: <span style={{ color: '#4ED1B1', fontWeight: 'bold', fontSize: '1.1rem' }}>{quizMarks.length}</span>
        </div>
      </div>
      
      {/* Quiz Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '1.5rem',
        maxHeight: showAllQuizzes ? 'none' : '450px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {quizMarks.slice(0, showAllQuizzes ? undefined : 6).map((quiz) => {
          const canRetake = canRetakeQuiz(quiz.timestamp);
          const retakeTime = getRetakeTime(quiz.timestamp);
          const passed = parseFloat(quiz.percentage) >= 60;
          
          return (
            <div
              key={`${quiz.topic}-${quiz.weekNum}-${quiz.subtopicNum}`}
              style={{
                background: passed 
                  ? 'linear-gradient(135deg, rgba(175, 209, 78, 0.08), rgba(175, 209, 78, 0.12))' 
                  : 'linear-gradient(135deg, rgba(209, 78, 78, 0.08), rgba(209, 78, 78, 0.12))',
                border: `1.5px solid ${passed ? 'rgba(175, 209, 78, 0.4)' : 'rgba(209, 78, 78, 0.4)'}`,
                borderRadius: '16px',
                padding: '1.5rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: passed 
                  ? '0 4px 12px rgba(175, 209, 78, 0.1)' 
                  : '0 4px 12px rgba(209, 78, 78, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${passed ? 'rgba(175, 209, 78, 0.25)' : 'rgba(209, 78, 78, 0.25)'}`;
                e.currentTarget.style.borderColor = passed ? 'rgba(175, 209, 78, 0.6)' : 'rgba(209, 78, 78, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = passed 
                  ? '0 4px 12px rgba(175, 209, 78, 0.1)' 
                  : '0 4px 12px rgba(209, 78, 78, 0.1)';
                e.currentTarget.style.borderColor = passed ? 'rgba(175, 209, 78, 0.4)' : 'rgba(209, 78, 78, 0.4)';
              }}
            >
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: passed 
                  ? 'linear-gradient(135deg, rgba(175, 209, 78, 0.25), rgba(175, 209, 78, 0.35))' 
                  : 'linear-gradient(135deg, rgba(209, 78, 78, 0.25), rgba(209, 78, 78, 0.35))',
                color: passed ? '#AFD14E' : '#D14E4E',
                padding: '0.4rem 1rem',
                borderRadius: '24px',
                fontSize: '0.8rem',
                fontWeight: '700',
                letterSpacing: '0.5px',
                border: `1px solid ${passed ? 'rgba(175, 209, 78, 0.5)' : 'rgba(209, 78, 78, 0.5)'}`,
                boxShadow: `0 2px 8px ${passed ? 'rgba(175, 209, 78, 0.2)' : 'rgba(209, 78, 78, 0.2)'}`
              }}>
                {passed ? '✓ PASSED' : '✗ NEEDS RETRY'}
              </div>
              
              {/* Topic & Week */}
              <div style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>
                <div style={{ 
                  color: '#4EAAD1', 
                  fontSize: '0.8rem', 
                  marginBottom: '0.4rem', 
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  {quiz.topic}
                </div>
                <div style={{ 
                  color: 'white', 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  marginBottom: '0.3rem',
                  lineHeight: '1.4'
                }}>
                  {quiz.subtopic}
                </div>
                <div style={{ color: '#888', fontSize: '0.85rem', fontWeight: '500' }}>
                  {quiz.week}
                </div>
              </div>
              
              {/* Score Display */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4))',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div>
                  <div style={{ 
                    color: '#999', 
                    fontSize: '0.75rem', 
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '600'
                  }}>Score</div>
                  <div style={{ 
                    color: passed ? '#AFD14E' : '#D14E4E', 
                    fontSize: '2rem', 
                    fontWeight: '800',
                    letterSpacing: '1px'
                  }}>
                    {quiz.score}/{quiz.total}
                  </div>
                </div>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  border: `3px solid ${passed ? '#AFD14E' : '#D14E4E'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: passed 
                    ? 'radial-gradient(circle, rgba(175, 209, 78, 0.2), rgba(175, 209, 78, 0.05))' 
                    : 'radial-gradient(circle, rgba(209, 78, 78, 0.2), rgba(209, 78, 78, 0.05))',
                  boxShadow: `inset 0 0 20px ${passed ? 'rgba(175, 209, 78, 0.1)' : 'rgba(209, 78, 78, 0.1)'}`
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      color: passed ? '#AFD14E' : '#D14E4E', 
                      fontSize: '1.6rem', 
                      fontWeight: '800',
                      letterSpacing: '0.5px'
                    }}>
                      {quiz.percentage}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Time & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  color: '#888', 
                  fontSize: '0.85rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px'
                }}>
                  ⏱️ {(quiz.timeTaken / 1000).toFixed(0)}s
                </div>
                
                {/* Retake Button */}
                <button
                  onClick={() => {
                    if (canRetake) {
                      navigate(`/quiz?topic=${encodeURIComponent(quiz.topic)}&week=${quiz.weekNum}&subtopic=${quiz.subtopicNum}`);
                    }
                  }}
                  disabled={!canRetake}
                  style={{
                    background: canRetake 
                      ? 'linear-gradient(135deg, #4ED1B1, #4EAAD1)' 
                      : 'linear-gradient(135deg, rgba(100, 100, 100, 0.3), rgba(80, 80, 80, 0.3))',
                    border: canRetake ? '1px solid rgba(78, 209, 177, 0.4)' : '1px solid rgba(100, 100, 100, 0.3)',
                    borderRadius: '10px',
                    padding: '0.6rem 1.25rem',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: canRetake ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: canRetake ? 1 : 0.6,
                    letterSpacing: '0.5px',
                    boxShadow: canRetake ? '0 4px 12px rgba(78, 209, 177, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (canRetake) {
                      e.target.style.transform = 'scale(1.08) translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(78, 209, 177, 0.35)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canRetake) {
                      e.target.style.transform = 'scale(1) translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(78, 209, 177, 0.2)';
                    }
                  }}
                  title={!canRetake ? `Available in ${retakeTime}` : 'Retake quiz now'}
                >
                  {canRetake ? '🔄 Retake' : `🔒 ${retakeTime}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Show More/Less Button */}
      {quizMarks.length > 6 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => setShowAllQuizzes(!showAllQuizzes)}
            style={{
              background: 'linear-gradient(135deg, rgba(78, 209, 177, 0.15), rgba(78, 170, 209, 0.15))',
              border: '1.5px solid rgba(78, 209, 177, 0.4)',
              borderRadius: '12px',
              padding: '0.9rem 2.5rem',
              color: '#4ED1B1',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(78, 209, 177, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(78, 209, 177, 0.25), rgba(78, 170, 209, 0.25))';
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 6px 20px rgba(78, 209, 177, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(78, 209, 177, 0.15), rgba(78, 170, 209, 0.15))';
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(78, 209, 177, 0.15)';
            }}
          >
            {showAllQuizzes ? '▲ Show Less' : `▼ Show All ${quizMarks.length} Quizzes`}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizMarksSection;
