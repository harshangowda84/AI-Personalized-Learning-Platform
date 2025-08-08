import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import "./profile.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";
import { ArrowRight, Plus, Trash2, AlertTriangle } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

const getStats = (roadmaps, quizStats) => {
  const stats = {};
  stats.progress = {};
  for (let topic in quizStats) {
    let numWeightage = 0;
    let completedWeightage = 0;
    Object.keys(roadmaps[topic]).forEach((week, i) => {
      roadmaps[topic][week].subtopics.forEach((subtopic, j) => {
        numWeightage += parseInt(subtopic.time.replace(/^\D+/g, ""));
        if (
          quizStats[topic] &&
          quizStats[topic][i + 1] &&
          quizStats[topic][i + 1][j + 1]
        ) {
          completedWeightage += parseInt(subtopic.time.replace(/^\D+/g, ""));
        }
      });
    });
    stats.progress[topic] = {
      total: numWeightage,
      completed: completedWeightage,
    };
  }
  console.log(stats);
  return stats;
};

// Get AI Learning Progress Statistics
const getAILearningStats = (roadmaps) => {
  const aiStats = {};
  
  // Get all topics from roadmaps
  Object.keys(roadmaps).forEach(topic => {
    const subtopics = [];
    
    // Collect all subtopics
    Object.keys(roadmaps[topic]).forEach(week => {
      roadmaps[topic][week].subtopics.forEach(subtopic => {
        subtopics.push(subtopic.subtopic);
      });
    });
    
    let totalSubtopics = subtopics.length;
    let completedChapters = 0;
    let totalChapters = 0;
    let totalStudyTime = 0;
    let totalNotes = 0;
    let totalBookmarks = 0;
    let completedSubtopics = 0;
    
    // Check progress for each subtopic
    subtopics.forEach(subtopic => {
      const progressKey = `learning_progress_${topic}_${subtopic}`;
      const progress = JSON.parse(localStorage.getItem(progressKey)) || {};
      
      if (progress.completedChapters) {
        const chaptersForSubtopic = progress.completedChapters.length;
        const totalChaptersForSubtopic = 4; // We create 4 chapters per subtopic
        
        completedChapters += chaptersForSubtopic;
        totalChapters += totalChaptersForSubtopic;
        
        // If all chapters completed, mark subtopic as completed
        if (chaptersForSubtopic === totalChaptersForSubtopic) {
          completedSubtopics++;
        }
      } else {
        totalChapters += 4; // Still count total chapters even if no progress
      }
      
      if (progress.studyTime) {
        totalStudyTime += progress.studyTime;
      }
      
      if (progress.notes && progress.notes.trim().length > 0) {
        totalNotes++;
      }
      
      if (progress.bookmarks) {
        totalBookmarks += progress.bookmarks.length;
      }
    });
    
    aiStats[topic] = {
      totalSubtopics,
      completedSubtopics,
      totalChapters,
      completedChapters,
      totalStudyTime, // in seconds
      totalNotes,
      totalBookmarks,
      completionPercentage: totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0
    };
  });
  
  return aiStats;
};

