import { describe, it, expect, vi, beforeEach, afterEach} from "vitest"

import worker from "../src"

const mockEnv = {
  MOXFIELD_SECRET: "TEST_SECRET"
}

const createRequest = (url: string, origin?: string): Request =>
  new Request(url, {
    method: "GET",
    headers: origin ? { origin } : {}
  })

describe("Cloudflare Worker", () => {
	const validOrigin = "chrome-extension://bibaandedejifgojmndgbpoicofbopea"
	const devOrigin = "chrome-extension://ppkmodalnfeenflonpdocilbbolmffpb"
	const invalidOrigin = "https://not-allowed.com"

	describe("Cloudflare Worker /moxfield/:id", () => {

		beforeEach(() => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				status: 200,
				text: () => Promise.resolve("{ \"mocked\": true }"),
				headers: new Headers({ "Content-Type": "application/json" })
			})
		})

		it("returns 404 for unmatched routes", async () => {
			const req = createRequest("https://example.com/invalid-route", validOrigin)
			const res = await worker.fetch(req, mockEnv)
			expect(res.status).toBe(404)
		})

		it("returns 403 if origin is missing or invalid", async () => {
			const noOriginRes = await worker.fetch(createRequest("https://example.com/moxfield/abc123"), mockEnv)
			expect(noOriginRes.status).toBe(403)

			const invalidRes = await worker.fetch(createRequest("https://example.com/moxfield/abc123", invalidOrigin), mockEnv)
			expect(invalidRes.status).toBe(403)
		})

		it("proxies request and injects secret for valid origin", async () => {
			const res = await worker.fetch(
				createRequest("https://example.com/moxfield/deck123", validOrigin),
				mockEnv
			)

			expect(res.status).toBe(200)
			expect(fetch).toHaveBeenCalledWith(
				"https://api2.moxfield.com/v3/decks/all/deck123",
				expect.objectContaining({
					headers: expect.objectContaining({
						Accept: "application/json",
						"User-Agent": "MoxKey; TEST_SECRET"
					})
				})
			)

			const body = await res.text()
			expect(body).toContain("mocked")
		})

		it("accepts dev origin", async () => {
			const res = await worker.fetch(
				createRequest("https://example.com/moxfield/devdeck", devOrigin),
				mockEnv
			)
			expect(res.status).toBe(200)
		})
	})

	describe("GET /magicville/:id", () => {
		let fetchMock: ReturnType<typeof vi.fn>

		beforeEach(() => {
			fetchMock = vi.fn()
			vi.stubGlobal("fetch", fetchMock)
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it("should return 404 if route is missing id", async () => {
			const res = await worker.fetch(createRequest("https://example.com/magicville/", validOrigin))
			expect(res.status).toBe(404)
		})

		it("should return 404 if invalid origin", async () => {
			const res = await worker.fetch(createRequest("https://example.com/magicville/123", invalidOrigin))
			expect(res.status).toBe(403)
		})

		it("should return 502 on fetch error", async () => {
			fetchMock.mockRejectedValue(new Error("network failure"))
			const res = await worker.fetch(createRequest("https://example.com/magicville/123", validOrigin))
			const body = await res.text()
			expect(res.status).toBe(502)
			expect(body).toMatch(/Upstream fetch failed/i)
		})

		it("should return 502 on HTML missing deck content", async () => {
			fetchMock.mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(`<html><body>No deck link here</body></html>`),
			} as Response)

			const res = await worker.fetch(createRequest("https://example.com/magicville/123", validOrigin))
			const body = await res.text()
			expect(res.status).toBe(404)
			expect(body).toMatch(/Download link not found/i)
		})

		it("should return parsed deck text", async () => {
			fetchMock.mockImplementation((url: string) => {
				if (url.includes("https://www.magic-ville.com/fr/decks/showdeck")) {
					// Simulate main deck page with download link
					return Promise.resolve({
						ok: true,
						text: () =>
							Promise.resolve(`
								<html>
									<a href="dl_appr?ref=deck123.txt">Download</a>
								</html>
							`),
					} as Response)
				} else if (url.includes("deck123.txt")) {
					// Simulate actual deck file
					return Promise.resolve({
						ok: true,
						text: () =>
							Promise.resolve(`4 Lightning Bolt\n20 Mountain`),
					} as Response)
				}
				return Promise.reject(new Error("unknown URL"))
			})

			const res = await worker.fetch(createRequest("https://example.com/magicville/123", validOrigin))
			const body = await res.text()
			expect(res.status).toBe(200)
			expect(body).toMatch(/Lightning Bolt/)
			expect(body).toMatch(/Mountain/)
		})
	})

	describe("GET /archidekt/:deckId", () => {
		let fetchMock: ReturnType<typeof vi.fn>

		beforeEach(() => {
			fetchMock = vi.fn()
			vi.stubGlobal("fetch", fetchMock)
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it("should return 403 if origin is missing or invalid", async () => {
			const resNoOrigin = await worker.fetch(createRequest("https://example.com/archidekt/12345"))
			expect(resNoOrigin.status).toBe(403)

			const resBadOrigin = await worker.fetch(createRequest("https://example.com/archidekt/12345", invalidOrigin))
			expect(resBadOrigin.status).toBe(403)
		})

		it("should proxy archidekt deck json for valid origin", async () => {
			fetchMock.mockResolvedValue({
				status: 200,
				text: () => Promise.resolve('{ "id": 12345, "name": "Test Deck" }'),
				headers: new Headers({ "Content-Type": "application/json" })
			} as Response)

			const res = await worker.fetch(createRequest("https://example.com/archidekt/12345", validOrigin))
			const body = await res.text()

			expect(res.status).toBe(200)
			expect(body).toContain("Test Deck")
			expect(fetchMock).toHaveBeenCalledWith(
				"https://archidekt.com/api/decks/12345/",
				expect.objectContaining({
					headers: expect.objectContaining({
						Accept: "application/json"
					})
				})
			)
		})
	})

})
