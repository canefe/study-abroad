# <p align="center">Study Abroad <p align="center">Course Matching Web-App</p></p>

A web application that helps course matching process of study abroad. Introduces two interfaces for two user groups, easeing their workflow.

## Project Structure

- `/prisma` - Prisma ORM directory where Prisma schema and seed file is located.

- `/src/app` - Main application code (Front-end)
  - `/_components` - Reusable React components
    - `/choices-table` - Components related to course selection
- `/src/lib` - Utility functions and shared code

- `/src/server/` - Back-end Folder
- `/src/server/auth.ts` - NextAuth.js configuration file, where authentication providers, session are defined.
- `/src/server/api` - API files such as tRPC routers and their procedures. Also has API tests.
- `/src/server/lib/` - Shared utility functions throughout the API files.
- `/src/server/api/services/` - Modularised router logic.


## Build instructions
### Requirements

* Node.js 20+ 
* npm or yarn
* Modern web browser (Chrome, Firefox, Edge, Safari)
* Tested on Windows and macOS, should work on Linux.
* A postgres database (either Docker or native installation).

### Build steps
* A code editor such as VSCode is recommended.


#### 1. Install dependencies:
* `npm install --global yarn` (optional) 
* `npm install` or `yarn`


#### 2. Set up environment variables:
* Create a `.env` file in the project root copying `.env.example`.
* You do not have to modify anything it is already set up for local development and for following commands bellow.
* You might have to change the ports if you have other services running on the same ports: `3000` or `5432`.

#### 3. Set up a Postgres database.
You can either use Docker or install Postgres natively to your OS. (You can always uninstall this later.)
Follow this guide to natively install Postgress server: https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database

##### Use Native Postgres (faster):
During setup, you will be prompted to specify username and password. Set these to "postgres" and "password" respectively, without quotes. Move to the next step.

##### Use Docker (preferred):
* Install Docker.
* Make sure it is running and its CLI commands are working.
* Open a terminal and run following commands depending on your OS:

* On macOS or linux, you can use this file to generate a Docker with postgres:
`./start-database.sh`
* On Windows, use the following bat file:
`start-database.bat`
* You should see this message in terminal: 
`Database container "study-abroad-postgres" was successfully created.`


#### 4. Run Prisma commands:
* `npx prisma db push` or `yarn prisma db push` to create the database and tables. This will not cause any errors.
* `npx prisma generate` or `yarn prisma generate` to generate Prisma client.

#### 4. Run the seed file:
`npx run seed` or `yarn seed` to populate the database with current School of Computing Science settings.

#### 5. Run the application:
* `npm run dev` or `yarn dev` to start the application in development mode.
* Open your browser and go to `http://localhost:3000` to see the application running.
* You can also run `npm run build` or `yarn build` to build the application for production. This will create a `.next` folder in the root directory.
* You can run `npm start` or `yarn start` to start the application in production mode. This will use the `.next` folder created in the previous step.
* You can also run `npm run test` or `yarn test` to run the tests in the application. This will use the `vitest` library in the `package.json` file.

### Test steps

Once the application is running, `localhost:3000` should be accessible in your browser. You can also run the tests using `npm run test` or `yarn test` to verify that everything is working correctly.

The web application will redirect you to the login page. You can log in using the following credentials:
* Co-ordinator account:
bob@example.com
(no password)
* Student account:
alice@example.com
(no password)

This will allow you to test the application as a co-ordinator or a student.

* You can try out the course matching by creating new applications. You can either create one as the student or create on behalf of the student as a co-ordinator.
* Current implementation only allows students to manage their applications. Leave feedback, create a new course on host university.
* Co-ordinators can view all applications, and manage them. They can also create new courses on host university. They have access to all courses and students. They can also adjust configuration settings for the application.
* You can test out dynamic year requirements which allows co-ordinators to set up requirements for each year of study.
