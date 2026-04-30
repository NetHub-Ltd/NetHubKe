#!/bin/bash
set -e

echo "------ Starting Database Initialization ------"

# 1️⃣ Verify required variables
required_vars=(
  POSTGRES_USER
  KEYCLOAK_DB_NAME
  KEYCLOAK_DB_USER
  KEYCLOAK_DB_PASSWORD
  FASTAPI_DB_NAME
  FASTAPI_DB_USER
  FASTAPI_DB_PASSWORD
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "ERROR: Environment variable $var is not set!"
    exit 1
  fi
done

echo "Databases: $KEYCLOAK_DB_NAME , $FASTAPI_DB_NAME"

# 2️⃣ Wait for Postgres
until psql -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  echo "Waiting for Postgres..."
  sleep 1
done

echo "Postgres is ready."

# 3️⃣ Function to create user if not exists
create_user() {
  local user=$1
  local password=$2

  echo "Ensuring user '$user' exists..."

  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres <<-EOSQL
    DO \$\$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = '$user'
      ) THEN
        CREATE ROLE $user WITH LOGIN PASSWORD '$password';
      END IF;
    END
    \$\$;
EOSQL
}

# 4️⃣ Function to create database if not exists
create_database() {
  local db=$1
  local owner=$2

  echo "Ensuring database '$db' exists..."

  DB_EXISTS=$(psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'")

  if [ "$DB_EXISTS" != "1" ]; then
    psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres \
      -c "CREATE DATABASE $db OWNER $owner;"
  else
    echo "Database '$db' already exists."
  fi
}

# 5️⃣ Create Keycloak DB + User
create_user "$KEYCLOAK_DB_USER" "$KEYCLOAK_DB_PASSWORD"
create_database "$KEYCLOAK_DB_NAME" "$KEYCLOAK_DB_USER"

# 6️⃣ Create FastAPI DB + User
create_user "$FASTAPI_DB_USER" "$FASTAPI_DB_PASSWORD"
create_database "$FASTAPI_DB_NAME" "$FASTAPI_DB_USER"

# 7️⃣ Final Verification
echo "------ Final Database List ------"
psql -U "$POSTGRES_USER" -d postgres -c "\l"

echo "------ Initialization Complete ------"
