#!/usr/bin/env node

import app from "../app";
import debugLib from "debug";
import http from "http";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const debug = debugLib("studyabroad:server");

const port = normalizePort(process.env.PORT || "3001");
app.set("port", port);

 * Create HTTP server.
 */
const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: string): number | string | boolean {
	const port = parseInt(val, 10);
	if (isNaN(port)) return val; // named pipe
	if (port >= 0) return port; // port number
	return false;
}

function onError(error: NodeJS.ErrnoException): void {
	if (error.syscall !== "listen") throw error;

	const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

	switch (error.code) {
		case "EACCES":
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function onListening(): void {
	const addr = server.address();
	const bind =
		addr !== null
			? typeof addr === "string"
				? `pipe ${addr}`
				: `port ${addr.port}`
			: "unknown";
	debug(`Listening on ${bind}`);
}
