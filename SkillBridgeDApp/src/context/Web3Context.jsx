// src/context/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import SKILLBRIDGE_ABI from "../abi/SkillBridgeMain.json";
import TOKEN_ABI from "../abi/SkillBridgeToken.json";

// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
const CONTRACT_ADDRESSES = {
  SKILLBRIDGE_TOKEN: "0x290A3F3b61dF4508ACAc89D1B39a2a2d52Ac58e2", // Replace with deployed token address
  SKILLBRIDGE_NFT: "0x69A1135c3992b9F23A58d4f1dCe013C85B0612b4",   // Replace with deployed NFT address
  SKILLBRIDGE_MAIN: "0xBE6807Fc49dF3D3fAaC2D1fc1e66C46B5faE40A8"
};

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
  const [tokenBalance, setTokenBalance] = useState('0'); // Added token balance state
  const [isConnected, setIsConnected] = useState(false);

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
        setIsConnected(true);
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
        SKILLBRIDGE_ABI.abi,
        web3Signer
      );

      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SKILLBRIDGE_TOKEN,
        TOKEN_ABI.abi,
        web3Signer
      );

      setContracts({
        skillBridge: skillBridgeContract,
        token: tokenContract
      });

      // Fetch initial token balance
      await refreshTokenBalance(tokenContract, web3Signer.address);
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContracts({});
    setTokenBalance('0');
    setIsConnected(false);
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

  // Refresh token balance and update state
  const refreshTokenBalance = async (tokenContract = null, address = null) => {
    const contract = tokenContract || contracts.token;
    const userAddress = address || account;
    
    if (!contract || !userAddress) {
      setTokenBalance('0');
      return '0';
    }

    try {
      const balance = await contract.balanceOf(userAddress);
      const formattedBalance = ethers.formatEther(balance);
      setTokenBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Failed to refresh token balance:', error);
      setTokenBalance('0');
      return '0';
    }
  };

  // Get user token balance
  const getTokenBalance = async () => {
    if (!contracts.token || !account) return '0';
    try {
      const balance = await contracts.token.balanceOf(account);
      const formattedBalance = ethers.formatEther(balance);
      setTokenBalance(formattedBalance); // Update state as well
      return formattedBalance;
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
      const enrolledCourses = await contracts.skillBridge.getUserEnrolledCourses(account);
      
      // Since NFTs = completed courses, use coursesCompleted count
      const coursesCompleted = Number(userData[3]);
        // Before retake, add these logs:
        console.log("User balance:", ethers.formatEther(await contracts.token.balanceOf(account)));
        console.log("Contract balance:", ethers.formatEther(await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN)));
        // console.log("Required fee:", ethers.formatEther(retakeFee));
        // console.log("Expected reward:", ethers.formatEther(reward));

      return {
        userAddress: userData[0],
        testScore: Number(userData[1]),
        tokensEarned: ethers.formatEther(userData[2]),
        coursesCompleted: coursesCompleted,
        hasCompletedTest: userData[4],
        coursesEnrolled: enrolledCourses.map(id => id.toString()),
        nftsEarned: coursesCompleted // Since 1 NFT = 1 completed course
      };
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  };

  // Complete test
  
  const isContractOwner = async () => {
    if (!contracts.skillBridge || !account) return false;
    try {
      const owner = await contracts.skillBridge.owner();
      return owner.toLowerCase() === account.toLowerCase();
    } catch (error) {
      console.error("Failed to check owner:", error);
      return false;
    }
  }

  // 2. Get contract token balance
const getContractTokenBalance = async () => {
  if (!contracts.token || !CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN) return "0";
  try {
    const balance = await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Failed to get contract balance:", error);
    return "0";
  }
};

