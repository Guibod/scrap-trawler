import React from "react"
import { ShieldExclamationIcon, PencilSquareIcon } from "@heroicons/react/20/solid"
import { Tooltip } from "@heroui/tooltip"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"

interface PlayerNameProps {
  player: PlayerDbo
}

const PlayerName = ({ player }: PlayerNameProps) => {
  // Render Override Tooltip if player is patched
  const renderPatchedIcon = () => {
    if (!player.overrides) return null; // Hide if not patched

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
    if (player.overrides || !player.isAnonymized) return null; // Hide if patched
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
    <div className="flex items-center space-x-2">
      {renderPatchedIcon()}
      {renderAnonymizedIcon()}
      <span>
        { player.overrides?.firstName || player.firstName }
        {" "}
        { player.overrides?.lastName || player.lastName}
      </span>
    </div>
  );
};

export default PlayerName;
