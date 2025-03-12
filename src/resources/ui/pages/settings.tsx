import React, { useState, useEffect } from "react";
import { useSettings } from "~resources/ui/providers/settings";
import { Form, Button, Input, Checkbox, Card, CardHeader, CardBody, addToast, Divider } from "@heroui/react"
import type { SettingsModel } from "~resources/domain/models/settings.model"
import ImportExportCard from "~resources/ui/components/import.export.card"

const SettingsPage = () => {
  const { settings, setMany } = useSettings();
  const [currentSettings, setCurrentSettings] = useState<SettingsModel|null>(null);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleKeyChange = (key: keyof SettingsModel, value) => {
    setCurrentSettings((prev) => ({
      ...prev!,
      [key]: value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await setMany(currentSettings);
    addToast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
      color: "success",
      variant: "solid",
    });
  };

  if (!currentSettings) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <Card className="w-full max-w-lg">
        <CardHeader className={"text-lg font-semibold"}>Settings</CardHeader>

        <Form onSubmit={onSubmit}>
          <CardBody className={"flex flex-col gap-5"}>
            <Input
              label="Moxfield API Key"
              placeholder="Enter your Moxfield API Key"
              defaultValue={currentSettings.moxfieldApiKey ?? ""}
              onValueChange={(v) => handleKeyChange("moxfieldApiKey", v)} // ✅ Fully controlled
            />

            <Checkbox
              isSelected={!!currentSettings.enableCrossEventIdentification}
              onValueChange={(v) => handleKeyChange("enableCrossEventIdentification", v)} // ✅ Fully controlled
            >
              Enable Cross-Event Identification
            </Checkbox>

            <Button type="submit" className="w-full py-2 text-lg" color={"primary"}>
              Save Settings
            </Button>
          </CardBody>
        </Form>
      </Card>

      <ImportExportCard />
    </div>
  );
};

export default SettingsPage;
