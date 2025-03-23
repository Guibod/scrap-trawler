const ALLOWED_ORIGINS = [
	"chrome-extension://bibaandedejifgojmndgbpoicofbopea",
	"chrome-extension://ppkmodalnfeenflonpdocilbbolmffpb"
]

const rateLimits = new Map<string, { count: number; reset: number }>()

export function isAllowed(origin: string | null): boolean {
	return origin !== null && ALLOWED_ORIGINS.includes(origin)
}

export function isThrottled(origin: string): boolean {
	const now = Date.now()
	const windowMs = 10_000
	const maxRequests = 5

	const entry = rateLimits.get(origin) ?? { count: 0, reset: now + windowMs }

	if (now > entry.reset) {
		entry.count = 1
		entry.reset = now + windowMs
	} else {
		entry.count += 1
	}

	rateLimits.set(origin, entry)
	return entry.count > maxRequests
}
