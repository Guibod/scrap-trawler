import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		include: ['test/**/*.test.ts'],
		coverage: {
			reporter: ['text', 'lcov'],
			reportsDirectory: './coverage',
			provider: 'istanbul',
		},
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
	},
});
