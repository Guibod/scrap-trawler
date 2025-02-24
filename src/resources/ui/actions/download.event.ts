import { EventDao } from "~resources/storage/event.dao"

export const downloadEventJson = async (eventId: string) => {
  try {
    const dao = new EventDao();
    // Retrieve the event entity from EventDao
    const eventEntity = await dao.get(eventId);

    if (!eventEntity) {
      throw new Error(`No event found with ID: ${eventId}`);
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(eventEntity, null, 2);

    // Create a Blob and URL
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = `event-${eventId}.json`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading event JSON:", error);
  }
};
