import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./quiz.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";
import { CircleCheck, CircleX, ArrowLeft } from "lucide-react";

const Question = ({ questionData, num, style }) => {
  const [attempted, setAttempted] = useState(false);
  return (
    <div className="question" style={style}>
      <h3>
        <span style={{ marginRight: "1ch" }}>{num + "."}</span>
        {questionData.question}
      </h3>
      <div className="flexbox options">
        {questionData.options.map((option, index) => {
          return (
            <div className="option" key={index}>
              <input
                type="radio"
                name={"ques" + (num + 1)}
                id={"ques" + (num + 1) + "index" + index}
                className={
                  (index == questionData.answerIndex ? "correct" : "wrong") +
                  " " +
                  (attempted ? "attempted" : "")
                }
                onClick={(e) => {
                  if (attempted) {
                    e.preventDefault();
                  } else {
                    if (window.numAttmpt == window.numQues - 1) {
                      window.timeTaken =
                        new Date().getTime() - window.startTime;
                      console.log(window.timeTaken);
                    }
                    if (index == questionData.answerIndex) {
                      window.numCorrect++;
                    }
                    window.numAttmpt++;
                    console.log(
                      window.numAttmpt,
                      window.numQues,
                      window.numCorrect
                    );
                    setAttempted(true);
                  }
                }}
              />
              <label htmlFor={"ques" + (num + 1) + "index" + index}>
                {option}
              </label>
              {index == questionData.answerIndex ? (
                <CircleCheck
                  className="optionIcon"
                  size={35}
                  strokeWidth={1}
                  color="#00FFE0"
                />
              ) : (
                <CircleX
                  className="optionIcon"
                  size={35}
                  strokeWidth={1}
                  color="#FF3D00"
                />
              )}
            </div>
          );
        })}
        <div
          className="reason"
          style={{ display: attempted ? "block" : "none" }}
        >
          {questionData.reason}
        </div>
      </div>
    </div>
  );
};

const QuizPage = (props) => {
  const [searchParams] = useSearchParams();
  const [subtopic, setSubtopic] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Handle back navigation
  const handleBack = () => {
    // Go back to roadmap
    navigate("/roadmap?topic=" + encodeURI(course));
  };

  const course = searchParams.get("topic");
  const weekNum = searchParams.get("week");
  const subtopicNum = searchParams.get("subtopic");
  if (!course || !weekNum || !subtopicNum) {
    navigate("/");
  }
  useEffect(() => {
    let topics = JSON.parse(localStorage.getItem("topics")) || {};
    const roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};

    if (
      !Object.keys(roadmaps).includes(course) ||
      !Object.keys(topics).includes(course)
    ) {
      navigate("/");
    }
    const week = Object.keys(roadmaps[course])[weekNum - 1];
    setTopic(roadmaps[course][week].topic);
    console.log(weekNum, week, Object.keys(roadmaps[course]));
    setSubtopic(roadmaps[course][week].subtopics[subtopicNum - 1].subtopic);
    setDescription(
      roadmaps[course][week].subtopics[subtopicNum - 1].description
    );
  }, [course, weekNum, subtopicNum]);

  useEffect(() => {
    console.log(course, topic, subtopic, description);
    if (!course || !topic || !subtopic || !description) return;
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {};
    if (
      quizzes[course] &&
      quizzes[course][weekNum] &&
      quizzes[course][weekNum][subtopicNum]
    ) {
      setQuestions(quizzes[course][weekNum][subtopicNum]);
      window.numQues = quizzes[course][weekNum][subtopicNum].length;
      setLoading(false);
      window.startTime = new Date().getTime();
      window.numAttmpt = 0;
      window.numCorrect = 0;

      return;
    } else {
      console.log("fetching questions...");
      axios.defaults.baseURL = "http://localhost:5000";

      axios({
        method: "POST",
        url: "/api/quiz",
        withCredentials: false,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        data: { course, topic, subtopic, description },
      })
        .then((res) => {
          setQuestions(res.data.questions);
          quizzes[course] = quizzes[course] || {};
          quizzes[course][weekNum] = quizzes[course][weekNum] || {};
          quizzes[course][weekNum][subtopicNum] = res.data.questions;
          localStorage.setItem("quizzes", JSON.stringify(quizzes));
          window.numQues = res.data.questions.length;
          setLoading(false);
          window.startTime = new Date().getTime();
          window.numAttmpt = 0;
          window.numCorrect = 0;
        })
        .catch((error) => {
          console.log(error);
          alert(
            "An error occured while fetching the quiz. Please try again later."
          );
        });
    }
  }, [course, topic, subtopic, description]);

  const SubmitButton = () => {
    return (
      <div className="submit">
        <button
          className="SubmitButton"
          onClick={() => {
            if (!window.timeTaken) {
              let time = new Date().getTime() - window.startTime;
              window.timeTaken = time;
            }
            const quizStats =
              JSON.parse(localStorage.getItem("quizStats")) || {};
            quizStats[course] = quizStats[course] || {};
            quizStats[course][weekNum] = quizStats[course][weekNum] || {};
            quizStats[course][weekNum][subtopicNum] = {
              numCorrect: window.numCorrect,
              numQues: window.numQues,
              timeTaken: window.timeTaken,
            };
            console.log(quizStats);
            let hardnessIndex =
              parseFloat(localStorage.getItem("hardnessIndex")) || 1;
            hardnessIndex =
              hardnessIndex +
              ((window.numQues - window.numCorrect) / (window.numQues * 2)) *
                (window.timeTaken / (5 * 60 * 1000 * window.numQues));
            localStorage.setItem("hardnessIndex", hardnessIndex);
            localStorage.setItem("quizStats", JSON.stringify(quizStats));
            navigate("/roadmap?topic=" + encodeURI(course), { replace: true });
          }}
        >
          Submit
        </button>
      </div>
    );
  };

  return (
    <div className="quiz_wrapper">
      <Header></Header>
      <Loader style={{ display: loading ? "block" : "none" }}>
        Generating Personalized Questions for You ...
      </Loader>
      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
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
          <h1 style={{ margin: 0 }}>{subtopic}</h1>
        </div>
        <h3 style={{ opacity: "0.61", fontWeight: "300", marginBottom: "2em" }}>
          {description}
        </h3>
        {questions.map((question, index) => {
          return <Question questionData={question} num={index + 1} />;
        })}
        <SubmitButton />
      </div>
    </div>
  );
};

export default QuizPage;
