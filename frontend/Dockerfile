# Use an official Node runtime as the parent image
FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code into the container
COPY . .

# Build the Next.js app
RUN npm run build

# Specify the command to run on container start
CMD ["npm", "start"]
