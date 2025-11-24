# Smart Contract Integration Mapping

## HealthPassport Contract Functions Available:
1. **mint(address to, string memory uri, string memory credType)** - Mint new health credentials
2. **balanceOf(address owner)** - Get number of credentials owned
3. **tokensOf(address owner)** - Get all token IDs owned by address
4. **ownerOf(uint256 tokenId)** - Get owner of specific token
5. **tokenURI(uint256 tokenId)** - Get metadata URI of token
6. **credentialType(uint256 tokenId)** - Get credential type of token
7. **isRevoked(uint256 tokenId)** - Check if credential is revoked
8. **verify(uint256 tokenId, bytes32[] proof)** - Verify credential with proof
9. **revoke(uint256 tokenId, string reason)** - Revoke credential
10. **totalSupply()** - Get total number of minted credentials

## Page Integration Mapping:

### ✅ FULLY SUPPORTED PAGES:

#### 1. `/credentials` page
- **Smart Contract Functions Used:**
  - `mint()` - Mint health achievement badges
  - `tokensOf()` - Display user's earned credentials
  - `balanceOf()` - Show total credential count
  - `credentialType()` - Filter credentials by type
  - `tokenURI()` - Get credential metadata
- **Implementation Status:** ✅ Ready to integrate
- **Missing Functions:** None

#### 2. `/dashboard` page  
- **Smart Contract Functions Used:**
  - `mint()` - Bulk mint credentials (audience challenge)
  - `balanceOf()` - Show credential count in stats
  - `tokensOf()` - Recent achievements display
  - `totalSupply()` - Network-wide stats
- **Implementation Status:** ✅ Ready to integrate  
- **Missing Functions:** None

#### 3. `/test` page
- **Smart Contract Functions Used:**
  - `mint()` - Test credential minting
  - `balanceOf()` - Test balance queries
  - `verify()` - Test credential verification
- **Implementation Status:** ✅ Already integrated
- **Missing Functions:** None

### ⚠️ PARTIALLY SUPPORTED PAGES:

#### 4. `/connect` page
- **Smart Contract Functions Used:**
  - `mint()` - Mint "Data Connection" credentials when linking devices
  - `credentialType()` - Track different data source credentials
- **Implementation Status:** ⚠️ Partial integration possible
- **Missing Functions:** No missing functions, but needs custom integration
- **Note:** Can mint credentials for successful data connections

#### 5. `/profile` page (if exists)
- **Smart Contract Functions Used:**
  - `tokensOf()` - Display all user credentials
  - `balanceOf()` - Profile statistics  
  - `credentialType()` - Organize credentials by category
- **Implementation Status:** ⚠️ Needs investigation
- **Missing Functions:** None

### 🚫 PAGES NEEDING CUSTOM IMPLEMENTATION:

#### 6. `/chat` page
- **Current Limitation:** Smart contract has no chat/message storage functions
- **Possible Integration:**
  - `mint()` - Mint "AI Consultation" credentials after chat sessions
  - `credentialType()` - Track consultation types (preventive, emergency, etc.)
- **Implementation Status:** 🚫 Limited integration (achievement-based only)
- **Missing Functions:** 
  - Chat history storage (not blockchain appropriate)
  - Message threading (not blockchain appropriate)
  - Real-time messaging (not blockchain appropriate)

#### 7. Landing page (`/`)  
- **Smart Contract Functions Used:**
  - `totalSupply()` - Show network statistics
  - Public credential verification demos
- **Implementation Status:** ✅ Demo integration possible
- **Missing Functions:** None

#### 8. Authentication pages (`/login`, `/signup`)
- **Current Limitation:** No user authentication functions in contract
- **Possible Integration:**
  - `mint()` - Mint "Account Verified" credential on signup
  - `balanceOf()` - Check if user has verification credentials
- **Implementation Status:** 🚫 Limited integration
- **Missing Functions:**
  - User registration (handled off-chain)
  - Password management (handled off-chain)  
  - Session management (handled off-chain)

## Integration Priority:

### HIGH PRIORITY (Immediate Integration):
1. ✅ `/credentials` - Core credential management
2. ✅ `/dashboard` - User overview and batch operations
3. ✅ `/test` - Already working

### MEDIUM PRIORITY (Enhanced Features):
4. ⚠️ `/connect` - Data source credential minting
5. ⚠️ `/profile` - Credential portfolio display

### LOW PRIORITY (Achievement Integration):  
6. 🚫 `/chat` - Session completion credentials
7. ✅ `/` (landing) - Public statistics display
8. 🚫 Auth pages - Verification credentials

## Implementation Strategy:

### Phase 1: Core Integration (Ready Now)
- Enhance `/credentials` with full smart contract integration
- Enhance `/dashboard` with blockchain-based statistics
- Add verification and revocation capabilities

### Phase 2: Extended Integration  
- Add data source credentials to `/connect`
- Create comprehensive profile with credential portfolio
- Add public verification demos to landing page

### Phase 3: Achievement Integration
- Mint consultation credentials in chat
- Add verification badges for authenticated users
- Implement credential-gated features

## Functions NOT in Contract (Need Custom Implementation):
- User profile storage (use IPFS + tokenURI)
- Chat message storage (use traditional database)  
- Device connection status (use off-chain storage)
- Authentication data (use traditional auth)
- Real-time notifications (use WebSocket/polling)
