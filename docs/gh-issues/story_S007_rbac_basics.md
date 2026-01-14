# Story S007 — Authorization roles and RBAC basics

Parent Epic: E002 — Authentication & User Management
Story ID: S007

Description:
Introduce minimal role-based access controls for admin and user operations.

Acceptance Criteria:
- Middleware to check roles present.
- At least one admin-only endpoint exists and is protected.

Priority: Medium
Estimate: 1d

Notes:
- Start with two roles: `user` and `admin`. Keep the model extensible.
