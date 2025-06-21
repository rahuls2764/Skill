// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Coins, 
  TrendingUp, 
  Play, 
  Star, 
  Clock, 
  Users,
  ShoppingCart,
  Trophy,
  Target,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPanel from '../components/AdminPanel'; // Adjust path as needed


const Dashboard = () => {
  const { 
    account, 
    getUserData, 
    enrollInCourse, 
    getTokenBalance, 
    getAllCourses,
    hasAccessToCourse,
    tokenBalance,
    refreshTokenBalance
  } = useWeb3();
  
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentTokenBalance, setCurrentTokenBalance] = useState(0);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      if (account) {
        setLoading(true);
        try {
          // Fetch user data from blockchain
          const [userDataFromChain, balance, coursesFromChain] = await Promise.all([
            getUserData(),
            getTokenBalance(),
            getAllCourses()
          ]);

          setUserData(userDataFromChain);
          setCurrentTokenBalance(parseFloat(balance) || 0);
          setAllCourses(coursesFromChain);

          // Check enrollment status for each course
          const enrollmentPromises = coursesFromChain.map(async (course) => {
            const hasAccess = await hasAccessToCourse(account, course.courseId);
            return { ...course, isEnrolled: hasAccess };
          });

          const coursesWithEnrollment = await Promise.all(enrollmentPromises);
          
          // Separate enrolled and available courses
          const enrolled = coursesWithEnrollment.filter(course => course.isEnrolled);
          const available = coursesWithEnrollment.filter(course => !course.isEnrolled);
          
          setEnrolledCourses(enrolled);
          
          // For now, we'll assume completed courses are tracked separately
          // You might want to add a completion tracking mechanism in your smart contract
          setCompletedCourses([]); // This would need to be implemented in the smart contract
          
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast.error('Error loading dashboard data');
        }
        setLoading(false);
      }
    };

    fetchAllData();
  }, [account, getUserData, getTokenBalance, getAllCourses, hasAccessToCourse]);

  // Also update when tokenBalance changes from Web3Context
  useEffect(() => {
    if (tokenBalance) {
      setCurrentTokenBalance(parseFloat(tokenBalance) || 0);
    }
  }, [tokenBalance]);

  const handleEnrollInCourse = async (courseId, price) => {
    if (currentTokenBalance < price) {
      toast.error(`Insufficient tokens. You need ${price} SKL tokens.`);
      return;
    }

    setPurchaseLoading({ ...purchaseLoading, [courseId]: true });
    try {
      await enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      
      // Refresh data after enrollment
      await refreshTokenBalance();
      const updatedUserData = await getUserData();
      setUserData(updatedUserData);
      
      // Update course enrollment status
      const updatedCourses = allCourses.map(course => {
        if (course.courseId === courseId) {
          return { ...course, isEnrolled: true };
        }
        return course;
      });
      
      setAllCourses(updatedCourses);
      setEnrolledCourses(prev => [...prev, updatedCourses.find(c => c.courseId === courseId)]);
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
    setPurchaseLoading({ ...purchaseLoading, [courseId]: false });
  };

  if (!account) {
    return (
      <div className="dashboard-full-width w-full min-h-screen p-6 text-center text-red-400">
        <div className="w-full mx-auto mt-20">
          <Trophy size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>Please connect your wallet to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-full-width w-full min-h-screen p-6 text-center text-cyan-400">
        <div className="w-full mx-auto mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-full-width w-full min-h-screen p-6 text-white">
      {/* Header */}
      <AdminPanel />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-400 mt-1">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <Coins size={20} className="text-yellow-400" />
            <span className="font-semibold">{currentTokenBalance.toFixed(2)} SBT</span>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Courses Enrolled</p>
              <p className="text-2xl font-bold text-cyan-400">{enrolledCourses.length}</p>
            </div>
            <BookOpen size={24} className="text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{userData?.coursesCompleted || 0}</p>
            </div>
            <CheckCircle size={24} className="text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tokens Earned</p>
              <p className="text-2xl font-bold text-purple-400">{parseFloat(userData?.tokensEarned || 0).toFixed(2)}</p>
            </div>
            <Award size={24} className="text-purple-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Test Score</p>
              <p className="text-2xl font-bold text-yellow-400">{userData?.testScore || 0}</p>
            </div>
            <Target size={24} className="text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      {enrolledCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Play size={24} className="text-cyan-400" />
            Continue Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.courseId} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-cyan-500 transition-colors">
                <div className="h-40 bg-gray-700 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img 
                      src={`https://gateway.pinata.cloud/ipfs/${course.thumbnail}`} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play size={32} className="text-cyan-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">by {course.instructor?.slice(0, 10)}...</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {course.category && (
                        <span className="bg-cyan-600 px-2 py-1 rounded text-white">{course.category}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => navigate(`/courses/${course.courseId}`)}
                      className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700 transition-colors text-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-cyan-400" />
          Available Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {allCourses.filter(course => !course.isEnrolled).map((course) => (
            <div key={course.courseId} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-cyan-500 transition-colors">
              <div className="h-40 bg-gray-700 flex items-center justify-center relative">
                {course.thumbnail ? (
                  <img 
                    src={`https://gateway.pinata.cloud/ipfs/${course.thumbnail}`} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen size={32} className="text-cyan-400" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  {course.category && (
                    <span className="text-xs bg-cyan-600 px-2 py-1 rounded">{course.category}</span>
                  )}
                  {course.difficulty && (
                    <span className="text-xs bg-purple-600 px-2 py-1 rounded ml-1">{course.difficulty}</span>
                  )}
                </div>
                <h3 className="font-semibold mb-1 text-sm">{course.title}</h3>
                <p className="text-gray-400 text-xs mb-2">by {course.instructor?.slice(0, 10)}...</p>
                {course.duration && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Clock size={10} />
                    <span>{course.duration}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Coins size={16} className="text-yellow-400" />
                    <span className="font-semibold">{course.price} SKL</span>
                  </div>
                  <button 
                    onClick={() => handleEnrollInCourse(course.courseId, course.price)}
                    disabled={purchaseLoading[course.courseId] || currentTokenBalance < course.price}
                    className={`px-3 py-1 rounded transition-colors text-sm flex items-center gap-1 ${
                      currentTokenBalance < course.price 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-cyan-600 hover:bg-cyan-700'
                    }`}
                  >
                    {purchaseLoading[course.courseId] ? (
                      'Enrolling...'
                    ) : (
                      <>
                        <ShoppingCart size={12} />
                        Enroll
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/test')}
            className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Target size={20} className="text-cyan-400" />
            <div className="text-left">
              <p className="font-semibold">
                {userData?.hasCompletedTest ? 'Retake Test' : 'Take Test'}
              </p>
              <p className="text-sm text-gray-400">
                {userData?.hasCompletedTest ? 'Improve your score' : 'Earn tokens'}
              </p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ShoppingCart size={20} className="text-green-400" />
            <div className="text-left">
              <p className="font-semibold">Buy Tokens</p>
              <p className="text-sm text-gray-400">Purchase with ETH</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/instructor')}
            className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Award size={20} className="text-purple-400" />
            <div className="text-left">
              <p className="font-semibold">Create Course</p>
              <p className="text-sm text-gray-400">Share your knowledge</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;