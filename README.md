# EventOps
A lightweight web application built to demonstrate practical DevOps workflow implementation using Docker Jenkins and Kubernetes

## running backend
## Create and activate virtualenv
`python3 -m venv venv
source venv/bin/activate  `

# Install dependencies
pip install -r requirements.txt
cp .env.example .env

# Run with docker compose (includes MongoDB):
docker compose up --build

Need not update the .env file

## Check if everything is working
docker compose ps          # both containers should show "running"
docker compose logs app    # look for "MongoDB connection: OK"

## Once the app is running, hit these two endpoints in a new terminal (WSL)
### Liveness — always 200 if process is alive
curl http://localhost:8000/health

### Readiness — 200 only if MongoDB is actually reachable
curl http://localhost:8000/ready

### Jenkins docker installation & Setup

- Create docker network for jenkins
```bash
docker network create jenkins
```

- Install jenkins using Docker
```bash
docker run --name jenkins --restart=on-failure -d -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock --network jenkins jenkins/jenkins:lts-jdk21
```

- Get Jenkins password for first setup
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

- Setup Jenkins project with pipeline, use GITHUBScm trigger
- Use ngrok/cloudfare to get a running public url for jenkins and add that in GitHub project in webhooks, with content type `application/json` and `just push`.
