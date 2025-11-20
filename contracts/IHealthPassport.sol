// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IHealthPassport
 * @dev Interface for Health Passport soulbound token system
 */
interface IHealthPassport {
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
    ) external returns (bool success);

    /**
     * @dev Returns the owner of a token
     * @param tokenId The token identifier
     * @return owner The address of the token owner
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Returns the metadata URI for a token
     * @param tokenId The token identifier
     * @return uri The metadata URI
     */
    function tokenURI(uint256 tokenId) external view returns (string memory uri);

    /**
     * @dev Returns the number of tokens owned by an address
     * @param owner The address to query
     * @return balance The number of tokens owned
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns all credential token IDs for an owner
     * @param owner The address to query
     * @return tokenIds Array of token IDs
     */
    function getCredentialsByOwner(address owner)
        external
        view
        returns (uint256[] memory tokenIds);
}
