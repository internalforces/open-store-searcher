# Security policy

## Supported version

The project is pre-release. Security fixes are made on the current `main` branch; older commits and
unmerged branches are not supported release lines. No production deployment is currently claimed.

## Reporting a vulnerability

GitHub private vulnerability reporting is not currently enabled for this repository. Do not put
exploit details, credentials, tokens, personal data, or a working proof of concept in a public issue.

Open a minimal issue stating that you need a private security contact, with only a broad component
and impact category. The maintainer will arrange a private channel. If even that minimal disclosure
would create risk, contact the repository owner through the contact methods on the owner's GitHub
profile instead.

Once a private channel is established, include:

- affected commit, file, workflow, or URL;
- prerequisites and reproducible steps;
- observed and expected behavior;
- likely impact and whether exploitation has occurred;
- a minimal proof of concept with secrets and personal data removed;
- any suggested remediation or disclosure constraints.

Do not test against third-party systems, public-data providers, map services, or a deployed site in
a way that could disrupt service, access data without authorization, or expose another person's
information. Use local fixtures whenever possible.

## Response process

The maintainer will acknowledge the report when it is received, assess the affected boundary, and
coordinate remediation and disclosure through the private channel. Security-related fixes require
review and explicit approval before release or deployment. Please allow time for verification; the
project will not trade away data-integrity, privacy, or last-known-good safeguards for a quick fix.

Public disclosure should wait until a fix or mitigation is available and the maintainer agrees on
the disclosure timing. Credit will be offered when requested and safe.
