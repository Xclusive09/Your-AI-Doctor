// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

/**
 * @title HealthDataRegistry
 * @dev Registry for managing authorized health data providers and data sources
 */
contract HealthDataRegistry is AccessControl {
    // Struct for health data provider
    struct HealthProvider {
        string name;
        string description;
        address providerAddress;
        bool isActive;
        uint256 registeredAt;
        uint256 totalDataSubmissions;
        string[] supportedDataTypes;
    }

    // Struct for data source connection
    struct DataSource {
        string name;
        string sourceType; // e.g., "Apple Health", "Google Fit", "Oura"
        address owner;
        bool isVerified;
        uint256 connectedAt;
        uint256 lastSyncTimestamp;
    }

    // Mapping from provider ID to HealthProvider
    mapping(bytes32 => HealthProvider) private _providers;

    // Mapping from data source ID to DataSource
    mapping(bytes32 => DataSource) private _dataSources;

    // Mapping from user address to their connected data sources
    mapping(address => bytes32[]) private _userDataSources;

    // Array of all provider IDs
    bytes32[] private _allProviders;

    // Mapping to check if provider exists
    mapping(bytes32 => bool) private _providerExists;

    /**
     * @dev Emitted when a new provider is registered
     */
    event ProviderRegistered(
        bytes32 indexed providerId,
        string name,
        address providerAddress,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a provider is updated
     */
    event ProviderUpdated(
        bytes32 indexed providerId,
        string name,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a provider is deactivated
     */
    event ProviderDeactivated(
        bytes32 indexed providerId,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a data source is connected
     */
    event DataSourceConnected(
        bytes32 indexed sourceId,
        address indexed owner,
        string sourceType,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a data source is synced
     */
    event DataSourceSynced(
        bytes32 indexed sourceId,
        address indexed owner,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a data source is verified
     */
    event DataSourceVerified(
        bytes32 indexed sourceId,
        address indexed verifier,
        uint256 timestamp
    );

    /**
     * @dev Constructor
     */
    constructor() AccessControl() {
        // Register default health data providers
        _registerDefaultProviders();
    }

    /**
     * @dev Registers a new health data provider
     */
    function registerProvider(
        bytes32 providerId,
        string calldata name,
        string calldata description,
        address providerAddress,
        string[] calldata supportedDataTypes
    ) external onlyRole(ADMIN_ROLE) {
        require(!_providerExists[providerId], "HealthDataRegistry: provider already exists");
        require(providerAddress != address(0), "HealthDataRegistry: invalid address");
        require(bytes(name).length > 0, "HealthDataRegistry: name cannot be empty");

        _providers[providerId] = HealthProvider({
            name: name,
            description: description,
            providerAddress: providerAddress,
            isActive: true,
            registeredAt: block.timestamp,
            totalDataSubmissions: 0,
            supportedDataTypes: supportedDataTypes
        });

        _providerExists[providerId] = true;
        _allProviders.push(providerId);

        // Grant healthcare provider role
        _grantRole(HEALTHCARE_PROVIDER_ROLE, providerAddress);

        emit ProviderRegistered(providerId, name, providerAddress, block.timestamp);
    }

    /**
     * @dev Updates a health data provider
     */
    function updateProvider(
        bytes32 providerId,
        string calldata description,
        string[] calldata supportedDataTypes
    ) external onlyRole(ADMIN_ROLE) {
        require(_providerExists[providerId], "HealthDataRegistry: provider does not exist");

        HealthProvider storage provider = _providers[providerId];
        provider.description = description;
        provider.supportedDataTypes = supportedDataTypes;

        emit ProviderUpdated(providerId, provider.name, block.timestamp);
    }

    /**
     * @dev Deactivates a health data provider
     */
    function deactivateProvider(bytes32 providerId)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_providerExists[providerId], "HealthDataRegistry: provider does not exist");
        require(_providers[providerId].isActive, "HealthDataRegistry: already deactivated");

        _providers[providerId].isActive = false;

        emit ProviderDeactivated(providerId, block.timestamp);
    }

    /**
     * @dev Connects a data source for a user
     */
    function connectDataSource(
        bytes32 sourceId,
        string calldata name,
        string calldata sourceType
    ) external {
        require(!_dataSourceExists(sourceId), "HealthDataRegistry: source already connected");

        _dataSources[sourceId] = DataSource({
            name: name,
            sourceType: sourceType,
            owner: msg.sender,
            isVerified: false,
            connectedAt: block.timestamp,
            lastSyncTimestamp: block.timestamp
        });

        _userDataSources[msg.sender].push(sourceId);

        emit DataSourceConnected(sourceId, msg.sender, sourceType, block.timestamp);
    }

    /**
     * @dev Syncs a data source (updates last sync timestamp)
     */
    function syncDataSource(bytes32 sourceId) external {
        require(_dataSourceExists(sourceId), "HealthDataRegistry: source does not exist");
        require(
            _dataSources[sourceId].owner == msg.sender,
            "HealthDataRegistry: not source owner"
        );

        _dataSources[sourceId].lastSyncTimestamp = block.timestamp;

        emit DataSourceSynced(sourceId, msg.sender, block.timestamp);
    }

    /**
     * @dev Verifies a data source (only for healthcare providers)
     */
    function verifyDataSource(bytes32 sourceId)
        external
        onlyRole(HEALTHCARE_PROVIDER_ROLE)
    {
        require(_dataSourceExists(sourceId), "HealthDataRegistry: source does not exist");
        require(
            !_dataSources[sourceId].isVerified,
            "HealthDataRegistry: already verified"
        );

        _dataSources[sourceId].isVerified = true;

        emit DataSourceVerified(sourceId, msg.sender, block.timestamp);
    }

    /**
     * @dev Records a data submission from a provider
     */
    function recordDataSubmission(bytes32 providerId)
        external
        onlyRole(HEALTHCARE_PROVIDER_ROLE)
    {
        require(_providerExists[providerId], "HealthDataRegistry: provider does not exist");
        require(_providers[providerId].isActive, "HealthDataRegistry: provider not active");

        _providers[providerId].totalDataSubmissions += 1;
    }

    /**
     * @dev Returns provider details
     */
    function getProvider(bytes32 providerId)
        external
        view
        returns (
            string memory name,
            string memory description,
            address providerAddress,
            bool isActive,
            uint256 registeredAt,
            uint256 totalDataSubmissions,
            string[] memory supportedDataTypes
        )
    {
        require(_providerExists[providerId], "HealthDataRegistry: provider does not exist");
        
        HealthProvider memory provider = _providers[providerId];
        return (
            provider.name,
            provider.description,
            provider.providerAddress,
            provider.isActive,
            provider.registeredAt,
            provider.totalDataSubmissions,
            provider.supportedDataTypes
        );
    }

    /**
     * @dev Returns data source details
     */
    function getDataSource(bytes32 sourceId)
        external
        view
        returns (
            string memory name,
            string memory sourceType,
            address owner,
            bool isVerified,
            uint256 connectedAt,
            uint256 lastSyncTimestamp
        )
    {
        require(_dataSourceExists(sourceId), "HealthDataRegistry: source does not exist");
        
        DataSource memory source = _dataSources[sourceId];
        return (
            source.name,
            source.sourceType,
            source.owner,
            source.isVerified,
            source.connectedAt,
            source.lastSyncTimestamp
        );
    }

    /**
     * @dev Returns all data sources for a user
     */
    function getUserDataSources(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return _userDataSources[user];
    }

    /**
     * @dev Returns all provider IDs
     */
    function getAllProviders() external view returns (bytes32[] memory) {
        return _allProviders;
    }

    /**
     * @dev Checks if a provider exists
     */
    function providerExists(bytes32 providerId) external view returns (bool) {
        return _providerExists[providerId];
    }

    /**
     * @dev Checks if a provider is active
     */
    function isProviderActive(bytes32 providerId) external view returns (bool) {
        require(_providerExists[providerId], "HealthDataRegistry: provider does not exist");
        return _providers[providerId].isActive;
    }

    /**
     * @dev Internal function to check if data source exists
     */
    function _dataSourceExists(bytes32 sourceId) internal view returns (bool) {
        return _dataSources[sourceId].owner != address(0);
    }

    /**
     * @dev Internal function to register default providers
     */
    function _registerDefaultProviders() internal {
        // Apple Health
        bytes32 appleHealthId = keccak256("APPLE_HEALTH");
        string[] memory appleTypes = new string[](5);
        appleTypes[0] = "steps";
        appleTypes[1] = "sleep";
        appleTypes[2] = "heart_rate";
        appleTypes[3] = "hrv";
        appleTypes[4] = "activity";
        
        _providers[appleHealthId] = HealthProvider({
            name: "Apple Health",
            description: "Official Apple Health integration",
            providerAddress: address(this), // Use contract address as placeholder
            isActive: true,
            registeredAt: block.timestamp,
            totalDataSubmissions: 0,
            supportedDataTypes: appleTypes
        });
        _providerExists[appleHealthId] = true;
        _allProviders.push(appleHealthId);

        // Google Fit
        bytes32 googleFitId = keccak256("GOOGLE_FIT");
        string[] memory googleTypes = new string[](5);
        googleTypes[0] = "steps";
        googleTypes[1] = "sleep";
        googleTypes[2] = "heart_rate";
        googleTypes[3] = "calories";
        googleTypes[4] = "activity";
        
        _providers[googleFitId] = HealthProvider({
            name: "Google Fit",
            description: "Official Google Fit integration",
            providerAddress: address(this),
            isActive: true,
            registeredAt: block.timestamp,
            totalDataSubmissions: 0,
            supportedDataTypes: googleTypes
        });
        _providerExists[googleFitId] = true;
        _allProviders.push(googleFitId);

        // Oura Ring
        bytes32 ouraId = keccak256("OURA_RING");
        string[] memory ouraTypes = new string[](4);
        ouraTypes[0] = "sleep";
        ouraTypes[1] = "hrv";
        ouraTypes[2] = "temperature";
        ouraTypes[3] = "readiness";
        
        _providers[ouraId] = HealthProvider({
            name: "Oura Ring",
            description: "Oura Ring sleep and readiness tracking",
            providerAddress: address(this),
            isActive: true,
            registeredAt: block.timestamp,
            totalDataSubmissions: 0,
            supportedDataTypes: ouraTypes
        });
        _providerExists[ouraId] = true;
        _allProviders.push(ouraId);
    }
}
