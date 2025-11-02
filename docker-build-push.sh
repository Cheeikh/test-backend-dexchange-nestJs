#!/bin/bash

# Script pour build et push l'image Docker vers Docker Hub
# Usage: ./docker-build-push.sh <votre-username> [tag]

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <docker-hub-username> [tag]"
  echo "Example: $0 monusername latest"
  exit 1
fi

DOCKER_USERNAME=$1
TAG=${2:-latest}
IMAGE_NAME="${DOCKER_USERNAME}/transfer-api"

echo "🔨 Building image with docker-compose (platform: linux/amd64)..."
# Utiliser buildx pour une meilleure prise en charge multi-plateforme
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_DEFAULT_PLATFORM=linux/amd64

# Déterminer le nom de l'image selon la méthode de build
COMPOSE_PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]')
BUILT_IMAGE="${COMPOSE_PROJECT_NAME}-app:latest"

# Vérifier si buildx est disponible, sinon utiliser docker-compose
if docker buildx version > /dev/null 2>&1; then
    echo "📦 Using docker buildx for cross-platform build (linux/amd64)..."
    docker buildx build --platform linux/amd64 --load -t "${BUILT_IMAGE}" -f Dockerfile .
else
    echo "📦 Using docker-compose (buildx not available)..."
    docker-compose build app
fi

echo "🏷️  Tagging image as ${IMAGE_NAME}:${TAG}..."

# Vérifier que l'image existe
if ! docker image inspect "${BUILT_IMAGE}" > /dev/null 2>&1; then
    echo "⚠️  Image ${BUILT_IMAGE} not found. Trying to find it..."
    # Fallback: chercher dans docker images
    BUILT_IMAGE=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -i "app" | grep "latest" | head -n 1)
    if [ -z "$BUILT_IMAGE" ]; then
        echo "❌ Error: Could not find the built image. Please check docker images manually."
        echo "Available images:"
        docker images | head -10
        exit 1
    fi
fi

echo "📋 Found image: ${BUILT_IMAGE}"
docker tag "${BUILT_IMAGE}" "${IMAGE_NAME}:${TAG}"

echo "🔐 Logging in to Docker Hub..."
docker login

echo "📤 Pushing image to Docker Hub..."
docker push "${IMAGE_NAME}:${TAG}"

echo "✅ Image pushed successfully: ${IMAGE_NAME}:${TAG}"

