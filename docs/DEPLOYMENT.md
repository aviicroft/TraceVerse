# TRACEVERSE Production Deployment Guide

This guide outlines the **two best deployment strategies** for TRACEVERSE:

1. [Strategy A (Fastest & Free Tier): Vercel + Render / Railway](#strategy-a-cloud-paas-vercel--render--railway-recommended) (Direct GitHub integration, zero DevOps)
2. [Strategy B (Self-Hosted / Demo Server): Docker Compose on VPS/AWS/DigitalOcean](#strategy-b-self-hosted-vps-aws-ec2--digitalocean-with-docker-compose) (Full privacy and control)

---

## 🔑 Required Environment Variables

Before deploying, make sure you have your API keys ready:

| Variable | Description | Where to get / Example |
| :--- | :--- | :--- |
| `BLOCKCHAIN_API_KEY` | Etherscan API Key | [etherscan.io/myapikey](https://etherscan.io/myapikey) |
| `BLOCKCHAIN_API_URL` | Etherscan v2 API Endpoint | `https://api.etherscan.io/v2/api` |
| `TRONGRID_API_KEY` | TronGrid API Key (for TRC-20 USDT tracing) | [trongrid.io](https://www.trongrid.io/) |
| `DATABASE_URL` | Database Connection String | `sqlite+aiosqlite:///./data/crypto_trace.db` (or Postgres URL) |
| `NEXT_PUBLIC_API_URL` | Backend URL accessible by the Frontend | `https://your-backend.onrender.com/api/v1` |

---

## Strategy A: Cloud PaaS (Vercel + Render / Railway) [RECOMMENDED]

### Step 1: Deploy Backend on Render or Railway

#### Option 1A: Render (Free Web Service)
1. Go to [render.com](https://render.com) and log in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `NINJA981/TRACEVERSE`.
4. Configure service settings:
   - **Name**: `TRACEVERSE-api`
   - **Language**: `Python`
   - **Root Directory**: (Leave blank / root)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `BLOCKCHAIN_API_KEY` = `your_etherscan_key`
   - `BLOCKCHAIN_API_URL` = `https://api.etherscan.io/v2/api`
   - `TRONGRID_API_KEY` = `your_trongrid_key`
   - `PYTHONPATH` = `.`
6. Click **Create Web Service**.
7. Copy your backend live URL: `https://TRACEVERSE-api.onrender.com`.

---

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New Project** and select `NINJA981/TRACEVERSE`.
3. In project configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select `frontend`.
4. In **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://TRACEVERSE-api.onrender.com/api/v1` *(use your Render URL from Step 1)*
5. Click **Deploy**.
6. In ~60 seconds, your application will be live at `https://TRACEVERSE.vercel.app`!

---

## Strategy B: Self-Hosted VPS (AWS EC2 / DigitalOcean) with Docker Compose

If you have a Linux VPS (Ubuntu 22.04 / 24.04), you can deploy the complete stack with a single command.

### 1. Server Setup & Docker Installation
```bash
# Update and install Docker + Docker Compose
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git curl

# Add your user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone Repository & Setup `.env`
```bash
git clone https://github.com/NINJA981/TRACEVERSE.git
cd TRACEVERSE

# Create production .env file
cat <<EOF > .env
BLOCKCHAIN_API_KEY=your_etherscan_api_key
BLOCKCHAIN_API_URL=https://api.etherscan.io/v2/api
TRONGRID_API_KEY=your_trongrid_api_key
DATABASE_URL=sqlite+aiosqlite:///./data/crypto_trace.db
MAX_HOPS=3
NEXT_PUBLIC_API_URL=/api/v1
EOF
```

### 3. Launch with Docker Compose
```bash
docker-compose up -d --build
```

### 4. Verify Services
```bash
# Check running containers
docker-compose ps

# Check backend health
curl http://localhost:8000/api/v1/health

# Open Frontend in Browser
# http://<your-vps-ip>:3000
```

---

## 🔒 Production Nginx Reverse Proxy & SSL (Optional for VPS)

To bind your domain (e.g. `TRACEVERSE.yourdomain.com`) with automated Let's Encrypt SSL:

```nginx
# /etc/nginx/sites-available/TRACEVERSE
server {
    server_name TRACEVERSE.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/v1 {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site and generate SSL certificate
sudo ln -s /etc/nginx/sites-available/TRACEVERSE /etc/nginx/sites-enabled/
sudo certbot --nginx -d TRACEVERSE.yourdomain.com
```

---

## 🚀 Post-Deployment Verification Checklist

- [ ] Visit `/` landing page: Smooth scrolling, hero interactive meters load.
- [ ] Click **"Launch Workstation"** to load `/app`.
- [ ] Test **Candidate Discovery Tab**: Discovered wallets display with Quality Scores and Reachable VASPs.
- [ ] Test **1-Click Investigation**: Click "Investigate" on a candidate to verify live 3-hop graph generation.
- [ ] Test **Section 91 Freeze Notice**: Generate official legal order with PDF export.
