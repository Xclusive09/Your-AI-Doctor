// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICredentialVerifier
 * @dev Interface for verifying health credentials using zero-knowledge proofs
 */
interface ICredentialVerifier {
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
     * @dev Verifies a health credential using zero-knowledge proof
     * @param tokenId The token identifier to verify
     * @param proof The zero-knowledge proof
     * @return isValid Whether the credential is valid
     */
    function verifyCredential(uint256 tokenId, bytes32[] calldata proof)
        external
        view
        returns (bool isValid);

    /**
     * @dev Verifies multiple credentials in batch
     * @param tokenIds Array of token identifiers
     * @param proofs Array of zero-knowledge proofs
     * @return results Array of verification results
     */
    function batchVerifyCredentials(
        uint256[] calldata tokenIds,
        bytes32[][] calldata proofs
    ) external view returns (bool[] memory results);

    /**
     * @dev Checks if a credential is still valid (not expired or revoked)
     * @param tokenId The token identifier
     * @return isValid Whether the credential is currently valid
     */
    function isCredentialValid(uint256 tokenId)
        external
        view
        returns (bool isValid);
}
