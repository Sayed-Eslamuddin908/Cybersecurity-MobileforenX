# Contributing to MobileForenX

Thank you for your interest in contributing to **MobileForenX**.

MobileForenX is a Mobile Forensics Toolkit focused on authorized forensic analysis, cybersecurity education, research, and controlled laboratory use.

## Before Contributing

Please:

- Read the `README.md`.
- Review `SECURITY.md`.
- Do not upload real private forensic evidence.
- Do not commit credentials, API keys, private keys, or tokens.
- Use synthetic or properly authorized datasets for testing.
- Keep changes focused and documented.

## Development Setup

```bash
git clone <YOUR-REPOSITORY-URL>
cd Cybersecurity-MobileforenX

python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Start the project:

```bash
chmod +x mft
./mft
```

## Recommended Workflow

```text
Fork
  ↓
Create Branch
  ↓
Develop
  ↓
Test
  ↓
Document
  ↓
Commit
  ↓
Push
  ↓
Pull Request
```

Example:

```bash
git checkout -b feature/new-artifact-parser
```

## Adding a Forensic Module

When adding a new artifact parser or forensic module:

1. Define the artifact and evidence source.
2. Implement the parser or processing logic.
3. Validate input and handle errors safely.
4. Add tests where practical.
5. Add logging without exposing sensitive data.
6. Integrate reporting where appropriate.
7. Update the README and changelog.

## Code Quality

Prefer:

- Clear Python code
- Small, maintainable functions
- Safe path handling
- Explicit error handling
- Minimal external dependencies
- Documentation for public interfaces

## Pull Requests

A pull request should include:

- A clear description of the change.
- Testing performed.
- Relevant documentation updates.
- Any compatibility or dependency changes.

Do not include real case evidence or confidential investigation material.

## Responsible Use

Contributions must support legitimate and authorized forensic, educational, research, or defensive purposes.

The project must not be used to facilitate unauthorized access, surveillance, privacy violations, or theft of data.
