// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

/**
 * @title HealthCredentials
 * @dev Manages different types of health credentials and their requirements
 */
contract HealthCredentials is AccessControl {
    // Struct to define a credential type
    struct CredentialType {
        string name;
        string description;
        string[] requirements;
        uint256 validityPeriod; // in seconds, 0 for permanent
        bool isActive;
        uint256 createdAt;
    }

    // Struct to track credential statistics
    struct CredentialStats {
        uint256 totalIssued;
        uint256 currentValid;
        uint256 totalRevoked;
        uint256 lastIssuedTimestamp;
    }

    // Mapping from credential type ID to CredentialType
    mapping(bytes32 => CredentialType) private _credentialTypes;

    // Mapping from credential type ID to statistics
    mapping(bytes32 => CredentialStats) private _credentialStats;

    // Array of all credential type IDs
    bytes32[] private _allCredentialTypes;

    // Mapping to check if credential type exists
    mapping(bytes32 => bool) private _credentialTypeExists;

    /**
     * @dev Emitted when a new credential type is registered
     */
    event CredentialTypeRegistered(
        bytes32 indexed typeId,
        string name,
        uint256 validityPeriod,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a credential type is updated
     */
    event CredentialTypeUpdated(
        bytes32 indexed typeId,
        string name,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a credential type is deactivated
     */
    event CredentialTypeDeactivated(
        bytes32 indexed typeId,
        uint256 timestamp
    );

    /**
     * @dev Emitted when credential stats are updated
     */
    event CredentialStatsUpdated(
        bytes32 indexed typeId,
        uint256 totalIssued,
        uint256 currentValid,
        uint256 totalRevoked
    );

    /**
     * @dev Constructor
     */
    constructor() AccessControl() {
        // Register default credential types
        _registerDefaultCredentialTypes();
    }

    /**
     * @dev Registers a new credential type
     */
    function registerCredentialType(
        bytes32 typeId,
        string calldata name,
        string calldata description,
        string[] calldata requirements,
        uint256 validityPeriod
    ) external onlyRole(ADMIN_ROLE) {
        require(!_credentialTypeExists[typeId], "HealthCredentials: type already exists");
        require(bytes(name).length > 0, "HealthCredentials: name cannot be empty");

        _credentialTypes[typeId] = CredentialType({
            name: name,
            description: description,
            requirements: requirements,
            validityPeriod: validityPeriod,
            isActive: true,
            createdAt: block.timestamp
        });

        _credentialTypeExists[typeId] = true;
        _allCredentialTypes.push(typeId);

        emit CredentialTypeRegistered(typeId, name, validityPeriod, block.timestamp);
    }

    /**
     * @dev Updates an existing credential type
     */
    function updateCredentialType(
        bytes32 typeId,
        string calldata description,
        string[] calldata requirements,
        uint256 validityPeriod
    ) external onlyRole(ADMIN_ROLE) {
        require(_credentialTypeExists[typeId], "HealthCredentials: type does not exist");

        CredentialType storage credType = _credentialTypes[typeId];
        credType.description = description;
        credType.requirements = requirements;
        credType.validityPeriod = validityPeriod;

        emit CredentialTypeUpdated(typeId, credType.name, block.timestamp);
    }

    /**
     * @dev Deactivates a credential type
     */
    function deactivateCredentialType(bytes32 typeId)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_credentialTypeExists[typeId], "HealthCredentials: type does not exist");
        require(_credentialTypes[typeId].isActive, "HealthCredentials: already deactivated");

        _credentialTypes[typeId].isActive = false;

        emit CredentialTypeDeactivated(typeId, block.timestamp);
    }

    /**
     * @dev Records credential issuance
     */
    function recordCredentialIssued(bytes32 typeId)
        external
        onlyRole(MINTER_ROLE)
    {
        require(_credentialTypeExists[typeId], "HealthCredentials: type does not exist");

        CredentialStats storage stats = _credentialStats[typeId];
        stats.totalIssued += 1;
        stats.currentValid += 1;
        stats.lastIssuedTimestamp = block.timestamp;

        emit CredentialStatsUpdated(
            typeId,
            stats.totalIssued,
            stats.currentValid,
            stats.totalRevoked
        );
    }

    /**
     * @dev Records credential revocation
     */
    function recordCredentialRevoked(bytes32 typeId)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(_credentialTypeExists[typeId], "HealthCredentials: type does not exist");

        CredentialStats storage stats = _credentialStats[typeId];
        require(stats.currentValid > 0, "HealthCredentials: no valid credentials");
        
        stats.currentValid -= 1;
        stats.totalRevoked += 1;

        emit CredentialStatsUpdated(
            typeId,
            stats.totalIssued,
            stats.currentValid,
            stats.totalRevoked
        );
    }

    /**
     * @dev Returns credential type details
     */
    function getCredentialType(bytes32 typeId)
        external
        view
        returns (
            string memory name,
            string memory description,
            string[] memory requirements,
            uint256 validityPeriod,
            bool isActive,
            uint256 createdAt
        )
    {
        require(_credentialTypeExists[typeId], "HealthCredentials: type does not exist");
        
        CredentialType memory credType = _credentialTypes[typeId];
        return (
            credType.name,
            credType.description,
            credType.requirements,
            credType.validityPeriod,
            credType.isActive,
            credType.createdAt
        );
    }

    /**
     * @dev Returns credential statistics
     */
    function getCredentialStats(bytes32 typeId)
        external
        view
        returns (
            uint256 totalIssued,
            uint256 currentValid,
            uint256 totalRevoked,
            uint256 lastIssuedTimestamp
        )
    {
        require(_credentialTypeExists[typeId], "HealthCredentials: type does not exist");
        
        CredentialStats memory stats = _credentialStats[typeId];
        return (
            stats.totalIssued,
            stats.currentValid,
            stats.totalRevoked,
            stats.lastIssuedTimestamp
        );
    }

    /**
     * @dev Returns all credential type IDs
     */
    function getAllCredentialTypes() external view returns (bytes32[] memory) {
        return _allCredentialTypes;
    }

    /**
     * @dev Checks if a credential type exists
     */
    function credentialTypeExists(bytes32 typeId) external view returns (bool) {
        return _credentialTypeExists[typeId];
    }

    /**
     * @dev Checks if a credential type is active
     */
    function isCredentialTypeActive(bytes32 typeId) external view returns (bool) {
        require(_credentialTypeExists[typeId], "HealthCredentials: type does not exist");
        return _credentialTypes[typeId].isActive;
    }

    /**
     * @dev Internal function to register default credential types
     */
    function _registerDefaultCredentialTypes() internal {
        // Verified Walker
        bytes32 walkerTypeId = keccak256("VERIFIED_WALKER");
        string[] memory walkerReqs = new string[](1);
        walkerReqs[0] = "90 days with >= 10,000 steps";
        
        _credentialTypes[walkerTypeId] = CredentialType({
            name: "Verified Walker",
            description: "Achieved 10,000+ steps daily for 90 consecutive days",
            requirements: walkerReqs,
            validityPeriod: 365 days,
            isActive: true,
            createdAt: block.timestamp
        });
        _credentialTypeExists[walkerTypeId] = true;
        _allCredentialTypes.push(walkerTypeId);

        // Deep Sleep Master
        bytes32 sleepTypeId = keccak256("DEEP_SLEEP_MASTER");
        string[] memory sleepReqs = new string[](1);
        sleepReqs[0] = "60 nights with >= 8 hours sleep";
        
        _credentialTypes[sleepTypeId] = CredentialType({
            name: "Deep Sleep Master",
            description: "Achieved 8+ hours of quality sleep for 60 nights",
            requirements: sleepReqs,
            validityPeriod: 180 days,
            isActive: true,
            createdAt: block.timestamp
        });
        _credentialTypeExists[sleepTypeId] = true;
        _allCredentialTypes.push(sleepTypeId);

        // Metabolic Champion
        bytes32 metabolicTypeId = keccak256("METABOLIC_CHAMPION");
        string[] memory metabolicReqs = new string[](1);
        metabolicReqs[0] = "30-day glucose standard deviation < 15";
        
        _credentialTypes[metabolicTypeId] = CredentialType({
            name: "Metabolic Champion",
            description: "Maintained stable glucose levels for 30 days",
            requirements: metabolicReqs,
            validityPeriod: 90 days,
            isActive: true,
            createdAt: block.timestamp
        });
        _credentialTypeExists[metabolicTypeId] = true;
        _allCredentialTypes.push(metabolicTypeId);

        // Cardio Elite
        bytes32 cardioTypeId = keccak256("CARDIO_ELITE");
        string[] memory cardioReqs = new string[](1);
        cardioReqs[0] = "90-day average HRV > 70";
        
        _credentialTypes[cardioTypeId] = CredentialType({
            name: "Cardio Elite",
            description: "Maintained excellent heart rate variability for 90 days",
            requirements: cardioReqs,
            validityPeriod: 180 days,
            isActive: true,
            createdAt: block.timestamp
        });
        _credentialTypeExists[cardioTypeId] = true;
        _allCredentialTypes.push(cardioTypeId);

        // Century Club
        bytes32 centuryTypeId = keccak256("CENTURY_CLUB");
        string[] memory centuryReqs = new string[](1);
        centuryReqs[0] = "100,000 steps in 7 days";
        
        _credentialTypes[centuryTypeId] = CredentialType({
            name: "Century Club",
            description: "Achieved 100,000 total steps in a single week",
            requirements: centuryReqs,
            validityPeriod: 0, // Permanent
            isActive: true,
            createdAt: block.timestamp
        });
        _credentialTypeExists[centuryTypeId] = true;
        _allCredentialTypes.push(centuryTypeId);

        // 7-Day Streak Master
        bytes32 streakTypeId = keccak256("STREAK_MASTER");
        string[] memory streakReqs = new string[](1);
        streakReqs[0] = "7 consecutive days of health tracking";
        
        _credentialTypes[streakTypeId] = CredentialType({
            name: "7-Day Streak Master",
            description: "Maintained consistent health tracking for 7 days",
            requirements: streakReqs,
            validityPeriod: 0, // Permanent
            isActive: true,
            createdAt: block.timestamp
        });
        _credentialTypeExists[streakTypeId] = true;
        _allCredentialTypes.push(streakTypeId);
    }
}
