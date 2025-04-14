import React from "react";
import { Button } from "@heroui/button";
import { useEventSetup } from "~/resources/ui/components/event/setup/provider";
import PlayerCard from "~/resources/ui/components/player/card"

const SetupFinalize: React.FC = () => {
  const { event, handleFinalization } = useEventSetup();

  return (
    <div className="flex flex-col w-full p-4">
      {/* Friendly Confirmation Button */}
      <div className="mb-6 flex flex-col justify-center">
        <p className="text-lg mt-2">Congratulations, everything is setup !</p>

        <p className="text-sm mt-1">After validation, Scrap-Trawler will start fetching decklists from remote websites. This operation is automatic, but it can take a while depending of your settings and permissions.</p>
        <p className="text-sm mt-1">The setup mode remain accessible through the top-right toggle button at any time if you ever need to change something.</p>
        <Button
          onPress={handleFinalization}
          className="mt-3 bg-green-500 text-white px-6 py-3 text-lg rounded-md shadow-lg hover:scale-105 active:scale-95">
          ✅ Finish setup & Start fetching decklists
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(event.players).map(playerId => {
          return (
            <PlayerCard key={playerId} playerId={playerId} editable={false} />
          );
        }))}
      </div>
    </div>
  );
};

export default SetupFinalize;
