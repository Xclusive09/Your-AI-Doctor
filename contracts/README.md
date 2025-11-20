# Health Passport Smart Contracts

This directory contains the Solidity smart contracts for the AI Doctor Health Passport system on BlockDAG blockchain.

## 📋 Contract Overview

### Core Contracts

#### 1. **HealthPassport.sol**
Main contract for managing soulbound health credential NFTs.

**Features:**
- Mints non-transferable (soulbound) health credentials
- Tracks ownership and balances
- Manages credential metadata
- Supports zero-knowledge proof verification
- Credential revocation functionality
- ERC721-compatible interface

**Key Functions:**
- `mintSoulbound(tokenId, recipient, metadata)` - Mint a new credential
- `ownerOf(tokenId)` - Get credential owner
- `balanceOf(address)` - Get credential count for address
- `getCredentialsByOwner(address)` - Get all credentials for owner
- `verifyCredential(tokenId, proof)` - Verify credential with ZK proof
- `revokeCredential(tokenId, reason)` - Revoke a credential

#### 2. **HealthCredentials.sol**
Manages different types of health credentials and their requirements.

**Features:**
- Define and register credential types
- Track credential statistics
- Manage credential requirements
- Set validity periods for credentials
- Default credential types pre-registered

**Default Credential Types:**
- **Verified Walker**: 90 days with ≥10,000 steps
- **Deep Sleep Master**: 60 nights with ≥8 hours sleep
- **Metabolic Champion**: 30-day glucose SD <15
- **Cardio Elite**: 90-day average HRV >70
- **Century Club**: 100,000 steps in 7 days
- **7-Day Streak Master**: 7 consecutive days tracking

**Key Functions:**
- `registerCredentialType(typeId, name, description, requirements, validityPeriod)` - Register new type
- `getCredentialType(typeId)` - Get credential type details
- `getCredentialStats(typeId)` - Get issuance statistics
- `recordCredentialIssued(typeId)` - Record new issuance
- `recordCredentialRevoked(typeId)` - Record revocation

#### 3. **AccessControl.sol**
Role-based access control for the health passport system.

**Roles:**
- **ADMIN_ROLE**: System administrators
- **MINTER_ROLE**: Authorized credential minters
- **VERIFIER_ROLE**: Credential verifiers
- **HEALTHCARE_PROVIDER_ROLE**: Healthcare data providers

**Key Functions:**
- `grantRole(role, account)` - Grant role to account
- `revokeRole(role, account)` - Revoke role from account
- `hasRole(role, account)` - Check if account has role
- `renounceRole(role, account)` - Renounce own role

### Supporting Contracts

#### 4. **HealthDataRegistry.sol**
Registry for managing authorized health data providers and data sources.

**Features:**
- Register and manage health data providers
- Connect and verify data sources
- Track data synchronization
- Support for multiple data source types

**Supported Data Sources:**
- Apple Health
- Google Fit
- Oura Ring
- Levels (glucose monitoring)
- Whoop
- MyFitnessPal

**Key Functions:**
- `registerProvider(providerId, name, description, address, dataTypes)` - Register provider
- `connectDataSource(sourceId, name, sourceType)` - Connect user data source
- `syncDataSource(sourceId)` - Update sync timestamp
- `verifyDataSource(sourceId)` - Verify data source authenticity
- `getUserDataSources(address)` - Get all sources for user

#### 5. **ZKVerifier.sol**
Zero-knowledge proof verification for privacy-preserving credential verification.

**Features:**
- Merkle tree-based proof verification
- Batch proof verification support
- Proof replay prevention
- Privacy-preserving data verification
- Time-bound verification parameters

**Key Functions:**
- `setVerificationParams(verificationId, merkleRoot, threshold, validUntil)` - Set verification params
- `verifyProof(verificationId, proof, leaf)` - Verify a ZK proof
- `batchVerifyProofs(verificationId, proofs, leaves)` - Batch verify proofs
- `checkProof(verificationId, proof, leaf)` - Check proof without recording
- `verifyPrivateData(verificationId, dataHash, proof)` - Verify private data

#### 6. **BatchMinting.sol**
Enables efficient batch minting of health credentials for high-throughput scenarios.

**Features:**
- Batch mint multiple credentials in one transaction
- Optimized for BlockDAG's 10,000+ TPS
- Audience challenge support
- Automatic retry on failures
- Detailed minting statistics

