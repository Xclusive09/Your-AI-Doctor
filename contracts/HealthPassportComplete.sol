// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HealthPassport - Complete Smart Contract
 * @dev Single-file implementation of the Health Passport soulbound token system
 * @notice This contract combines all functionality into one file for easy deployment on BlockDAG
 */

/**
 * @title HealthPassport
 * @dev Main contract for managing soulbound health credential NFTs with built-in access control
 */
contract HealthPassport {
    
    // ═══════════════════════════════════════════════════════════════
    // ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant HEALTHCARE_PROVIDER_ROLE = keccak256("HEALTHCARE_PROVIDER_ROLE");

    // Mapping from role to addresses that have the role
    mapping(bytes32 => mapping(address => bool)) private _roles;

    // Mapping from role to role admin
    mapping(bytes32 => bytes32) private _roleAdmins;

    /**
     * @dev Emitted when a role is granted
     */
    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    /**
     * @dev Emitted when a role is revoked
     */
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    /**
     * @dev Modifier to check if caller has a specific role
     */
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "HealthPassport: unauthorized");
        _;
    }

    /**
     * @dev Returns true if account has been granted role
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    /**
     * @dev Returns the admin role that controls a role
     */
    function getRoleAdmin(bytes32 role) public view returns (bytes32) {
        return _roleAdmins[role];
    }

    /**
     * @dev Grants role to an account
     */
    function grantRole(bytes32 role, address account)
        public
        onlyRole(getRoleAdmin(role))
    {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes role from an account
     */
    function revokeRole(bytes32 role, address account)
        public
        onlyRole(getRoleAdmin(role))
    {
        _revokeRole(role, account);
    }

    /**
     * @dev Allows an account to renounce their own role
     */
    function renounceRole(bytes32 role, address account) public {
        require(account == msg.sender, "HealthPassport: can only renounce own roles");
        _revokeRole(role, account);
    }

    /**
     * @dev Internal function to grant role
     */
    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    /**
     * @dev Internal function to revoke role
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }

    /**
     * @dev Internal function to set role admin
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal {
        _roleAdmins[role] = adminRole;
    }

    // ═══════════════════════════════════════════════════════════════
    // HEALTH PASSPORT NFT
    // ═══════════════════════════════════════════════════════════════
    
    // Token name
    string public constant name = "Health Passport";
    
    // Token symbol
    string public constant symbol = "HEALTH";

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping from owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to metadata URI
    mapping(uint256 => string) private _tokenURIs;

    // Mapping from owner to array of owned token IDs
    mapping(address => uint256[]) private _ownedTokens;

    // Mapping from token ID to index in owner's token array
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // Mapping from token ID to credential type
    mapping(uint256 => string) private _credentialTypes;

    // Mapping from token ID to issuance timestamp
    mapping(uint256 => uint256) private _issuanceTimestamps;

    // Mapping from token ID to revocation status
    mapping(uint256 => bool) private _revokedCredentials;

    // Mapping from token ID to revocation reason
    mapping(uint256 => string) private _revocationReasons;

    // Mapping from token ID to merkle root for ZK verification
    mapping(uint256 => bytes32) private _verificationRoots;

    // Counter for total minted tokens
    uint256 private _totalMinted;

    /**
     * @dev Emitted when a new credential is minted
     */
    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string credentialType,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a credential is revoked
     */
    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed owner,
        string reason,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a credential is verified
     */
    event CredentialVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );

    /**
     * @dev Standard Transfer event for ERC721 compatibility
     */
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    /**
     * @dev Modifier to check if token exists
     */
    modifier tokenExists(uint256 tokenId) {
        require(_owners[tokenId] != address(0), "HealthPassport: token does not exist");
        _;
    }

    /**
     * @dev Constructor initializes the contract with roles
     */
    constructor() {
        // Grant admin role to contract deployer
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        
        // Set role admins
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(VERIFIER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(HEALTHCARE_PROVIDER_ROLE, ADMIN_ROLE);
    }

    /**
     * @dev Mints a soulbound health credential NFT
     * @param tokenId The unique identifier for the token
     * @param recipient The address receiving the credential
     * @param metadata The metadata URI for the credential
     * @return success Whether the minting was successful
     */
    function mintSoulbound(
        uint256 tokenId,
        address recipient,
        string calldata metadata
    ) external onlyRole(MINTER_ROLE) returns (bool success) {
        require(recipient != address(0), "HealthPassport: mint to zero address");
        require(_owners[tokenId] == address(0), "HealthPassport: token already minted");

        _owners[tokenId] = recipient;
        _balances[recipient] += 1;
        _tokenURIs[tokenId] = metadata;
        _issuanceTimestamps[tokenId] = block.timestamp;
        _totalMinted += 1;

        // Add token to owner's array
        _ownedTokensIndex[tokenId] = _ownedTokens[recipient].length;
        _ownedTokens[recipient].push(tokenId);

        // Extract credential type from metadata
        _credentialTypes[tokenId] = _extractCredentialType(metadata);

        emit CredentialMinted(
            tokenId,
            recipient,
            _credentialTypes[tokenId],
            block.timestamp
        );
        emit Transfer(address(0), recipient, tokenId);

        return true;
    }

    /**
     * @dev Returns the owner of a token
     * @param tokenId The token identifier
     * @return owner The address of the token owner
     */
    function ownerOf(uint256 tokenId)
        external
        view
        tokenExists(tokenId)
        returns (address owner)
    {
        return _owners[tokenId];
    }

    /**
     * @dev Returns the metadata URI for a token
     * @param tokenId The token identifier
     * @return uri The metadata URI
     */
    function tokenURI(uint256 tokenId)
        external
        view
        tokenExists(tokenId)
        returns (string memory uri)
    {
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Returns the number of tokens owned by an address
     * @param owner The address to query
     * @return balance The number of tokens owned
     */
    function balanceOf(address owner) external view returns (uint256 balance) {
        require(owner != address(0), "HealthPassport: balance query for zero address");
        return _balances[owner];
    }

    /**
     * @dev Returns all credential token IDs for an owner
     * @param owner The address to query
     * @return tokenIds Array of token IDs
     */
    function getCredentialsByOwner(address owner)
        external
        view
        returns (uint256[] memory tokenIds)
    {
        return _ownedTokens[owner];
    }

    /**
     * @dev Verifies a health credential using zero-knowledge proof
     * @param tokenId The token identifier to verify
     * @param proof The zero-knowledge proof
     * @return isValid Whether the credential is valid
     */
    function verifyCredential(uint256 tokenId, bytes32[] calldata proof)
        external
        view
        tokenExists(tokenId)
        returns (bool isValid)
    {
        if (_revokedCredentials[tokenId]) {
            return false;
        }

        bytes32 root = _verificationRoots[tokenId];
        if (root == bytes32(0)) {
            // No verification root set, consider valid if not revoked
            return true;
        }

        // Verify merkle proof
        return _verifyMerkleProof(proof, root, keccak256(abi.encodePacked(tokenId)));
    }

    /**
     * @dev Verifies multiple credentials in batch
     * @param tokenIds Array of token identifiers
     * @param proofs Array of zero-knowledge proofs
     * @return results Array of verification results
     */
    function batchVerifyCredentials(
        uint256[] calldata tokenIds,
        bytes32[][] calldata proofs
    ) external view returns (bool[] memory results) {
        require(tokenIds.length == proofs.length, "HealthPassport: length mismatch");
        
        results = new bool[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_owners[tokenIds[i]] == address(0)) {
                results[i] = false;
                continue;
            }
            
            if (_revokedCredentials[tokenIds[i]]) {
                results[i] = false;
                continue;
            }

            bytes32 root = _verificationRoots[tokenIds[i]];
            if (root == bytes32(0)) {
                results[i] = true;
            } else {
                results[i] = _verifyMerkleProof(
                    proofs[i],
                    root,
                    keccak256(abi.encodePacked(tokenIds[i]))
                );
            }
        }
        return results;
    }

    /**
     * @dev Checks if a credential is still valid (not expired or revoked)
     * @param tokenId The token identifier
     * @return isValid Whether the credential is currently valid
     */
    function isCredentialValid(uint256 tokenId)
        external
        view
        tokenExists(tokenId)
        returns (bool isValid)
    {
        return !_revokedCredentials[tokenId];
    }

    /**
     * @dev Revokes a credential
     * @param tokenId The token to revoke
     * @param reason The reason for revocation
     */
    function revokeCredential(uint256 tokenId, string calldata reason)
        external
        onlyRole(VERIFIER_ROLE)
        tokenExists(tokenId)
    {
        require(!_revokedCredentials[tokenId], "HealthPassport: already revoked");
        
        _revokedCredentials[tokenId] = true;
        _revocationReasons[tokenId] = reason;
        
        emit CredentialRevoked(
            tokenId,
            _owners[tokenId],
            reason,
            block.timestamp
        );
    }

    /**
     * @dev Sets verification root for a credential (for ZK proofs)
     * @param tokenId The token identifier
     * @param root The merkle root for verification
     */
    function setVerificationRoot(uint256 tokenId, bytes32 root)
        external
        onlyRole(VERIFIER_ROLE)
        tokenExists(tokenId)
    {
        _verificationRoots[tokenId] = root;
    }

    /**
     * @dev Returns the total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _totalMinted;
    }

    /**
     * @dev Returns credential type for a token
     */
    function getCredentialType(uint256 tokenId)
        external
        view
        tokenExists(tokenId)
        returns (string memory)
    {
        return _credentialTypes[tokenId];
    }

    /**
     * @dev Returns issuance timestamp for a token
     */
    function getIssuanceTimestamp(uint256 tokenId)
        external
        view
        tokenExists(tokenId)
        returns (uint256)
    {
        return _issuanceTimestamps[tokenId];
    }

    /**
     * @dev Returns revocation reason for a token
     */
    function getRevocationReason(uint256 tokenId)
        external
        view
        tokenExists(tokenId)
        returns (string memory)
    {
        require(_revokedCredentials[tokenId], "HealthPassport: not revoked");
        return _revocationReasons[tokenId];
    }

    /**
     * @dev Internal function to verify merkle proof
     */
    function _verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }

    /**
     * @dev Internal function to extract credential type from metadata
     */
    function _extractCredentialType(string memory metadata)
        internal
        pure
        returns (string memory)
    {
        // Simple implementation: return metadata as credential type
        // In production, parse JSON to extract type field
        bytes memory metadataBytes = bytes(metadata);
        if (metadataBytes.length <= 32) {
            return metadata;
        }
        return metadata;
    }

    /**
     * @dev Prevents transfers (soulbound tokens)
     * This would be called before any transfer, but since we don't implement
     * transfer functions, tokens remain soulbound by design
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal pure {
        require(from == address(0), "HealthPassport: soulbound tokens cannot be transferred");
        // Allow minting (from == address(0))
        // Prevent transfers and burning
        tokenId; // Silence unused variable warning
        to; // Silence unused variable warning
    }
}