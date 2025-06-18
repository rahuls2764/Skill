import React, { useState, useEffect } from 'react';
import { Play, Clock, Users, Star, Award, CheckCircle, Lock, Zap, Book, Target, User, ArrowLeft } from 'lucide-react';

const CourseDetail = () => {
  const [courseData, setCourseData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userTokens, setUserTokens] = useState(250);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [nftEarned, setNftEarned] = useState(false);

  const mockCourse = {
    courseId: '1',
    title: 'Solidity Smart Contract Development',
    description: 'Master the art of building secure and efficient smart contracts from scratch. This comprehensive course covers everything from Solidity fundamentals to advanced contract patterns and security best practices.',
    instructor: 'Alex Thompson',
    instructorBio: 'Senior Blockchain Developer with 5+ years experience in DeFi protocols',
    instructorAddress: '0x742d35Cc6634C0532925a3b8D1631',
    instructorRating: 4.9,
    price: 150,
    category: 'blockchain',
    enrollmentCount: 1243,
    averageRating: 4.8,
    totalRatings: 189,
    duration: '8 hours',
    difficulty: 'Intermediate',
    thumbnailIPFSHash: 'QmX4R7T9Y2K8B3N6M9',
    videoIPFSHash: 'QmA1B2C3D4E5F6G7H8I9J',
    prerequisites: [
      'Basic programming knowledge',
      'Understanding of blockchain concepts',
      'Familiarity with JavaScript'
    ],
    learningOutcomes: [
      'Write secure Solidity smart contracts',
      'Deploy contracts to Ethereum testnet',
      'Implement common contract patterns',
      'Perform security audits and testing',
      'Integrate contracts with frontend applications'
    ],
    syllabus: [
      { title: 'Introduction to Solidity', duration: '45 min', completed: false },
      { title: 'Data Types and Variables', duration: '60 min', completed: false },
      { title: 'Functions and Modifiers', duration: '90 min', completed: false },
      { title: 'Contract Inheritance', duration: '75 min', completed: false },
      { title: 'Security Best Practices', duration: '120 min', completed: false },
      { title: 'Testing and Deployment', duration: '90 min', completed: false }
    ]
  };

  const mockQuiz = {
    questions: [
      {
        question: 'What is the purpose of the "payable" keyword in Solidity?',
        options: [
          'To make a function public',
          'To allow a function to receive Ether',
          'To make a function pure',
          'To create a modifier'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which of the following is a correct way to declare a state variable?',
        options: [
          'uint256 public balance;',
          'var balance = 100;',
          'int balance: 100;',
          'balance uint256 = 100;'
        ],
        correctAnswer: 0,
        points: 10
      }
    ],
    passingScore: 70,
    timeLimit: 30
  };

  useEffect(() => {
    setCourseData(mockCourse);
    setCurrentQuiz(mockQuiz);
    // Check if user is enrolled (mock check)
    setIsEnrolled(false);
  }, []);

  const handleEnrollment = () => {
    if (userTokens >= courseData.price) {
      setUserTokens(prev => prev - courseData.price);
      setIsEnrolled(true);
      setCourseData(prev => ({ ...prev, enrollmentCount: prev.enrollmentCount + 1 }));
    } else {
      alert(`Insufficient tokens! You need ${courseData.price - userTokens} more tokens.`);
    }
  };

  const handleQuizSubmit = () => {
    const totalQuestions = currentQuiz.questions.length;
    const correctAnswers = currentQuiz.questions.filter((q, index) => 
      quizAnswers[index] === q.correctAnswer
    ).length;
    
    const score = (correctAnswers / totalQuestions) * 100;
    
    if (score >= currentQuiz.passingScore) {
      setQuizCompleted(true);
      setNftEarned(true);
      setShowQuiz(false);
      alert(`Congratulations! You passed with ${score}%. Your NFT certificate is being minted!`);
    } else {
      alert(`You scored ${score}%. You need ${currentQuiz.passingScore}% to pass. Please try again.`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!courseData) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="w-full px-6 py-4">
          <button className="flex items-center text-gray-600 hover:text-indigo-600 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(courseData.difficulty)}`}>
                {courseData.difficulty}
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {courseData.category}
              </span>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4 inline mr-2" />
              {userTokens} Tokens
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8">
              <div className="relative h-64 md:h-96 bg-gradient-to-br from-indigo-400 to-purple-500">
                {isEnrolled ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setShowVideoPlayer(true)}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-6 hover:bg-white/30 transition-all"
                    >
                      <Play className="w-12 h-12 text-white ml-1" />
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Lock className="w-16 h-16 mx-auto mb-4 opacity-60" />
                      <p className="text-lg font-medium">Enroll to access course content</p>
                    </div>
                  </div>
                )}
                
                {isEnrolled && (
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {courseData.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {courseData.enrollmentCount} enrolled
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{courseData.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{courseData.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mr-4"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{courseData.instructor}</h3>
                    <p className="text-gray-600 text-sm">{courseData.instructorBio}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium">{courseData.instructorRating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold">{courseData.averageRating}</span>
                    <span className="text-gray-500 text-sm ml-1">({courseData.totalRatings} reviews)</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {courseData.enrollmentCount} students enrolled
                  </div>
                </div>
              </div>
            </div>

            {/* Course Content/Syllabus */}
            {isEnrolled && (
              <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                <div className="space-y-4">
                  {courseData.syllabus.map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors">
                      <div className="flex items-center">
                        {lesson.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-500 mr-4" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-4"></div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                          <p className="text-sm text-gray-500">{lesson.duration}</p>
                        </div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Quiz Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Final Quiz</h3>
                      <p className="text-gray-600">Complete the quiz to earn your NFT certificate</p>
                    </div>
                    {quizCompleted ? (
                      <div className="flex items-center text-green-600">
                        <Award className="w-6 h-6 mr-2" />
                        <span className="font-medium">Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowQuiz(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                      >
                        Take Quiz
                      </button>
                    )}
                  </div>
                  
                  {nftEarned && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center">
                        <Award className="w-6 h-6 text-green-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-green-900">NFT Certificate Earned!</h4>
                          <p className="text-green-700 text-sm">Your completion certificate has been minted as an NFT</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prerequisites & Learning Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Book className="w-6 h-6 mr-2 text-indigo-600" />
                  Prerequisites
                </h3>
                <ul className="space-y-2">
                  {courseData.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-600">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-purple-600" />
                  Learning Outcomes
                </h3>
                <ul className="space-y-2">
                  {courseData.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-gray-600">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-indigo-500 mr-2" />
                  <span className="text-3xl font-bold text-gray-900">{courseData.price}</span>
                  <span className="text-lg text-gray-500 ml-2">tokens</span>
                </div>
                
                {isEnrolled ? (
                  <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-medium">
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Enrolled
                  </div>
                ) : (
                  <button
                    onClick={handleEnrollment}
                    disabled={userTokens < courseData.price}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                      userTokens >= courseData.price
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {userTokens >= courseData.price ? 'Enroll Now' : 'Insufficient Tokens'}
                  </button>
                )}
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{courseData.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{courseData.enrollmentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificate</span>
                  <span className="font-medium text-green-600">NFT Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Access</span>
                  <span className="font-medium">Lifetime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && currentQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Course Quiz</h2>
              <p className="text-gray-600">Answer all questions to earn your NFT certificate</p>
            </div>
            
            <div className="p-6 space-y-6">
              {currentQuiz.questions.map((question, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-200 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={optionIndex}
                          onChange={(e) => setQuizAnswers(prev => ({ ...prev, [index]: parseInt(e.target.value) }))}
                          className="mr-3 text-indigo-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t flex justify-between">
              <button
                onClick={() => setShowQuiz(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleQuizSubmit}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;