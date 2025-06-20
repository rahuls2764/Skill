// src/pages/Test.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import TestQuizQuestions from '../utils/TestQuizQuestions';
import Loader from '../components/Loader';
const Test = () => {
  const { account, completeTest, getUserData } = useWeb3();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(180);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

 
  const handleQuizStart=async()=>{
    setLoading(true);
    const data = await TestQuizQuestions();
    setLoading(false);
    setQuestions(data);
    
    setHasStarted(true);  
  }
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (account) {
        const data = await getUserData();
        setUserData(data);
      }
    };
    fetchUserData();
  }, [account, getUserData]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (hasStarted && timeLeft > 0 && !isSubmitted) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, hasStarted, isSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (questionIndex, selectedOption) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    let total = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) total++;
    });
    setScore(total);

    setLoading(true);
    try {
      await completeTest(total);
      toast.success(`Test submitted! You earned ${total * 2} SKL tokens.`);
    } catch (err) {
      toast.error('Error submitting test.');
    }
    setLoading(false);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setIsSubmitted(false);
    setTimeLeft(300);
    setHasStarted(false);
  };

  if (!account) {
    return <div className="p-6 text-center text-red-400">Please connect your wallet to start the test.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">SkillBridge Entry Test</h1>
        <div className="flex items-center gap-2 text-cyan-300">
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {!hasStarted ? (
        <div className="text-center mt-10 space-y-8">
        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-mytofy-text-secondary">
          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-4 shadow-md border border-cyan-600">
            <h3 className="text-lg font-semibold text-mytofy-accent-coral mb-1">1 Free Attempt</h3>
            <p className="text-sm">Your first SkillBridge entry test is free. After this, each test will cost 2 SKL tokens.</p>
          </div>
    
          <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-xl p-4 shadow-md border border-cyan-600">
            <h3 className="text-lg font-semibold text-mytofy-accent-coral mb-1">Time Limit: 3 Minutes</h3>
            <p className="text-sm">Answer as many questions as possible within the 3-minute timer.</p>
          </div>
    
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 shadow-md border border-cyan-600">
            <h3 className="text-lg font-semibold text-mytofy-accent-coral mb-1">Earn Tokens</h3>
            <p className="text-sm">Each correct answer rewards you with 2 SKL tokens to use on the platform.</p>
          </div>
        </div>
    
        {/* Start button */}
        <div className="mt-6">
        {loading ? <Loader /> :<button
            onClick={handleQuizStart}
            // onClick={()=>setLoading(true)}
            disabled={loading}
            className={` transition-all px-6 py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-700 `}
          >
            Start Test
          </button> }   
        </div>
      </div>
     
      ) : !isSubmitted ? (
        questions.length === 0 ? (
          <div className="text-center text-cyan-300 mt-10">Loading questions...</div>
        ) : (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">{questions[currentQuestion].question}</h2>
            <div className="grid gap-3">
              {Object.entries(questions[currentQuestion].options).map(([key, option]) => (
                <button
                  key={key}
                  className={`border px-4 py-2 rounded text-start ${
                    answers[currentQuestion] === key ? 'bg-cyan-600 text-white' : 'bg-gray-800'
                  } hover:bg-cyan-500`}
                  onClick={() => handleAnswer(currentQuestion, key)}
                >
                  {key.toUpperCase()}. {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                disabled={currentQuestion === 0}
                className="text-sm text-cyan-400"
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                ← Previous
              </button>
              {currentQuestion < questions.length - 1 ? (
                <button
                  className="text-sm text-cyan-400"
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-700"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="text-center mt-10">
          <Award size={40} className="mx-auto text-yellow-400 mb-4" />
          <h2 className="text-xl font-bold text-green-400">Test Completed</h2>
          <p className="mt-2">You scored {score} out of {questions.length}</p>
          <p className="mt-1 text-cyan-300">You've earned {score * 2} SKL tokens!</p>
          <button
            className="mt-6 px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
          <button
            className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            onClick={restartTest}
          >
            Retake Test
          </button>
        </div>
      )}
    </div>
  );
};

export default Test;
