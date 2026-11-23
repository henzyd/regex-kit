# Security Policy

## Supported versions

regex-kit is a single-track project. Security fixes go into the latest release, and there
are no maintained older branches.

| Version        | Supported |
| -------------- | --------- |
| Latest release | Yes       |
| Anything older | No        |

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it through GitHub's private vulnerability reporting:

<https://github.com/henzyd/regex-kit/security/advisories/new>

That channel is visible only to the maintainers. You will get an acknowledgement within
seven days, and an assessment with a fix or a rejection within thirty.

Useful things to include:

- What an attacker can do, and what they need to already have in order to do it
- The affected version, your runtime and version, and whether you use ESM or CommonJS
- A minimal reproduction, ideally the exact input string that triggers it

## What is in scope

regex-kit ships patterns that other people run against input they do not control. The
interesting attack surface is therefore the patterns themselves:

- **Catastrophic backtracking (ReDoS):** an input string that makes an exported pattern
  or helper take super-linear time. A short string that stalls a thread is a finding.
- A pattern that accepts input it is documented to reject, where a caller would
  reasonably rely on that for a security decision.
- A helper that fails to escape or neutralise input it claims to make safe.
- A dependency, or a file in the published tarball, that should not be there.

regex-kit makes no network requests, runs no subprocesses, and has no runtime
dependencies. If you find it doing any of those, that is a finding in itself.

## What is out of scope

- Findings that require the user to have already been persuaded to run untrusted code.
- Patterns used for something their documentation says they are not for. A format check
  is not an authorisation check.
- Wrong matches with no security consequence. That is a bug, and belongs in the public
  issue tracker.
- Dependency advisories in development tooling, which never reaches a user's machine.

## Disclosure

We will credit you in the release notes unless you prefer otherwise. Please give us a
chance to ship a fix before publishing details.
