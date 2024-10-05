# Use the official Node.js 18 image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application (transpile TypeScript or prepare production build)
RUN yarn build

# Expose the backend port
EXPOSE 3001

# Start the backend server
CMD ["yarn", "start"]
