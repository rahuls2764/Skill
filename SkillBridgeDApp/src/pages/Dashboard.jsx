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

const Dashboard = () => {
  const { account, getUserData, purchaseCourse, getUserTokenBalance } = useWeb3();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState({});

  // Sample courses data - in real app, fetch from API
  const availableCourses = [
    {
      id: '1',
      title: 'Advanced React Patterns',
      instructor: 'Sarah Chen',
      price: 50,
      rating: 4.8,
      students: 1234,
      duration: '8 hours',
      category: 'Frontend',
      thumbnail: '/api/placeholder/300/200',
      description: 'Master advanced React patterns and hooks for professional development.'
    },
    {
      id: '2',
      title: 'Solidity Smart Contracts',
      instructor: 'Alex Kumar',
      price: 75,
      rating: 4.9,
      students: 856,
      duration: '12 hours',
      category: 'Blockchain',
      thumbnail: '/api/placeholder/300/200',
      description: 'Learn to build secure and efficient smart contracts on Ethereum.'
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      instructor: 'Maria Rodriguez',
      price: 40,
      rating: 4.7,
      students: 2145,
      duration: '6 hours',
      category: 'Design',
      thumbnail: '/api/placeholder/300/200',
      description: 'Create beautiful and user-friendly interfaces with modern design principles.'
    },
    {
      id: '4',
      title: 'Node.js Backend Development',
      instructor: 'David Park',
      price: 60,
      rating: 4.6,
      students: 987,
      duration: '10 hours',
      category: 'Backend',
      thumbnail: '/api/placeholder/300/200',
      description: 'Build scalable server-side applications with Node.js and Express.'
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (account) {
        setLoading(true);
        try {
          const data = await getUserData();
          const balance = await getUserTokenBalance();
          setUserData(data);
          setTokenBalance(balance);
          
          // Mock enrolled and completed courses based on user data
          if (data?.coursesEnrolled) {
            const enrolled = availableCourses.filter(course => 
              data.coursesEnrolled.includes(course.id)
            );
            setEnrolledCourses(enrolled);
          }
          
          if (data?.coursesCompleted) {
            const completed = availableCourses.filter(course => 
              data.coursesCompleted.includes(course.id)
            );
            setCompletedCourses(completed);
          }
        } catch (error) {
          toast.error('Error fetching user data');
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [account, getUserData, getUserTokenBalance]);

  const handlePurchaseCourse = async (courseId, price) => {
    if (tokenBalance < price) {
      toast.error(`Insufficient tokens. You need ${price} SKL tokens.`);
      return;
    }

    setPurchaseLoading({ ...purchaseLoading, [courseId]: true });
    try {
      await purchaseCourse(courseId);
      toast.success('Course purchased successfully!');
      // Refresh user data
      const updatedData = await getUserData();
      const updatedBalance = await getUserTokenBalance();
      setUserData(updatedData);
      setTokenBalance(updatedBalance);
    } catch (error) {
      toast.error('Error purchasing course');
    }
    setPurchaseLoading({ ...purchaseLoading, [courseId]: false });
  };

  if (!account) {
    return (
      <div className="p-6 text-center text-red-400">
        <div className="max-w-md mx-auto mt-20">
          <Trophy size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>Please connect your wallet to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-cyan-400">
        <div className="max-w-md mx-auto mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-400 mt-1">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <Coins size={20} className="text-yellow-400" />
            <span className="font-semibold">{tokenBalance} SKL</span>
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
              <p className="text-2xl font-bold text-green-400">{completedCourses.length}</p>
            </div>
            <CheckCircle size={24} className="text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">NFTs Earned</p>
              <p className="text-2xl font-bold text-purple-400">{userData?.nftsEarned?.length || 0}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-cyan-500 transition-colors">
                <div className="h-40 bg-gray-700 flex items-center justify-center">
                  <Play size={32} className="text-cyan-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">by {course.instructor}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Progress: 60% {/* Mock progress */}
                    </div>
                    <button 
                      onClick={() => navigate(`/course/${course.id}`)}
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
          Popular Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableCourses.map((course) => {
            const isEnrolled = enrolledCourses.some(c => c.id === course.id);
            const isCompleted = completedCourses.some(c => c.id === course.id);
            
            return (
              <div key={course.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-cyan-500 transition-colors">
                <div className="h-40 bg-gray-700 flex items-center justify-center relative">
                  <BookOpen size={32} className="text-cyan-400" />
                  {isCompleted && (
                    <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs bg-cyan-600 px-2 py-1 rounded">{course.category}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-400">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">{course.title}</h3>
                  <p className="text-gray-400 text-xs mb-2">by {course.instructor}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users size={10} />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Coins size={16} className="text-yellow-400" />
                      <span className="font-semibold">{course.price} SKL</span>
                    </div>
                    {isEnrolled ? (
                      <button 
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        {isCompleted ? 'Review' : 'Continue'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePurchaseCourse(course.id, course.price)}
                        disabled={purchaseLoading[course.id] || tokenBalance < course.price}
                        className={`px-3 py-1 rounded transition-colors text-sm flex items-center gap-1 ${
                          tokenBalance < course.price 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-cyan-600 hover:bg-cyan-700'
                        }`}
                      >
                        {purchaseLoading[course.id] ? (
                          'Buying...'
                        ) : (
                          <>
                            <ShoppingCart size={12} />
                            Buy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
              <p className="font-semibold">Retake Test</p>
              <p className="text-sm text-gray-400">Earn more tokens</p>
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
              <p className="font-semibold">Teach Course</p>
              <p className="text-sm text-gray-400">Share your skills</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;