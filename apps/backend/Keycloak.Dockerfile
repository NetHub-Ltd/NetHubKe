# 1. Builder Stage
FROM quay.io/keycloak/keycloak:26.0.5 as builder

# Optimization for Production
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres

WORKDIR /opt/keycloak

# COPY the realm file into the default import directory
# Creating the directory first ensures correct permissions
RUN mkdir -p /opt/keycloak/data/import
COPY ./realms/nethub-realm.json /opt/keycloak/data/import/realm.json

# This 'build' command makes startup nearly instant
RUN /opt/keycloak/bin/kc.sh build

# 2. Final Runtime Stage
FROM quay.io/keycloak/keycloak:26.0.5
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Ensure the runtime uses the same optimized environment
ENV KC_DB=postgres

# Default entrypoint
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]