import { join } from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		setupFiles: ["./test/setup.ts"],
	},
	resolve: {
		alias: {
			"@/": new URL("./src/", import.meta.url).pathname,
		},
	},
});
