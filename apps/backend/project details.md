### Project Description: Implementing a Secure, Decoupled Authentication and User Data System with Keycloak and FastAPI

#### 1. Project Overview
This project implements a microservices architecture where:
- **Keycloak** acts as the dedicated Identity Provider (IdP) for authentication (authN), handling user login, passwords, multi-factor authentication (MFA), and issuing JSON Web Tokens (JWTs).
- **FastAPI** serves as the User Data Service, owning and managing business-specific user data (e.g., balances, subscriptions). It validates JWTs from Keycloak using JSON Web Key Sets (JWKS) and provides enriched data to requesting microservices.
- **Microservices** (e.g., Billing or Subscription services) obtain JWT access tokens directly from Keycloak, then use those tokens to query FastAPI for user data. This ensures decoupling: Keycloak focuses on auth, FastAPI on data, and microservices on business logic.

The system is designed for flexibility (e.g., swap Keycloak with another IdP like Auth0 by updating configs only), security (stateless JWT validation, short-lived tokens), and scalability (independent scaling of components). It follows OIDC/OAuth2 standards for interoperability.

**Key Goals**:
- Zero code changes for IdP replacement.
- Secure, stateless token validation.
- Centralized user data management in FastAPI to avoid bloating Keycloak.
- Microservices remain lightweight without direct DB access.

**Assumed Stack**:
- Python-based (FastAPI for the data service, Python libs for microservices).
- Docker for containerization.
- PostgreSQL (or similar) as FastAPI's DB.
- Deployment: Local dev with Docker, production on Kubernetes/AWS/EC2.

**Estimated Timeline**: 3–5 days for setup and testing (assuming basic familiarity with Docker and Python).

#### 2. Prerequisites
Before starting:
- **Hardware/Environment**: A machine with Docker, Python 3.10+, pip, and Git installed. At least 4GB RAM for local runs.
- **Accounts/Tools**:
  - Download Keycloak from the official site (quay.io/keycloak/keycloak, version 25.0 or latest stable as of 2026).
  - Install FastAPI dependencies: Run `pip install fastapi uvicorn python-jose[cryptography] httpx pydantic asyncpg` (for PostgreSQL) in a virtualenv.
  - Database: Install PostgreSQL locally or use a managed service like AWS RDS.
  - Secret Management: Use environment variables or a tool like Docker Secrets/Vault for production.
