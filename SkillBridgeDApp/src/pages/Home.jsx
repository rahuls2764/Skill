// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { 
  BookOpen, 
  Award, 
  Coins, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react';

const Home = () => {
  const { account, connectWallet } = useWeb3();

  const features = [
    {
      icon: Coins,
      title: 'Earn While Learning',
      description: 'Take skill tests and earn platform tokens based on your performance.',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: BookOpen,
      title: 'Quality Courses',
      description: 'Access premium courses from expert instructors worldwide.',
      gradient: 'from-blue-400 to-purple-500'
    },
    {
      icon: Award,
      title: 'NFT Certificates',
      description: 'Earn blockchain-verified certificates as NFTs upon course completion.',
      gradient: 'from-green-400 to-teal-500'
    },
    {
      icon: Users,
      title: 'Global Community',
      description: 'Connect with learners and instructors from around the world.',
      gradient: 'from-pink-400 to-red-500'
    }
  ];

  const stats = [
    { label: 'Active Learners', value: '10,000+', icon: Users },
    { label: 'Courses Available', value: '500+', icon: BookOpen },
    { label: 'NFTs Minted', value: '25,000+', icon: Award },
    { label: 'Tokens Distributed', value: '1M+', icon: Coins }
  ];

  const benefits = [
    'Decentralized learning platform',
    'Blockchain-verified certificates',
    'Transparent reward system',
    'Global accessibility',
    'Peer-to-peer skill exchange',
    'Cryptocurrency payments'
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Learn, Earn, and
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {' '}Certify
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Join the world's first Web3 skill-sharing platform where knowledge pays and certificates are forever.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {account ? (
            <Link
              to="/test"
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <span>Take Skill Test</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <span>Connect Wallet to Start</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <Link
            to="/courses"
            className="flex items-center space-x-2 border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-white/10"
          >
            <BookOpen className="w-5 h-5" />
            <span>Browse Courses</span>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-300">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Why Choose SkillBridge?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of education with blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/15 transition-all duration-200">
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">How It Works</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Simple steps to start your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-bold text-white">Take Assessment</h3>
            <p className="text-gray-300">
              Complete our skill assessment test and earn tokens based on your performance.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-bold text-white">Enroll in Courses</h3>
            <p className="text-gray-300">
              Use your earned tokens to enroll in courses that match your interests and goals.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-bold text-white">Earn NFT Certificate</h3>
            <p className="text-gray-300">
              Complete courses and quizzes to earn blockchain-verified NFT certificates.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              The Future of Education is Here
            </h2>
            <p className="text-gray-300 text-lg">
              SkillBridge combines the best of traditional education with cutting-edge blockchain technology to create a truly revolutionary learning experience.
            </p>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl text-center">
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold">Secure</h4>
              <p className="text-gray-300 text-sm">Blockchain security</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 p-6 rounded-xl text-center">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold">Global</h4>
              <p className="text-gray-300 text-sm">Worldwide access</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 p-6 rounded-xl text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold">Rewarding</h4>
              <p className="text-gray-300 text-sm">Earn while learning</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-xl text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold">Quality</h4>
              <p className="text-gray-300 text-sm">Expert instructors</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-12">
        <h2 className="text-4xl font-bold text-white">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Join thousands of learners who are already earning tokens and building their skills on SkillBridge.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {account ? (
            <>
              <Link
                to="/test"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Start Your Journey
              </Link>
              <Link
                to="/courses"
                className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:bg-white/10"
              >
                Explore Courses
              </Link>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Connect Wallet to Get Started
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;