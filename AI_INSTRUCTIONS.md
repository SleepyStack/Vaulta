# Vaulta Project Rules & Context
- **Backend**: Spring Boot 3. SecureUser uses `email` for the `username` field.
- **Frontend**: Next.js 15 (App Router).
- **API Client**: Axios instance in `@/lib/api`.
- **Auth Implementation**:
    - Login requires `email` and `password`.
    - Store JWT as 'vaulta_token'.
    - If any request returns 401, clear localStorage and redirect to `/login`.
- **Token Versioning**: User entity has `tokenVersion`. Ensure frontend clears session if token becomes invalid due to a version mismatch.
- **Styling**: Modern dark Fintech UI. Slate-950 background, Emerald-500 primary accents.