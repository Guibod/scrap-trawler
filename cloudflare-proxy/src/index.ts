import { isAllowed, isThrottled } from "./rate-limit"

export interface Env {
	MOXFIELD_SECRET: string
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)
		const match = url.pathname.match(/^\/moxfield\/([a-zA-Z0-9_-]+)$/)
		if (!match) {
			return new Response("Not found", { status: 404 })
		}

		const deckId = match[1]
		const origin = request.headers.get("origin")
		if (!origin || !isAllowed(origin)) {
			return new Response("CORS forbidden", { status: 403 })
		}

		if (isThrottled(origin)) {
			return new Response("Rate limit exceeded", { status: 429 })
		}

		try {
			const upstreamRes = await fetch(`https://api2.moxfield.com/v3/decks/all/${deckId}`, {
				headers: {
					Accept: "application/json",
					"User-Agent": `MoxKey; ${env.MOXFIELD_SECRET}`
				}
			})

			const body = await upstreamRes.text()
			const headers = new Headers(upstreamRes.headers)
			headers.set("Access-Control-Allow-Origin", origin)
			headers.set("Access-Control-Allow-Methods", "GET")
			headers.set("Access-Control-Allow-Headers", "Content-Type")

			return new Response(body, {
				status: upstreamRes.status,
				headers
			})
		} catch (err: any) {
			return new Response("Internal error", {
				status: 500,
				headers: {
					"Access-Control-Allow-Origin": origin ?? "null"
				}
			})
		}
	}
}
