// src/context/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
const CONTRACT_ADDRESSES = {
  SKILLBRIDGE_TOKEN: "0x...", // Replace with deployed token address
  SKILLBRIDGE_NFT: "0x...",   // Replace with deployed NFT address
  SKILLBRIDGE_MAIN: "0x..."   // Replace with deployed main contract address
};

// Contract ABIs (simplified for demo - use full ABI in production)
const SKILLBRIDGE_ABI = [
  // Read functions
  "function courses(uint256) view returns (uint256, address, string, string, uint256, string, string, string, uint256, bool, uint256)",
  "function users(address) view returns (address, uint256, uint256, uint256, bool)",
  "function hasAccessToCourse(address, uint256) view returns (bool)",
  "function hasCompletedCourse(address, uint256) view returns (bool)",
  "function getUserEnrolledCourses(address) view returns (uint256[])",
  "function getInstructorCourses(address) view returns (uint256[])",
  "function getUserTokenBalance(address) view returns (uint256)",
  "function getInstructorEarnings(address) view returns (uint256)",
  "function nextCourseId() view returns (uint256)",
  
  // Write functions
  "function completeTest(uint256) external",
  "function createCourse(string, string, uint256, string, string, string) external returns (uint256)",
  "function enrollInCourse(uint256) external",
  "function completeCourse(uint256, string) external",
  "function purchaseTokens() external payable",
  "function convertTokensToETH(uint256) external",
  "function withdrawInstructorEarnings() external",
  
  // Events
  "event TestCompleted(address indexed user, uint256 score, uint256 tokensEarned)",
  "event CourseCreated(uint256 indexed courseId, address indexed instructor, string title, uint256 price)",
  "event CourseEnrolled(address indexed student, uint256 indexed courseId, uint256 price)",
  "event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 nftTokenId)"
];

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) external returns (bool)",
  "function approve(address, uint256) external returns (bool)",
  "function allowance(address, address) view returns (uint256)"
];

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Initialize Web3
  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const network = await web3Provider.getNetwork();
        setChainId(Number(network.chainId));
        
        return web3Provider;
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
        toast.error('Failed to initialize Web3');
      }
    } else {
      toast.error('Please install MetaMask');
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!provider) {
        await initializeWeb3();
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const web3Provider = provider || new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);
        
        // Initialize contracts
        await initializeContracts(web3Signer);
        
        toast.success('Wallet connected successfully!');
        return accounts[0];
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Initialize contracts
  const initializeContracts = async (web3Signer) => {
    try {
      const skillBridgeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN,
        SKILLBRIDGE_ABI,
        web3Signer
      );

      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SKILLBRIDGE_TOKEN,
        TOKEN_ABI,
        web3Signer
      );

      setContracts({
        skillBridge: skillBridgeContract,
        token: tokenContract
      });
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContracts({});
    toast.success('Wallet disconnected');
  };

  // Switch network (if needed)
  const switchNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network');
    }
  };

  // Get user token balance
  const getTokenBalance = async () => {
    if (!contracts.token || !account) return '0';
    try {
      const balance = await contracts.token.balanceOf(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  };

  // Get user data
  const getUserData = async () => {
    if (!contracts.skillBridge || !account) return null;
    try {
      const userData = await contracts.skillBridge.users(account);
      return {
        userAddress: userData[0],
        testScore: Number(userData[1]),
        tokensEarned: ethers.formatEther(userData[2]),
        coursesCompleted: Number(userData[3]),
        hasCompletedTest: userData[4]
      };
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  };

  // Complete test
  const completeTest = async (score) => {
    if (!contracts.skillBridge) throw new Error('Contract not initialized');
    try {
      const tx = await contracts.skillBridge.completeTest(score);
      await tx.wait();
      toast.success('Test completed successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to complete test:', error);
      toast.error('Failed to complete test');
      throw error;
    }
  };

  // Create course
  const createCourse = async (courseData) => {
    if (!contracts.skillBridge) throw new Error('Contract not initialized');
    try {
      const tx = await contracts.skillBridge.createCourse(
        courseData.title,
        courseData.description,
        ethers.parseEther(courseData.price.toString()),
        courseData.videoIPFSHash,
        courseData.thumbnailIPFSHash,
        courseData.category
      );
      await tx.wait();
      toast.success('Course created successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error('Failed to create course');
      throw error;
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    if (!contracts.skillBridge || !contracts.token) throw new Error('Contracts not initialized');
    try {
      // First approve token spending
      const course = await contracts.skillBridge.courses(courseId);
      const coursePrice = course[4]; // price is at index 4
      
      const approveTx = await contracts.token.approve(
        CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN,
        coursePrice
      );
      await approveTx.wait();
      
      // Then enroll in course
      const enrollTx = await contracts.skillBridge.enrollInCourse(courseId);
      await enrollTx.wait();
      toast.success('Enrolled in course successfully!');
      return enrollTx;
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      toast.error('Failed to enroll in course');
      throw error;
    }
  };

  // Purchase tokens
  const purchaseTokens = async (ethAmount) => {
    if (!contracts.skillBridge) throw new Error('Contract not initialized');
    try {
      const tx = await contracts.skillBridge.purchaseTokens({
        value: ethers.parseEther(ethAmount.toString())
      });
      await tx.wait();
      toast.success('Tokens purchased successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to purchase tokens:', error);
      toast.error('Failed to purchase tokens');
      throw error;
    }
  };

  // Get all courses
  const getAllCourses = async () => {
    if (!contracts.skillBridge) return [];
    try {
      const nextId = await contracts.skillBridge.nextCourseId();
      const courses = [];
      
      for (let i = 1; i < nextId; i++) {
        try {
          const course = await contracts.skillBridge.courses(i);
          if (course[9]) { // isActive
            courses.push({
              courseId: Number(course[0]),
              instructor: course[1],
              title: course[2],
              description: course[3],
              price: ethers.formatEther(course[4]),
              videoIPFSHash: course[5],
              thumbnailIPFSHash: course[6],
              category: course[7],
              enrollmentCount: Number(course[8]),
              isActive: course[9],
              createdAt: new Date(Number(course[10]) * 1000)
            });
          }
        } catch (error) {
          console.error(`Failed to fetch course ${i}:`, error);
        }
      }
      
      return courses;
    } catch (error) {
      console.error('Failed to get courses:', error);
      return [];
    }
  };

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      }
    };

    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    contracts,
    loading,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getTokenBalance,
    getUserData,
    completeTest,
    createCourse,
    enrollInCourse,
    purchaseTokens,
    getAllCourses,
    CONTRACT_ADDRESSES
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};