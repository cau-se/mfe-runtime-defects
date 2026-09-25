# Micro-Frontend 3

## Docker (Production)

This project includes a production-ready multi-stage Docker image:

- Stage 1 builds Angular assets with Node.
- Stage 2 serves static files with Nginx.
- Nginx config is externalized in `nginx.conf` (repo file copied into container).

Build image:

```bash
docker build -t micro-frontend-3:prod .
```

Run container:

```bash
docker run --rm -d -p 4303:80 micro-frontend-3:prod
```

Micro frontend URL for shell integration:

```
http://localhost:4303
```
