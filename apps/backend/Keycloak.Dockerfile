FROM quay.io/keycloak/keycloak:26.0.5 as builder

# Optimization for Production
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres

WORKDIR /opt/keycloak
# This 'build' command makes startup nearly instant
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.0.5
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Default entrypoint
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
