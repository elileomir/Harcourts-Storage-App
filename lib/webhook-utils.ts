export async function triggerAvailabilityWebhook(facilities: string[]) {
  if (facilities.length === 0) return;

  const webhookUrl =
    "https://hup.app.n8n.cloud/webhook/3e1b21ce-c761-44e1-bce0-3fa57b5951f8";
  const facilityString = facilities.join(", ");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ facility: facilityString }),
    });
    console.log(`Webhook triggered for facilities: ${facilityString}`);
  } catch (error) {
    console.error("Failed to trigger availability webhook:", error);
  }
}
