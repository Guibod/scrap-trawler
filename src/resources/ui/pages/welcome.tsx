import React, { useEffect } from "react"
import packageJson from "../../../../package.json"
import { Button } from "@heroui/button"
import { Card, CardBody, CardHeader } from "@heroui/card"
import ButtonScrape from "~/resources/ui/components/button.scrape"
import screenshotAgenda from "data-base64:../../../../assets/screenshots/eventlink.agenda.png"
import screenshotEvent from "data-base64:../../../../assets/screenshots/eventlink.event.png"
import Roadmap from "~resources/ui/components/roadmap"
import { useNavigate } from "react-router-dom"
import ButtonOpen from "~resources/ui/components/button.open"
import { useSettings } from "~resources/ui/providers/settings"

const CURRENT_VERSION = packageJson.version

const WelcomePage = () => {
  const navigate = useNavigate()
  const { settings, setOne } = useSettings();

  useEffect(() => {
    if (settings.showWelcome) {
      setOne('showWelcome', false);
    }
  }, []);

  return (
    <div className="container flex flex-col w-3/4 mx-auto p-6 gap-5">
      <Card>
        <CardHeader className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-mtg">Welcome to Scrap Trawler!</h1>
          <p className="text-sm">Version {CURRENT_VERSION} (Alpha)</p>
        </CardHeader>

        <CardBody className={"text-medium"}>
          {/* Alpha Disclaimer */}
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
            <strong>⚠️ Alpha Version Notice:</strong> Scrap Trawler is still under active development.
            Some features are partially implemented or missing, but updates are coming soon!
            Your feedback is highly valuable—feel free to report any issues or suggestions.
          </div>

          {/* About the Project */}
          <p className="mb-6 text-left">
            Scrap Trawler was created by Guibod, a French Tournament Organizer, Judge, and Developer
            who wanted to simplify the repetitive tasks of tournament management.
            This tool helps organizers save time, provide better player feedback,
            and improve the tournament experience for everyone.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-left">🔍 What to Expect on EventLink</h2>
        </CardHeader>
        <CardBody className={"text-medium"}>
          <p className="mb-2">
            Scrap Trawler integrates with EventLink by adding a <strong>Scrape</strong> button.
            This enables you to easily extract and manage event data, including:
          </p>

          <ul className="list-disc list-inside mb-2 w-1/2 mx-auto">
            <li>📝 Player registration details</li>
            <li>🎲 Round pairings & match results</li>
            <li>📊 Standings & tiebreakers</li>
            <li>⚠️ Penalties & infractions</li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-2">
            <img
              src={screenshotAgenda}
              alt="Agenda View"
              className="w-full max-h-80 object-cover rounded-lg shadow-lg border border-gray-300 dark:border-gray-700"
            />
            <img
              src={screenshotEvent}
              alt="Event View"
              className="w-full max-h-80 object-cover rounded-lg shadow-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          <p className="mb-4">
            Below is an example of the button as it will appear in EventLink:
          </p>

          <div className="flex justify-center my-4">
            <ButtonScrape fake={true} eventId="faked" organizationId="faked" />
          </div>

          <p className="mb-4">
            You can also use the button below to quickly open the Scrap Trawler app:
          </p>

          <div className="flex justify-center my-4">
            <ButtonOpen fake={true} />
          </div>
        </CardBody>
      </Card>


      <Card className={"text-medium"}>
        <CardHeader className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-left">⚖️ Legal Disclaimer</h2>
        </CardHeader>

        <CardBody className={"text-medium flex-col flex gap-2"}>
          <p>Scrap Trawler is an independent browser extension developed to assist Tournament Organizers and Judges in managing event data more efficiently. It is not affiliated with, endorsed by, or sponsored by Wizards of the Coast, LLC.</p>

          <p>This tool interacts with publicly available information on Wizards EventLink, but does not modify, interfere with, or automate any actions on the platform beyond data extraction for personal use.</p>

          <p>Users are responsible for complying with the terms of service of Wizards EventLink and other relevant platforms when using Scrap Trawler. The developer assumes no liability for any misuse or unintended consequences arising from its use.</p>
        </CardBody>
      </Card>

      {/* Roadmap */}
      <Card className={"text-medium"}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-left">🚀 Roadmap</h2>
        </CardHeader>
        <CardBody>
          <Roadmap />
        </CardBody>
      </Card>

      <Card className={"text-medium"}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-left">📞 Need Help?</h2>
        </CardHeader>
        <CardBody>
          <p>If you encounter any issues or have feedback, feel free to:</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2">
            <li>📬 <strong>Report a bug</strong> on <a href="https://github.com/Guibod/scrap-trawler/issues" className="text-blue-500">GitHub Issues</a></li>
            <li>💬 <strong>Join the discussion</strong> on our community channels</li>
          </ul>
        </CardBody>
      </Card>

      {/* Dismiss Button */}
      <Button className="px-6 py-2 text-lg" color="success" onPress={() => navigate("/")}>
        Get Started
      </Button>
    </div>
  )
}

export default WelcomePage
