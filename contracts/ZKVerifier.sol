// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

/**
 * @title ZKVerifier
 * @dev Zero-knowledge proof verification for privacy-preserving health credential verification
 */
contract ZKVerifier is AccessControl {
    // Struct for verification parameters
    struct VerificationParams {
        bytes32 merkleRoot;
        uint256 threshold;
        uint256 validUntil;
        bool isActive;
    }

    // Struct for verification result
    struct VerificationResult {
        bool isValid;
        uint256 verifiedAt;
        address verifier;
        bytes32 proofHash;
    }

    // Mapping from verification ID to parameters
    mapping(bytes32 => VerificationParams) private _verificationParams;

    // Mapping from verification ID to results
    mapping(bytes32 => VerificationResult[]) private _verificationHistory;

    // Mapping from proof hash to whether it has been used
    mapping(bytes32 => bool) private _usedProofs;

    /**
     * @dev Emitted when verification parameters are set
     */
    event VerificationParamsSet(
        bytes32 indexed verificationId,
        bytes32 merkleRoot,
        uint256 threshold,
        uint256 validUntil,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a proof is verified
     */
    event ProofVerified(
        bytes32 indexed verificationId,
        address indexed verifier,
        bytes32 proofHash,
        bool isValid,
        uint256 timestamp
    );

    /**
     * @dev Emitted when verification parameters are deactivated
     */
    event VerificationDeactivated(
        bytes32 indexed verificationId,
        uint256 timestamp
    );

    /**
     * @dev Constructor
     */
    constructor() AccessControl() {}

    /**
     * @dev Sets verification parameters for a specific verification
     * @param verificationId Unique identifier for the verification
     * @param merkleRoot Root of the merkle tree for proof verification
     * @param threshold Minimum threshold for validity
     * @param validUntil Timestamp until which verification is valid
     */
    function setVerificationParams(
        bytes32 verificationId,
        bytes32 merkleRoot,
        uint256 threshold,
        uint256 validUntil
    ) external onlyRole(VERIFIER_ROLE) {
        require(merkleRoot != bytes32(0), "ZKVerifier: invalid merkle root");
        require(validUntil > block.timestamp, "ZKVerifier: invalid validity period");

        _verificationParams[verificationId] = VerificationParams({
            merkleRoot: merkleRoot,
            threshold: threshold,
            validUntil: validUntil,
            isActive: true
        });

        emit VerificationParamsSet(
            verificationId,
            merkleRoot,
            threshold,
            validUntil,
            block.timestamp
        );
    }

    /**
     * @dev Verifies a zero-knowledge proof
     * @param verificationId The verification identifier
     * @param proof The merkle proof array
     * @param leaf The leaf to verify
     * @return isValid Whether the proof is valid
     */
    function verifyProof(
        bytes32 verificationId,
        bytes32[] calldata proof,
        bytes32 leaf
    ) external returns (bool isValid) {
        VerificationParams memory params = _verificationParams[verificationId];
        
        require(params.isActive, "ZKVerifier: verification not active");
        require(block.timestamp <= params.validUntil, "ZKVerifier: verification expired");

        bytes32 proofHash = keccak256(abi.encodePacked(proof, leaf));
        require(!_usedProofs[proofHash], "ZKVerifier: proof already used");

        isValid = _verifyMerkleProof(proof, params.merkleRoot, leaf);

        // Record verification result
        _verificationHistory[verificationId].push(VerificationResult({
            isValid: isValid,
            verifiedAt: block.timestamp,
            verifier: msg.sender,
            proofHash: proofHash
        }));

        if (isValid) {
            _usedProofs[proofHash] = true;
        }

        emit ProofVerified(
            verificationId,
            msg.sender,
            proofHash,
            isValid,
            block.timestamp
        );

        return isValid;
    }

    /**
     * @dev Batch verifies multiple zero-knowledge proofs
     * @param verificationId The verification identifier
     * @param proofs Array of merkle proofs
     * @param leaves Array of leaves to verify
     * @return results Array of verification results
     */
    function batchVerifyProofs(
        bytes32 verificationId,
        bytes32[][] calldata proofs,
        bytes32[] calldata leaves
    ) external returns (bool[] memory results) {
        require(proofs.length == leaves.length, "ZKVerifier: length mismatch");

        VerificationParams memory params = _verificationParams[verificationId];
        require(params.isActive, "ZKVerifier: verification not active");
        require(block.timestamp <= params.validUntil, "ZKVerifier: verification expired");

        results = new bool[](proofs.length);

        for (uint256 i = 0; i < proofs.length; i++) {
            bytes32 proofHash = keccak256(abi.encodePacked(proofs[i], leaves[i]));
            
            if (_usedProofs[proofHash]) {
                results[i] = false;
                continue;
            }

            bool isValid = _verifyMerkleProof(proofs[i], params.merkleRoot, leaves[i]);
            results[i] = isValid;

            // Record verification result
            _verificationHistory[verificationId].push(VerificationResult({
                isValid: isValid,
                verifiedAt: block.timestamp,
                verifier: msg.sender,
                proofHash: proofHash
            }));

            if (isValid) {
                _usedProofs[proofHash] = true;
            }

            emit ProofVerified(
                verificationId,
                msg.sender,
                proofHash,
                isValid,
                block.timestamp
            );
        }

        return results;
    }

    /**
     * @dev Verifies a proof without recording (view function)
     * @param verificationId The verification identifier
     * @param proof The merkle proof array
     * @param leaf The leaf to verify
     * @return isValid Whether the proof is valid
     */
    function checkProof(
        bytes32 verificationId,
        bytes32[] calldata proof,
        bytes32 leaf
    ) external view returns (bool isValid) {
        VerificationParams memory params = _verificationParams[verificationId];
        
        if (!params.isActive || block.timestamp > params.validUntil) {
            return false;
        }

        bytes32 proofHash = keccak256(abi.encodePacked(proof, leaf));
        if (_usedProofs[proofHash]) {
            return false;
        }

        return _verifyMerkleProof(proof, params.merkleRoot, leaf);
    }

    /**
     * @dev Deactivates verification parameters
     * @param verificationId The verification identifier
     */
    function deactivateVerification(bytes32 verificationId)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(
            _verificationParams[verificationId].isActive,
            "ZKVerifier: already deactivated"
        );

        _verificationParams[verificationId].isActive = false;

        emit VerificationDeactivated(verificationId, block.timestamp);
    }

    /**
     * @dev Returns verification parameters
     */
    function getVerificationParams(bytes32 verificationId)
        external
        view
        returns (
            bytes32 merkleRoot,
            uint256 threshold,
            uint256 validUntil,
            bool isActive
        )
    {
        VerificationParams memory params = _verificationParams[verificationId];
        return (
            params.merkleRoot,
            params.threshold,
            params.validUntil,
            params.isActive
        );
    }

    /**
     * @dev Returns verification history for a verification ID
     */
    function getVerificationHistory(bytes32 verificationId)
        external
        view
        returns (VerificationResult[] memory)
    {
        return _verificationHistory[verificationId];
    }

    /**
     * @dev Returns the count of verification attempts
     */
    function getVerificationCount(bytes32 verificationId)
        external
        view
        returns (uint256)
    {
        return _verificationHistory[verificationId].length;
    }

    /**
     * @dev Checks if a proof has been used
     */
    function isProofUsed(bytes32 proofHash) external view returns (bool) {
        return _usedProofs[proofHash];
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
     * @dev Generates a leaf hash for verification
     * @param tokenId The token identifier
     * @param data Additional data to hash
     * @return leaf The leaf hash
     */
    function generateLeaf(uint256 tokenId, bytes calldata data)
        external
        pure
        returns (bytes32 leaf)
    {
        return keccak256(abi.encodePacked(tokenId, data));
    }

    /**
     * @dev Verifies private health data without revealing the actual data
     * @param verificationId The verification identifier
     * @param dataHash Hash of the private health data
     * @param proof Merkle proof for the data
     * @return isValid Whether the private data is valid
     */
    function verifyPrivateData(
        bytes32 verificationId,
        bytes32 dataHash,
        bytes32[] calldata proof
    ) external view returns (bool isValid) {
        VerificationParams memory params = _verificationParams[verificationId];
        
        if (!params.isActive || block.timestamp > params.validUntil) {
            return false;
        }

        return _verifyMerkleProof(proof, params.merkleRoot, dataHash);
    }
}