**Key Functions:**
- `batchMintCredentials(recipients, tokenIds, metadataList)` - Batch mint credentials
- `mintAudienceChallenge(recipient, count, baseTokenId, credentialType)` - Mint for challenge
- `getBatchRequest(batchId)` - Get batch details
- `getStatistics()` - Get minting statistics

### Interface Contracts

#### 7. **IHealthPassport.sol**
Interface definition for Health Passport contract.

#### 8. **ICredentialVerifier.sol**
Interface definition for credential verification functionality.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│                    (Next.js Frontend)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BlockDAG Blockchain                       │
│                                                              │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │ HealthPassport │◄────────┤ BatchMinting    │            │
│  │     (Main)     │         │   (Utility)     │            │
│  └────────────────┘         └─────────────────┘            │
│         │  │                                                │
│         │  │                                                │
│         │  └──────┬─────────────────┬──────────────┐      │
│         │         ▼                 ▼              ▼      │
│         │  ┌────────────┐    ┌───────────┐  ┌──────────┐ │
│         │  │ ZKVerifier │    │  Health   │  │  Health  │ │
│         │  │            │    │ Credentials│  │   Data   │ │
│         │  └────────────┘    └───────────┘  │ Registry │ │
│         │                                    └──────────┘ │
│         ▼                                                  │
│  ┌────────────────┐                                       │
│  │ AccessControl  │                                       │
│  │   (Base)       │                                       │
│  └────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Deployment Guide

**Want to deploy right now?** 👉 See [QUICKSTART.md](./QUICKSTART.md)

**Need detailed instructions?** 👉 See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Simple Deployment Process

1. **Compile** contract in BlockDAG IDE
2. **Copy** ABI and Bytecode
3. **Run** `standalone-deploy.js` script
4. **Save** contract address
5. **Download** ABI to `contracts/HealthPassport.json`
6. **Update** `.env.local` with contract address
7. **Install** web3: `npm install web3`
8. **Test** your integration!

### Files for Deployment

- **`standalone-deploy.js`** - Main deployment script for BlockDAG IDE
- **`blockdag-deploy.js`** - Alternative deployment script
- **`deploy.js`** - Local deployment with Node.js
- **`package.json`** - Dependencies for local deployment
- **`QUICKSTART.md`** - Step-by-step deployment guide
- **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment documentation

### Prerequisites

1. **BlockDAG Wallet** with test tokens
2. **BlockDAG IDE Access** for compilation
3. **Node.js 18+** (if deploying locally)
4. **Web3.js** will be installed automatically

### Compilation

#### Using BlockDAG IDE (Recommended):
1. Open https://ide.blockdag.network
2. Upload contract files
3. Click "Compile"
4. Copy ABI and Bytecode

#### Using Hardhat (Alternative):
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat compile
```

#### Using Foundry (Alternative):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge build
```

### Deployment Order

Deploy contracts in this specific order due to dependencies:

1. **AccessControl.sol** (base contract, no dependencies)
2. **HealthCredentials.sol** (inherits AccessControl)
3. **HealthDataRegistry.sol** (inherits AccessControl)
4. **ZKVerifier.sol** (inherits AccessControl)
5. **HealthPassport.sol** (inherits AccessControl, implements interfaces)
6. **BatchMinting.sol** (requires HealthPassport address)

