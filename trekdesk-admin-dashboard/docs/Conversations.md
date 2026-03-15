# Conversations Feature

## Overview

The **Conversations** feature is the primary interface for TrekDesk AI administrators to review, analyze, and manage customer interactions. It provides a high-fidelity lookup into the history of AI-driven voice and chat sessions, enabling quality assurance and lead qualification.

## 🏗️ UI Architecture

The feature is built using a **Split-Pane Layout** pattern:

- **Left Navigation Pane**: A scrollable list of session cards showing high-level metadata (Sentiment, Duration, Timestamp).
- **Right Detail Pane**: A comprehensive drill-down view showing the full conversation transcript, AI-generated summaries, and performance insights.

### Key Components

| File                       | Responsibility                                                                                        |
| :------------------------- | :---------------------------------------------------------------------------------------------------- |
| `Conversations.tsx`        | The primary container component. Manages selection state, data orchestration, and deletion workflows. |
| `Conversations.module.css` | Scoped styling using CSS Modules, including animations for message bubble rendering.                  |

---

## 🔄 Data Lifecycle

The feature leverages **TanStack Query (React Query)** for efficient server-state management:

1.  **Index Fetching**: Uses `useCallLogs()` to populate the sidebar. Data is cached and automatically invalidated upon session deletion.
2.  **Detail Fetching**: Uses `useCallLogDetails(selectedId)` with the `enabled` flag to fetch the full transcript only when a session is selected.
3.  **Deletion**: Uses `useDeleteCallLog()` mutation tucked behind a global confirmation modal to safely remove records.

---

## 🛠️ Implementation Details

### Transcript Normalization

To bridge the gap between real-time data capture and historical storage, the component includes a **Normalization Layer**. It handles two data formats:

1.  **Structured Array (Modern)**:

    ```json
    [
      { "role": "ai", "text": "..." },
      { "role": "user", "text": "..." }
    ]
    ```

    Rendered as a threaded dialogue with "Assistant" and "User" labels.

2.  **Object Fallback (Legacy)**:
    Handles older sessions where transcripts were stored as a single text block (`{ full_text: "..." }`), ensuring no broken UI for historical data.

### Lead Qualification Highlights

The UI visually distinguishes between different types of interactions based on the `sentiment_score`:

- **Hot Leads**: Highlighted with a `success` badge (Score > 0.7).
- **Inquiries**: Labeled with a `secondary` badge for standard customer support queries.

## 🚀 Future Roadmap

- **Audio Playback**: Integration of call audio recording playback directly in the detail pane.
- **Lead Flagging**: Ability for admins to manually flag specific sessions for follow-up.
- **Transcript Search**: Client-side filtering of conversation threads.
