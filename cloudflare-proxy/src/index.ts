import { Hono, type Env } from "hono"
import { cors } from "hono/cors"
import { isAllowed, isThrottled } from "./rate-limit"
import { parseHTML } from "linkedom"

export interface MyEnv extends Env {
	Bindings: {
		MOXFIELD_SECRET: string
	}
}

const app = new Hono<MyEnv>()

app.use(cors({
	origin: (origin) => isAllowed(origin) ? origin : "",
	allowMethods: ["GET", "OPTIONS"],
	allowHeaders: ["Content-Type"]
}))

app.get("/moxfield/:deckId", async (c) => {
	const deckId = c.req.param("deckId")
	const origin = c.req.header("origin")!

	if (!origin || !isAllowed(origin)) {
		return c.text("CORS forbidden", 403)
	}

	if (isThrottled(origin)) {
		return c.text("Rate limit exceeded", 429)
	}

	const res = await fetch(`https://api2.moxfield.com/v3/decks/all/${deckId}`, {
		headers: {
			Accept: "application/json",
			"User-Agent": `MoxKey; ${c.env.MOXFIELD_SECRET}`
		}
	})

	const body = await res.text()
	return new Response(body, {
		status: res.status,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": origin
		}
	})
})

app.get("/magicville/:deckId", async (c) => {
	try {
		const { deckId } = c.req.param()
		const origin = c.req.header("origin")!

		if (!origin || !isAllowed(origin)) {
			return c.text("CORS forbidden", 403)
		}

		if (isThrottled(origin)) {
			return c.text("Rate limit exceeded", 429)
		}

		const showdeckUrl = `https://www.magic-ville.com/fr/decks/showdeck?ref=${deckId}`
		let showRes: Response
		try {
			showRes = await fetch(showdeckUrl, {
				headers: {
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
					"Accept-Encoding": "gzip, deflate, br",
					"Accept-Language": "en-US,en;q=0.9",
					"Connection": "keep-alive",
					"Upgrade-Insecure-Requests": "1"
				}
			})
			console.log("✔ showRes.ok:", showRes.ok)
		} catch (err) {
			console.error("🔥 fetch(showdeckUrl) threw:", err)
			return c.text("Upstream fetch failed", 502)
		}

		let href: string | undefined | null
		try {
			const html = await showRes.text()
			const { document } = parseHTML(html)
			const link = document.querySelector('a[href^="dl_appr"]');
			href = link?.getAttribute('href');
		} catch (err) {
			console.error("🔥 Parsing HTML failed:", err)
			return c.text("Parsing error", 500)
		}

		if (!href) {
			return c.text(`Download link not found`, 404)
		}

		const downloadUrl = `https://www.magic-ville.com/fr/decks/${href}`
		console.log("✔ Download URL:", downloadUrl)

		const txtRes = await fetch(downloadUrl)
		const txt = await txtRes.text()

		return new Response(txt, {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
				"Access-Control-Allow-Origin": origin
			}
		})
	} catch (err) {
		console.error("🔥 Handler exploded", err)
		return c.text("Internal error", 500)
	}
})

app.get("/archidekt/:deckId", async (c) => {
	const deckId = c.req.param("deckId")
	const origin = c.req.header("origin")!

	if (!origin || !isAllowed(origin)) {
		return c.text("CORS forbidden", 403)
	}

	if (isThrottled(origin)) {
		return c.text("Rate limit exceeded", 429)
	}

	const res = await fetch(`https://archidekt.com/api/decks/${deckId}/`, {
		headers: {
			Accept: "application/json"
		}
	})

	const body = await res.text()
	return new Response(body, {
		status: res.status,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": origin
		}
	})
})

export default app
