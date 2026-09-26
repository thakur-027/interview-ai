# --- Stage 1: build ---
# This stage exists only to run `vite build`. Everything in it (node_modules,
# source files, the Node runtime itself) is thrown away after the build -
# none of it ends up in the final image.
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite bakes env vars into the JS bundle AT BUILD TIME, not at container
# start time - unlike the backend, you can't just change this with an
# environment variable at `docker run`. It has to be passed as a build ARG.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Stage 2: serve ---
# A fresh, tiny image. Only the compiled static files + nginx make it in here.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
