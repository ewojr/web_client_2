# Security Policy

The Password Depot Web Client is a browser based password manager, so we
take security reports seriously and appreciate responsible disclosure.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report privately through one of these channels:

1. **GitHub private vulnerability reporting** (preferred) — on this repository,
   go to the **Security** tab → **Report a vulnerability**. This opens a private
   advisory visible only to you and the maintainers.
   <!-- Maintainers: enable this under Settings → Code security and analysis →
        "Private vulnerability reporting" before publishing the repo. -->
2. **Email** — `info@password-depot.de`.

Please include:

- A description of the issue and its potential impact.
- Steps to reproduce (proof-of-concept, affected URL/endpoint, request/response if
  relevant).
- The version / commit of the web client and the PD Server REST API version.
- Any suggested remediation, if you have one.

We aim to acknowledge reports within **5 business days** and to keep you updated
as we investigate. Please give us a reasonable window to release a fix before any
public disclosure.

## Scope

**In scope** — the code in this repository (the web client SPA): authentication
flows, token/second-password handling, CSP, XSS/injection surfaces, OIDC/Azure
callback validation, clipboard handling, and dependency vulnerabilities.

**Out of scope** — the Password Depot Server and the REST API itself. Those are
separate products; for issues in the API contract see
https://github.com/acebit-gmbh/pd_rest_api, and report server-side
vulnerabilities to the same security contact above noting that they concern the
server, not this client.

## Supported versions

This repository tracks the current release of the web client (`2.x`). Security
fixes are applied to the latest released version. Older versions are not
maintained.

## Good to know

- The client performs **no client-side cryptography** — it relies on HTTPS for
  confidentiality and the PD Server for decryption. Reports that assume otherwise
  may be working from an incorrect model; see the "Security Model" section of the
  [README](README.md).
- Access tokens live only in tab-scoped `sessionStorage` and are never persisted
  to `localStorage` or cookies; second passwords are held in memory only.
