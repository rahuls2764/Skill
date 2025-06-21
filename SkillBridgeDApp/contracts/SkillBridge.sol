// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./SkillBridgeNFT.sol";
import "./SkillBridgeToken.sol";



// Main SkillBridge Platform Contract
contract SkillBridge is Ownable, ReentrancyGuard {
    SkillBridgeToken public platformToken;
    SkillBridgeNFT public certificateNFT;
    
    // Constants
    uint256 public constant TOKENS_PER_TEST_POINT = 10;
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 5;
    uint256 public constant ETH_TO_TOKEN_RATE = 1000;
    
    // Structs
    struct Course {
        uint256 courseId;
        address instructor;
        string title;
        string description;
        uint256 price;
        string videoIPFSHash;
        string thumbnailIPFSHash;
        string category;
        uint256 enrollmentCount;
        bool isActive;
        uint256 createdAt;
    }
    
    struct User {
        address userAddress;
        uint256 testScore;
        uint256 tokensEarned;
        uint256 coursesCompleted;
        bool hasCompletedTest;
    }
    
    // State variables
    uint256 public nextCourseId = 1;
    uint256 public totalUsers;
    
    // Mappings
    mapping(uint256 => Course) public courses;
    mapping(address => User) public users;
    mapping(address => mapping(uint256 => bool)) public hasAccessToCourse;
    mapping(address => mapping(uint256 => bool)) public hasCompletedCourse;
    mapping(address => uint256[]) public userEnrolledCourses;
    mapping(address => uint256[]) public instructorCourses;
    mapping(address => uint256) public instructorEarnings;
    
    // Events
    event TestCompleted(address indexed user, uint256 score, uint256 tokensEarned);
    event CourseCreated(uint256 indexed courseId, address indexed instructor, string title, uint256 price);
    event CourseEnrolled(address indexed student, uint256 indexed courseId, uint256 price);
    event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 nftTokenId);
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokensReceived);
    event TokensConverted(address indexed user, uint256 tokensAmount, uint256 ethReceived);
    event InstructorPaid(address indexed instructor, uint256 tokensAmount);
    
    constructor(address _tokenAddress, address _nftAddress, address initialOwner) Ownable(initialOwner) {
        platformToken = SkillBridgeToken(_tokenAddress);
        certificateNFT = SkillBridgeNFT(_nftAddress);
    }

    // Complete test and earn tokens
    function completeTest(uint256 score) external nonReentrant {
        require(score <= 100, "Score cannot exceed 100");
        require(!users[msg.sender].hasCompletedTest, "Test already completed");
        
        uint256 tokensToEarn = score * TOKENS_PER_TEST_POINT;
        
        // Update user data
        users[msg.sender] = User({
            userAddress: msg.sender,
            testScore: score,
            tokensEarned: tokensToEarn,
            coursesCompleted: 0,
            hasCompletedTest: true
        });
        
        totalUsers++;
        
        // Mint tokens directly to user (no need for contract to hold tokens)
        platformToken.mint(msg.sender, tokensToEarn);
        
        emit TestCompleted(msg.sender, score, tokensToEarn);
    }
    
    // Alternative test completion without token transfer (for debugging)
    function completeTestNoTransfer(uint256 score) external {
        require(score <= 100, "Score cannot exceed 100");
        require(!users[msg.sender].hasCompletedTest, "Test already completed");
        
        uint256 tokensToEarn = score * TOKENS_PER_TEST_POINT;
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            testScore: score,
            tokensEarned: tokensToEarn,
            coursesCompleted: 0,
            hasCompletedTest: true
        });
        
        totalUsers++;
        
        emit TestCompleted(msg.sender, score, tokensToEarn);
    }
    
    // Create a new course
    function createCourse(
        string memory _title,
        string memory _description,
        uint256 _price,
        string memory _videoIPFSHash,
        string memory _thumbnailIPFSHash,
        string memory _category
    ) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_videoIPFSHash).length > 0, "Video hash cannot be empty");
        
        uint256 courseId = nextCourseId++;
        
        courses[courseId] = Course({
            courseId: courseId,
            instructor: msg.sender,
            title: _title,
            description: _description,
            price: _price,
            videoIPFSHash: _videoIPFSHash,
            thumbnailIPFSHash: _thumbnailIPFSHash,
            category: _category,
            enrollmentCount: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        instructorCourses[msg.sender].push(courseId);
        
        emit CourseCreated(courseId, msg.sender, _title, _price);
        return courseId;
    }
    
    // Enroll in a course
    function enrollInCourse(uint256 _courseId) external nonReentrant {
        require(_courseId < nextCourseId, "Course does not exist");
        require(courses[_courseId].isActive, "Course is not active");
        require(!hasAccessToCourse[msg.sender][_courseId], "Already enrolled");
        require(users[msg.sender].hasCompletedTest, "Must complete test first");
        
        Course storage course = courses[_courseId];
        uint256 coursePrice = course.price;
        
        require(platformToken.balanceOf(msg.sender) >= coursePrice, "Insufficient token balance");
        
        // Transfer tokens from student to this contract
        require(
            platformToken.transferFrom(msg.sender, address(this), coursePrice),
            "Token transfer failed"
        );
        
        // Calculate fees
        uint256 platformFee = (coursePrice * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 instructorPayment = coursePrice - platformFee;
        
        // Update instructor earnings
        instructorEarnings[course.instructor] += instructorPayment;
        
        // Grant access
        hasAccessToCourse[msg.sender][_courseId] = true;
        userEnrolledCourses[msg.sender].push(_courseId);
        course.enrollmentCount++;
        
        emit CourseEnrolled(msg.sender, _courseId, coursePrice);
    }
    
    // Complete course and get NFT certificate
    function completeCourse(uint256 _courseId, string memory _tokenURI) external nonReentrant {
        require(hasAccessToCourse[msg.sender][_courseId], "No access to this course");
        require(!hasCompletedCourse[msg.sender][_courseId], "Course already completed");
        require(courses[_courseId].isActive, "Course is not active");
        
        // Mark as completed
        hasCompletedCourse[msg.sender][_courseId] = true;
        users[msg.sender].coursesCompleted++;
        
        // Mint NFT certificate
        uint256 nftTokenId = certificateNFT.mintCertificate(msg.sender, _tokenURI);
        
        emit CourseCompleted(msg.sender, _courseId, nftTokenId);
    }
    
    // Purchase tokens with ETH
    function purchaseTokens() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH to purchase tokens");
        
        uint256 tokensToMint = msg.value * ETH_TO_TOKEN_RATE;
        
        // Mint tokens directly to buyer
        platformToken.mint(msg.sender, tokensToMint);
        
        emit TokensPurchased(msg.sender, msg.value, tokensToMint);
    }
    
    // Convert tokens back to ETH
    function convertTokensToETH(uint256 _tokenAmount) external nonReentrant {
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(platformToken.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");
        
        uint256 ethAmount = _tokenAmount / ETH_TO_TOKEN_RATE;
        require(address(this).balance >= ethAmount, "Insufficient contract ETH balance");
        
        // Transfer tokens from user to contract (burn them)
        require(
            platformToken.transferFrom(msg.sender, address(this), _tokenAmount),
            "Token transfer failed"
        );
        
        // Send ETH to user
        payable(msg.sender).transfer(ethAmount);
        
        emit TokensConverted(msg.sender, _tokenAmount, ethAmount);
    }
    
    // Instructor withdraws earnings
    function withdrawInstructorEarnings() external nonReentrant {
        uint256 earnings = instructorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        instructorEarnings[msg.sender] = 0;
        
        // Transfer tokens to instructor
        require(platformToken.transfer(msg.sender, earnings), "Token transfer failed");
        
        emit InstructorPaid(msg.sender, earnings);
    }
    
    // Helper function to approve tokens (frontend convenience)
    function approveTokens(uint256 _amount) external {
        require(platformToken.approve(address(this), _amount), "Token approval failed");
    }
    
    // Debug function to check user token info
    function debugUserTokenInfo(address _user) external view returns (
        uint256 userBalance,
        uint256 contractBalance,
        uint256 allowance,
        bool hasCompleted,
        uint256 score
    ) {
        return (
            platformToken.balanceOf(_user),
            platformToken.balanceOf(address(this)),
            platformToken.allowance(_user, address(this)),
            users[_user].hasCompletedTest,
            users[_user].testScore
        );
    }
    
    // View functions
    function getCourse(uint256 _courseId) external view returns (Course memory) {
        return courses[_courseId];
    }
    
    function getUserEnrolledCourses(address _user) external view returns (uint256[] memory) {
        return userEnrolledCourses[_user];
    }
    
    function getInstructorCourses(address _instructor) external view returns (uint256[] memory) {
        return instructorCourses[_instructor];
    }
    
    function getUserTokenBalance(address _user) external view returns (uint256) {
        return platformToken.balanceOf(_user);
    }
    
    function getInstructorEarnings(address _instructor) external view returns (uint256) {
        return instructorEarnings[_instructor];
    }
    
    function getUser(address _user) external view returns (
        address userAddress,
        uint256 testScore,
        uint256 tokensEarned,
        uint256 coursesCompleted,
        bool hasCompletedTest
    ) {
        User memory u = users[_user];
        return (u.userAddress, u.testScore, u.tokensEarned, u.coursesCompleted, u.hasCompletedTest);
    }
    
    function hasUserData(address _user) external view returns (bool) {
        return users[_user].hasCompletedTest;
    }
    
    function getUserRaw(address _user) external view returns (uint256 testScore, bool hasCompleted) {
        return (users[_user].testScore, users[_user].hasCompletedTest);
    }
    
    function getContractStats() external view returns (uint256 total, uint256 contractTokenBalance) {
        return (totalUsers, platformToken.balanceOf(address(this)));
    }
    
    // Owner functions
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = platformToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(platformToken.transfer(owner(), balance), "Token transfer failed");
    }
    
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function pauseCourse(uint256 _courseId) external onlyOwner {
        courses[_courseId].isActive = false;
    }
    
    function unpauseCourse(uint256 _courseId) external onlyOwner {
        courses[_courseId].isActive = true;
    }
    
    // Emergency functions
    function fundContractWithETH() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to fund contract");
    }
    
    // Set new token contract (emergency)
    function setTokenContract(address _newTokenAddress) external onlyOwner {
        platformToken = SkillBridgeToken(_newTokenAddress);
    }
    
    // Set new NFT contract (emergency)
    function setNFTContract(address _newNFTAddress) external onlyOwner {
        certificateNFT = SkillBridgeNFT(_newNFTAddress);
    }
    
    // Receive ETH
    receive() external payable {}
}