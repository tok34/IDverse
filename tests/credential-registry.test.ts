// credential-registry.test.ts
import { describe, it, expect, beforeEach } from "vitest"

type Principal = string
type CredentialHash = string

interface Credential {
  issuer: Principal
  issuedAt: number
  expiresAt: number
  revoked: boolean
}

const ERR = {
  NOT_AUTHORIZED: 100,
  ISSUER_NOT_REGISTERED: 101,
  CREDENTIAL_NOT_FOUND: 102,
  CREDENTIAL_ALREADY_EXISTS: 103,
  CREDENTIAL_REVOKED: 104
}

const mockContract = {
  admin: "ST1ADMIN1234",
  approvedIssuers: new Set<Principal>(),
  credentials: new Map<string, Credential>(),
  blockHeight: 1000,

  setBlockHeight(height: number) {
    this.blockHeight = height
  },

  getKey(subject: Principal, hash: CredentialHash) {
    return `${subject}:${hash}`
  },

  isAdmin(sender: Principal) {
    return sender === this.admin
  },

  addIssuer(sender: Principal, issuer: Principal) {
    if (!this.isAdmin(sender)) return { error: ERR.NOT_AUTHORIZED }
    this.approvedIssuers.add(issuer)
    return { value: true }
  },

  removeIssuer(sender: Principal, issuer: Principal) {
    if (!this.isAdmin(sender)) return { error: ERR.NOT_AUTHORIZED }
    this.approvedIssuers.delete(issuer)
    return { value: true }
  },

  issueCredential(sender: Principal, subject: Principal, hash: CredentialHash, expiresAt: number) {
    if (!this.approvedIssuers.has(sender)) return { error: ERR.ISSUER_NOT_REGISTERED }
    const key = this.getKey(subject, hash)
    if (this.credentials.has(key)) return { error: ERR.CREDENTIAL_ALREADY_EXISTS }

    this.credentials.set(key, {
      issuer: sender,
      issuedAt: this.blockHeight,
      expiresAt,
      revoked: false
    })
    return { value: true }
  },

  revokeCredential(sender: Principal, subject: Principal, hash: CredentialHash) {
    const key = this.getKey(subject, hash)
    const cred = this.credentials.get(key)
    if (!cred) return { error: ERR.CREDENTIAL_NOT_FOUND }
    if (cred.issuer !== sender) return { error: ERR.NOT_AUTHORIZED }

    cred.revoked = true
    return { value: true }
  },

  verifyCredential(subject: Principal, hash: CredentialHash) {
    const key = this.getKey(subject, hash)
    const cred = this.credentials.get(key)
    if (!cred) return { error: ERR.CREDENTIAL_NOT_FOUND }
    if (cred.revoked || this.blockHeight > cred.expiresAt) return { error: ERR.CREDENTIAL_REVOKED }
    return { value: true }
  },

  getCredential(subject: Principal, hash: CredentialHash) {
    const key = this.getKey(subject, hash)
    const cred = this.credentials.get(key)
    if (!cred) return { error: ERR.CREDENTIAL_NOT_FOUND }
    return { value: cred }
  }
}

describe("Credential Registry", () => {
  const issuer = "ST2ISSUER"
  const subject = "ST3SUBJECT"
  const hash = "0xabc123"

  beforeEach(() => {
    mockContract.approvedIssuers.clear()
    mockContract.credentials.clear()
    mockContract.setBlockHeight(1000)
  })

  it("allows admin to add a credential issuer", () => {
    const res = mockContract.addIssuer(mockContract.admin, issuer)
    expect(res).toEqual({ value: true })
    expect(mockContract.approvedIssuers.has(issuer)).toBe(true)
  })

  it("prevents non-admin from adding issuers", () => {
    const res = mockContract.addIssuer(subject, issuer)
    expect(res).toEqual({ error: ERR.NOT_AUTHORIZED })
  })

  it("allows issuer to issue a credential", () => {
    mockContract.addIssuer(mockContract.admin, issuer)
    const res = mockContract.issueCredential(issuer, subject, hash, 1100)
    expect(res).toEqual({ value: true })
  })

  it("prevents duplicate credentials", () => {
    mockContract.addIssuer(mockContract.admin, issuer)
    mockContract.issueCredential(issuer, subject, hash, 1100)
    const res = mockContract.issueCredential(issuer, subject, hash, 1200)
    expect(res).toEqual({ error: ERR.CREDENTIAL_ALREADY_EXISTS })
  })

  it("allows issuer to revoke a credential", () => {
    mockContract.addIssuer(mockContract.admin, issuer)
    mockContract.issueCredential(issuer, subject, hash, 1100)
    const res = mockContract.revokeCredential(issuer, subject, hash)
    expect(res).toEqual({ value: true })
    const verify = mockContract.verifyCredential(subject, hash)
    expect(verify).toEqual({ error: ERR.CREDENTIAL_REVOKED })
  })

  it("fails verification on expired credential", () => {
    mockContract.addIssuer(mockContract.admin, issuer)
    mockContract.issueCredential(issuer, subject, hash, 1050)
    mockContract.setBlockHeight(1100)
    const res = mockContract.verifyCredential(subject, hash)
    expect(res).toEqual({ error: ERR.CREDENTIAL_REVOKED })
  })

  it("retrieves credential details", () => {
    mockContract.addIssuer(mockContract.admin, issuer)
    mockContract.issueCredential(issuer, subject, hash, 1200)
    const res = mockContract.getCredential(subject, hash)
    expect(res.value).toMatchObject({
      issuer,
      issuedAt: 1000,
      expiresAt: 1200,
      revoked: false
    })
  })
})
