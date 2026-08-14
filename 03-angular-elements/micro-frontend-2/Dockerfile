FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first to maximize layer cache reuse.
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Build production assets.
COPY . .
RUN npm run build -- --configuration production


FROM nginx:1.27-alpine AS runtime

# Use an external nginx config file from the repo.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular application builder output for this project.
COPY --from=builder /app/dist/micro-frontend-2/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
