import React, { useState, useEffect } from 'react';
import { Play, Clock, Users, Star, Award, CheckCircle, Lock, Zap, Book, Target, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from '../context/Web3Context';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userTokens, setUserTokens] = useState(250);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [nftEarned, setNftEarned] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});

  const { getCourseDetails, hasAccessToCourse, account, enrollInCourse } = useWeb3();

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const details = await getCourseDetails(id);
        const enrolled = await hasAccessToCourse(account, id);
        setCourseData(details);
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error("Error loading course", err);
      }
    };
    if (id && account) loadCourse();
  }, [id, account]);

  const handleEnrollment = async () => {
    if (!courseData) return;
    if (userTokens < courseData.price) {
      alert(`Need ${courseData.price - userTokens} more tokens.`);
      return;
    }

    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
      setUserTokens(prev => prev - courseData.price);
    } catch (err) {
      console.error("Enrollment failed", err);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white/80 backdrop-blur-md border-b px-6 py-4">
        <button onClick={() => navigate("/courses")} className="flex items-center text-gray-600 hover:text-indigo-600 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </button>
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(courseData.difficulty)}`}>
              {courseData.difficulty}
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
              {courseData.category}
            </span>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full">
            <Zap className="inline w-4 h-4 mr-2" />
            {userTokens} Tokens
          </div>
        </div>
      </div>

      <div className="px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video */}
          <div className="rounded-2xl overflow-hidden border shadow-sm bg-white relative h-72 md:h-[400px]">
            {isEnrolled && courseData.videoCid && showVideoPlayer ? (
              <video
                controls
                className="w-full h-full object-cover"
                src={`https://gateway.pinata.cloud/ipfs/${courseData.videoCid}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
                {isEnrolled ? (
                  <button onClick={() => setShowVideoPlayer(true)} className="bg-white/20 p-5 rounded-full border border-white/30">
                    <Play className="w-10 h-10 text-white" />
                  </button>
                ) : (
                  <div className="text-white text-center">
                    <Lock className="w-12 h-12 mx-auto mb-2 opacity-80" />
                    <p className="text-lg font-medium">Enroll to access video</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{courseData.title}</h1>
            <p className="text-gray-700 text-lg">{courseData.description}</p>
          </div>

          {/* Syllabus */}
          {isEnrolled && courseData.syllabus?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-2xl font-bold mb-4">Course Syllabus</h2>
              <ul className="space-y-4">
                {courseData.syllabus.map((item, i) => (
                  <li key={i} className="flex justify-between items-center border p-3 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <span className="text-sm text-gray-500">{item.duration}</span>
                    </div>
                    <Play className="text-indigo-500 w-5 h-5" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning Outcomes */}
          {courseData.learningOutcomes?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-2xl font-bold mb-4">Learning Outcomes</h2>
              <ul className="list-disc ml-5 text-gray-700 space-y-2">
                {courseData.learningOutcomes.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Right/Sidebar */}
        <div className="sticky top-20 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{courseData.price} Tokens</h3>
            {isEnrolled ? (
              <div className="bg-green-100 text-green-700 py-2 rounded-lg">
                <CheckCircle className="inline w-4 h-4 mr-2" />
                Enrolled
              </div>
            ) : (
              <button
                onClick={handleEnrollment}
                disabled={userTokens < courseData.price}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  userTokens >= courseData.price
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Enroll Now
              </button>
            )}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-sm text-gray-600 space-y-2">
            <div className="flex justify-between"><span>Duration</span><span>{courseData.duration}</span></div>
            <div className="flex justify-between"><span>Students</span><span>{courseData.enrollmentCount}</span></div>
            <div className="flex justify-between"><span>Category</span><span>{courseData.category}</span></div>
            <div className="flex justify-between"><span>Access</span><span>Lifetime</span></div>
            <div className="flex justify-between"><span>Certificate</span><span className="text-green-600">NFT Included</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