- **Knowledge**: Basic understanding of OAuth2/OIDC, JWTs, REST APIs, and Docker Compose.
- **Security Prep**: Generate strong passwords/secrets (use tools like `openssl rand -hex 32`). Enable HTTPS certificates (self-signed for dev, Let's Encrypt for prod).

#### 3. Step-by-Step Implementation

##### Step 3.1: Set Up Keycloak
Keycloak runs as a separate service. Configure it to handle only authentication—no business data.

1. **Install and Run Keycloak**:
   - Use Docker for ease: Create a `docker-compose.yml` file in a new directory (e.g., `/project/keycloak`):
     - Define a service for Keycloak with environment variables for admin credentials.
     - Map port 8080 to host.
     - Add a PostgreSQL service if you want persistent storage (optional for dev).
   - Run `docker-compose up -d` to start.
   - Access the admin console: http://localhost:8080 (use admin credentials from env vars).

2. **Configure Realm**:
   - In the admin console (left sidebar): Click "Create Realm".
   - Name: "myapp" (or your project name).
   - Enable features: Under Realm Settings > General, enable "User Profile" and "Client Policies".
   - Set token settings: Realm Settings > Tokens tab.
     - Access Token Lifespan: 5 minutes (short for security).
     - SSO Session Idle: 30 minutes.
     - Default Signature Algorithm: RS256 (asymmetric—important for JWKS).
   - Enable MFA: Realm Settings > Authentication > Policies. Create a policy for OTP (e.g., require for all users or conditional).

3. **Configure Clients**:
   - Clients represent your microservices and apps.
   - Go to Clients > Create Client.
   - For each microservice (e.g., "billing-service"):
     - Client Type: OpenID Connect.
     - Client ID: "billing-service" (unique).
     - Client Authentication: On (confidential client—requires secret).
     - Authentication Flow: Standard Flow (for user logins) or Client Credentials (for service-to-service).
     - Valid Redirect URIs: * (for dev; restrict in prod).
     - Save, then in Credentials tab: Copy the Client Secret (store securely in microservice configs).
   - For FastAPI (if it needs to act as a client): Create a similar client, but it mainly validates, so optional.
   - Add scopes: Clients > Your Client > Client Scopes. Add dedicated scopes like "read:balance" or "read:subscriptions" (assign as default).

4. **Add Users and Roles**:
   - Users > Add User: Create test users (e.g., username: "testuser", email, temporary password).
   - Manage > Groups or Realm Roles: Create roles like "user", "admin". Assign to users.
   - Test login: Use Keycloak's built-in login page or Postman to simulate.

5. **Expose Endpoints**:
   - Key OIDC endpoints (auto-discovered via /.well-known/openid-configuration):
     - Token: /realms/myapp/protocol/openid-connect/token.
     - JWKS: /realms/myapp/protocol/openid-connect/certs.
     - Userinfo: /realms/myapp/protocol/openid-connect/userinfo (optional, for basic claims).
   - In production: Deploy Keycloak on a subdomain (idp.yourdomain.com), enable HTTPS, cluster for HA (add more nodes via Docker/K8s).

##### Step 3.2: Set Up the Database for FastAPI
FastAPI owns user data, so set up a DB.

1. **Install PostgreSQL**:
   - Local: Install via package manager (e.g., `brew install postgresql` on Mac).
   - Create DB: `createdb user_data_db`.
   - Create user: `createuser app_user --pwprompt`.

2. **Schema Design**:
   - Tables:
     - users: id (UUID/PK), sub (Keycloak subject ID, unique), email, created_at.
     - balances: user_id (FK), balance (decimal), updated_at.
     - subscriptions: user_id (FK), type (string, e.g., "premium"), status, expiry.
   - Use migrations (e.g., Alembic with SQLAlchemy) for schema management.

3. **Connection Config**: Store in env vars (DB_URL=postgresql://app_user:password@localhost/user_data_db).

##### Step 3.3: Set Up FastAPI (User Data Service)
FastAPI runs separately, validates tokens, and serves data.

1. **Project Structure**:
   - Create directory: `/project/fastapi`.
   - Files: main.py (app entry), dependencies.py (for token validation), models.py (Pydantic schemas), db.py (DB connection), routers/user.py (endpoints).

2. **Configure Environment**:
   - .env file: KEYCLOAK_ISSUER=http://localhost:8080/realms/myapp, JWKS_URL=http://localhost:8080/realms/myapp/protocol/openid-connect/certs, AUDIENCE=your-client-id, DB_URL=...

3. **Implement Token Validation Dependency**:
   - Use python-jose to fetch JWKS dynamically.
   - In dependencies.py: Function that:
     - Fetches JWKS (use httpx.get, cache with TTL e.g., 1 hour).
     - Decodes JWT: Check signature, exp, iss, aud.
     - Extracts 'sub' claim.
     - Raises 401 if invalid.

4. **Implement Endpoints**:
   - In routers/user.py:
     - GET /users/{sub}/balance: Depends on validation, query DB by sub, return {"balance": value}.
     - GET /users/{sub}/subscriptions: Similar, return list.
     - GET /users/{sub}/profile: Combined enriched data.
   - Use FastAPI's Depends for injecting the validated user/sub into endpoints.

5. **Data Enrichment**:
   - In endpoint logic: After validation, fetch from DB, optionally compute (e.g., check if subscription active based on expiry).
   - Cache frequent queries (use Redis if needed).

6. **Run FastAPI**:
   - uvicorn main:app --reload (local).
   - Dockerize for prod: Dockerfile with COPY requirements, ENTRYPOINT uvicorn.

##### Step 3.4: Set Up User Data Synchronization
Ensure FastAPI DB has records when users exist in Keycloak.

1. **Use Keycloak Events**:
   - In Keycloak: Realm Settings > Events > Config. Enable "User" events, set webhook listener.
   - Create a simple webhook endpoint in FastAPI (e.g., POST /sync/user): Receives event (e.g., user created), extracts sub/email, inserts minimal record in DB.

2. **Alternative**: For initial sync, export users from Keycloak admin and import to FastAPI DB manually/scripted.

##### Step 3.5: Set Up a Sample Microservice
Example: A Python-based Billing microservice.

1. **Structure**: Directory /project/billing, main.py, config.py.
2. **Config**: .env with KEYCLOAK_TOKEN_URL=http://localhost:8080/realms/myapp/protocol/openid-connect/token, CLIENT_ID=billing-service, CLIENT_SECRET=...

3. **Token Acquisition**:
   - Function: Use httpx.post to token endpoint with grant_type=client_credentials, client_id/secret.
   - Cache token until exp - 60s.

4. **Data Fetch**:
   - Function: Get token, then httpx.get to FastAPI (e.g., /users/{sub}/balance) with Bearer header.
   - Handle errors: 401 → refresh token.

5. **Run**: Similar to FastAPI.

##### Step 3.6: Testing the Flow
1. **Unit Tests**: Use pytest for FastAPI (test validation with mock JWKS), mock token fetch in microservices.
2. **Integration**: 
   - Login to Keycloak as user.
   - From microservice: Get token, call FastAPI, verify data returned.
   - Test invalid token: Should 401.
3. **Tools**: Postman for API calls, jwt.io for token inspection.
4. **Edge Cases**: Expired token, wrong aud, no data in DB.

#### 4. Deployment and Security Best Practices
- **Deployment**:
  - Use Docker Compose for local multi-service.
  - Prod: Kubernetes pods for each (Keycloak, FastAPI, microservices). Use ingress for domains (idp.yourdomain.com, api.yourdomain.com).
  - Scaling: Horizontal pods, load balancers.
- **Security**:
  - HTTPS: Mandatory—use cert-manager in K8s.
  - Secrets: Never in code; use Kubernetes Secrets or AWS SSM.
  - Auditing: Log all auth events to centralized system (ELK).
  - Rate Limiting: Use FastAPI middleware (e.g., slowapi).
  - Vulnerability Scans: Run Trivy on Docker images.
  - Compliance: If handling PII, ensure GDPR—store minimal in Keycloak.
- **Monitoring**: Prometheus + Grafana for metrics (token requests, validation failures).

#### 5. Troubleshooting and Maintenance
- **Common Issues**:
  - Token Invalid: Check iss/aud match configs.
  - JWKS Fetch Fail: Network/HTTPS issues—verify URLs.
  - Sync Problems: Debug webhook logs.
- **Maintenance**: Update Keycloak regularly (patch for security). Backup DB. Rotate client secrets annually.
- **Extensibility**: Add OPA for advanced authZ later.