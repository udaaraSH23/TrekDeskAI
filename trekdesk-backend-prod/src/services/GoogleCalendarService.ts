/**
 * @file GoogleCalendarService.ts
 * @description Service for interacting with Google Calendar API.
 */

import { calendar, calendar_v3 } from "@googleapis/calendar";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { IGoogleCalendarService } from "../interfaces/services/IGoogleCalendarService";
import { logger } from "../utils/logger";

export class GoogleCalendarService implements IGoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
    );

    let auth: OAuth2Client | string | undefined;

    if (env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
      });
      auth = this.oauth2Client;
      logger.info(
        "[GoogleCalendarService] Initialized with OAuth2 Refresh Token",
      );
    } else if (env.GOOGLE_CALENDAR_API_KEY) {
      auth = env.GOOGLE_CALENDAR_API_KEY;
      logger.info("[GoogleCalendarService] Initialized with API Key");
    } else {
      logger.warn(
        "[GoogleCalendarService] No OAuth refresh token or API key provided. Service may fail to authenticate requests.",
      );
    }

    this.calendar = calendar({
      version: "v3",
      auth,
    });
  }

  /**
   * Checks if a specific time slot is busy using the freebusy query.
   */
  public async isBusy(
    start: string,
    end: string,
    calendarId: string = "primary",
  ): Promise<boolean> {
    try {
      logger.info(
        `[GoogleCalendarService] Checking if ${calendarId} is busy between ${start} and ${end}`,
      );

      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          items: [{ id: calendarId }],
        },
      });

      const busySlots = response.data.calendars?.[calendarId]?.busy || [];
      return busySlots.length > 0;
    } catch (error) {
      logger.error("[GoogleCalendarService] Error checking freebusy:", error);
      throw error;
    }
  }

  /**
   * Lists events for a specific day.
   */
  public async listEvents(
    date: string,
    calendarId: string = "primary",
  ): Promise<calendar_v3.Schema$Event[]> {
    const timeMin = new Date(`${date}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${date}T23:59:59Z`).toISOString();
    return this.listEventsRange(timeMin, timeMax, calendarId);
  }

  /**
   * Lists events for a specific date range.
   */
  public async listEventsRange(
    timeMin: string,
    timeMax: string,
    calendarId: string = "primary",
  ): Promise<calendar_v3.Schema$Event[]> {
    try {
      logger.info(
        `[GoogleCalendarService] Listing events from ${timeMin} to ${timeMax}`,
      );

      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items || [];
    } catch (error) {
      logger.error(
        "[GoogleCalendarService] Error listing events range:",
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new calendar event.
   */
  public async createEvent(details: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    calendarId?: string;
  }): Promise<calendar_v3.Schema$Event> {
    try {
      const calendarId = details.calendarId || "primary";
      logger.info(`[GoogleCalendarService] Creating event: ${details.summary}`);

      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: {
          summary: details.summary,
          description: details.description,
          start: {
            dateTime: details.start,
          },
          end: {
            dateTime: details.end,
          },
        },
      });

      return response.data;
    } catch (error) {
      logger.error("[GoogleCalendarService] Error creating event:", error);
      throw error;
    }
  }
}
