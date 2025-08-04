;; credential-registry.clar
;; Implements verifiable credential registration, revocation, and validation for self-sovereign identity systems
;; Clarity v2

;; ---------- Constants ----------
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ISSUER-NOT-REGISTERED u101)
(define-constant ERR-CREDENTIAL-NOT-FOUND u102)
(define-constant ERR-CREDENTIAL-ALREADY_EXISTS u103)
(define-constant ERR-CREDENTIAL_REVOKED u104)

;; ---------- Data Structures ----------
(define-map credentials
  { subject: principal, hash: (buff 32) }
  {
    issuer: principal,
    issued-at: uint,
    expires-at: uint,
    revoked: bool
  }
)

(define-map approved-issuers principal bool)

(define-data-var admin principal tx-sender)

;; ---------- Private Helpers ----------
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; ---------- Public Admin Functions ----------
(define-public (add-issuer (issuer principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (map-set approved-issuers issuer true)
    (ok true)
  )
)

(define-public (remove-issuer (issuer principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (map-delete approved-issuers issuer)
    (ok true)
  )
)

;; ---------- Credential Operations ----------
(define-public (issue-credential (subject principal) (hash (buff 32)) (expires-at uint))
  (begin
    (asserts! (is-some (map-get? approved-issuers tx-sender)) (err ERR-ISSUER-NOT-REGISTERED))
    (let ((key { subject: subject, hash: hash }))
      (asserts! (is-none (map-get? credentials key)) (err ERR-CREDENTIAL-ALREADY_EXISTS))
      (map-set credentials key {
        issuer: tx-sender,
        issued-at: block-height,
        expires-at: expires-at,
        revoked: false
      })
      (ok true)
    )
  )
)

(define-public (revoke-credential (subject principal) (hash (buff 32)))
  (let ((key { subject: subject, hash: hash }))
    (match (map-get? credentials key)
      some cred
        (begin
          (asserts! (is-eq tx-sender (get issuer cred)) (err ERR-NOT-AUTHORIZED))
          (map-set credentials key (merge cred { revoked: true }))
          (ok true)
        )
      none (err ERR-CREDENTIAL-NOT-FOUND)
    )
  )
)

;; ---------- Read-Only Functions ----------
(define-read-only (verify-credential (subject principal) (hash (buff 32)))
  (let ((key { subject: subject, hash: hash }))
    (match (map-get? credentials key)
      some cred
        (if (or (get revoked cred) (> block-height (get expires-at cred)))
            (err ERR-CREDENTIAL_REVOKED)
            (ok true)
        )
      none (err ERR-CREDENTIAL-NOT-FOUND)
    )
  )
)

(define-read-only (get-credential (subject principal) (hash (buff 32)))
  (let ((key { subject: subject, hash: hash }))
    (match (map-get? credentials key)
      some cred (ok cred)
      none (err ERR-CREDENTIAL-NOT-FOUND)
    )
  )
)

(define-read-only (is-issuer (account principal))
  (ok (is-some (map-get? approved-issuers account)))
)

(define-read-only (get-admin)
  (ok (var-get admin))
)
