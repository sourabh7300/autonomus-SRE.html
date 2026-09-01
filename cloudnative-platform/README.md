# CloudNative Platform — Task Tracker

Sample app for the CloudNative Platform DevOps learning project: a small
task-tracking app with three services, built to be containerized, deployed
through CI/CD + GitOps, and monitored — not to be a serious task tracker.

## Services

- **frontend** — static HTML/JS UI (nginx), lets you add/delete tasks
- **api** — Express REST API, in-memory task store
- **worker** — polls the API and moves tasks from `pending` → `processing` → `done`

## Run it locally

```bash
docker compose up --build
```

Then open http://localhost:8080. Add a task and watch its status change as
the worker picks it up — this is the loop you'll later watch happen inside
a real EKS cluster.

## Run the API tests

```bash
cd api
npm install
npm test
```

## Where this fits in the bigger project

| Phase | What this repo gives you |
|---|---|
| 1. Terraform foundation | Nothing here yet — provision VPC/EKS/IAM separately, this app is what gets deployed onto it |
| 2. The application | This repo |
| 3. CI | `.github/workflows/ci.yml` — tests, builds, Trivy scan for each service |
| 4. GitOps | Point ArgoCD at the `k8s/` directory (or convert to a Helm chart) |
| 5. Observability | Once deployed, the `/health` endpoint and pod metrics are your starting point for Prometheus scraping |

## Next steps

1. Replace the `<YOUR_ECR_REPO>` placeholders in `k8s/*.yaml` once your
   Terraform-provisioned ECR repos exist.
2. Uncomment the ECR push steps in `ci.yml` once OIDC is set up between
   GitHub Actions and AWS.
3. Move `tasks` in `api/server.js` from an in-memory array to Postgres/DynamoDB
   when you're ready for a stateful backend.
