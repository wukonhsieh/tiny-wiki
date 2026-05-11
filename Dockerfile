# Stage 1: Build Vue client
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

ENV PORT=3000
ENV REPO_PATH=/vault

EXPOSE 3000
CMD ["node", "server/index.js"]
