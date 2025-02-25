# Scrap Trawler – Privacy Policy

**Effective Date:** 2025-02-25  
**Last Updated:** 2025-02-25

## 1. Introduction
Scrap Trawler is a **browser extension** designed to assist **Magic: The Gathering tournament organizers** in extracting event data from **Wizards EventLink**. This Privacy Policy explains how Scrap Trawler handles user data and ensures compliance with Chrome Web Store policies.

## 2. Data Collection and Usage
Scrap Trawler **does not collect, store, or transmit any personal data** outside the user's local browser environment. The extension operates **entirely within the user's device**, processing data from EventLink to streamline tournament organization.

### 2.1. Data Processed
- **Tournament Data:** Scrap Trawler extracts publicly available **player registration, pairings, standings, and penalties** from EventLink.
- **Decklists and Metadata:** If provided by the user, decklists and custom tournament metadata are linked to players.
- **Local Storage:** Extracted data is stored **locally** in the browser using `chrome.storage.local`. No data is sent to external servers.

### 2.2. Permissions and Justification
Scrap Trawler requires certain browser permissions to function correctly:
- **`activeTab`** – Allows the extension to scrape tournament data only when the user activates it.
- **`cookies`** – Accesses EventLink authentication tokens (`clientAuth`) for authorized API requests.
- **`scripting`** – Injects scripts into EventLink pages to extract tournament data.
- **`sidePanel`** – Provides a user-friendly interface for displaying tournament progress.
- **`storage`** – Stores event data locally for user access.
- **`host permissions` (`https://eventlink.wizards.com/*`)** – Enables reading tournament data from EventLink.

## 3. Data Sharing
Scrap Trawler **does not share, sell, or transmit** any data to third parties. All data remains within the user's browser environment.

## 4. Security Measures
- The extension **only runs on EventLink pages** and does not modify or interfere with other websites.
- Authentication tokens (cookies) are **never stored or transmitted** beyond the active session.
- The extension does not collect personally identifiable information (PII).

## 5. User Control and Data Retention
- Users can clear stored tournament data at any time via their browser settings.
- No persistent user profiles are created.

## 6. Compliance with Chrome Web Store Policies
Scrap Trawler adheres to the [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/). It follows strict privacy guidelines, ensuring minimal permissions usage and transparent data handling.

## 7. Contact Information
For any questions regarding this Privacy Policy, please create a ticket on the [GitHub repository](https://github.com/Guibod/scrap-trawler/issues)
