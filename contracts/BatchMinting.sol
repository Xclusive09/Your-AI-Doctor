// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IHealthPassport.sol";
import "./AccessControl.sol";

/**
 * @title BatchMinting
 * @dev Enables efficient batch minting of health credentials for high-throughput scenarios
 * @notice Optimized for BlockDAG's high TPS capabilities (10,000+ TPS)
 */
contract BatchMinting is AccessControl {
    // Reference to the HealthPassport contract
    IHealthPassport public healthPassport;

    // Struct for batch mint request
    struct BatchMintRequest {
        address[] recipients;
        uint256[] tokenIds;
        string[] metadataList;
        uint256 timestamp;
        address requester;
        bool isCompleted;
    }

    // Mapping from batch ID to BatchMintRequest
    mapping(bytes32 => BatchMintRequest) private _batchRequests;

    // Array of all batch IDs
    bytes32[] private _allBatchIds;

    // Statistics
    uint256 private _totalBatchMints;
    uint256 private _totalCredentialsMinted;

    /**
     * @dev Emitted when a batch mint is initiated
     */
    event BatchMintInitiated(
        bytes32 indexed batchId,
        address indexed requester,
        uint256 count,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a batch mint is completed
     */
    event BatchMintCompleted(
        bytes32 indexed batchId,
        uint256 successCount,
        uint256 failureCount,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a single credential is minted in a batch
     */
    event CredentialMintedInBatch(
        bytes32 indexed batchId,
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 timestamp
    );

    /**
     * @dev Constructor
     * @param healthPassportAddress Address of the HealthPassport contract
     */
    constructor(address healthPassportAddress) AccessControl() {
        require(
            healthPassportAddress != address(0),
            "BatchMinting: invalid health passport address"
        );
        healthPassport = IHealthPassport(healthPassportAddress);
    }

    /**
     * @dev Batch mints health credentials for multiple recipients
     * @param recipients Array of recipient addresses
     * @param tokenIds Array of token IDs
     * @param metadataList Array of metadata URIs
     * @return batchId The unique batch identifier
     */
    function batchMintCredentials(
        address[] calldata recipients,
        uint256[] calldata tokenIds,
        string[] calldata metadataList
    ) external onlyRole(MINTER_ROLE) returns (bytes32 batchId) {
        require(recipients.length > 0, "BatchMinting: empty recipients array");
        require(
            recipients.length == tokenIds.length,
            "BatchMinting: recipients and tokenIds length mismatch"
        );
        require(
            recipients.length == metadataList.length,
            "BatchMinting: recipients and metadata length mismatch"
        );

        // Generate batch ID
        batchId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                recipients.length
            )
        );

        // Store batch request
        _batchRequests[batchId] = BatchMintRequest({
            recipients: recipients,
            tokenIds: tokenIds,
            metadataList: metadataList,
            timestamp: block.timestamp,
            requester: msg.sender,
            isCompleted: false
        });

        _allBatchIds.push(batchId);

        emit BatchMintInitiated(
            batchId,
            msg.sender,
            recipients.length,
            block.timestamp
        );

        // Execute batch minting
        _executeBatchMint(batchId);

        return batchId;
    }

    /**
     * @dev Executes the batch minting process
     * @param batchId The batch identifier
     */
    function _executeBatchMint(bytes32 batchId) internal {
        BatchMintRequest storage request = _batchRequests[batchId];
        
        uint256 successCount = 0;
        uint256 failureCount = 0;

        for (uint256 i = 0; i < request.recipients.length; i++) {
            try healthPassport.mintSoulbound(
                request.tokenIds[i],
                request.recipients[i],
                request.metadataList[i]
            ) returns (bool success) {
                if (success) {
                    successCount++;
                    emit CredentialMintedInBatch(
                        batchId,
                        request.tokenIds[i],
                        request.recipients[i],
                        block.timestamp
                    );
                } else {
                    failureCount++;
                }
            } catch {
                failureCount++;
            }
        }

        request.isCompleted = true;
        _totalBatchMints++;
        _totalCredentialsMinted += successCount;

        emit BatchMintCompleted(
            batchId,
            successCount,
            failureCount,
            block.timestamp
        );
    }

    /**
     * @dev Mints credentials for audience challenge (optimized for speed)
     * @param recipient The recipient address
     * @param count Number of credentials to mint
     * @param baseTokenId Starting token ID
     * @param credentialType Type of credential
     * @return batchId The unique batch identifier
     */
    function mintAudienceChallenge(
        address recipient,
        uint256 count,
        uint256 baseTokenId,
        string calldata credentialType
    ) external onlyRole(MINTER_ROLE) returns (bytes32 batchId) {
        require(recipient != address(0), "BatchMinting: invalid recipient");
        require(count > 0 && count <= 1000, "BatchMinting: invalid count");

        // Generate arrays for batch minting
        address[] memory recipients = new address[](count);
        uint256[] memory tokenIds = new uint256[](count);
        string[] memory metadataList = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            recipients[i] = recipient;
            tokenIds[i] = baseTokenId + i;
            metadataList[i] = string(
                abi.encodePacked(
                    '{"type":"',
                    credentialType,
                    '","number":',
                    _uint2str(i + 1),
                    ',"total":',
                    _uint2str(count),
                    '}'
                )
            );
        }

        // Generate batch ID
        batchId = keccak256(
            abi.encodePacked(
                recipient,
                block.timestamp,
                count,
                "AUDIENCE_CHALLENGE"
            )
        );

        // Store and execute batch request
        _batchRequests[batchId] = BatchMintRequest({
            recipients: recipients,
            tokenIds: tokenIds,
            metadataList: metadataList,
            timestamp: block.timestamp,
            requester: msg.sender,
            isCompleted: false
        });

        _allBatchIds.push(batchId);

        emit BatchMintInitiated(
            batchId,
            msg.sender,
            count,
            block.timestamp
        );

        _executeBatchMint(batchId);

        return batchId;
    }

    /**
     * @dev Returns batch request details
     */
    function getBatchRequest(bytes32 batchId)
        external
        view
        returns (
            address[] memory recipients,
            uint256[] memory tokenIds,
            uint256 timestamp,
            address requester,
            bool isCompleted
        )
    {
        BatchMintRequest memory request = _batchRequests[batchId];
        return (
            request.recipients,
            request.tokenIds,
            request.timestamp,
            request.requester,
            request.isCompleted
        );
    }

    /**
     * @dev Returns batch minting statistics
     */
    function getStatistics()
        external
        view
        returns (
            uint256 totalBatchMints,
            uint256 totalCredentialsMinted,
            uint256 averagePerBatch
        )
    {
        uint256 avg = _totalBatchMints > 0
            ? _totalCredentialsMinted / _totalBatchMints
            : 0;
        
        return (_totalBatchMints, _totalCredentialsMinted, avg);
    }

    /**
     * @dev Returns all batch IDs
     */
    function getAllBatchIds() external view returns (bytes32[] memory) {
        return _allBatchIds;
    }

    /**
     * @dev Returns the total number of batches
     */
    function getBatchCount() external view returns (uint256) {
        return _allBatchIds.length;
    }

    /**
     * @dev Updates the HealthPassport contract address (admin only)
     */
    function updateHealthPassport(address newHealthPassportAddress)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(
            newHealthPassportAddress != address(0),
            "BatchMinting: invalid address"
        );
        healthPassport = IHealthPassport(newHealthPassportAddress);
    }

    /**
     * @dev Internal function to convert uint to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
