import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * 📅 Calcula fecha de vencimiento
 */
export function calculateExpirationDate(
  baseDate: Date,
  durationDays: number
): Date {
  const exp = new Date(baseDate);
  exp.setDate(exp.getDate() + durationDays);
  return exp;
}

export async function setupAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}
/**
 * 🔔 Calcula fechas de recordatorio
 */
export function calculateReminderDates(
  expirationDate: Date,
  reminderDaysBefore: number[]
): Date[] {
  return reminderDaysBefore.map((days) => {
    const d = new Date(expirationDate);
    d.setDate(d.getDate() - days);
    return d;
  });
}

/**
 * 🔕 Cancela notificaciones existentes
 */
export async function cancelNotifications(ids?: string[]) {
  if (!ids || ids.length === 0) return;

  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      console.log("Error cancelando notificación", e);
    }
  }
}

/**
 * 🔔 Programa recordatorios (GENÉRICO PARA TODOS LOS DOCUMENTOS)
 */
export async function scheduleDocumentReminders({
  title,
  body,
  baseDate,
  durationDays,
  reminderDaysBefore,
}: {
  title: string;
  body: string;
  baseDate: Date;
  durationDays: number;
  reminderDaysBefore: number[];
}): Promise<string[]> {
  const now = new Date();

  // 📅 calcular vencimiento
  const expirationDate = calculateExpirationDate(baseDate, durationDays);

  // 🔔 calcular recordatorios
  const reminderDates = calculateReminderDates(
    expirationDate,
    reminderDaysBefore
  );

  const ids: string[] = [];

  for (const date of reminderDates) {
    // ❌ no programar fechas pasadas
    if (date <= now) continue;

try {
    const id = await Notifications.scheduleNotificationAsync({
    content: {
        title,
        body: `${body} vence el ${expirationDate.toLocaleDateString()}`,
        sound: true,
    },
    trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: date,
    },
    });

    ids.push(id);
    } catch (e) {
    console.log("Error programando notificación", e);
    }
}

    return ids;
    }
    

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
