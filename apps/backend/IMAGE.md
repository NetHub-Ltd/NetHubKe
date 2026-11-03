# Backend container image

**Registry:** GitHub Container Registry (GHCR)  
**Image:** `ghcr.io/nethub-ltd/nethubke`

## How images are published

Workflow: `.github/workflows/build_and_push.yml`

| Trigger | Tags pushed |
|---------|-------------|
| Push to `master` / `main` (backend paths) | `0.0.<run_number>`, `sha-<shortsha>`, `latest` |
| Git tag `v*` | `vX.Y.Z`, `X.Y.Z`, `sha-<shortsha>` |
| `workflow_dispatch` | same as branch + optional custom tag |

Auth uses `GITHUB_TOKEN` (packages:write). No Docker Hub secrets required.

## Consume from k3s-gitops

```yaml
image: ghcr.io/nethub-ltd/nethubke:0.0.12  # {"$imagepolicy": "flux-system:nethubke"}
```

Package visibility: if the package is private, the cluster needs `ghcr-registry-key` / `ghcr-credentials` (already used for tawala-api).
