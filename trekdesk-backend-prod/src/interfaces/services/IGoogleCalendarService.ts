import { calendar_v3 } from "@googleapis/calendar";

export interface IGoogleCalendarService {
  /**
   * Checks if a specific time slot is busy.
   * @param start - Start time ISO string.
   * @param end - End time ISO string.
   * @param calendarId - The calendar ID to check (defaults to primary).
   */
  isBusy(start: string, end: string, calendarId?: string): Promise<boolean>;

  /**
   * Lists events for a specific day.
   * @param date - Date string (YYYY-MM-DD).
   * @param calendarId - The calendar ID to check.
   */
  listEvents(
    date: string,
    calendarId?: string,
  ): Promise<calendar_v3.Schema$Event[]>;

  /**
   * Creates a new calendar event.
   * @param details - Event details.
   */
  createEvent(details: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    calendarId?: string;
  }): Promise<calendar_v3.Schema$Event>;
}
