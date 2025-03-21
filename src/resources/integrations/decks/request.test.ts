import { describe, it, expect, vi } from 'vitest'
import { UnresolvedFetcherError } from '~/resources/integrations/decks/exceptions'
import { DeckFetchRequest } from "~/resources/integrations/decks/request"

vi.mock('~/resources/integrations/decks/resolver', () => ({
  default: {
    resolveFetcherType: vi.fn((row) => row.decklistUrl ? class {} : undefined)
  }
}))

describe('DeckFetchRequest', () => {
  const validRow = {
    id: 'row-1',
    player: {},
    archetype: 'Gruul Aggro',
    decklistUrl: 'https://moxfield.com/decks/123',
    decklistTxt: '',
    firstName: 'Garruk',
    lastName: 'Wildspeaker'
  }

  const invalidRow = {
    ...validRow,
    decklistUrl: ''
  }

  it('creates a valid request with fetcher type', () => {
    const req = new DeckFetchRequest('event-1', validRow)
    expect(req.id).toMatch(/[a-f0-9\-]{36}/)
    expect(req.eventId).toBe('event-1')
    expect(req.row).toBe(validRow)
    expect(typeof req.fetcherType).toBe('function')
  })

  it('throws UnresolvedFetcherError if fetcher cannot be resolved', () => {
    expect(() => new DeckFetchRequest('event-2', invalidRow)).toThrow(UnresolvedFetcherError)
  })
})