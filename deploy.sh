#!/bin/bash

###############################################################################
# metaldragon.co.kr Deployment Script
# 서버에서 실행하여 애플리케이션을 배포합니다.
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/metaldragon"
BACKUP_DIR="/var/backups/metaldragon"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  metaldragon.co.kr Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (sudo)${NC}"
  exit 1
fi

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
  echo -e "${RED}Application directory not found: $APP_DIR${NC}"
  exit 1
fi

cd "$APP_DIR"

# Step 1: Backup current state
echo -e "${YELLOW}[1/7] Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" --exclude='node_modules' --exclude='.next' --exclude='loki-data' --exclude='grafana-data' .
echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"

# Step 2: Pull latest code
echo -e "${YELLOW}[2/7] Pulling latest code from GitHub...${NC}"
git fetch origin
git reset --hard origin/master
echo -e "${GREEN}✓ Code updated${NC}"

# Step 3: Check environment file
echo -e "${YELLOW}[3/7] Checking environment variables...${NC}"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: $ENV_FILE not found${NC}"
  echo "Please create $ENV_FILE with required variables"
  exit 1
fi
cp "$ENV_FILE" .env.local
echo -e "${GREEN}✓ Environment file ready${NC}"

# Step 4: Stop running containers
echo -e "${YELLOW}[4/7] Stopping containers...${NC}"
docker-compose down
echo -e "${GREEN}✓ Containers stopped${NC}"

# Step 5: Build and start containers
echo -e "${YELLOW}[5/7] Building and starting containers...${NC}"
docker-compose up -d --build
echo -e "${GREEN}✓ Containers started${NC}"

# Step 6: Wait for services to be ready
echo -e "${YELLOW}[6/7] Waiting for services to start...${NC}"
sleep 10

# Step 7: Health check
echo -e "${YELLOW}[7/7] Running health checks...${NC}"

# Check if containers are running
if [ "$(docker-compose ps -q | wc -l)" -eq 0 ]; then
  echo -e "${RED}✗ No containers running${NC}"
  exit 1
fi

# Check Next.js app
if curl -sf http://localhost:3000 > /dev/null; then
  echo -e "${GREEN}✓ Next.js app is running${NC}"
else
  echo -e "${RED}✗ Next.js app is not responding${NC}"
  docker-compose logs app
  exit 1
fi

# Check Grafana
if curl -sf http://localhost:3001 > /dev/null; then
  echo -e "${GREEN}✓ Grafana is running${NC}"
else
  echo -e "${YELLOW}⚠ Grafana is not responding (optional)${NC}"
fi

# Check Loki
if curl -sf http://localhost:3100/ready > /dev/null; then
  echo -e "${GREEN}✓ Loki is running${NC}"
else
  echo -e "${YELLOW}⚠ Loki is not responding (optional)${NC}"
fi

# Show running containers
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Running containers:"
docker-compose ps

echo ""
echo -e "${GREEN}App URL: http://localhost:3000${NC}"
echo -e "${GREEN}Grafana: http://localhost:3001${NC}"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop all: docker-compose down"
echo ""
