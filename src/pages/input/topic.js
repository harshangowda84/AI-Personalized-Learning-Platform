import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

import "./topic.css";
import Header from "../../components/header/header";
import { ArrowRight, LibraryBig, Search, ArrowLeft } from "lucide-react";
import Loader from "../../components/loader/loader";

const TopicPage = (props) => {
  const navigate = useNavigate();
  
  // Check if user is logged in (allow demo access)
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const isDemoAccess = new URLSearchParams(window.location.search).get('demo') === 'true';
  
  useEffect(() => {
    // Allow demo access or if user is logged in
    if (!isLoggedIn && !isDemoAccess) {
      // Redirect to landing page if not logged in and not demo
      // But we'll be permissive for now
    }
  }, [isLoggedIn, isDemoAccess, navigate]);

  const suggestionList = [
    "Competitive Programming",
    "Machine Learning",
    "Quantitative Finance",
    "Web Development",
    "Quantum Technology",
  ];
  const colors = [
    "#D14EC4",
    "#AFD14E",
    "#4ED1B1",
    "#D14E4E",
    "#D1854E",
    "#904ED1",
    "#4EAAD1",
  ];
  const [topic, setTopic] = useState("");
  const [timeInput, setTimeInput] = useState(4);
  const [timeUnit, setTimeUnit] = useState("Weeks");
  const [time, setTime] = useState("4 Weeks");
  const [knowledgeLevel, setKnowledgeLevel] = useState("Absolute Beginner");
  const [loading, setLoading] = useState(false);
  
  // Get enrolled courses from localStorage
  const topics = JSON.parse(localStorage.getItem("topics")) || {};
  const enrolledCourses = Object.keys(topics);

  useEffect(() => {
    if (topic) {
      console.log("Topic: ", topic);
    }
  }, [topic]);

  useEffect(() => {
    setTime(timeInput + " " + timeUnit);
  }, [timeInput, timeUnit]);

  const Suggestions = ({ list }) => {
    return (
      <div className="flexbox suggestions">
        {list.map((item, i) => (
          <button>
            <div
              className="suggestionPill"
              onClick={() => {
                setTopic(item);
              }}
              style={{ "--clr": colors[i % colors.length] }}
            >
              {item} <ArrowRight className="arrow" size={30} strokeWidth={1} />
            </div>
          </button>
        ))}
      </div>
    );
  };

  const TopicInput = () => {
    const [inputVal, setInputVal] = useState("");
    const searchIcon = <Search size={65} color={"white"} strokeWidth={2} />;
    const arrowIcon = <ArrowRight size={65} color={"white"} strokeWidth={2} />;
    const [icon, setIcon] = useState(searchIcon);

    return (
      <div className="inputContainer TopicInput">
        <LibraryBig
          className="icon"
          size={78}
          color={"#73737D"}
          strokeWidth={1}
        />
        <input
          type="text"
          placeholder="Enter A Topic"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            if (e.target.value) {
              setIcon(arrowIcon);
            } else {
              setIcon(searchIcon);
            }
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            if (inputVal) {
              setTopic(inputVal);
            }
          }}
        >
          {icon}
        </button>
      </div>
    );
  };
  const SetTopic = () => {
    return (
      <div className="flexbox main setTopic">
        <h2>What do you want to learn?</h2>
        <TopicInput />
        <h3>Suggestions:</h3>
        <Suggestions list={suggestionList}></Suggestions>
        <ContinueLearning />
      </div>
    );
  };

  // Continue Learning Component
  const ContinueLearning = () => {
    if (enrolledCourses.length === 0) return null;
    
    return (
      <div className="continueLearning" style={{ 
        width: '100%', 
        padding: '2rem', 
        marginBottom: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ 
          color: 'white', 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          fontSize: '1.8rem',
          fontWeight: '600'
        }}>
          Continue Learning
        </h2>
        <div className="flexbox" style={{ 
          flexWrap: 'wrap', 
          gap: '1rem', 
          justifyContent: 'center' 
        }}>
          {enrolledCourses.map((course, i) => (
            <NavLink
              key={course}
              className="link"
              to={"/roadmap?topic=" + encodeURI(course)}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="courseCard"
                style={{
                  '--clr': colors[i % colors.length],
                  background: `linear-gradient(135deg, ${colors[i % colors.length]}15, ${colors[i % colors.length]}25)`,
                  border: `1px solid ${colors[i % colors.length]}40`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  width: '280px',
                  minHeight: '120px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = `0 10px 25px ${colors[i % colors.length]}30`;
                  e.target.style.borderColor = `${colors[i % colors.length]}80`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = `${colors[i % colors.length]}40`;
                }}
              >
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  textTransform: 'capitalize',
                  color: colors[i % colors.length]
                }}>
                  {course}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#ccc',
                  marginBottom: '0.5rem'
                }}>
                  {topics[course].time}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#aaa',
                  marginBottom: '1rem'
                }}>
                  {topics[course].knowledge_level}
                </div>
                <ArrowRight
                  size={24}
                  strokeWidth={2}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    bottom: '1rem',
                    color: colors[i % colors.length]
                  }}
                />
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  const TimeInput = () => {
    return (
      <div className="flexbox TimeInput">
        <div className="inputContainer">
          <input
            id="timeInput"
            type="number"
            value={timeInput}
            onChange={(e) => {
              if (e.target.value > 100 || e.target.value < 0) {
                return;
              }
              setTimeInput(e.target.value);
            }}
          />
        </div>
        <div className="inputContainer">
          <select
            name="timeUnit"
            id="timeUnit"
            value={timeUnit}
            onChange={(e) => {
              setTimeUnit(e.target.value);
            }}
          >
            {/* <option value="Days" id="Days">
              Days
            </option>
            <option value="Hours" id="Hours">
              Hours
            </option> */}
            <option value="Weeks" id="Weeks">
              Weeks
            </option>
            <option value="Months" id="Months">
              Months
            </option>
          </select>
        </div>
      </div>
    );
  };
  const KnowledgeLevelInput = () => {
    return (
      <div className="inputContainer">
        <select
          name="knowledgeLevel"
          id="knowledgeLevel"
          style={{ width: "min-content", textAlign: "center" }}
          value={knowledgeLevel}
          onChange={(e) => {
            setKnowledgeLevel(e.target.value);
          }}
        >
          <option value="Absolute Beginner">Absolute Beginner</option>
          <option value="Beginner">Beginner</option>
          <option value="Moderate">Moderate</option>
          <option value="Expert">Expert</option>
        </select>
      </div>
    );
  };
  const SubmitButton = ({ children }) => {
    const navigate = useNavigate();
    return (
      <button
        className="SubmitButton"
        onClick={() => {
          if (time === "0 Weeks" || time === "0 Months") {
            alert("Please enter a valid time period");
            return;
          }
          setLoading(true);
          // check if topic is already present on localstorage
          let topics = JSON.parse(localStorage.getItem("topics")) || {};
          if (!Object.keys(topics).includes(topic)) {
            let data = { topic, time, knowledge_level: knowledgeLevel };
            console.log(data);
            axios.defaults.baseURL = "http://localhost:5000";
            axios({
              method: "POST",
              url: "/api/roadmap",
              data: data,
              withCredentials: false,
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            })
              .then((res) => {
                // Check if response contains an error
                if (res.data.error) {
                  alert(res.data.error);
                  setLoading(false);
                  // Reset topic to show topic selection again
                  setTopic("");
                  return;
                }
                
                topics[topic] = { time, knowledge_level: knowledgeLevel };
                localStorage.setItem("topics", JSON.stringify(topics));
                let roadmaps =
                  JSON.parse(localStorage.getItem("roadmaps")) || {};

                roadmaps[topic] = res.data;
                localStorage.setItem("roadmaps", JSON.stringify(roadmaps));
                navigate("/roadmap?topic=" + encodeURI(topic));
              })
              .catch((error) => {
                console.log(error);
                alert(
                  "An error occured while generating the roadmap. Please try again later."
                );
                setLoading(false);
                // Reset topic to show topic selection again instead of navigating away
                setTopic("");
              });
          } else {
            navigate("/roadmap?topic=" + encodeURI(topic));
          }
        }}
      >
        {children}
      </button>
    );
  };
  const SetDetails = () => {
    return (
      <div className="flexbox main setDetails">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '2rem',
          width: '100%',
          justifyContent: 'flex-start'
        }}>
          <button
            onClick={() => setTopic("")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              marginRight: '1rem'
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
            <ArrowLeft size={20} />
            Back to Topics
          </button>
          <h1 style={{ 
            margin: 0, 
            color: 'white', 
            fontSize: '1.5rem',
            textTransform: 'capitalize'
          }}>
            {topic}
          </h1>
        </div>
        <h2>How much time do you have to learn it?</h2>
        <TimeInput />
        <h2 style={{ marginTop: "1.5em" }}>
          Your Knowledge Level on the Topic
        </h2>
        <KnowledgeLevelInput />
        <SubmitButton>Start Learning</SubmitButton>
      </div>
    );
  };

  return (
    <div className="wrapper">
      <Loader style={{ display: loading ? "block" : "none" }}>
        Generating Roadmap...
      </Loader>
      <Header></Header>
      {!topic ? <SetTopic /> : <SetDetails />}
    </div>
  );
};

export default TopicPage;
