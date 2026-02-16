import * as Notifications from "expo-notifications";

export function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function subDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

// Programa recordatorios y devuelve los IDs para guardarlos y poder cancelarlos luego
export async function scheduleSoatReminders(args: {
  vehicleName: string;
  purchaseDate: Date;          // fecha compra
  reminderDaysBefore: number[]; // ej: [7, 30]
}) {
  const expiry = addYears(args.purchaseDate, 1);

  const ids: string[] = [];

  for (const daysBefore of args.reminderDaysBefore) {
    const notifyAt = subDays(expiry, daysBefore);

    // Si la fecha ya pasó, no la programes
    if (notifyAt.getTime() <= Date.now()) continue;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "SOAT por vencer",
        body: `Tu SOAT de "${args.vehicleName}" vence el ${expiry.toLocaleDateString()}.`,
      },
      trigger: { date: notifyAt } as Notifications.NotificationTriggerInput,


    });

    ids.push(id);
  }

  return ids;
}

export async function cancelNotifications(ids: string[]) {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}