// 3. Transfer tokens to contract (Admin only)
const fundContract = async (amount) => {
  if (!contracts.token || !account) {
    throw new Error("Contracts not initialized");
  }

  const isOwner = await isContractOwner();
  if (!isOwner) {
    throw new Error("Only contract owner can fund the contract");
  }

  try {
    const amountInWei = ethers.parseEther(amount.toString());
    
    // Check if user has enough balance
    const userBalance = await contracts.token.balanceOf(account);
    if (userBalance < amountInWei) {
      throw new Error(`Insufficient balance. You have ${ethers.formatEther(userBalance)} SBT`);
    }

    console.log(`Transferring ${amount} SBT tokens to contract...`);
    
    const tx = await contracts.token.transfer(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN, amountInWei);
    await tx.wait();
    
    console.log(`Successfully transferred ${amount} SBT tokens to contract`);
    toast.success(`Contract funded with ${amount} SBT tokens`);
    
    // Refresh balances
    await refreshTokenBalance();
    
    return tx;
  } catch (error) {
    console.error("Failed to fund contract:", error);
    toast.error(`Failed to fund contract: ${error.message}`);
    throw error;
  }
};
// handle quiz complete
  const completeTest = async (score) => {
    if (!contracts.skillBridge || !contracts.token) throw new Error("Contracts not initialized");
    
    const reward = ethers.parseEther((score * 1).toString());
    const retakeFee = ethers.parseEther("2");
    console.log("User balance:", ethers.formatEther(await contracts.token.balanceOf(account)));
console.log("Contract balance:", ethers.formatEther(await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN)));
console.log("Required fee:", ethers.formatEther(retakeFee));
console.log("Expected reward:", ethers.formatEther(reward));
    
    try {
      const userData = await contracts.skillBridge.users(account);
      const hasCompleted = userData[4];
      
      let tx;
      
      if (!hasCompleted) {
        // First time test - check if contract has enough tokens for reward
        const contractBalance = await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
        if (contractBalance < reward) {
          throw new Error("Contract has insufficient tokens for reward");
        }
        
        tx = await contracts.skillBridge.completeTest(score);
      } else {
        // Retake - check user balance
        const userBalance = await contracts.token.balanceOf(account);
        if (userBalance < retakeFee) {
          throw new Error(`Insufficient balance. You need ${ethers.formatEther(retakeFee)} SKL tokens for retake fee`);
        }
        
        // Check contract balance for reward
        const contractBalance = await contracts.token.balanceOf(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
        if (contractBalance < reward) {
          throw new Error("Contract has insufficient tokens for reward");
        }
        
        // Check current allowance
        const currentAllowance = await contracts.token.allowance(account, CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN);
        console.log("Current allowance:", ethers.formatEther(currentAllowance));
        console.log("Required fee:", ethers.formatEther(retakeFee));
        
        if (currentAllowance < retakeFee) {
          console.log("Approving tokens...");
          const approveTx = await contracts.token.approve(CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN, retakeFee);
          await approveTx.wait();
          console.log("Approval successful");
        }
        
        // Now call retakeTest
        tx = await contracts.skillBridge.retakeTest(score, retakeFee);
      }
      
      await tx.wait();
      await refreshTokenBalance();
      
      toast.success(`Test ${hasCompleted ? "retaken" : "completed"} successfully!`);
      return tx;
    } catch (error) {
      console.error("Failed to submit test:", error);
      toast.error(`Test submission failed: ${error.message}`);
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
      const course = await contracts.skillBridge.courses(courseId);
      const coursePrice = course[3]; // ✅ index 3 = price (uint256)
  
      // Check if user has enough tokens
      const currentBalance = await contracts.token.balanceOf(account);
      if (currentBalance < coursePrice) {
        throw new Error('Insufficient token balance');
      }
  
      // Approve token allowance
      const approveTx = await contracts.token.approve(
        CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN,
        coursePrice
      );
      await approveTx.wait();
  
      // Enroll in course
      const enrollTx = await contracts.skillBridge.enrollInCourse(courseId);
      await enrollTx.wait();

      // Refresh token balance after enrollment
      await refreshTokenBalance();
  
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
      
      // Refresh token balance after purchase
      await refreshTokenBalance();
      
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
          console.log("Course data:", course);
          
          const courseId = Number(course[0]);
          const instructor = course[1];
          const title = course[2];
          const price = ethers.formatEther(course[3]);
          const metadataCID = course[4];
          const isActive = course[5];
          const createdAt = new Date(Number(course[6]) * 1000);
  
          if (isActive && metadataCID) {
            const metadataRes = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataCID}`);
            const metadata = await metadataRes.json();
  
            courses.push({
              courseId,
              instructor,
              title,
              price: parseFloat(price), // Convert to number for easier comparison
              metadataCID,
              isActive,
              createdAt,
              ...metadata // includes category, description, thumbnail, difficulty, duration, etc.
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

  // Get course details
  const getCourseDetails = async (courseId) => {
    if (!contracts.skillBridge) throw new Error("SkillBridge contract not loaded");

    try {
      const course = await contracts.skillBridge.courses(courseId);
      const metadataCID = course.metadataCID;

      const metadataRes = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataCID}`);
      const metadata = await metadataRes.json();

      return {
        courseId,
        ...metadata,
        instructor: course.instructor,
        price: Number(ethers.formatUnits(course.price, 18)),
        createdAt: Number(course.createdAt),
        isActive: course.isActive
      };
    } catch (error) {
      console.error('Failed to get course details:', error);
      throw error;
    }
  };

  // Check if user has access to course
  const hasAccessToCourse = async (userAddress, courseId) => {
    if (!contracts.skillBridge) return false;
    try {
      const isEnrolled = await contracts.skillBridge.hasAccessToCourse(userAddress, courseId);
      return isEnrolled;
    } catch (err) {
      console.error(`Failed to check enrollment for course ${courseId}:`, err);
      return false;
    }
  };

  // Get ETH balance
  const getEthBalance = async () => {
    if (!provider || !account) return '0';
    try {
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get ETH balance:', error);
      return '0';
    }
  };

  // Auto-refresh token balance periodically
  useEffect(() => {
    let intervalId;
    
    if (isConnected && contracts.token && account) {
      // Refresh balance immediately
      refreshTokenBalance();
      
      // Set up periodic refresh every 30 seconds
      intervalId = setInterval(() => {
        refreshTokenBalance();
      }, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, contracts.token, account]);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (contracts.token) {
          refreshTokenBalance();
        }
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(Number(chainId));
      // Optionally refresh contracts or show network switch notification
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, contracts.token]);

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            setAccount(accounts[0]);
            setIsConnected(true);
            
            const web3Signer = await web3Provider.getSigner();
            setSigner(web3Signer);
            
            const network = await web3Provider.getNetwork();
            setChainId(Number(network.chainId));
            
            await initializeContracts(web3Signer);
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const value = {
    // State
    account,
    provider,
    signer,
    contracts,
    loading,
    chainId,
    tokenBalance,
    isConnected,
    
    // Functions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    initializeWeb3,
    
    // Token functions
    getTokenBalance,
    refreshTokenBalance,
    getEthBalance,
    
    // Contract functions
    getUserData,
    completeTest,
    createCourse,
    enrollInCourse,
    purchaseTokens,
    getAllCourses,
    getCourseDetails,
    hasAccessToCourse,
    isContractOwner,
    getContractTokenBalance,
    fundContract,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};