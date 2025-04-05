import { describe, it, expect } from "vitest"
import type { CardAtomic } from "~/resources/storage/entities/card.entity"
import { CardMapper } from "~/resources/domain/mappers/card.mapper"

describe("CardMapper.fromAtomicArray", () => {
  it("should convert a classic card with no faces", () => {
    const input: CardAtomic[] = [
      {
        name: "Deathrite Shaman",
        layout: "normal",
        colors: ["B", "G"],
        colorIdentity: ["B", "G"],
        convertedManaCost: 1,
        manaValue: 1,
        type: "Creature — Elf Shaman",
        types: ["Creature"],
        supertypes: [],
        subtypes: ["Elf", "Shaman"],
        legalities: { commander: "Legal", modern: "Banned", vintage: "Legal" },
        identifiers: { scryfallOracleId: "abc123" },
      } as CardAtomic,
    ]

    const result = CardMapper.fromAtomicArray(input)
    expect(result.name).toBe("Deathrite Shaman")
    expect(result.layout).toBe("normal")
    expect(result.faces).toBeUndefined()
    expect(result.localizedNames.en).toBe("Deathrite Shaman")
  })

  it("should convert an MDFC card with both faces", () => {
    const input: CardAtomic[] = [
      {
        name: "Sundering Eruption // Volcanic Fissure",
        faceName: "Sundering Eruption",
        layout: "modal_dfc",
        side: "a",
        manaCost: "{2}{R}",
        faceManaValue: 3,
        type: "Sorcery",
        colors: ["R"],
        colorIdentity: ["R"],
        manaValue: 3,
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "dfc-test-id" },
      },
      {
        name: "Sundering Eruption // Volcanic Fissure",
        faceName: "Volcanic Fissure",
        layout: "modal_dfc",
        side: "b",
        type: "Land",
        colors: [],
        colorIdentity: ["R"],
        manaValue: 0,
        faceManaValue: 0,
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "dfc-test-id" },
      },
    ] as CardAtomic[]

    const result = CardMapper.fromAtomicArray(input)
    expect(result.name).toBe("Sundering Eruption // Volcanic Fissure")
    expect(result.layout).toBe("modal_dfc")
    expect(result.faces).toHaveLength(2)

    const [front, back] = result.faces!
    expect(front.name).toBe("Sundering Eruption")
    expect(back.name).toBe("Volcanic Fissure")
    expect(front.side).toBe("a")
    expect(back.side).toBe("b")
  })

  it("should convert a split card with both halves", () => {
    const input: CardAtomic[] = [
      {
        name: "Expansion // Explosion",
        faceName: "Expansion",
        layout: "split",
        side: "a",
        manaCost: "{U/R}{U/R}",
        faceManaValue: 2,
        type: "Instant",
        colors: ["U", "R"],
        colorIdentity: ["U", "R"],
        manaValue: 6,
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "split-test-id" },
      },
      {
        name: "Expansion // Explosion",
        faceName: "Explosion",
        layout: "split",
        side: "b",
        manaCost: "{X}{U}{U}{R}{R}",
        faceManaValue: 4,
        type: "Instant",
        colors: ["U", "R"],
        colorIdentity: ["U", "R"],
        manaValue: 6,
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "split-test-id" },
      },
    ] as CardAtomic[]

    const result = CardMapper.fromAtomicArray(input);

    expect(result.name).toBe("Expansion // Explosion");
    expect(result.layout).toBe("split");
    expect(result.faces).toHaveLength(2);

    const [first, second] = result.faces!;
    expect(first.name).toBe("Expansion");
    expect(second.name).toBe("Explosion");
    expect(first.side).toBe("a");
    expect(second.side).toBe("b");
  });

  it("should convert a flip card with both faces", () => {
    const input: CardAtomic[] = [
      {
        name: "Student of Elements // Tobita, Master of Winds",
        faceName: "Student of Elements",
        layout: "flip",
        side: "a",
        manaCost: "{1}{U}",
        faceManaValue: 2,
        type: "Creature — Human Wizard",
        colors: ["U"],
        colorIdentity: ["U"],
        manaValue: 2,
        power: "1",
        toughness: "1",
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "flip-test-id" },
      },
      {
        name: "Student of Elements // Tobita, Master of Winds",
        faceName: "Tobita, Master of Winds",
        layout: "flip",
        side: "b",
        type: "Legendary Creature — Human Wizard",
        colors: ["U"],
        colorIdentity: ["U"],
        manaValue: 2,
        power: "3",
        toughness: "3",
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "flip-test-id" },
      },
    ] as CardAtomic[];

    const result = CardMapper.fromAtomicArray(input);

    expect(result.name).toBe("Student of Elements // Tobita, Master of Winds");
    expect(result.layout).toBe("flip");
    expect(result.faces).toHaveLength(2);

    const [front, back] = result.faces!;
    expect(front.name).toBe("Student of Elements");
    expect(back.name).toBe("Tobita, Master of Winds");
    expect(front.side).toBe("a");
    expect(back.side).toBe("b");
  });

  it("should convert a transform card with both sides", () => {
    const input: CardAtomic[] = [
      {
        name: "Delver of Secrets // Insectile Aberration",
        faceName: "Delver of Secrets",
        layout: "transform",
        side: "a",
        manaCost: "{U}",
        faceManaValue: 1,
        type: "Creature — Human Wizard",
        colors: ["U"],
        colorIdentity: ["U"],
        manaValue: 1,
        power: "1",
        toughness: "1",
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "transform-test-id" },
      },
      {
        name: "Delver of Secrets // Insectile Aberration",
        faceName: "Insectile Aberration",
        layout: "transform",
        side: "b",
        type: "Creature — Human Insect",
        colors: ["U"],
        colorIdentity: ["U"],
        manaValue: 1,
        power: "3",
        toughness: "2",
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "transform-test-id" },
      },
    ] as CardAtomic[];

    const result = CardMapper.fromAtomicArray(input);

    expect(result.name).toBe("Delver of Secrets // Insectile Aberration");
    expect(result.layout).toBe("transform");
    expect(result.faces).toHaveLength(2);

    const [front, back] = result.faces!;
    expect(front.name).toBe("Delver of Secrets");
    expect(back.name).toBe("Insectile Aberration");
    expect(front.side).toBe("a");
    expect(back.side).toBe("b");
  });

  it("should convert a meld card as a single-faced card", () => {
    const input: CardAtomic[] = [
      {
        name: "Argoth, Sanctum of Nature // Titania, Gaea Incarnate",
        faceName: "Argoth, Sanctum of Nature",
        layout: "meld",
        side: "a",
        type: "Land",
        colors: [],
        colorIdentity: ["G"],
        manaValue: 0,
        legalities: { commander: "Legal" },
        identifiers: { scryfallOracleId: "meld-test-id" },
      }
    ] as CardAtomic[];

    const result = CardMapper.fromAtomicArray(input);

    expect(result.name).toBe("Argoth, Sanctum of Nature // Titania, Gaea Incarnate");
    expect(result.layout).toBe("meld");
    expect(result.faces).toBeUndefined(); // 🔥 No side B in file
  });

})
