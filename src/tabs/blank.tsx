import React from "react";
import { HeroUIProvider } from "@heroui/system"
import { Button } from "@heroui/button"
import "../resources/ui/style.css"
import { Tooltip } from "@heroui/tooltip"

const App = () => {
  return (
    <HeroUIProvider>
      <div className="container">
        <h1>Scrap Trawler</h1>
        <Tooltip
          showArrow={true}
          content={
            <div className='px-1 py-2'>
              My content
            </div>
          }
        >
          <span>my text</span>
        </Tooltip>
        <p>Standalone Extension UI</p>
        <Button onPress={() => alert("Scrap started!")}>Start Scraping</Button>
      </div>
    </HeroUIProvider>
  );
};

export default App;