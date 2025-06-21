// Debug.jsx - Add this component to test your contracts
import React from "react";
import { useWeb3 } from "../context/Web3Context";

const Debug = () => {
  const {
    debugContract,
    getUserData,
    getTokenBalance,
    account,
    chainId,
    isConnected,
  } = useWeb3();

  const handleDebug = async () => {
    console.log("Starting debug...");
    await debugContract();
  };

  const handleTestUserData = async () => {
    console.log("Testing getUserData...");
    const result = await getUserData();
    console.log("User data result:", result);
  };

  const handleTestBalance = async () => {
    console.log("Testing getTokenBalance...");
    const result = await getTokenBalance();
    console.log("Balance result:", result);
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h3>Web3 Debug Panel</h3>
      <div>
        <p>
          <strong>Connected:</strong> {isConnected ? "Yes" : "No"}
        </p>
        <p>
          <strong>Account:</strong> {account || "Not connected"}
        </p>
        <p>
          <strong>Chain ID:</strong> {chainId || "Unknown"}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleDebug} style={{ margin: "5px" }}>
          Run Contract Debug
        </button>
        <button onClick={handleTestUserData} style={{ margin: "5px" }}>
          Test User Data
        </button>
        <button onClick={handleTestBalance} style={{ margin: "5px" }}>
          Test Token Balance
        </button>
      </div>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        Check the browser console for detailed debug information.
      </div>
    </div>
  );
};

export default Debug;
