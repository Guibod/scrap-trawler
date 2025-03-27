import React from "react"
import { ShieldExclamationIcon, PencilSquareIcon, HandThumbUpIcon, HandThumbDownIcon, HandRaisedIcon, ClockIcon } from "@heroicons/react/20/solid"
import { Tooltip } from "@heroui/tooltip"
import type { PlayerProfile } from "~/resources/domain/mappers/player.mapper"
import { pairingModeDescription } from "~/resources/domain/dbos/mapping.dbo"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"

interface PlayerNameProps {
  player: PlayerProfile
}

const deckStatusMap: Record<DeckStatus, {icon: React.ReactNode, description: string}> = {
  [DeckStatus.PENDING]: {
    icon: <ClockIcon className="h-5 w-5 fill-gray-100 stroke-gray-700 cursor-help" />,
    description: "Their decklist has not been fetched yet."
  },
  [DeckStatus.FETCHED]: {
    icon: <HandThumbUpIcon className="h-5 w-5 fill-success-100 stroke-success-700 cursor-help" />,
    description: "Their decklist has been fetched."
  },
  [DeckStatus.FAILED]: {
    icon: <HandThumbDownIcon className="h-5 w-5 fill-warning-100 stroke-warning-700 cursor-help" />,
    description: "Their decklist could not be fetched."
  },
  [DeckStatus.ERROR]: {
    icon: <HandRaisedIcon className="h-5 w-5 fill-danger-100 stroke-danger-700 cursor-help" />,
    description: "An error occurred while fetching their decklist."
  }
}

const PlayerName = ({ player }: PlayerNameProps) => {
  // Render Override Tooltip if player is patched
  const renderMappedIcon = () => {
    if (!player.mapMode) return null; // Hide if not patched

    return (
      <Tooltip content={
        <div className="text-xs text-gray-800">
          <p>
            This player was mapped from the spreadsheet using <strong>{pairingModeDescription(player.mapMode)}</strong>.

            {deckStatusMap[player.deck?.status]?.description && (
              <span>
                {" "}
                {deckStatusMap[player.deck?.status]?.description}
              </span>
            )}
          </p>
        </div>
      }>
        {deckStatusMap[player.deck?.status]?.icon && deckStatusMap[player.deck?.status]?.icon}
      </Tooltip>
    );
  };

  const renderPatchedIcon = () => {
    if (!player.isOverride) return null; // Hide if not patched

    return (
      <Tooltip content={
        <div className="text-xs text-gray-800">
          <p>You’ve manually edited this player’s information.</p>
        </div>
      }>
        <PencilSquareIcon className="h-5 w-5 fill-gray-100 stroke-gray-700 cursor-help" />
      </Tooltip>
    );
  };

  // Render Anonymization Tooltip if player is anonymized (Only if NOT patched)
  const renderAnonymizedIcon = () => {
    if (player.isOverride || !player.isAnonymized) return null; // Hide if patched
    return (
      <Tooltip content={
        <div className="text-xs text-gray-800">
          <p>
            Under GDPR and other privacy laws, this player was forcibly anonymized
            in EventLink before you scraped the tournament.
          </p>
          <p>Scrape Trawler will soon allow you to override this anonymization or even select the identity of the
            player from other tournaments.
          </p>
          <p className="font-semibold">
            WOTC unique identifier: {player.id}
          </p>
        </div>
      }>
        <ShieldExclamationIcon className="h-5 w-5 fill-red-100 stroke-red-700 cursor-help" />
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center space-x-2" aria-label={`player-name-${player.id}`}>
      {renderMappedIcon() || renderPatchedIcon() || renderAnonymizedIcon()}
      <span>
        { player.firstName }
        {" "}
        { player.lastName }
      </span>
    </div>
  );
};

export default PlayerName;
