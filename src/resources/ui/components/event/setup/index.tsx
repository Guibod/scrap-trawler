import React from "react"
import { EventSetupProvider } from "~/resources/ui/components/event/setup/provider"
import SetupSteps from "~/resources/ui/components/event/setup/steps"

// TODO: add a form to use the filters to exclude / include values
// TODO: add a form to select the duplicate strategy
// TODO: grey out filtered out rows in the table
// TODO: grey out duplicated items in the table as decided by the strategy
// TODO: display a sample of the data from the spreadsheet in the end
// TODO: control the accordion depending on the progress of the setup

const EventSetup = () => {
  return (
    <EventSetupProvider>
      <SetupSteps />
    </EventSetupProvider>
  );
};

export default EventSetup;
