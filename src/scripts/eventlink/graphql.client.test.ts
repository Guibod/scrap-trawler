import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { GraphQLClient } from "graphql-request";
import { EventLinkGraphQLClient } from "./graphql.client";
import { GraphQlError, InvalidGraphQlResponseError } from "~scripts/eventlink/exceptions"

// Mock GraphQLClient to prevent real API calls
vi.mock("graphql-request", () => ({
  gql: vi.fn().mockImplementation(() => "fake-query"),
  GraphQLClient: vi.fn().mockImplementation(() => ({
    request: vi.fn(),
  })),
}));

describe("EventLinkGraphQLClient", () => {
  let client: EventLinkGraphQLClient;
  let mockGraphQLClient: vi.Mocked<GraphQLClient>;

  beforeEach(() => {
    client = new EventLinkGraphQLClient("fake-token", "test-client");
    mockGraphQLClient = (client as any).client;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("getOrganization - successful response", async () => {
    const mockResponse = {
      organization: { id: 1, name: "Test Org" },
    };

    mockGraphQLClient.request.mockResolvedValueOnce(mockResponse);

    const result = await client.getOrganization(1);

    expect(result).toEqual(mockResponse.organization);
    expect(mockGraphQLClient.request).toHaveBeenCalledWith(
      expect.any(String),
      { id: 1 }
    );
  });

  test("getGameStateAtRound - successful response", async () => {
    const mockResponse = {
      gameStateV2AtRound: { eventId: 42, currentRoundNumber: 3 },
    };

    mockGraphQLClient.request.mockResolvedValueOnce(mockResponse);

    const result = await client.getGameStateAtRound(42, 3);

    expect(result).toEqual(mockResponse.gameStateV2AtRound);
    expect(mockGraphQLClient.request).toHaveBeenCalledWith(
      expect.any(String),
      { eventId: 42, round: 3 }
    );
  });

  test("getEventDetails - successful response", async () => {
    const mockResponse = {
      event: { id: 99, title: "MTG Tournament" },
    };

    mockGraphQLClient.request.mockResolvedValueOnce(mockResponse);

    const result = await client.getEventDetails(99, "en");

    expect(result).toEqual(mockResponse.event);
    expect(mockGraphQLClient.request).toHaveBeenCalledWith(
      expect.any(String),
      { id: 99, locale: "en" }
    );
  });

  test("GraphQL request failure should throw GraphQlError", async () => {
    mockGraphQLClient.request.mockRejectedValue(
      new Error("Network failure")
    );

    await expect(client.getOrganization(1)).rejects.toThrow(GraphQlError);
    await expect(client.getOrganization(1)).rejects.toThrow(
      "GraphQL request failed."
    );

    expect(mockGraphQLClient.request).toHaveBeenCalled();
  });

  test("GraphQL unexpected payload should throw InvalidGraphQlResponseError", async () => {
    mockGraphQLClient.request.mockResolvedValue(null);

    await expect(client.getOrganization(1)).rejects.toThrow(InvalidGraphQlResponseError);
    await expect(client.getOrganization(1)).rejects.toThrow(
      "GraphQL Error: Received an invalid or malformed GraphQL response."
    );

    expect(mockGraphQLClient.request).toHaveBeenCalled();
  });

  test("Invalid GraphQL response should throw GraphQlError", async () => {
    mockGraphQLClient.request.mockRejectedValueOnce({
      errors: [{ message: "Invalid request" }],
    });

    await expect(client.getEventDetails(99)).rejects.toThrow(GraphQlError);
  });
});
