# Use the Node.js image as a base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json file and package-lock.json file to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

#Copy the rest of the applications files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

#Define the command to run the app
CMD ["npm", "start"]

