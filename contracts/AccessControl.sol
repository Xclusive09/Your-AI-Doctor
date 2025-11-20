// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessControl
 * @dev Role-based access control for health passport system
 */
contract AccessControl {
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
     * @dev Emitted when a role admin is changed
     */
    event RoleAdminChanged(
        bytes32 indexed role,
        bytes32 indexed previousAdminRole,
        bytes32 indexed newAdminRole
    );

    /**
     * @dev Modifier to check if caller has a specific role
     */
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "AccessControl: unauthorized");
        _;
    }

    /**
     * @dev Constructor grants admin role to deployer
     */
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(VERIFIER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(HEALTHCARE_PROVIDER_ROLE, ADMIN_ROLE);
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
        require(account == msg.sender, "AccessControl: can only renounce own roles");
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
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roleAdmins[role] = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }
}
