# **GitHub OAuth Integration**

This project is a **Node.js** and **Express** application that integrates GitHub OAuth 2.0 authentication. It allows users to log in via GitHub and stores user details, including the access token and profile, in a **MongoDB** database.

## **Project Features**
- GitHub OAuth 2.0 authentication flow.
- Securely stores user profile and access tokens in MongoDB.
- Allows the retrieval of integration details using GitHub ID.
- Backend API that interacts with GitHub’s API.

## **Technologies Used**
- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose)
- **Axios** (for HTTP requests to GitHub API)
- **dotenv** (for managing environment variables)
- **express-session** (for handling sessions)
- **CORS** (to allow cross-origin requests)

---

## **Getting Started**

### **Prerequisites**
Before you start, ensure that you have the following installed:
- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Running locally or use MongoDB Atlas)
- [GitHub OAuth Application](https://github.com/settings/developers) (Set up your GitHub OAuth app)

### **1. Clone the Repository**
First, clone this repository to your local machine:

```bash
git clone https://github.com/yourusername/github-oauth-integration.git
cd github-oauth-integration
```

Update .env file with your GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET and MONGO_URI values.

```bash
node app.js
```