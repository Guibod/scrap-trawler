import { useCards } from "~/resources/ui/providers/card"
import React, { useState } from "react"
import { Checkbox, CheckboxGroup, Progress } from "@heroui/react"
import { Button } from "@heroui/button"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { CardLanguage } from "~/resources/storage/entities/card.entity"
import { useSettings } from "~/resources/ui/providers/settings"

const HumanLanguages: Record<CardLanguage, string> = {
  [CardLanguage.ENGLISH]: "English",
  [CardLanguage.SPANISH]: "Spanish",
  [CardLanguage.FRENCH]: "French",
  [CardLanguage.GERMAN]: "German",
  [CardLanguage.ITALIAN]: "Italian",
  [CardLanguage.PORTUGUESE]: "Portuguese",
  [CardLanguage.JAPANESE]: "Japanese",
  [CardLanguage.KOREAN]: "Korean",
  [CardLanguage.RUSSIAN]: "Russian",
  [CardLanguage.CHINESE_SIMPLIFIED]: "Simplified Chinese",
  [CardLanguage.CHINESE_TRADITIONAL]: "Traditional Chinese",
  [CardLanguage.ANCIENT_GREEK]: "Ancient Greek",
  [CardLanguage.PHYREXIAN]: "Phyrexian",
}

export const CardIndexSettings: React.FC = () => {
  const { settings, setOne } = useSettings()
  const { indexingProgress, indexingSize, indexSize, buildIndex} = useCards()
  const [isIndexing, setIsIndexing] = useState(!!indexingProgress)
  const [selected, setSelected] = useState(settings.searchLanguages);

  const smartBuildIndex = async () => {
    setIsIndexing(true)
    await buildIndex()
    setIsIndexing(false)
  }

  const handleChange = async (value: CardLanguage[]) => {
    await setOne("searchLanguages", value).then(() => setSelected(value))
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <h2 className="text-lg font-bold flex justify-between w-full align-text-bottom">
          Card Index
          {indexSize ? (<span className="text-sm">({indexSize} cards)</span>) : (<span className="text-sm text-warning">(no card yet)</span>)}
        </h2>
      </CardHeader>
      <CardBody className="text-medium">
        <p className="mb-4">Scrap Trawler use an internal search engine to resolve card names.</p>

        <CheckboxGroup label="Select indexation languages" value={selected} onValueChange={handleChange} isDisabled={isIndexing} orientation="horizontal" className="mb-4">
          {Object.values(CardLanguage).map((lang) => (
            <Checkbox key={lang} value={lang} size="sm">{HumanLanguages[lang]}</Checkbox>
          ))}
        </CheckboxGroup>

        {isIndexing && <Progress value={indexingProgress} maxValue={indexingSize} size="lg" className="mt-2" showValueLabel={true} aria-label="settings-index-progress" />}

        <Button disabled={isIndexing} onPress={smartBuildIndex} color="primary" className="mt-4">
          Update Index
        </Button>
      </CardBody>
    </Card>
  );
};

export default CardIndexSettings