import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Users, TrendingUp, BookOpen, Zap } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [userTokens, setUserTokens] = useState(0);

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'blockchain', name: 'Blockchain', icon: Zap },
    { id: 'programming', name: 'Programming', icon: BookOpen },
    { id: 'design', name: 'Design', icon: BookOpen },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp }
  ];

  const mockCourses = [
    {
      courseId: '1',
      title: 'Solidity Smart Contract Development',
      description: 'Learn to build secure and efficient smart contracts from scratch',
      instructor: 'Alex Thompson',
      instructorAddress: '0x742d35Cc6634C0532925a3b8D1631',
      price: 150,
      category: 'blockchain',
      enrollmentCount: 1243,
      averageRating: 4.8,
      duration: '8 hours',
      thumbnailIPFSHash: 'QmX4R7T9Y2K8B3N6M9',
      difficulty: 'Intermediate',
      isEnrolled: false
    },
    {
      courseId: '2',
      title: 'React & Web3 Integration',
      description: 'Build decentralized applications with React and Web3 technologies',
      instructor: 'Sarah Chen',
      instructorAddress: '0x9A2f7B8C3D4E5F6G7H8I',
      price: 120,
      category: 'programming',
      enrollmentCount: 987,
      averageRating: 4.6,
      duration: '6 hours',
      thumbnailIPFSHash: 'QmY5S8U0P3L7M9N1K4',
      difficulty: 'Advanced',
      isEnrolled: true
    },
    {
      courseId: '3',
      title: 'NFT Art & Design Fundamentals',
      description: 'Create stunning NFT artwork and understand the digital art market',
      instructor: 'Mike Rodriguez',
      instructorAddress: '0xB8E4F2A6D9C7X5Z3Y1W',
      price: 80,
      category: 'design',
      enrollmentCount: 756,
      averageRating: 4.7,
      duration: '4 hours',
      thumbnailIPFSHash: 'QmZ6T9V2M8K5N7P4Q3',
      difficulty: 'Beginner',
      isEnrolled: false
    }
  ];

  useEffect(() => {
    // Simulate fetching user token balance
    setUserTokens(500);
    setCourses(mockCourses);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.enrollmentCount - a.enrollmentCount;
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const handleEnrollCourse = (courseId, price) => {
    if (userTokens >= price) {
      // Simulate enrollment
      setCourses(prev => prev.map(course => 
        course.courseId === courseId 
          ? { ...course, isEnrolled: true, enrollmentCount: course.enrollmentCount + 1 }
          : course
      ));
      setUserTokens(prev => prev - price);
    } else {
      alert(`Insufficient tokens! You need ${price - userTokens} more tokens.`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Discover Courses
              </h1>
              <p className="text-gray-600 mt-2">Learn new skills and earn while you grow</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4 inline mr-2" />
                {userTokens} Tokens
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-32">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 inline mr-3" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Course Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {sortedCourses.map(course => (
                <div key={course.courseId} className="group">
                  <div className="bg-white rounded-2xl shadow-sm border hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Course Thumbnail */}
                    <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        {course.isEnrolled && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Enrolled
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {course.enrollmentCount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{course.instructor}</p>
                            <p className="text-xs text-gray-500">Instructor</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium">{course.averageRating}</span>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 text-indigo-500 mr-1" />
                          <span className="text-lg font-bold text-gray-900">{course.price}</span>
                          <span className="text-sm text-gray-500 ml-1">tokens</span>
                        </div>
                        
                        {course.isEnrolled ? (
                          <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium cursor-default">
                            Enrolled
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnrollCourse(course.courseId, course.price)}
                            disabled={userTokens < course.price}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              userTokens >= course.price
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;