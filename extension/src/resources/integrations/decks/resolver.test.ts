import { describe, it, expect } from 'vitest'
import { MoxfieldFetcher } from '~/resources/integrations/decks/fetchers/moxfield.fetcher'
import { TextFetcher } from '~/resources/integrations/decks/fetchers/text.fetcher'
import DeckFetcherResolver from "~/resources/integrations/decks/resolver"
import { NothingFetcher } from "~/resources/integrations/decks/fetchers/nothing.fetcher"
import { MagicVilleFetcher } from "~/resources/integrations/decks/fetchers/magic-ville.fetcher"
import { ArchidektFetcher } from "~/resources/integrations/decks/fetchers/archidekt.fetcher"

const baseRow = {
  id: 'row-1',
  player: {},
  archetype: 'Aggro',
  firstName: 'Test',
  lastName: 'User'
}

describe('DeckFetcherResolver', () => {
  it('resolves to MoxfieldFetcher when moxfield.com URL is present', () => {
    const row = { ...baseRow, decklistUrl: 'https://moxfield.com/decks/abc', decklistTxt: '' }
    const fetcher = DeckFetcherResolver.resolveFetcherType(row)
    expect(fetcher).toBe(MoxfieldFetcher)
  })

  it('resolves to MagicVilleFetcher when magic-ville.com URL is present', () => {
    const row = { ...baseRow, decklistUrl: 'https://magic-ville.com/toto/tutu', decklistTxt: '' }
    const fetcher = DeckFetcherResolver.resolveFetcherType(row)
    expect(fetcher).toBe(MagicVilleFetcher)
  })

  it('resolves to ArchidektFetcher when archidekt.com URL is present', () => {
    const row = { ...baseRow, decklistUrl: 'https://archidekt.com/toto/tutu', decklistTxt: '' }
    const fetcher = DeckFetcherResolver.resolveFetcherType(row)
    expect(fetcher).toBe(ArchidektFetcher)
  })

  it('resolves to TextFetcher when decklistTxt is provided and no URL', () => {
    const row = { ...baseRow, decklistUrl: '', decklistTxt: '1 Forest\n1 Llanowar Elves' }
    const fetcher = DeckFetcherResolver.resolveFetcherType(row)
    expect(fetcher).toBe(TextFetcher)
  })

  it('returns NothingFetcher when neither URL nor text is provided', () => {
    const row = { ...baseRow, decklistUrl: '', decklistTxt: '' }
    const fetcher = DeckFetcherResolver.resolveFetcherType(row)
    expect(fetcher).toBe(NothingFetcher)
  })
})