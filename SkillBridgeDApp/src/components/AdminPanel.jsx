import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { 
    account, 
    isContractOwner, 
    getContractTokenBalance, 
    fundContract,
    tokenBalance 
  } = useWeb3();
  
  const [isOwner, setIsOwner] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is owner on component mount
  useEffect(() => {
    const checkOwnership = async () => {
      if (account && isContractOwner) {
        const ownerStatus = await isContractOwner();
        setIsOwner(ownerStatus);
      }
    };
    checkOwnership();
  }, [account, isContractOwner]);

  // Get contract balance
  useEffect(() => {
    const fetchContractBalance = async () => {
      if (getContractTokenBalance) {
        const balance = await getContractTokenBalance();
        setContractBalance(balance);
      }
    };
    fetchContractBalance();
  }, [getContractTokenBalance]);

  const handleFundContract = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await fundContract(fundAmount);
      setFundAmount('');
      // Refresh contract balance
      const newBalance = await getContractTokenBalance();
      setContractBalance(newBalance);
    } catch (error) {
      console.error("Fund contract error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFund = async (amount) => {
    setLoading(true);
    try {
      await fundContract(amount);
      // Refresh contract balance
      const newBalance = await getContractTokenBalance();
      setContractBalance(newBalance);
    } catch (error) {
      console.error("Quick fund error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show panel if user is not the owner
  if (!isOwner) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 mb-6">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">👑</span>
          Admin Panel
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Balances */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Token Balances</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Your Balance:</span>
                <span className="font-bold text-green-600">{tokenBalance} SBT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Contract Balance:</span>
                <span className="font-bold text-blue-600">{contractBalance} SBT</span>
              </div>
            </div>

            {parseFloat(contractBalance) < 1000 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Contract balance is low. Fund it to enable test rewards.
                </p>
              </div>
            )}
          </div>

          {/* Fund Contract */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Fund Contract</h3>
            
            {/* Quick Fund Buttons */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Quick Fund Options:</p>
              <div className="flex gap-2 flex-wrap">
                {[1000, 5000, 10000, 50000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickFund(amount)}
                    disabled={loading || parseFloat(tokenBalance) < amount}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {amount.toLocaleString()} SBT
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Custom Amount:</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max={tokenBalance}
                />
                <button
                  onClick={handleFundContract}
                  disabled={loading || !fundAmount || parseFloat(fundAmount) <= 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Funding...' : 'Fund'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Contract needs SBT tokens to pay rewards to users</li>
            <li>• Each test gives 1 SBT per score point (max 100 SBT per test)</li>
            <li>• Retake fee is 2 SBT per attempt</li>
            <li>• Recommended: Keep at least 10,000 SBT in contract</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;