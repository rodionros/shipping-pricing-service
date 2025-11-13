IMAGE_NAME=ghcr.io/rodionrostovchshikov/shipping-pricing-service
PLATFORMS=linux/amd64,linux/arm64

build:
	docker build -t $(IMAGE_NAME):local .

run:
	docker run --rm -p 3000:3000 --env-file .env $(IMAGE_NAME):local

push-latest:
	docker push $(IMAGE_NAME):latest

buildx:
	docker buildx create --use --name shipping-builder || true
	docker buildx build \
		--platform=$(PLATFORMS) \
		-t $(IMAGE_NAME):latest \
		--push \
		.