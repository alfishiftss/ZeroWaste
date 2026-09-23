# 🌍 ZeroWaste

*Bridging the gap between food surplus and food scarcity.*

## 📖 Project Overview

**ZeroWaste** is a digital food rescue network built to intercept food waste. We provide a seamless platform that connects local food-based businesses directly with everyday consumers. 

- **For Businesses:** It offers a streamlined, socially responsible way to offload daily surplus inventory—reducing disposal costs and building community goodwill.
- **For Consumers:** It provides a real-time marketplace to claim high-quality, heavily discounted (or free) meals before they are thrown away.
- **For the Environment:** Every meal rescued is a direct reduction in the carbon footprint associated with commercial food waste.

## 🛠️ Technology Stack

This project is built using the **MERN** stack:

- **Frontend (React.js):** A dynamic, single-page application (SPA) providing an interactive UI.
- **Backend (Express.js & Node.js):** A lightweight, highly scalable RESTful API handling business logic.
- **Database (MongoDB & Mongoose):** A flexible NoSQL database perfectly suited for handling diverse data shapes.

## 📁 Project Structure

The repository is organized into two main directories:

- `frontend/`: Contains the React.js application.
- `backend/`: Contains the Node.js/Express.js server and API routes.

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB](https://www.mongodb.com/) installed or a MongoDB Atlas account.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ZeroWaste.git
   cd ZeroWaste
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add your environment variables (e.g., MongoDB URI, JWT Secret, Cloudinary credentials).

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   *The server will typically run on `http://localhost:5000`.*

2. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm start
   ```
   *The React app will open in your browser, usually at `http://localhost:3000`.*

## 🏗️ Architecture

ZeroWaste adheres to the **Model-View-Controller (MVC)** architectural pattern to keep the codebase organized and scalable. 

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the ISC License.
