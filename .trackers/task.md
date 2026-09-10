# Task: Frontend CI npm ci fix

## Issue
CI `npm ci` failed with EUSAGE when package-lock.json was missing from the checkout.

## Fix
- Install step: use npm ci if lockfile exists, else npm install + log warning
- package-lock.json must remain tracked (not gitignored)

## Note
PR #28 (dev → master) should bring package-lock onto master; this hardens CI either way.
