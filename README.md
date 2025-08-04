# IDverse

A blockchain-powered digital identity system for refugees and undocumented individuals that enables secure, verifiable, and self-sovereign identity ownership — without needing a nation-issued document.

---

## Overview

IDverse consists of ten smart contracts that together build a decentralized, privacy-preserving identity ecosystem:

1. **Identity Manager Contract** – Creates and manages decentralized identities (DIDs).
2. **Credential Registry Contract** – Registers, revokes, and verifies verifiable credentials (VCs).
3. **Issuer Registry Contract** – Manages trusted credential issuers (NGOs, agencies).
4. **Access Control Contract** – Controls consent-based data sharing with third parties.
5. **Social Recovery Contract** – Enables identity recovery via trusted contacts or organizations.
6. **Reputation Score Contract** – Calculates dynamic trust scores based on issued credentials.
7. **Dispute Resolution Contract** – Handles credential-related disputes and fraud claims.
8. **Incentives Token Contract** – Issues non-transferable tokens to reward participation.
9. **Credential NFT Contract** – Mints non-transferable SBTs representing key credentials.
10. **Governance DAO Contract** – Oversees protocol rules, issuer approvals, and dispute outcomes.

---

## Features

- **Decentralized Identity (DID)** creation with user-owned keys  
- **Verifiable Credentials (VC)** issued by NGOs, schools, and aid agencies  
- **Selective disclosure and access control** for sensitive data  
- **Credential NFTs (Soulbound)** to prove education, health, or refugee status  
- **Social recovery** without centralized custodians  
- **Governance DAO** led by NGO and civil society stakeholders  
- **Privacy-preserving architecture** with off-chain proofs and ZK integrations  
- **Reputation score** for access to jobs, education, and aid  
- **Reward tokens** to encourage participation and verification  
- **Dispute resolution** to protect against misuse or false credentials  

---

## Smart Contracts

### Identity Manager Contract
- Creates and deactivates DIDs
- Associates wallet addresses with identity metadata
- Verifies proof-of-personhood via biometric hash or trusted attestations

### Credential Registry Contract
- Registers credentials with metadata hash and expiry
- Revokes or re-validates credentials
- References off-chain data stored on IPFS

### Issuer Registry Contract
- Onboards and verifies credential issuers
- Includes NGOs, UN agencies, schools, health orgs
- DAO-managed approval and audit process

### Access Control Contract
- Consent-based credential sharing with third parties
- Generates view keys or access tokens with expiration
- Logs access requests and approvals

### Social Recovery Contract
- Enables identity recovery via guardians (NGOs or trusted contacts)
- Multisig-style recovery process
- Protects against wallet/key loss

### Reputation Score Contract
- Calculates a dynamic trust score based on credentials
- Scores weighted by issuer reputation and credential type
- Helps aid orgs and employers assess eligibility

### Dispute Resolution Contract
- Allows challenge and resolution of fake or disputed credentials
- DAO-based or multisig arbitration system
- Blacklists malicious issuers if proven

### Incentives Token Contract
- Issues reputation tokens (non-transferable) for verification and participation
- Used for credential issuers, reviewers, and active identity holders

### Credential NFT Contract
- Mints key credentials (e.g. education, health clearance) as Soulbound NFTs
- Non-transferable and privacy-aware
- Integrated with off-chain verification mechanisms

### Governance DAO Contract
- Votes on onboarding/removing issuers
- Updates system parameters (e.g. credential expiration logic)
- Manages dispute resolution outcomes and budget allocations

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/idverse.git
   ```
3. Run tests:
    ```bash
    npm test
    ```
4. Deploy contracts:
    ```bash
    clarinet deploy
    ```

---

## Usage

Each smart contract is modular and interacts with others via on-chain calls and metadata hashes.
Refer to individual contract documentation for ABI, usage examples, and integration workflows.

- Use identity-manager to register and update user identities.
- Use credential-registry to attach proofs from issuers.
- Use access-control to grant third-party access.
- Use social-recovery to restore access if keys are lost.

---

## License

MIT License