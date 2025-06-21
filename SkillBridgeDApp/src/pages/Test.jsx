// src/pages/Test.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Award, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers'; 

const Test = () => {
  const { account, completeTest, getUserData } = useWeb3();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    {
      id: 1,
      question: "What is React primarily used for?",
      options: [
        "Backend development",
        "Building user interfaces",
        "Database management",
        "Server configuration"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "Which of the following is a blockchain platform?",
      options: [
        "React",
        "Ethereum",
        "MongoDB",
        "Express"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "What does CSS stand for?",
      options: [
        "Computer Style Sheets",
        "Cascading Style Sheets",
        "Creative Style Sheets",
        "Colorful Style Sheets"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "What is the main purpose of smart contracts?",
      options: [
        "To store data",
        "To execute agreements automatically",
        "To mine cryptocurrency",
        "To create websites"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "Which JavaScript framework is most popular for building SPAs?",
      options: [
        "jQuery",
        "React",
        "Bootstrap",
        "Tailwind"
      ],
      correct: 1
    },
    {
      id: 6,
      question: "What is the purpose of IPFS?",
      options: [
        "Internet Protocol for Security",
        "Interplanetary File System",
        "Integrated Programming File System",
        "Internet Protocol File Storage"
      ],
      correct: 1
    },
    {
      id: 7,
      question: "Which of these is a Web3 wallet?",
      options: [
        "PayPal",
        "MetaMask",
        "Venmo",
        "Cash App"
      ],
      correct: 1
    },
    {
      id: 8,
      question: "What does API stand for?",
      options: [
        "Application Programming Interface",
        "Automated Programming Interface",
        "Advanced Programming Interface",
        "Application Protocol Interface"
      ],
      correct: 0
    },
    {
      id: 9,
      question: "What is the main benefit of NFTs?",
      options: [
        "Faster transactions",
        "Lower fees",
        "Proof of ownership",
        "Better security"
      ],
      correct: 2
    },
    {
      id: 10,
      question: "Which programming language is used for Ethereum smart contracts?",
      options: [
        "JavaScript",
        "Python",
        "Solidity",
        "Java"
      ],
      correct: 2
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (account) {
        const data = await getUserData();
        setUserData(data);
      }
    };
    fetchUserData();
  }, [account, getUserData]);

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

  const { contracts, provider } = useWeb3();
  const contract = contracts.skillBridge;

  const handleSubmit = async () => {
    setIsSubmitted(true);

    // Calculate score
    let total = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) total++;
    });
    setScore(total);

    console.log("=== DEBUG INFO ===");
    console.log("Score:", total);
    console.log("User address:", account);
    
    // Fix: Use proper contract address access
    const contractAddress = contract?.address || contract?.target;
    console.log("Contract address:", contractAddress);

    if (!contract) {
      if (toast.error) {
        toast.error("Contract not initialized. Please try again later.");
      } else if (toast) {
        toast("Contract not initialized. Please try again later.");
      }
      console.error("Contract not initialized. Please try again later.");
      return;
    }

    setLoading(true);

    try {
      // 1. Check if user already completed the test
      const userData = await contract.getUser(account);
      if (userData.hasCompletedTest || userData[4]) { // userData[4] is hasCompletedTest
        if (toast.error) {
          toast.error("You have already completed the test!");
        } else if (toast) {
          toast("You have already completed the test!");
        }
        console.error("You have already completed the test!");
        setLoading(false);
        return;
      }

      // 2. Simple approach: Just call completeTest directly
      // The contract will mint tokens directly to the user
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.completeTest(total);
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (gasError) {
        console.warn("Gas estimation failed. Using fallback.");
        // Handle both ethers v5 and v6
        gasEstimate = ethers.BigNumber?.from ? ethers.BigNumber.from("300000") : 300000n;
      }

      // Prepare transaction options - handle both ethers v5 and v6
      const txOptions = {};
      
      if (typeof gasEstimate === 'bigint') {
        // Ethers v6
        txOptions.gasLimit = (gasEstimate * 120n) / 100n; // add 20% buffer
      } else if (gasEstimate.mul) {
        // Ethers v5
        txOptions.gasLimit = gasEstimate.mul(120).div(100); // add 20% buffer
      } else {
        // Fallback
        txOptions.gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      }

      // Add gas price if using ethers v5
      if (ethers.utils && ethers.utils.parseUnits) {
        txOptions.gasPrice = ethers.utils.parseUnits("20", "gwei");
      }

      console.log("Sending transaction with options:", txOptions);

      const tx = await contract.completeTest(total, txOptions);

      // Safe toast usage with fallback
      if (toast.info) {
        toast.info(`Transaction sent: ${tx.hash}`);
      } else if (toast) {
        toast(`Transaction sent: ${tx.hash}`);
      }
      console.log("Transaction hash:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) {
        // Verify the test was completed
        const updatedUserData = await contract.getUser(account);
        const hasCompleted = updatedUserData.hasCompletedTest || updatedUserData[4];
        
        if (hasCompleted) {
          if (toast.success) {
            toast.success(`Test submitted successfully! You earned ${total * 10} SKL tokens.`);
          } else if (toast) {
            toast(`Test submitted successfully! You earned ${total * 10} SKL tokens.`);
          }
          console.log(`Test submitted successfully! You earned ${total * 10} SKL tokens.`);
        } else {
          if (toast.error) {
            toast.error("Transaction confirmed but test not marked as completed. Contact support.");
          } else if (toast) {
            toast("Transaction confirmed but test not marked as completed. Contact support.");
          }
          console.error("Transaction confirmed but test not marked as completed. Contact support.");
        }
      } else {
        if (toast.error) {
          toast.error("Transaction failed. Please try again.");
        } else if (toast) {
          toast("Transaction failed. Please try again.");
        }
        console.error("Transaction failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting test:", err);

      let errorMessage = "Error submitting test.";

      if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected by user.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees.";
      } else if (err.message?.includes("Test already completed")) {
        errorMessage = "You have already completed this test.";
      } else if (err.message?.includes("execution reverted")) {
        if (err.data) {
          try {
            // Handle both ethers v5 and v6 revert reason extraction
            let reason;
            if (ethers.utils && ethers.utils.toUtf8String) {
              reason = ethers.utils.toUtf8String("0x" + err.data.substr(138));
            } else {
              reason = err.reason || "Unknown revert reason";
            }
            errorMessage = `Transaction failed: ${reason}`;
          } catch {
            errorMessage = "Transaction failed with unknown revert reason.";
          }
        }
      } else if (err.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.code === "TIMEOUT") {
        errorMessage = "Transaction timed out. Please try again.";
      } else if (err.message?.includes("unsupported addressable value")) {
        errorMessage = "Contract connection error. Please refresh and try again.";
      }

      if (toast.error) {
        toast.error(errorMessage);
      } else if (toast) {
        toast(errorMessage);
      }
      console.error("Error submitting test:", errorMessage);
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
        <div className="text-center mt-10">
          <button onClick={() => setHasStarted(true)} className="px-6 py-2 bg-cyan-500 rounded hover:bg-cyan-600">
            Start Test
          </button>
        </div>
      ) : (
        <>
          {!isSubmitted ? (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">{questions[currentQuestion].question}</h2>
              <div className="grid gap-3">
                {questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    className={`border px-4 py-2 rounded ${
                      answers[currentQuestion] === idx ? 'bg-cyan-600 text-white' : 'bg-gray-800'
                    } hover:bg-cyan-500`}
                    onClick={() => handleAnswer(currentQuestion, idx)}
                  >
                    {option}
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
          ) : (
            <div className="text-center mt-10">
              <Award size={40} className="mx-auto text-yellow-400 mb-4" />
              <h2 className="text-xl font-bold text-green-400">Test Completed</h2>
              <p className="mt-2">You scored {score} out of {questions.length}</p>
              <p className="mt-1 text-cyan-300">You've earned {score * 10} SKL tokens!</p>
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
        </>
      )}
    </div>
  );
};

export default Test;