// Get overall AI learning statistics
const getOverallAIStats = (aiStats) => {
  let totalStudyTime = 0;
  let totalCompletedChapters = 0;
  let totalChapters = 0;
  let totalNotes = 0;
  let totalBookmarks = 0;
  let totalCompletedSubtopics = 0;
  let totalSubtopics = 0;
  
  Object.values(aiStats).forEach(stats => {
    totalStudyTime += stats.totalStudyTime;
    totalCompletedChapters += stats.completedChapters;
    totalChapters += stats.totalChapters;
    totalNotes += stats.totalNotes;
    totalBookmarks += stats.totalBookmarks;
    totalCompletedSubtopics += stats.completedSubtopics;
    totalSubtopics += stats.totalSubtopics;
  });
  
  return {
    totalStudyTime,
    totalCompletedChapters,
    totalChapters,
    totalNotes,
    totalBookmarks,
    totalCompletedSubtopics,
    totalSubtopics,
    overallCompletionPercentage: totalChapters > 0 ? (totalCompletedChapters / totalChapters) * 100 : 0
  };
};
const TopicButton = ({ children }) => {
  const navigate = useNavigate();
  return (
    <button
      className="SubmitButton"
      onClick={() => {
        navigate("/topic");
      }}
    >
      {children}
    </button>
  );
};
const ProfilePage = (props) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  // Get user data from localStorage
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  
  // Debug logging
  console.log('Profile - isLoggedIn:', isLoggedIn, 'userName:', userName, 'userEmail:', userEmail);
  
  const topics = JSON.parse(localStorage.getItem("topics")) || {};
  const colors = [
    "#D14EC4",
    "#AFD14E",
    "#4ED1B1",
    "#D14E4E",
    "#D1854E",
    "#904ED1",
    "#4EAAD1",
  ];
  const [stats, setStats] = useState({});
  const [aiLearningStats, setAiLearningStats] = useState({});
  const [overallAIStats, setOverallAIStats] = useState({});
  const [percentCompletedData, setPercentCompletedData] = useState({});
  const [aiProgressData, setAiProgressData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [avatarStyle, setAvatarStyle] = useState(0); // For cycling through avatar styles
  const navigate = useNavigate();

  // Generate user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Generate unique avatar based on user data
  const generateUniqueAvatar = (userName, totalCourses, studyTime, style = 0) => {
    // Create a hash from username for consistent avatar selection
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      const char = userName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Different avatar style sets
    const avatarSets = [
      // Set 1: Emoji-based avatars
      [
        {
          emoji: '🚀',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          title: 'Space Explorer',
          description: 'Reaching for the stars in learning!'
        },
        {
          emoji: '🎓',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          title: 'Scholar',
          description: 'Dedicated to academic excellence'
        },
        {
          emoji: '🧠',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          title: 'Mind Master',
          description: 'Expanding mental horizons'
        },
        {
          emoji: '⚡',
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          title: 'Lightning Learner',
          description: 'Fast and efficient'
        },
        {
          emoji: '🎯',
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          title: 'Goal Crusher',
          description: 'Always hitting targets'
        },
        {
          emoji: '🔬',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          title: 'Researcher',
          description: 'Deep diving into knowledge'
        },
        {
          emoji: '💎',
          background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
          title: 'Knowledge Gem',
          description: 'Precious learning collector'
        },
        {
          emoji: '🌟',
          background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
          title: 'Rising Star',
          description: 'Shining bright in education'
        }
      ],
      // Set 2: Geometric patterns with initials
      [
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          title: 'Creative Mind',
          description: 'Thinking outside the box',
          pattern: '🔷'
        },
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #A8E6CF, #DCEDC1)',
          title: 'Nature Learner',
          description: 'Growing knowledge naturally',
          pattern: '🍃'
        },
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #FFD93D, #6BCF7F)',
          title: 'Bright Student',
          description: 'Illuminating the path',
          pattern: '☀️'
        },
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #A8A8A8, #D3D3D3)',
          title: 'Tech Enthusiast',
          description: 'Digital learning pioneer',
          pattern: '⚙️'
        },
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #FF8A80, #FFD0A6)',
          title: 'Warm Learner',
          description: 'Passionate about growth',
          pattern: '🔥'
        },
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #B39DDB, #F8BBD9)',
          title: 'Dream Chaser',
          description: 'Pursuing aspirations',
          pattern: '✨'
        },
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #81C784, #AED581)',
          title: 'Growth Mindset',
          description: 'Always evolving',
          pattern: '🌱'
        },
        {
          emoji: getUserInitials(userName),
          background: 'linear-gradient(45deg, #64B5F6, #81D4FA)',
          title: 'Ocean Explorer',
          description: 'Diving deep into knowledge',
          pattern: '🌊'
        }
      ],
      // Set 3: Achievement-based avatars
      [
        {
          emoji: '👑',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          title: 'Learning Royalty',
          description: 'Ruler of knowledge'
        },
        {
          emoji: '🏆',
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          title: 'Champion',
          description: 'Victory in learning'
        },
        {
          emoji: '🎖️',
          background: 'linear-gradient(135deg, #36D1DC, #5B86E5)',
          title: 'Distinguished Learner',
          description: 'Honor in education'
        },
        {
          emoji: '🥇',
          background: 'linear-gradient(135deg, #FDBB2D, #22C1C3)',
          title: 'Gold Standard',
          description: 'Excellence personified'
        },
        {
          emoji: '🌈',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          title: 'Spectrum Learner',
          description: 'Embracing all knowledge'
        },
        {
          emoji: '🔮',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          title: 'Future Visionary',
          description: 'Seeing possibilities'
        },
        {
          emoji: '💫',
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          title: 'Cosmic Learner',
          description: 'Universal understanding'
        },
        {
          emoji: '🎨',
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
          title: 'Creative Genius',
          description: 'Artistic approach to learning'
        }
      ]
    ];

    const currentSet = avatarSets[style % avatarSets.length];
    
    // Select avatar based on learning achievements
    let avatarIndex = Math.abs(hash) % currentSet.length;
    
    // Upgrade avatar based on achievements
    if (totalCourses >= 3 && studyTime > 3600) { // 1+ hour of study
      avatarIndex = currentSet.length - 1; // Best avatar
    } else if (totalCourses >= 2 && studyTime > 1800) { // 30+ minutes
      avatarIndex = currentSet.length - 2; // Second best
    } else if (studyTime > 900) { // 15+ minutes
      avatarIndex = Math.min(avatarIndex + 1, currentSet.length - 1);
    }
    
    return { ...currentSet[avatarIndex], style };
  };

  // Generate learning badge based on progress
  const getLearningBadge = (totalCourses, studyTime, totalChapters) => {
    if (totalCourses >= 5 && studyTime > 7200) return { emoji: '🏆', title: 'Learning Champion', color: '#FFD700' };
    if (totalCourses >= 3 && studyTime > 3600) return { emoji: '🥇', title: 'Master Learner', color: '#FF6B6B' };
    if (totalCourses >= 2 && studyTime > 1800) return { emoji: '🥈', title: 'Advanced Student', color: '#4ECDC4' };
    if (totalCourses >= 1 && studyTime > 600) return { emoji: '🥉', title: 'Dedicated Learner', color: '#45B7D1' };
    if (studyTime > 300) return { emoji: '📚', title: 'Getting Started', color: '#96CEB4' };
    return { emoji: '🌱', title: 'New Explorer', color: '#FFEAA7' };
  };

  // Format study time from seconds to readable format
  const formatStudyTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Handle back navigation
  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      // If no history, go to topic selection page
      navigate('/topic');
    }
  };

  // Handle delete course
  const handleDeleteCourse = (courseName) => {
    setCourseToDelete(courseName);
    setShowDeleteModal(true);
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      // Get current data from localStorage
      const currentTopics = JSON.parse(localStorage.getItem("topics")) || {};
      const currentRoadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};
      const currentQuizStats = JSON.parse(localStorage.getItem("quizStats")) || {};
      
      // Clean up AI learning progress data for this course
      const roadmap = currentRoadmaps[courseToDelete];
      if (roadmap) {
        Object.keys(roadmap).forEach(week => {
          roadmap[week].subtopics.forEach(subtopic => {
            const progressKey = `learning_progress_${courseToDelete}_${subtopic.subtopic}`;
            localStorage.removeItem(progressKey);
          });
        });
      }
      
      // Remove the course from all storage
      delete currentTopics[courseToDelete];
      delete currentRoadmaps[courseToDelete];
      delete currentQuizStats[courseToDelete];
      
      // Update localStorage
      localStorage.setItem("topics", JSON.stringify(currentTopics));
      localStorage.setItem("roadmaps", JSON.stringify(currentRoadmaps));
      localStorage.setItem("quizStats", JSON.stringify(currentQuizStats));
      
      // Update stats
      setStats(getStats(currentRoadmaps, currentQuizStats));
      
      // Update AI learning stats
      const aiStats = getAILearningStats(currentRoadmaps);
      setAiLearningStats(aiStats);
      setOverallAIStats(getOverallAIStats(aiStats));
      
      // Close modal
      setShowDeleteModal(false);
      setCourseToDelete(null);
      
      // Force a page refresh to update all data
      window.location.reload();
    }
  };

  const cancelDeleteCourse = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  // Load saved avatar style preference
  useEffect(() => {
    const savedAvatarStyle = localStorage.getItem('userAvatarStyle');
    if (savedAvatarStyle) {
      setAvatarStyle(parseInt(savedAvatarStyle));
    }
  }, []);

  // Save avatar style preference
  const cycleAvatarStyle = () => {
    const newStyle = (avatarStyle + 1) % 3; // 3 different avatar styles
    setAvatarStyle(newStyle);
    localStorage.setItem('userAvatarStyle', newStyle.toString());
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn && userEmail) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: {
              'user-email': userEmail
            }
          });
          setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [isLoggedIn, userEmail]);

  useEffect(() => {
    const roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};
    const quizStats = JSON.parse(localStorage.getItem("quizStats")) || {};
    
    // Set quiz-based stats
    setStats(getStats(roadmaps, quizStats));
    
    // Set AI learning stats
    const aiStats = getAILearningStats(roadmaps);
    setAiLearningStats(aiStats);
    setOverallAIStats(getOverallAIStats(aiStats));
  }, []);
  useEffect(() => {
    let progress = stats.progress || {};
    let labels = Object.keys(progress);
    let data = Object.values(progress).map(
      (topicProgress) => (topicProgress.completed * 100) / topicProgress.total
    );
    let backgroundColors = Object.values(progress).map(
      (topicProgress, index) => colors[index % colors.length]
    );
    setPercentCompletedData({
      labels: labels,
      datasets: [
        {
          label: "% Quiz Completed",
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    });
  }, [stats]);

  // Set up AI learning progress chart data
  useEffect(() => {
    let aiProgress = aiLearningStats || {};
    let labels = Object.keys(aiProgress);
    let data = Object.values(aiProgress).map(
      (topicProgress) => topicProgress.completionPercentage
    );
    let backgroundColors = Object.values(aiProgress).map(
      (topicProgress, index) => colors[(index + 3) % colors.length] // Use different colors
    );
    setAiProgressData({
      labels: labels,
      datasets: [
        {
          label: "% AI Learning Completed",
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    });
  }, [aiLearningStats]);
  return (
    <div className="profile_wrapper">
      <Header></Header>
      <div className="flexbox content">
        <div className="flexbox info">
          <div className="avatarContainer" style={{ position: 'relative' }}>
            {/* Unique Avatar based on learning progress */}
            {(() => {
              const avatar = generateUniqueAvatar(userName, Object.keys(topics).length, overallAIStats.totalStudyTime || 0, avatarStyle);
              const badge = getLearningBadge(Object.keys(topics).length, overallAIStats.totalStudyTime || 0, overallAIStats.totalChapters || 0);
              
              return (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Main Avatar */}
                  <div 
                    onClick={cycleAvatarStyle}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: avatar.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.5rem',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      border: '4px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 12px 40px rgba(209, 78, 196, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {/* Animated background pattern */}
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      animation: 'rotate 10s linear infinite'
                    }} />
                    
                    {/* Pattern overlay for style 2 */}
                    {avatar.pattern && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        fontSize: '1.5rem',
                        opacity: 0.3,
                        zIndex: 1
                      }}>
                        {avatar.pattern}
                      </div>
                    )}
                    
                    {/* Avatar emoji/initials */}
                    <div style={{ 
                      position: 'relative', 
                      zIndex: 2,
                      fontWeight: avatar.style === 1 ? 'bold' : 'normal',
                      fontSize: avatar.style === 1 ? '2.5rem' : '3.5rem'
                    }}>
                      {avatar.emoji}
                    </div>
                    
                    {/* User initials in corner for non-initial avatars */}
                    {avatar.style !== 1 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'white',
                        zIndex: 3
                      }}>
                        {getUserInitials(userName)}
                      </div>
                    )}
                  </div>
                  
                  {/* Avatar Title */}
                  <div style={{
                    marginTop: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '0.2rem'
                    }}>
                      {avatar.title}
                    </div>
                    <div style={{
                      color: '#ccc',
                      fontSize: '0.7rem',
                      fontStyle: 'italic'
                    }}>
                      {avatar.description}
                    </div>
                  </div>
                  
                  {/* Style indicator */}
                  <div style={{
                    marginTop: '0.3rem',
                    fontSize: '0.6rem',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                  onClick={cycleAvatarStyle}
                  >
                    <span>Style {avatarStyle + 1}/3</span>
                    <span style={{ color: '#D14EC4' }}>• Click to change</span>
                  </div>
                  
                  {/* Achievement Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: badge.color,
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    border: '2px solid white',
                    animation: 'pulse 2s infinite',
                    cursor: 'pointer',
                    title: badge.title
                  }}>
                    {badge.emoji}
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="flexbox text">
            <h1>{userName}</h1>
            {userEmail && (
              <p style={{ color: '#888', marginBottom: '1rem' }}>{userEmail}</p>
            )}
            <h3>
              Ongoing Courses: <b>{Object.keys(topics).length}</b>
            </h3>
            <h3>
              Hardness Index:{" "}
              <b>
                {(
                  parseFloat(localStorage.getItem("hardnessIndex")) || 1
                ).toFixed(3)}
              </b>
            </h3>
            {/* AI Learning Progress Stats */}
            {overallAIStats.totalChapters > 0 && (
              <>
                <h3>
                  AI Study Time: <b>{formatStudyTime(overallAIStats.totalStudyTime)}</b>
                </h3>
                <h3>
                  Chapters Completed: <b>{overallAIStats.totalCompletedChapters}/{overallAIStats.totalChapters}</b>
                </h3>
                <h3>
                  Learning Notes: <b>{overallAIStats.totalNotes}</b>
                </h3>
                <h3>
                  Bookmarks: <b>{overallAIStats.totalBookmarks}</b>
                </h3>
              </>
            )}
            {userProfile?.profile && (
              <>
                <h3>
                  Learning Hours: <b>{userProfile.profile.learning_hours || 0}</b>
                </h3>
                <h3>
                  Courses Completed: <b>{userProfile.profile.courses_completed || 0}</b>
                </h3>
              </>
            )}
          </div>
        </div>
        <div className="newTopic">
          <TopicButton>
            <h2>
              <Plus
                size={25}
                strokeWidth={2}
                style={{ marginRight: "1ch", scale: "1.2" }}
              ></Plus>
              Learn Something New
            </h2>
          </TopicButton>
        </div>

        <div className="courses">
          <h2 className="heading">Continue Learning</h2>
          <div className="flexbox">
            {Object.keys(topics).map((course, i) => {
              const aiStats = aiLearningStats[course];
              const quizProgress = stats.progress && stats.progress[course] 
                ? (stats.progress[course].completed * 100) / stats.progress[course].total 
                : 0;
              
              return (
                <div key={course} className="courseCardContainer" style={{ position: 'relative', margin: '1rem' }}>
                  <NavLink
                    className="link"
                    to={"/roadmap?topic=" + encodeURI(course)}
                  >
                    <div
                      className="card"
                      style={{ "--clr": colors[i % colors.length] }}
                    >
                      <div className="title">{course}</div>

                      <div className="time">{topics[course].time}</div>

                      <div className="knowledge_level">
                        {topics[course].knowledge_level}
                      </div>
                      
                      {/* Enhanced Progress Section */}
                      <div className="progressContainer" style={{ marginTop: '1rem' }}>
                        {/* Quiz Progress */}
                        {stats.progress && stats.progress[course] && (
                          <div style={{ marginBottom: '0.8rem' }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              fontSize: '0.8rem',
                              marginBottom: '0.3rem',
                              color: '#4ED1B1'
                            }}>
                              <span>🎯 Quiz Progress</span>
                              <span>{quizProgress.toFixed(0)}%</span>
                            </div>
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '4px',
                              height: '6px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                background: '#4ED1B1',
                                height: '100%',
                                width: `${quizProgress}%`,
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        )}
                        
                        {/* AI Learning Progress */}
                        {aiStats && aiStats.totalChapters > 0 && (
                          <div style={{ marginBottom: '0.8rem' }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              fontSize: '0.8rem',
                              marginBottom: '0.3rem',
                              color: '#D14EC4'
                            }}>
                              <span>📚 AI Learning</span>
                              <span>{aiStats.completionPercentage.toFixed(0)}%</span>
                            </div>
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '4px',
                              height: '6px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                background: '#D14EC4',
                                height: '100%',
                                width: `${aiStats.completionPercentage}%`,
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        )}
                        
                        {/* Study Time and Stats */}
                        {aiStats && aiStats.totalStudyTime > 0 && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#ccc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '0.5rem'
                          }}>
                            <span>⏱️ {formatStudyTime(aiStats.totalStudyTime)}</span>
                            <span>📝 {aiStats.totalNotes} notes</span>
                          </div>
                        )}
                      </div>
                      
                      <ArrowRight
                        size={50}
                        strokeWidth={2}
                        className="arrow"
                      ></ArrowRight>
                    </div>
                  </NavLink>
                  <button
                    className="deleteButton"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteCourse(course);
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 107, 107, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 107, 107, 1)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 107, 107, 0.9)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <Trash2 size={20} color="white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="progress">
          <h2 className="heading">Learning Progress</h2>
          
          {/* Overall Progress Summary */}
          {(Object.keys(percentCompletedData).length > 0 || Object.keys(aiProgressData).length > 0) && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid rgba(209, 78, 196, 0.2)'
            }}>
              <h3 style={{ color: '#D14EC4', marginBottom: '1.5rem', textAlign: 'center' }}>
                📊 Overall Learning Summary
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {/* Quiz Progress Summary */}
                {Object.keys(percentCompletedData).length > 0 && (
                  <div style={{
                    background: 'rgba(78, 209, 177, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(78, 209, 177, 0.3)'
                  }}>
                    <div style={{ color: '#4ED1B1', fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                    <h4 style={{ color: '#4ED1B1', marginBottom: '0.5rem' }}>Quiz Progress</h4>
                    <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      Completed quizzes and assessments
                    </p>
                  </div>
                )}
                
                {/* AI Learning Progress Summary */}
                {overallAIStats.totalChapters > 0 && (
                  <div style={{
                    background: 'rgba(209, 78, 196, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(209, 78, 196, 0.3)'
                  }}>
                    <div style={{ color: '#D14EC4', fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                    <h4 style={{ color: '#D14EC4', marginBottom: '0.5rem' }}>AI Learning Progress</h4>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Interactive chapters and study sessions
                    </p>
                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                      <div style={{ marginBottom: '0.3rem' }}>
                        <span style={{ color: '#D14EC4' }}>
                          {overallAIStats.overallCompletionPercentage.toFixed(1)}%
                        </span> completed
                      </div>
                      <div style={{ marginBottom: '0.3rem' }}>
                        <span style={{ color: '#AFD14E' }}>
                          {formatStudyTime(overallAIStats.totalStudyTime)}
                        </span> studied
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="charts">
            {/* Quiz Progress Chart */}
            {Object.keys(percentCompletedData).length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ color: '#4ED1B1', marginBottom: '1rem', textAlign: 'center' }}>
                  🎯 Quiz Completion Progress
                </h3>
                <div
                  className="bar"
                  style={{
                    maxWidth: "700px",
                    minHeight: "400px",
                    filter: "brightness(1.5)",
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "20px",
                    padding: "20px",
                    margin: "auto",
                    border: "1px solid rgba(78, 209, 177, 0.3)"
                  }}
                >
                  <Bar
                    data={percentCompletedData}
                    options={{ 
                      maintainAspectRatio: false, 
                      indexAxis: "y",
                      plugins: {
                        legend: {
                          labels: {
                            color: '#4ED1B1'
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: '#ccc' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                          ticks: { color: '#ccc' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* AI Learning Progress Chart */}
            {Object.keys(aiProgressData).length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ color: '#D14EC4', marginBottom: '1rem', textAlign: 'center' }}>
                  📚 AI Learning Progress
                </h3>
                <div
                  className="bar"
                  style={{
                    maxWidth: "700px",
                    minHeight: "400px",
                    filter: "brightness(1.5)",
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "20px",
                    padding: "20px",
                    margin: "auto",
                    border: "1px solid rgba(209, 78, 196, 0.3)"
                  }}
                >
                  <Bar
                    data={aiProgressData}
                    options={{ 
                      maintainAspectRatio: false, 
                      indexAxis: "y",
                      plugins: {
                        legend: {
                          labels: {
                            color: '#D14EC4'
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: '#ccc' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                          ticks: { color: '#ccc' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Detailed AI Learning Stats per Course */}
            {Object.keys(aiLearningStats).length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#AFD14E', marginBottom: '1rem', textAlign: 'center' }}>
                  📖 Detailed Learning Statistics
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  {Object.entries(aiLearningStats).map(([topic, stats], index) => (
                    <div 
                      key={topic}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: `1px solid ${colors[index % colors.length]}`,
                        borderColor: `${colors[index % colors.length]}40`
                      }}
                    >
                      <h4 style={{ 
                        color: colors[index % colors.length], 
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        textTransform: 'capitalize'
                      }}>
                        {topic}
                      </h4>
                      <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '0.5rem',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px'
                        }}>
                          <span>📑 Chapters:</span>
                          <span style={{ color: colors[index % colors.length] }}>
                            {stats.completedChapters}/{stats.totalChapters}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '0.5rem',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px'
                        }}>
                          <span>⏱️ Study Time:</span>
                          <span style={{ color: '#AFD14E' }}>
                            {formatStudyTime(stats.totalStudyTime)}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '0.5rem',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px'
                        }}>
                          <span>📝 Notes:</span>
                          <span style={{ color: '#4ED1B1' }}>{stats.totalNotes}</span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '1rem',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px'
                        }}>
                          <span>🔖 Bookmarks:</span>
                          <span style={{ color: '#D1854E' }}>{stats.totalBookmarks}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            marginBottom: '0.5rem',
                            fontSize: '0.8rem'
                          }}>
                            <span>Progress</span>
                            <span style={{ color: colors[index % colors.length], fontWeight: 'bold' }}>
                              {stats.completionPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            height: '8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              background: colors[index % colors.length],
                              height: '100%',
                              width: `${stats.completionPercentage}%`,
                              transition: 'width 0.3s ease',
                              borderRadius: '8px'
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={cancelDeleteCourse}
        >
          <div 
            style={{
              background: 'rgba(21, 22, 39, 0.95)',
              border: '1px solid rgba(209, 78, 196, 0.3)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              backdropFilter: 'blur(20px)',
              animation: 'slideUp 0.3s ease',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  animation: 'pulse 2s infinite'
                }}
              >
                <AlertTriangle size={30} color="white" />
              </div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                Delete Course
              </h3>
              <p style={{ color: '#ccc', fontSize: '1rem', lineHeight: '1.5' }}>
                Are you sure you want to delete "<span style={{ color: '#D14EC4', fontWeight: 'bold' }}>{courseToDelete}</span>"?
                <br />
                <span style={{ fontSize: '0.9rem', color: '#999' }}>
                  This will permanently remove all progress and cannot be undone.
                </span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={cancelDeleteCourse}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: '500',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: '500',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
