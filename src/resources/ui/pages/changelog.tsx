import changelog from "~/changelog.json";
import React from "react"
import { Accordion } from "@heroui/accordion";
import { AccordionItem } from "@heroui/react"

const ChangelogPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">📜 Changelog</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Here is the list of changes made to the app over time.
      </p>

      <Accordion>
        {changelog.map(({ version, timestamp, changes }, index) => (
          <AccordionItem key={index} title={`Version ${version} - ${new Date(timestamp * 1000).toLocaleDateString()}`}>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 p-2">
              {changes.map((change, idx) => (
                <li key={idx} className="text-sm">{change}</li>
              ))}
            </ul>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ChangelogPage;