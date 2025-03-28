# Letter Drive App Server

This is the server-side code for the Letter Drive App, a platform that allows users to store and manage their letters digitally.

## Table of Contents

-   [Package Managers](#package-managers)
-   [Project Structure](#project-structure)
-   [Code Snippets](#code-snippets)
-   [Getting Started](#getting-started)
-   [Environment Variables](#environment-variables)
-   [Database Setup](#database-setup)
-   [Running the Server](#running-the-server)

## Package Managers

This project uses the following package managers:

-   [npm](https://www.npmjs.com/)

## Project Structure

```markdown
index.js
package-lock.json
package.json
vercel.json
config
db.js
passport.js
controller
model
letterSchema.js
userSchema.js
node_modules
routes
authRoutes.js
home.js
index.js
letterRoutes.js
```

## Code Snippets

### Connecting to MongoDB

```javascript
const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if no response
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
```

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/letter-drive-app-server.git
```

2. Navigate to the project directory:

```bash
cd letter-drive-app-server/server
```

3. Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root of your project and add the following variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/letter-drive-app?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
JWT_SECRET=<your-jwt-secret>
```

Replace `<username>`, `<password>`, `<your-google-client-id>`, `<your-google-client-secret>`, and `<your-jwt-secret>` with your actual values.

## Database Setup

Make sure you have MongoDB installed and running on your local machine. Create a new database called `letter-drive-app`.

## Running the Server

To start the server, run the following command:

```bash
npm run dev
```

The server will start listening on `http://localhost:5000`.

Now you can use the Letter Drive App's frontend to interact with the server.

## Additional Resources

-   [Express.js](https://expressjs.com/)
-   [MongoDB](https://www.mongodb.com/)
-   [Passport.js](http://www.passportjs.org/)
-   [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
-   [JSON Web Tokens (JWT)](https://jwt.io/)
