# EventOps
A lightweight web application built to demonstrate practical DevOps workflow implementation using Docker, Jenkins, and Kubernetes.

---

## Running the Backend

### Create and activate virtualenv
```bash
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies
```bash
pip install -r requirements.txt
cp .env.example .env
```

### Run with Docker Compose (includes MongoDB)
```bash
docker compose up --build
```
No need to update the `.env` file.

### Check if everything is working
```bash
docker compose ps          # both containers should show "running"
docker compose logs app    # look for "MongoDB connection: OK"
```

### Health endpoints
```bash
# Liveness — always 200 if process is alive
curl http://localhost:8000/health

# Readiness — 200 only if MongoDB is actually reachable
curl http://localhost:8000/ready
```

---

## Jenkins Setup

### Create Docker network
```bash
docker network create jenkins
```

### Install Jenkins via Docker
```bash
docker run --name jenkins --restart=on-failure -d \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --network jenkins \
  jenkins/jenkins:lts-jdk21
```

### Get initial admin password
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

- Set up a Jenkins pipeline project with a GitHub SCM trigger.
- Use ngrok or Cloudflare Tunnel to expose Jenkins publicly, then add the URL as a GitHub webhook with content type `application/json` and trigger on `push`.

---

## Kubernetes (minikube)

### Prerequisites
- [minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

### Start minikube
```bash
minikube start --cpus=4 --memory=6144
minikube addons enable metrics-server   # required for HPA
```

### Build image inside minikube (avoids image pull issues)
```bash
eval $(minikube docker-env)
docker build -t eventapp:latest .
```

### Apply all manifests
```bash
kubectl apply -f k8s/mongo-pvc.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

### Verify everything is running
```bash
kubectl get all
kubectl get hpa
```

### Get the app URL
```bash
minikube service eventapp-service --url
```

### Rebuild and redeploy after code changes
```bash
eval $(minikube docker-env)
docker build -t eventapp:latest .
kubectl rollout restart deployment/eventapp
```

---

## Kubernetes Demo

### Demo 1 — HPA (Horizontal Pod Autoscaler)

Open 4 terminals:

**Terminal 1** — get app URL
```bash
minikube service eventapp-service --url
```

**Terminal 2** — watch pods
```bash
kubectl get pods -w
```

**Terminal 3** — watch HPA
```bash
kubectl get hpa -w
```

**Terminal 4** — generate CPU load
```bash
curl "http://$(minikube ip):30080/load?duration=120"
```

Watch Terminal 3 — `TARGETS` will rise above 50% and `REPLICAS` will climb from 1 up to 5. After the load ends, pods scale back down in ~3–5 minutes.

---

### Demo 2 — Self-Healing

While the other terminals are still running:

```bash
# List pods and pick one to delete
kubectl get pods

# Delete it
kubectl delete pod eventapp-<hash>
```

Watch Terminal 2 — the deleted pod goes `Terminating` and a new one is created automatically within seconds.

---

### Demo 3 — Rolling Update

```bash
# Edit k8s/deployment.yaml — change APP_VERSION from v1 to v2
kubectl apply -f k8s/deployment.yaml

# Watch the rollout
kubectl rollout status deployment/eventapp

# Verify new version
curl http://$(minikube ip):30080/version
```

Old pods terminate one at a time while new ones come up — zero downtime.

---

### Teardown
```bash
kubectl delete -f k8s/
minikube stop
```

---

## Kubernetes Manifest Summary

| File | Purpose |
|---|---|
| `k8s/mongo-pvc.yaml` | Persistent storage for MongoDB |
| `k8s/mongo.yaml` | MongoDB Deployment + headless Service |
| `k8s/deployment.yaml` | EventApp Deployment — 2 replicas, liveness/readiness probes, CPU limits |
| `k8s/service.yaml` | NodePort Service — exposes app on port 30080 |
| `k8s/hpa.yaml` | Autoscaler — scales 1→5 pods when CPU exceeds 50% |
