import React from "react"
import { ShieldExclamationIcon } from "@heroicons/react/20/solid"
import { Tooltip } from "@heroui/tooltip"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"

interface PlayerNameProps {
  player: PlayerDbo
}

const PlayerName = ({player}: PlayerNameProps) => {
  return (
    <div className={`flex items-center space-x-2 cursor-help`}>
      {player.isAnonymized && (
        <Tooltip content={
          <div className="text-xs text-gray-800">
            <p>
              Under the GDPR and other privacy laws, this player was forcibly anonymized
              in EventLink before you scraped the tournament.<br />
              Scrape Trawler will soon allow you to override this anonymization or even select the identity of the
              player from other tournaments.
            </p>

            <p className="font-semibold">
              WOTC unique identifier: {player.id}
            </p>
          </div>
        }>
          <ShieldExclamationIcon className={`h-5 w-5 fill-red-100 stroke-red-700`} />
        </Tooltip>
      )}

      <span>{player.firstName + " " + player.lastName}</span>
    </div>
  );
}

export default PlayerName