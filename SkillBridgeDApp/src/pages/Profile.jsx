// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Award, 
  Coins, 
  BookOpen, 
  Edit3, 
  Save,
  X,
  Trophy,
  Star,
  Calendar,
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle,
  TrendingUp,
  Target,
  Clock,
  Medal
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { account, getUserData, getUserTokenBalance, updateUserProfile } = useWeb3();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: '',
    skills: '',
    location: ''
  });

  // Mock NFTs and achievements data
  const mockNFTs = [
    { id: '1', name: 'React Master', course: 'Advanced React Patterns', rarity: 'Epic', date: '2025-01-15' },
    { id: '2', name: 'Blockchain Expert', course: 'Solidity Smart Contracts', rarity: 'Legendary', date: '2025-02-01' },
    { id: '3', name: 'Design Guru', course: 'UI/UX Design Fundamentals', rarity: 'Rare', date: '2025-02-10' }
  ];

  const mockAchievements = [
    { id: '1', title: 'Early Adopter', description: 'Joined SkillBridge in the first month', icon: 'trophy', unlocked: true },
    { id: '2', title: 'Quick Learner', description: 'Completed 3 courses in one week', icon: 'star', unlocked: true },
    { id: '3', title: 'Test Champion', description: 'Scored 100% on entry test', icon: 'target', unlocked: userData?.testScore === 10 },
    { id: '4', title: 'Token Collector', description: 'Earned 1000+ SKL tokens', icon: 'coins', unlocked: tokenBalance >= 1000 }
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
          setEditForm({
            username: data?.username || '',
            email: data?.email || '',
            bio: data?.bio || '',
            skills: data?.skills || '',
            location: data?.location || ''
          });
        } catch (error) {
          toast.error('Error fetching profile data');
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [account, getUserData, getUserTokenBalance]);

  const handleEditChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      await updateUserProfile(editForm);
      setUserData({ ...userData, ...editForm });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error updating profile');
    }
    setSaveLoading(false);
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(account);
    toast.success('Wallet address copied!');
  };

  const formatWalletAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400 border-yellow-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getAchievementIcon = (icon) => {
    switch (icon) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'target': return Target;
      case 'coins': return Coins;
      default: return Medal;
    }
  };

  if (!account) {
    return (
      <div className="p-6 text-center text-red-400">
        <div className="max-w-md mx-auto mt-20">
          <User size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-cyan-400">
        <div className="max-w-md mx-auto mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-400 mt-1">Manage your SkillBridge account</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
              {(userData?.username || 'User')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userData?.username || 'Anonymous User'}</h2>
              <p className="text-gray-400">{userData?.email || 'No email provided'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Wallet size={16} className="text-cyan-400" />
                <span className="text-sm font-mono">{formatWalletAddress(account)}</span>
                <button 
                  onClick={copyWalletAddress}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => handleEditChange('username', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            ) : (
              <p className="text-gray-300">{userData?.username || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            ) : (
              <p className="text-gray-300">{userData?.email || 'Not set'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => handleEditChange('bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-300">{userData?.bio || 'No bio provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.skills}
                onChange={(e) => handleEditChange('skills', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                placeholder="React, Node.js, Solidity..."
              />
            ) : (
              <p className="text-gray-300">{userData?.skills || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => handleEditChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                placeholder="City, Country"
              />
            ) : (
              <p className="text-gray-300">{userData?.location || 'Not specified'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">SKL Tokens</p>
              <p className="text-2xl font-bold text-yellow-400">{tokenBalance}</p>
            </div>
            <Coins size={24} className="text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Courses Completed</p>
              <p className="text-2xl font-bold text-green-400">{userData?.coursesCompleted?.length || 0}</p>
            </div>
            <CheckCircle size={24} className="text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">NFTs Earned</p>
              <p className="text-2xl font-bold text-purple-400">{userData?.nftsEarned?.length || mockNFTs.length}</p>
            </div>
            <Award size={24} className="text-purple-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Test Score</p>
              <p className="text-2xl font-bold text-cyan-400">{userData?.testScore || 0}/10</p>
            </div>
            <Target size={24} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* NFT Collection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Award size={24} className="text-purple-400" />
          NFT Certificates
        </h2>
        {mockNFTs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockNFTs.map((nft) => (
              <div key={nft.id} className={`bg-gray-800 rounded-lg border-2 p-6 hover:border-opacity-80 transition-colors ${getRarityColor(nft.rarity)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${getRarityColor(nft.rarity)} border`}>
                    {nft.rarity}
                  </div>
                  <Award size={20} className={getRarityColor(nft.rarity).split(' ')[0]} />
                </div>
                <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{nft.course}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>Earned: {new Date(nft.date).toLocaleDateString()}</span>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm flex items-center justify-center gap-2">
                  <ExternalLink size={14} />
                  View on OpenSea
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <Award size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold mb-2 text-gray-400">No NFT Certificates Yet</h3>
            <p className="text-gray-500 mb-4">Complete courses and pass quizzes to earn NFT certificates</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy size={24} className="text-yellow-400" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAchievements.map((achievement) => {
            const IconComponent = getAchievementIcon(achievement.icon);
            return (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  achievement.unlocked 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-gray-900 border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    achievement.unlocked 
                      ? 'bg-yellow-600' 
                      : 'bg-gray-700'
                  }`}>
                    <IconComponent size={20} className={
                      achievement.unlocked 
                        ? 'text-white' 
                        : 'text-gray-500'
                    } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${
                        achievement.unlocked 
                          ? 'text-white' 
                          : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      {achievement.unlocked && (
                        <CheckCircle size={16} className="text-green-400" />
                      )}
                    </div>
                    <p className={`text-sm ${
                      achievement.unlocked 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Journey */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-cyan-400" />
          Learning Journey
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold">Joined SkillBridge</p>
                <p className="text-sm text-gray-400">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recently'}</p>
              </div>
            </div>
            <div className="text-sm text-cyan-400">Completed</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold">Completed Entry Test</p>
                <p className="text-sm text-gray-400">Score: {userData?.testScore || 0}/10</p>
              </div>
            </div>
            <div className="text-sm text-cyan-400">Completed</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                <Clock size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold">First Course Enrollment</p>
                <p className="text-sm text-gray-400">Start your learning journey</p>
              </div>
            </div>
            <div className="text-sm text-yellow-400">
              {userData?.coursesEnrolled?.length > 0 ? 'Completed' : 'In Progress'}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Medal size={16} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-400">Earn First NFT Certificate</p>
                <p className="text-sm text-gray-500">Complete a course and pass the quiz</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;