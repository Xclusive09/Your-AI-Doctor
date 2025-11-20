// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IHealthPassport.sol";
import "./ICredentialVerifier.sol";
import "./AccessControl.sol";

/**
 * @title HealthPassport
 * @dev Main contract for managing soulbound health credential NFTs
 * @notice This contract implements a non-transferable (soulbound) token system for health credentials
 */
contract HealthPassport is IHealthPassport, ICredentialVerifier, AccessControl {
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

    // Mapping from token ID to merkle root for ZK verification
    mapping(uint256 => bytes32) private _verificationRoots;

    // Counter for total minted tokens
    uint256 private _totalMinted;

    /**
     * @dev Modifier to check if token exists
     */
    modifier tokenExists(uint256 tokenId) {
        require(_owners[tokenId] != address(0), "HealthPassport: token does not exist");
        _;
    }

    /**
     * @dev Constructor initializes the contract
     */
    constructor() AccessControl() {
        // Grant minter role to contract deployer
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev See {IHealthPassport-mintSoulbound}
     */
    function mintSoulbound(
        uint256 tokenId,
        address recipient,
        string calldata metadata
    ) external override onlyRole(MINTER_ROLE) returns (bool) {
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

        // Extract credential type from metadata (simple implementation)
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
     * @dev See {IHealthPassport-ownerOf}
     */
    function ownerOf(uint256 tokenId)
        external
        view
        override
        tokenExists(tokenId)
        returns (address)
    {
        return _owners[tokenId];
    }

    /**
     * @dev See {IHealthPassport-tokenURI}
     */
    function tokenURI(uint256 tokenId)
        external
        view
        override
        tokenExists(tokenId)
        returns (string memory)
    {
        return _tokenURIs[tokenId];
    }

    /**
     * @dev See {IHealthPassport-balanceOf}
     */
    function balanceOf(address owner) external view override returns (uint256) {
        require(owner != address(0), "HealthPassport: balance query for zero address");
        return _balances[owner];
    }

    /**
     * @dev See {IHealthPassport-getCredentialsByOwner}
     */
    function getCredentialsByOwner(address owner)
        external
        view
        override
        returns (uint256[] memory)
    {
        return _ownedTokens[owner];
    }

    /**
     * @dev See {ICredentialVerifier-verifyCredential}
     */
    function verifyCredential(uint256 tokenId, bytes32[] calldata proof)
        external
        view
        override
        tokenExists(tokenId)
        returns (bool)
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
     * @dev See {ICredentialVerifier-batchVerifyCredentials}
     */
    function batchVerifyCredentials(
        uint256[] calldata tokenIds,
        bytes32[][] calldata proofs
    ) external view override returns (bool[] memory) {
        require(tokenIds.length == proofs.length, "HealthPassport: length mismatch");
        
        bool[] memory results = new bool[](tokenIds.length);
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
     * @dev See {ICredentialVerifier-isCredentialValid}
     */
    function isCredentialValid(uint256 tokenId)
        external
        view
        override
        tokenExists(tokenId)
        returns (bool)
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
        // Simple implementation: return first 32 chars or full string
        bytes memory metadataBytes = bytes(metadata);
        if (metadataBytes.length <= 32) {
            return metadata;
        }
        return metadata; // In production, parse JSON to extract type
    }

    /**
     * @dev Prevents transfers (soulbound tokens)
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

    /**
     * @dev Standard Transfer event for ERC721 compatibility
     */
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
}