### Deployment Script Example

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Health Passport contracts to BlockDAG...");

  // 1. Deploy HealthPassport (includes AccessControl)
  const HealthPassport = await ethers.getContractFactory("HealthPassport");
  const healthPassport = await HealthPassport.deploy();
  await healthPassport.waitForDeployment();
  console.log("HealthPassport deployed to:", await healthPassport.getAddress());

  // 2. Deploy HealthCredentials
  const HealthCredentials = await ethers.getContractFactory("HealthCredentials");
  const healthCredentials = await HealthCredentials.deploy();
  await healthCredentials.waitForDeployment();
  console.log("HealthCredentials deployed to:", await healthCredentials.getAddress());

  // 3. Deploy HealthDataRegistry
  const HealthDataRegistry = await ethers.getContractFactory("HealthDataRegistry");
  const healthDataRegistry = await HealthDataRegistry.deploy();
  await healthDataRegistry.waitForDeployment();
  console.log("HealthDataRegistry deployed to:", await healthDataRegistry.getAddress());

  // 4. Deploy ZKVerifier
  const ZKVerifier = await ethers.getContractFactory("ZKVerifier");
  const zkVerifier = await ZKVerifier.deploy();
  await zkVerifier.waitForDeployment();
  console.log("ZKVerifier deployed to:", await zkVerifier.getAddress());

  // 5. Deploy BatchMinting
  const BatchMinting = await ethers.getContractFactory("BatchMinting");
  const batchMinting = await BatchMinting.deploy(await healthPassport.getAddress());
  await batchMinting.waitForDeployment();
  console.log("BatchMinting deployed to:", await batchMinting.getAddress());

  // Grant roles
  const MINTER_ROLE = await healthPassport.MINTER_ROLE();
  await healthPassport.grantRole(MINTER_ROLE, await batchMinting.getAddress());
  console.log("Granted MINTER_ROLE to BatchMinting contract");

  console.log("\nDeployment Summary:");
  console.log("====================");
  console.log("HealthPassport:", await healthPassport.getAddress());
  console.log("HealthCredentials:", await healthCredentials.getAddress());
  console.log("HealthDataRegistry:", await healthDataRegistry.getAddress());
  console.log("ZKVerifier:", await zkVerifier.getAddress());
  console.log("BatchMinting:", await batchMinting.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Hardhat Configuration

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    blockdag_testnet: {
      url: "https://api.testnet.blockdag.network",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 12345 // Replace with actual BlockDAG testnet chain ID
    }
  }
};
```

### Deploy to BlockDAG Testnet

```bash
npx hardhat run scripts/deploy.js --network blockdag_testnet
```

## 🧪 Testing

### Writing Tests

Create tests in the `test/` directory:

```javascript
// test/HealthPassport.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthPassport", function () {
  let healthPassport;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const HealthPassport = await ethers.getContractFactory("HealthPassport");
    healthPassport = await HealthPassport.deploy();
    await healthPassport.waitForDeployment();
  });

  it("Should mint a soulbound token", async function () {
    const tokenId = 1;
    const metadata = "ipfs://QmExample";
    
    await healthPassport.mintSoulbound(tokenId, user1.address, metadata);
    
    expect(await healthPassport.ownerOf(tokenId)).to.equal(user1.address);
    expect(await healthPassport.balanceOf(user1.address)).to.equal(1);
  });

  it("Should prevent token transfers (soulbound)", async function () {
    // Soulbound tokens cannot be transferred
    // Test implementation here
  });
});
```

### Run Tests

```bash
npx hardhat test
```

## 🔐 Security Considerations

### Access Control
- All sensitive functions are protected with role-based access control
- Admin role required for system configuration
- Minter role required for credential issuance
- Verifier role required for credential verification

### Soulbound Tokens
- Credentials are non-transferable (soulbound)
- Prevents secondary markets for health credentials
- Ensures credentials remain tied to original recipient

### Zero-Knowledge Proofs
- Privacy-preserving verification
- Merkle tree-based proof system
- Proof replay prevention
- Time-bound verification windows

### Best Practices
- Use OpenZeppelin contracts where applicable
- Regular security audits recommended
- Follow Solidity style guide
- Comprehensive testing before production deployment

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:
- Batch operations for multiple credentials
- Efficient storage patterns
- Minimal on-chain data storage
- Use of events for off-chain indexing

## 🔧 Integration

### Frontend Integration Example

```typescript
import { ethers } from 'ethers';
import HealthPassportABI from './contracts/HealthPassport.json';

// Connect to contract
const provider = new ethers.JsonRpcProvider('https://api.testnet.blockdag.network');
const signer = await provider.getSigner();
const healthPassport = new ethers.Contract(
  HEALTH_PASSPORT_ADDRESS,
  HealthPassportABI.abi,
  signer
);

// Mint a credential
async function mintCredential(tokenId, recipient, metadata) {
  const tx = await healthPassport.mintSoulbound(tokenId, recipient, metadata);
  await tx.wait();
  console.log('Credential minted:', tx.hash);
}

// Get user credentials
async function getUserCredentials(address) {
  const tokenIds = await healthPassport.getCredentialsByOwner(address);
  return tokenIds;
}
```

## 📝 License

MIT License - see main repository LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

For issues or questions about the smart contracts:
- Open an issue on [GitHub](https://github.com/Xclusive09/Your-AI-Doctor/issues)
- Check the [BlockDAG documentation](https://blockdag.network/docs)

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Soulbound health credentials
  - Role-based access control
  - Zero-knowledge proof support
  - Batch minting capabilities
  - Health data registry
  - Credential type management
