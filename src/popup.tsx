import { Button } from "@heroui/button";
import "~/resources/ui/style.css";
import { openApp } from "~/resources/ui/actions/open";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/16/solid"
import logo from "data-base64:../assets/icon.png"
import { HeroUIProvider } from "@heroui/react"
import PopupLayout from "~/resources/ui/layouts/popup"
import React from "react"
import Version from "~/resources/ui/components/version"


const Popup = () => {
    const handleOpenBug = () => {
        window.open("https://github.com/Guibod/scrap-trawler/issues/new", "_blank", "noopener,noreferrer");
    };

    return (
      <HeroUIProvider>
        <PopupLayout>
          <div className="w-64 p-4 rounded-lg shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                  <img src={logo} alt="Scrap Trawler Logo" className="w-10 h-10" />
                  <Button
                    aria-label={"settings"}
                    isIconOnly={true}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    onPress={() => openApp("/settings")}
                  >
                      <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  </Button>
              </div>

              {/* App Info */}
              <div className="text-center">
                  <h1 className="text-lg font-mtg">Scrap Trawler <span className="text-sm"><Version linked={false}/></span></h1>
              </div>

              {/* Buttons */}
              <div className="mt-4 space-y-2">
                  <Button onPress={() => openApp("/")} color="primary" className="w-full">Open Application</Button>
                  <Button onPress={handleOpenBug} variant="ghost" color="secondary" className="w-full">
                      Report a Bug
                  </Button>
              </div>
          </div>
        </PopupLayout>
      </HeroUIProvider>
    );
};

export default Popup;
