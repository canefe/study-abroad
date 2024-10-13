# Stage 1: Build the Next.js app and export it
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Clean the Yarn cache to prevent conflicts
RUN yarn cache clean

# Install dependencies with frozen lockfile
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the container
COPY . .

# Build and export the Next.js app
RUN yarn build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Remove the default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the static export output from the builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
