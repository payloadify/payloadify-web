# Payloadify — Project Brief

## What this is
A security/pentest utility tools hub, similar to iLovePDF but for pentesters.
One tool per page, SEO-first, free to use. Domain: payloadify.dev

## Target audience
Pentesters, bug bounty hunters, OSCP/CEH students, red teamers.
They arrive via Google search for a specific task, use the tool once, leave.

## Tech stack
- Frontend: Next.js (static export) or plain Vue/React SPA
- Hosting: Cloudflare Pages (free tier)
- Backend (only when unavoidable, e.g. DNS lookups): Cloudflare Workers
- No database, no user accounts, no login for v1
- Keep everything client-side (runs in browser) wherever possible —
  this is a real selling point for a security-conscious audience

## Build order (v1 — build in this order, one at a time)
1. JWT Decoder/Tamper — decode header/payload, flag alg:none and weak signing
2. Hash Identifier — detect hash type (MD5/SHA1/SHA256/NTLM/bcrypt) + show matching Hashcat mode number
3. Payload Encoder/Decoder — chainable Base64, Hex, URL, HTML-entity, and Unicode escape encode/decode
4. CVSS 3.1/4.0 Calculator — click-through vectors, output vector string
5. Reverse Shell Generator — multi-language one-liners (bash, python, PHP, nc, PowerShell)

(Tools 6-8 — subdomain permutation generator, security headers analyzer,
SPF/DKIM/DMARC checker — come later, after v1 validates)

## Deferred features (intentionally out of scope for now)
- Hash Identifier batch mode (paste a whole file of dumped hashes, one per
  line, get a results table) — v1 only identifies one hash at a time.
  Batch support is saved as a future monetization-driving feature once site
  traffic justifies the extra build effort, not part of initial launch.

## Future ideas (not active build order)
- A dedicated bcrypt tool/page — bcrypt needs a salt + cost-factor input,
  which is a different UI shape than the plain "type text, get a hash"
  Hash Generator. Worth its own page eventually rather than bolting onto
  Hash Generator. Not scheduled; revisit after the current build order.

## Design/UX principles
- One URL per tool (e.g. /jwt-decoder), never a single blank-canvas app
- Fast load, minimal JS, no unnecessary dependencies
- Clean, modern UI — this is competing against dated tools like jwt.io
- Every tool page needs a unique <title> and meta description matching
  how people actually search (e.g. "jwt decoder online")

## Important constraints
- I (the project owner) have a pentesting/security background but am NOT
  an experienced coder. Explain what you're building in plain terms as you go.
- Since our audience is security-literate, correctness matters a lot —
  flag any assumptions or edge cases you're unsure about rather than
  guessing silently.
- Budget is near-$0. Avoid suggesting paid services/dependencies unless
  there's no free alternative.

## Scope discipline
Do not add features, fields, or behaviors beyond what's explicitly requested. 
If you think an enhancement would help, describe it and ask before building 
it — don't build it silently as part of an unrelated task.