import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./roadmap.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";
import Modal from "../../components/modal/modal";
import {
  CirclePlus,
  ChevronDown,
  ChevronRight,
  LoaderPinwheel,
  FolderSearch,
  Bot,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Save,
  FileText,
} from "lucide-react";
import { translateLocalStorage, translateObj } from "../../translate/translate";
import Markdown from "react-markdown";
import ConfettiExplosion from "react-confetti-explosion";

const RoadmapPage = (props) => {
  const [resources, setResources] = useState(null);
  const [resourceParam, setResourceParam] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [roadmap, setRoadmap] = useState({});
  const [topicDetails, setTopicDetails] = useState({
    time: "-",
    knowledge_level: "-",
  });
  const [quizStats, setQuizStats] = useState({});
  const [confettiExplode, setConfettiExplode] = useState(false);
  const navigate = useNavigate();
  const topic = searchParams.get("topic");
  
  // Handle back navigation
  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      // If no history, go to profile page
      navigate('/profile');
    }
  };
  
  if (!topic) {
    navigate("/");
  }
  useEffect(() => {
    const topics = JSON.parse(localStorage.getItem("topics")) || {};

    setTopicDetails(topics[topic]);

    const roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};
    setRoadmap(roadmaps[topic]);
    // setLoading(true);
    // translateObj(roadmaps[topic], "hi").then((translatedObj) => {
    // setRoadmap(translatedObj);
    // setLoading(false);
    //   console.log(translatedObj);
    // });

    const stats = JSON.parse(localStorage.getItem("quizStats")) || {};
    setQuizStats(stats[topic] || {});

    if (
      !Object.keys(roadmaps).includes(topic) ||
      !Object.keys(topics).includes(topic)
    ) {
      //   alert(`Roadmap for ${topic} not found. Please generate it first.`);
      navigate("/");
    }
    console.log(roadmap);
    console.log(topicDetails);
  }, [topic]);

  const colors = [
    "#D14EC4",
    "#4ED1B1",
    "#D14E4E",
    "#4EAAD1",
    "#D1854E",
    "#904ED1",
    "#AFD14E",
  ];

  const Subtopic = ({ subtopic, number, style, weekNum, quizStats }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const topic = searchParams.get("topic");
    return (
      <div
        className="flexbox subtopic"
        style={{ ...style, justifyContent: "space-between" }}
      >
        <h1 className="number">{number}</h1>
        <div className="detail">
          <h3
            style={{
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {subtopic.subtopic}
          </h3>
          <p className="time">
            {(
              parseFloat(subtopic.time.replace(/^\D+/g, "")) *
              (parseFloat(localStorage.getItem("hardnessIndex")) || 1)
            ).toFixed(1)}{" "}
            {subtopic.time.replace(/[0-9]/g, "")}
          </p>
          <p style={{ fontWeight: "300", opacity: "61%", marginTop: "1em" }}>
            {subtopic.description}
          </p>
        </div>
        <div
          className="hardness"
          onClick={() => {
            let hardness = prompt(
              "Rate Hardness on a rating of 1-10 (where 5 means perfect)"
            );
            if (hardness) {
              let hardnessIndex =
                parseFloat(localStorage.getItem("hardnessIndex")) || 1;
              hardnessIndex = hardnessIndex + (hardness - 5) / 10;
              localStorage.setItem("hardnessIndex", hardnessIndex);
              window.location.reload();
            }
          }}
        >
          Rate Hardness
        </div>

        <div className="flexbox buttons" style={{ flexDirection: "column" }}>
          <button
            className="resourcesButton"
            onClick={() => {
              setModalOpen(true);
              setResourceParam({
                subtopic: subtopic.subtopic,
                description: subtopic.description,
                time: subtopic.time,
                course: topic,
                knowledge_level: topicDetails.knowledge_level,
              });
            }}
          >
            Resources
          </button>
          {quizStats.timeTaken ? (
            <div className="quiz_completed">
              {((quizStats.numCorrect * 100) / quizStats.numQues).toFixed(1) +
                "% Correct in " +
                (quizStats.timeTaken / 1000).toFixed(0) +
                "s"}
            </div>
          ) : (
            <button
              className="quizButton"
              onClick={() => {
                navigate(
                  `/quiz?topic=${topic}&week=${weekNum}&subtopic=${number}`
                );
              }}
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  };

  const TopicBar = ({
    week,
    topic,
    color,
    subtopics,
    style,
    children,
    weekNum,
    quizStats,
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <div style={style}>
        <div className="topic-bar" style={{ "--clr": color }}>
          <div className="topic-bar-title">
            <h3
              className="week"
              style={{ fontWeight: "400", textTransform: "capitalize" }}
            >
              {week}
            </h3>
            <h2
              style={{
                fontWeight: "400",
                textTransform: "capitalize",
                color: "white",
              }}
            >
              {topic}
            </h2>
          </div>
          <button
            className="plus"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <ChevronRight
              size={50}
              strokeWidth={2}
              color={color}
            ></ChevronRight>
          </button>
          <div
            className="subtopics"
            style={{ display: open ? "block" : "none" }}
          >
            {subtopics?.map((subtopic, i) => (
              <Subtopic
                subtopic={subtopic}
                number={i + 1}
                weekNum={weekNum}
                quizStats={quizStats[i + 1] || {}}
              ></Subtopic>
            ))}
          </div>
        </div>

        {children}
      </div>
    );
  };

  // Structured Learning Resource Component
  const StructuredLearningResource = ({ content, subtopic, time, course }) => {
    const [currentChapter, setCurrentChapter] = useState(0);
    const [completedChapters, setCompletedChapters] = useState(new Set());
    const [isLearning, setIsLearning] = useState(false);
    const [studyTime, setStudyTime] = useState(0);
    const [userNotes, setUserNotes] = useState('');
    const [bookmarks, setBookmarks] = useState(new Set());
    
    // Generate structured chapters from content
    const [chapters, setChapters] = useState([]);
    
    // Initialize with basic chapters immediately
    useEffect(() => {
      const timeInMinutes = parseFloat(time.replace(/^\D+/g, "")) * (time.includes('hour') ? 60 : 1);
      
      const initialChapters = [
        {
          title: `Introduction to ${subtopic}`,
          duration: Math.ceil(timeInMinutes * 0.2),
          type: 'introduction',
          content: `# Introduction to ${subtopic}\n\nWelcome to your personalized learning journey! In this section, you'll get a comprehensive overview of ${subtopic} and understand why it's important in the context of ${course}.\n\n## What You'll Learn\n- Core concepts and fundamentals\n- Real-world applications\n- Key terminology and definitions\n- How ${subtopic} fits into the broader ${course} landscape\n\n## Getting Started\nLet's begin by understanding the basics and building a solid foundation for your learning journey.`
        },
        {
          title: `Core Concepts of ${subtopic}`,
          duration: Math.ceil(timeInMinutes * 0.4),
          type: 'concepts',
          content: `# Core Concepts of ${subtopic}\n\nNow let's dive deep into the fundamental concepts that form the backbone of ${subtopic}. This section will build your foundation knowledge.\n\n## Key Learning Objectives\n- Master the essential principles\n- Understand underlying mechanisms\n- Learn important terminology\n- Grasp the theoretical foundations\n\n## Deep Dive\nWe'll explore each concept step-by-step with clear explanations and practical examples.`
        },
        {
          title: `Practical Applications & Examples`,
          duration: Math.ceil(timeInMinutes * 0.3),
          type: 'practical',
          content: `# Practical Applications & Examples\n\nTime to see ${subtopic} in action! This section focuses on real-world applications and hands-on understanding.\n\n## What We'll Cover\n- Real-world use cases and scenarios\n- Step-by-step practical examples\n- Hands-on exercises you can try\n- Common patterns and best practices\n\n## Practice Makes Perfect\nLet's apply what you've learned with concrete examples and exercises.`
        },
        {
          title: `Summary & Next Steps`,
          duration: Math.ceil(timeInMinutes * 0.1),
          type: 'summary',
          content: `# Summary & Next Steps\n\nCongratulations! You've completed your learning journey on ${subtopic}. Let's review what you've accomplished.\n\n## What You've Learned\n- ✅ Fundamental concepts and principles\n- ✅ Real-world applications\n- ✅ Practical examples and exercises\n- ✅ Key terminology and best practices\n\n## Next Steps\n1. Practice what you've learned\n2. Explore related topics in ${course}\n3. Apply these concepts in real projects\n4. Continue your learning journey\n\n## Keep Learning!\nThis is just the beginning of your ${course} journey. Keep exploring and practicing!`
        }
      ];
      
      setChapters(initialChapters);
    }, [subtopic, time, course]); // Initialize immediately when component mounts
    
    useEffect(() => {
      // Update chapters with AI-generated content when available
      if (!content) return;
      
      const generateChapters = () => {
        const timeInMinutes = parseFloat(time.replace(/^\D+/g, "")) * (time.includes('hour') ? 60 : 1);
        
        // Create structured chapters
        const baseChapters = [
          {
            title: `Introduction to ${subtopic}`,
            duration: Math.ceil(timeInMinutes * 0.2),
            type: 'introduction',
            content: `# Introduction to ${subtopic}\n\nWelcome to your personalized learning journey! In this section, you'll get a comprehensive overview of ${subtopic} and understand why it's important in the context of ${course}.\n\n## What You'll Learn\n- Core concepts and fundamentals\n- Real-world applications\n- Key terminology and definitions\n- How ${subtopic} fits into the broader ${course} landscape\n\n## Getting Started\nLet's begin by understanding the basics and building a solid foundation for your learning journey.`
          },
          {
            title: `Core Concepts of ${subtopic}`,
            duration: Math.ceil(timeInMinutes * 0.4),
            type: 'concepts',
            content: `# Core Concepts of ${subtopic}\n\nNow let's dive deep into the fundamental concepts that form the backbone of ${subtopic}. This section will build your foundation knowledge.\n\n## Key Learning Objectives\n- Master the essential principles\n- Understand underlying mechanisms\n- Learn important terminology\n- Grasp the theoretical foundations\n\n## Deep Dive\nWe'll explore each concept step-by-step with clear explanations and practical examples.`
          },
          {
            title: `Practical Applications & Examples`,
            duration: Math.ceil(timeInMinutes * 0.3),
            type: 'practical',
            content: `# Practical Applications & Examples\n\nTime to see ${subtopic} in action! This section focuses on real-world applications and hands-on understanding.\n\n## What We'll Cover\n- Real-world use cases and scenarios\n- Step-by-step practical examples\n- Hands-on exercises you can try\n- Common patterns and best practices\n\n## Practice Makes Perfect\nLet's apply what you've learned with concrete examples and exercises.`
          },
          {
            title: `Summary & Next Steps`,
            duration: Math.ceil(timeInMinutes * 0.1),
            type: 'summary',
            content: `# Summary & Next Steps\n\nCongratulations! You've completed your learning journey on ${subtopic}. Let's review what you've accomplished.\n\n## What You've Learned\n- ✅ Fundamental concepts and principles\n- ✅ Real-world applications\n- ✅ Practical examples and exercises\n- ✅ Key terminology and best practices\n\n## Next Steps\n1. Practice what you've learned\n2. Explore related topics in ${course}\n3. Apply these concepts in real projects\n4. Continue your learning journey\n\n## Keep Learning!\nThis is just the beginning of your ${course} journey. Keep exploring and practicing!`
          }
        ];
        
        // If we have structured content from API, parse it
        if (content && typeof content === 'object' && content.chapters) {
          return content.chapters.map((chapter, index) => ({
            ...baseChapters[index] || baseChapters[baseChapters.length - 1],
            ...chapter
          }));
        }
        
        // Otherwise use the main content with structured chapters
        const contentText = typeof content === 'string' ? content : (content?.content || content || '');
        
        // If we have actual content, try to split it into sections
        if (contentText && contentText.length > 100) {
          const sections = contentText.split(/(?=^#)/gm).filter(section => section.trim().length > 50);
          
          if (sections.length >= 2) {
            return sections.map((section, index) => ({
              title: section.split('\n')[0].replace(/#+\s*/, '').trim() || baseChapters[index]?.title || `Chapter ${index + 1}`,
              duration: Math.ceil(timeInMinutes / sections.length),
              type: baseChapters[index]?.type || 'content',
              content: section.trim()
            }));
          }
        }
        
        // Fallback: create base chapters and distribute content
        const chunkSize = Math.ceil(contentText.length / baseChapters.length);
        return baseChapters.map((chapter, index) => ({
          ...chapter,
          content: chapter.content + '\n\n' + (contentText.substring(index * chunkSize, (index + 1) * chunkSize) || 'Content is being generated...')
        }));
      };
      
      setChapters(generateChapters());
      
      // Debug logging
      console.log('Content received:', content);
      console.log('Subtopic:', subtopic);
      console.log('Time:', time);
      console.log('Generated chapters:', generateChapters());
    }, [content, subtopic, time, course]);

    // Load saved progress
    useEffect(() => {
      const savedProgress = JSON.parse(localStorage.getItem(`learning_progress_${course}_${subtopic}`)) || {};
      if (savedProgress.completedChapters) {
        setCompletedChapters(new Set(savedProgress.completedChapters));
      }
      if (savedProgress.currentChapter !== undefined) {
        setCurrentChapter(savedProgress.currentChapter);
      }
      if (savedProgress.studyTime) {
        setStudyTime(savedProgress.studyTime);
      }
      if (savedProgress.notes) {
        setUserNotes(savedProgress.notes);
      }
      if (savedProgress.bookmarks) {
        setBookmarks(new Set(savedProgress.bookmarks));
      }
    }, [course, subtopic]);

    // Save progress
    const saveProgress = () => {
      const progressData = {
        completedChapters: Array.from(completedChapters),
        currentChapter,
        studyTime,
        notes: userNotes,
        bookmarks: Array.from(bookmarks),
        lastAccessed: new Date().toISOString()
      };
      localStorage.setItem(`learning_progress_${course}_${subtopic}`, JSON.stringify(progressData));
    };

    // Study timer
    useEffect(() => {
      let interval;
      if (isLearning) {
        interval = setInterval(() => {
          setStudyTime(prev => prev + 1);
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isLearning]);

    // Auto-save progress
    useEffect(() => {
      const autoSave = setTimeout(saveProgress, 2000);
      return () => clearTimeout(autoSave);
    }, [completedChapters, currentChapter, studyTime, userNotes, bookmarks]);

    const markChapterComplete = (chapterIndex) => {
      const newCompleted = new Set(completedChapters);
      newCompleted.add(chapterIndex);
      setCompletedChapters(newCompleted);
      
      if (chapterIndex === currentChapter && chapterIndex < chapters.length - 1) {
        setCurrentChapter(chapterIndex + 1);
      }
    };

    const toggleBookmark = (chapterIndex) => {
      const newBookmarks = new Set(bookmarks);
      if (newBookmarks.has(chapterIndex)) {
        newBookmarks.delete(chapterIndex);
      } else {
        newBookmarks.add(chapterIndex);
      }
      setBookmarks(newBookmarks);
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = chapters.length > 0 ? (completedChapters.size / chapters.length) * 100 : 0;

    return (
      <div className="structured-learning" style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '0',
        padding: '2rem',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        margin: '0',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h2 style={{ color: '#D14EC4', margin: 0, fontSize: '1.5rem' }}>
              📚 {subtopic} - Interactive Learning
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => setIsLearning(!isLearning)}
                style={{
                  background: isLearning ? 'rgba(209, 78, 196, 0.2)' : 'rgba(175, 209, 78, 0.2)',
                  border: `1px solid ${isLearning ? '#D14EC4' : '#AFD14E'}`,
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: isLearning ? '#D14EC4' : '#AFD14E',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                {isLearning ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                {isLearning ? 'Pause' : 'Start'} Learning
              </button>
              <div style={{ 
                color: '#ccc', 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Clock size={16} />
                Study Time: {formatTime(studyTime)}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
                Progress: {completedChapters.size} of {chapters.length} chapters
              </span>
              <span style={{ color: '#AFD14E', fontSize: '0.9rem', fontWeight: '600' }}>
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #D14EC4, #AFD14E)',
                height: '100%',
                width: `${progressPercentage}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden', height: 'calc(100% - 120px)' }}>
          {/* Chapter Navigation */}
          <div style={{ 
            width: '350px', 
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '2rem',
            overflowY: 'auto',
            height: '100%'
          }}>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
              📖 Chapters
            </h3>
            {chapters.map((chapter, index) => (
              <div
                key={index}
                onClick={() => setCurrentChapter(index)}
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  background: currentChapter === index ? 'rgba(209, 78, 196, 0.2)' : 'transparent',
                  border: `1px solid ${currentChapter === index ? '#D14EC4' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  if (currentChapter !== index) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentChapter !== index) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <div>
                  <div style={{ 
                    color: currentChapter === index ? '#D14EC4' : 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    {chapter.title}
                  </div>
                  <div style={{ 
                    color: '#ccc',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Clock size={14} />
                    {chapter.duration} min
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {bookmarks.has(index) && (
                    <div style={{ color: '#AFD14E' }}>📌</div>
                  )}
                  {completedChapters.has(index) && (
                    <CheckCircle size={16} color="#AFD14E" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '4rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 'none'
          }}>
            {chapters.length > 0 && chapters[currentChapter] ? (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ color: 'white', margin: 0 }}>
                    {chapters[currentChapter].title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleBookmark(currentChapter)}
                      style={{
                        background: bookmarks.has(currentChapter) ? 'rgba(175, 209, 78, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${bookmarks.has(currentChapter) ? '#AFD14E' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '6px',
                        padding: '0.5rem',
                        color: bookmarks.has(currentChapter) ? '#AFD14E' : '#ccc',
                        cursor: 'pointer'
                      }}
                    >
                      📌
                    </button>
                    <button
                      onClick={() => markChapterComplete(currentChapter)}
                      disabled={completedChapters.has(currentChapter)}
                      style={{
                        background: completedChapters.has(currentChapter) ? 'rgba(175, 209, 78, 0.2)' : 'rgba(209, 78, 196, 0.2)',
                        border: `1px solid ${completedChapters.has(currentChapter) ? '#AFD14E' : '#D14EC4'}`,
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        color: completedChapters.has(currentChapter) ? '#AFD14E' : '#D14EC4',
                        cursor: completedChapters.has(currentChapter) ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                      }}
                    >
                      {completedChapters.has(currentChapter) ? (
                        <>
                          <CheckCircle size={16} />
                          Completed
                        </>
                      ) : (
                        'Mark Complete'
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Chapter Content */}
                <div style={{ 
                  color: 'white', 
                  lineHeight: '1.8',
                  marginBottom: '2rem',
                  fontSize: '1.1rem',
                  maxWidth: 'none',
                  flex: 1,
                  overflowY: 'auto'
                }}>
                  <Markdown>{chapters[currentChapter].content}</Markdown>
                </div>

                {/* Navigation */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <button
                    onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                    disabled={currentChapter === 0}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      color: currentChapter === 0 ? '#666' : 'white',
                      cursor: currentChapter === 0 ? 'default' : 'pointer',
                      opacity: currentChapter === 0 ? 0.5 : 1
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentChapter(Math.min(chapters.length - 1, currentChapter + 1))}
                    disabled={currentChapter === chapters.length - 1}
                    style={{
                      background: 'rgba(209, 78, 196, 0.2)',
                      border: '1px solid #D14EC4',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      color: currentChapter === chapters.length - 1 ? '#666' : '#D14EC4',
                      cursor: currentChapter === chapters.length - 1 ? 'default' : 'pointer',
                      opacity: currentChapter === chapters.length - 1 ? 0.5 : 1
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#ccc',
                padding: '4rem 2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>
                  Setting up your learning content...
                </h3>
                <p>Your personalized learning chapters are being prepared. Please wait a moment.</p>
              </div>
            )}
          </div>

          {/* Notes Panel - Right Side */}
          <div style={{ 
            width: '350px',
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '2rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <FileText size={18} color="#AFD14E" />
              <h4 style={{ color: '#AFD14E', margin: 0, fontSize: '1.1rem' }}>Your Notes</h4>
              <button
                onClick={saveProgress}
                style={{
                  background: 'rgba(175, 209, 78, 0.2)',
                  border: '1px solid #AFD14E',
                  borderRadius: '6px',
                  padding: '0.4rem 0.8rem',
                  color: '#AFD14E',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  marginLeft: 'auto'
                }}
              >
                <Save size={12} /> Save
              </button>
            </div>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Take notes while learning..."
              style={{
                width: '100%',
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '1rem',
                color: 'white',
                fontSize: '0.9rem',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
            
            {/* Progress Summary */}
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(209, 78, 196, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(209, 78, 196, 0.3)'
            }}>
              <h5 style={{ color: '#D14EC4', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                📊 Learning Progress
              </h5>
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                <div>Completed: {completedChapters.size}/{chapters.length} chapters</div>
                <div>Study Time: {formatTime(studyTime)}</div>
                <div>Bookmarks: {bookmarks.size}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ResourcesSection = ({ children }) => {
    return (
      <div className="flexbox resources">
        <div className="generativeFill">
          <button
            className="primary"
            onClick={() => {
              setLoading(true);
              axios.defaults.baseURL = "http://localhost:5000";

              // Enhanced data for structured learning
              const enhancedResourceParam = {
                ...resourceParam,
                requestType: "structured_learning",
                timeInMinutes: parseFloat(resourceParam.time.replace(/^\D+/g, "")) * (resourceParam.time.includes('hour') ? 60 : 1)
              };

              axios({
                method: "POST",
                url: "/api/generate-resource",
                data: enhancedResourceParam,
                withCredentials: false,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
              })
                .then((res) => {
                  setLoading(false);
                  
                  // Parse the structured response
                  const structuredContent = typeof res.data === 'string' 
                    ? res.data  // Just pass the string content directly
                    : res.data;
                  
                  setResources(
                    <StructuredLearningResource 
                      content={structuredContent}
                      subtopic={resourceParam.subtopic}
                      time={resourceParam.time}
                      course={resourceParam.course}
                    />
                  );
                  setTimeout(() => {
                    setConfettiExplode(true);
                    console.log("exploding confetti...");
                  }, 500);
                })
                .catch((err) => {
                  setLoading(false);
                  alert("error generating resources");
                  navigate("/roadmap?topic=" + encodeURI(topic));
                });
            }}
          >
            <Bot size={70} strokeWidth={1} className="icon"></Bot> AI Generated
            Learning Path
          </button>
        </div>
        {/* OR */}
        <div className="databaseFill">
          <button 
            className="primary" 
            onClick={() => {
              const searchQuery = encodeURIComponent(resourceParam.subtopic);
              const onlineCourses = [
                {
                  name: "Coursera",
                  url: `https://www.coursera.org/search?query=${searchQuery}`,
                  logo: "🎓",
                  description: "University courses and specializations"
                },
                {
                  name: "Udemy",
                  url: `https://www.udemy.com/courses/search/?q=${searchQuery}`,
                  logo: "📚",
                  description: "Practical skills and hands-on courses"
                },
                {
                  name: "edX",
                  url: `https://www.edx.org/search?q=${searchQuery}`,
                  logo: "🏛️",
                  description: "MIT, Harvard and top university courses"
                },
                {
                  name: "Khan Academy",
                  url: `https://www.khanacademy.org/search?page_search_query=${searchQuery}`,
                  logo: "🧠",
                  description: "Free educational content"
                },
                {
                  name: "YouTube",
                  url: `https://www.youtube.com/results?search_query=${searchQuery}+tutorial`,
                  logo: "📺",
                  description: "Free video tutorials and explanations"
                },
                {
                  name: "Pluralsight",
                  url: `https://www.pluralsight.com/search?q=${searchQuery}`,
                  logo: "💼",
                  description: "Technology and professional development"
                }
              ];

              setResources(
                <div className="res">
                  <h2 className="res-heading">Online Courses for "{resourceParam.subtopic}"</h2>
                  <div style={{ 
                    display: 'grid', 
                    gap: '1rem', 
                    marginTop: '2rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
                  }}>
                    {onlineCourses.map((platform, index) => (
                      <div 
                        key={index}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(209, 78, 196, 0.1)';
                          e.target.style.borderColor = '#D14EC4';
                          e.target.style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={() => window.open(platform.url, '_blank')}
                      >
                        <div style={{ 
                          fontSize: '2rem', 
                          marginBottom: '0.5rem' 
                        }}>
                          {platform.logo}
                        </div>
                        <h3 style={{ 
                          color: '#D14EC4', 
                          marginBottom: '0.5rem',
                          fontSize: '1.2rem',
                          fontWeight: '600'
                        }}>
                          {platform.name}
                        </h3>
                        <p style={{ 
                          color: '#ccc', 
                          fontSize: '0.9rem',
                          lineHeight: '1.4',
                          margin: 0
                        }}>
                          {platform.description}
                        </p>
                        <div style={{ 
                          marginTop: '1rem',
                          fontSize: '0.8rem',
                          color: '#AFD14E',
                          fontWeight: '500'
                        }}>
                          Click to search courses →
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ 
                    marginTop: '2rem', 
                    padding: '1rem',
                    background: 'rgba(175, 209, 78, 0.1)',
                    border: '1px solid rgba(175, 209, 78, 0.3)',
                    borderRadius: '8px',
                    color: '#AFD14E',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}>
                    💡 Tip: Compare courses from multiple platforms to find the best fit for your learning style and budget!
                  </div>
                </div>
              );
            }}
          >
            <FolderSearch
              size={70}
              strokeWidth={1}
              className="icon"
            ></FolderSearch>
            Browse Online Courses
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="roadmap_wrapper">
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setResources(null);
        }}
      >
        {!resources ? (
          <ResourcesSection></ResourcesSection>
        ) : (
          <>
            {confettiExplode && (
              <ConfettiExplosion zIndex={10000} style={{ margin: "auto" }} />
            )}

            {resources}
          </>
        )}
      </Modal>
      <Header></Header>

      <Loader style={{ display: loading ? "block" : "none" }}>
        Generating Resource...
      </Loader>
      <div className="content">
        <div className="flexbox topic">
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(209, 78, 196, 0.1)';
              e.target.style.borderColor = '#D14EC4';
              e.target.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ display: "inline-block", marginRight: "2ch" }}>
            {topic}
          </h1>
          <h2 style={{ display: "inline-block", color: "#B6B6B6" }}>
            {topicDetails.time}
          </h2>
        </div>
        <div className="roadmap">
          {Object.keys(roadmap)
            .sort(
              (a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1])
            )
            .map((week, i) => {
              return (
                <TopicBar
                  weekNum={i + 1}
                  week={week}
                  topic={roadmap[week].topic}
                  subtopics={roadmap[week].subtopics}
                  color={colors[i % colors.length]}
                  quizStats={quizStats[i + 1] || {}}
                ></TopicBar>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
