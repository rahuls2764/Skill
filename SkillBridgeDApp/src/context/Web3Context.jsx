// src/context/Web3Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import SkillBridge from '../../artifacts/contracts/SkillBridge.sol/SkillBridge.json';
import SkillBridgeNFT from '../../artifacts/contracts/SkillBridgeNFT.sol/SkillBridgeNFT.json';
import SkillBridgeToken from '../../artifacts/contracts/SkillBridgeToken.sol/SkillBridgeToken.json';


// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
const CONTRACT_ADDRESSES = {
  SKILLBRIDGE_TOKEN: "0x600ed547581018Ea2777fb1B7e956B0CBE215241", // Replace with deployed token address
  SKILLBRIDGE_NFT: "0x0AFF4Ae9A0867270c14C0b992E57CE87b6d7cf75",   // Replace with deployed NFT address
  SKILLBRIDGE_MAIN: "0x4E8718d943496706C36c761a36B9A55f86baA652"   // Replace with deployed main contract address
};

// Contract ABIs (simplified for demo - use full ABI in production)
const SKILLBRIDGE_ABI = SkillBridge;

const TOKEN_ABI = SkillBridgeToken;

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
      let web3Provider = provider;
      
      if (!web3Provider) {
        web3Provider = await initializeWeb3();
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
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
      console.log('Initializing contracts...');
      console.log('SKILLBRIDGE_ABI:', SKILLBRIDGE_ABI);
      console.log('TOKEN_ABI:', TOKEN_ABI);

      // Handle different ABI formats
      const skillBridgeABI = SKILLBRIDGE_ABI || SKILLBRIDGE_ABI;
      const tokenABI = TOKEN_ABI || TOKEN_ABI;

      if (!skillBridgeABI || !tokenABI) {
        throw new Error('ABI not found');
      }

      const skillBridgeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SKILLBRIDGE_MAIN,
        skillBridgeABI,
        web3Signer
      );

      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SKILLBRIDGE_TOKEN,
        tokenABI,
        web3Signer
      );

      console.log('Contracts initialized successfully');
      setContracts({
        skillBridge: skillBridgeContract,
        token: tokenContract
      });
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      console.error('Error details:', error.message);
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

  // Get user token balance - FIXED VERSION
  const getTokenBalance = async (userAddress) => {
    try {
      console.log('Getting token balance for:', userAddress);
      console.log('Contracts available:', !!contracts.skillBridge);
      
      // Validate user address
      if (!userAddress || typeof userAddress !== 'string') {
        throw new Error("Invalid user address");
      }
      
      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
        throw new Error("Invalid Ethereum address format");
      }
      
      // Check if contracts are initialized
      if (!contracts.skillBridge) {
        console.log('Contract not available, attempting to reconnect...');
        throw new Error("SkillBridge contract not initialized");
      }

      // Call the contract method
      console.log('Calling getUserTokenBalance...');
      const balance = await contracts.skillBridge.getUserTokenBalance(userAddress);
      const formattedBalance = ethers.formatUnits(balance, 18);
      console.log('Balance retrieved successfully:', formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error("Failed to get token balance:", error);
      
      // Provide more specific error messages
      if (error.message.includes("call revert exception")) {
        // This might mean the user doesn't exist in the contract yet
        return "0";
      } else if (error.message.includes("network")) {
        throw new Error("Network connection error");
      } else {
        throw error;
      }
    }
  };

  // Get user data
 const getUserData = async (userAddress) => {

  try {
    if (!userAddress) throw new Error(`Invalid user address ${userAddress}`);

    const data = await contracts.skillBridge.getUser(userAddress);

    const isEmpty = data[0] === ethers.ZeroAddress;

    if (isEmpty) {
      return {
        userAddress,
        testScore: 0,
        tokensEarned: "0.0",
        coursesCompleted: 0,
        hasCompletedTest: false,
      };
    }

    return {
      userAddress: data[0],
      testScore: Number(data[1]),
      tokensEarned: ethers.formatUnits(data[2], 18),
      coursesCompleted: Number(data[3]),
      hasCompletedTest: data[4],
    };
  } catch (error) {
    console.error("Failed to get user data:", error);
    throw error;
  }
};


  // Complete test
  const completeTest = async (score) => {
    if (!contracts.skillBridge) throw new Error('Contract not initialized');
    try {
      console.log("Submitting test with score:", score);
      const tx = await contracts.skillBridge.completeTest(score);
      await tx.wait();
      toast.success('Test completed successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to complete test:', error);

      // Try to decode the revert reason
      const reason = error?.error?.message || error?.reason || error?.message || "Unknown error";
      toast.error(`Failed to complete test: ${reason}`);
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
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          
          const network = await web3Provider.getNetwork();
          setChainId(Number(network.chainId));

          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const web3Signer = await web3Provider.getSigner();
            setSigner(web3Signer);
            await initializeContracts(web3Signer);
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
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
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