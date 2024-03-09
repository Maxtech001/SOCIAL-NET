social-network
Overview
This project presents a social networking platform inspired by Facebook, featuring elements such as user profiles, a followers system, content posting, group interactions, real-time chat, and dynamic notifications.

For detailed project instructions and audit questions, please refer to this link.

Setup Instructions
Using Docker:
Execute the Bash Script: Navigate to the root folder and run bash start-docker.sh. If this step encounters issues, you might need to install docker-compose by executing sudo apt install docker-compose.
Access the Application: Open a web browser and go to http://localhost:3000/.
Stopping Docker: Upon completion, remember to halt Docker and remove the images by executing bash stop-docker.sh.
Manual Startup:
To initiate the backend, execute go run ./backend/cmd in the project's root directory.

For the frontend, ensure Node.js is installed. Then, navigate to the frontend folder, run npm install to install required packages, and start the program with npm start. Visit http://localhost:3000/ in your web browser.

Project Contributors
Maxwell
KKulmanis