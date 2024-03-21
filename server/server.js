import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

const PORT = process.env.PORT || 3780;

const __dirname = path.resolve();

dotenv.config();

app.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Global error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
	console.error('Unhandled Exception:', err);
	// Perform any necessary cleanup or logging here
	process.exit(1);
});

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
	console.error('Unhandled Promise Rejection:', err);
	// Perform any necessary cleanup or logging here
});

// Error handling middleware for Express
app.use((err, req, res, next) => {
	console.error('Error:', err);
	res.status(500).send('Internal Server Error');
});

// Attempt to start the server
try {
	server.listen(PORT, () => {
		connectToMongoDB();
		console.log(`Server Running on port ${PORT}`);
	});
	server.on('error', (error) => {

	if (error.code === 'EADDRINUSE') {
		console.error(`Port ${PORT} is already in use.`);
		process.exit(1);
	} else {
		console.error('Error starting server:', error);
		process.exit(1);
	}
})
} catch (error) {
	console.error('Error starting server:', error);
		process.exit(1);
}
