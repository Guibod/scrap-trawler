# Scrap Trawler

![Scrap Trawler Logo](assets/icon.png)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Build Status](https://github.com/Guibod/scrap-trawler/actions/workflows/build.yml/badge.svg)](https://github.com/Guibod/scrap-trawler/actions)
[![Code Quality](https://img.shields.io/codefactor/grade/github/Guibod/Scrap-Trawler/main)](https://www.codefactor.io/repository/github/Guibod/Scrap-Trawler)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/10030/badge)](https://bestpractices.coreinfrastructure.org/projects/10030)

## 📖 About Scrap Trawler
Scrap Trawler is an **open-source browser extension** designed for **tournament organizers** using [EventLink](https://eventlink.wizards.com/). It enables users to **extract event data**, including:
- **Player registration**
- **Pairings & standings**
- **Penalties & infractions**

This project is **not affiliated with, endorsed by, or sponsored by Wizards of the Coast (WOTC).** *Magic: The Gathering*, *EventLink*, and all related trademarks belong to **Wizards of the Coast LLC**.

---

## ⚙️ Why the Name "Scrap Trawler"?
The name "Scrap Trawler" is inspired by the card **Scrap Trawler** from *Aether Revolt* (a set in *Magic: The Gathering*, published by Wizards of the Coast). The **Scrap Trawler card** allows players to "retrieve artifacts from the graveyard," much like this extension **retrieves event data** from the EventLink system.

"Scrap Trawler" is **not a copyrighted name** and is used here **as an homage** to the spirit of data recovery and organization. This project **does not claim ownership** over any trademarks or intellectual property related to Wizards of the Coast or *Magic: The Gathering*.

---

## 🚀 Features
* **Extracts event data directly from EventLink** using the user's session.
* **Supports GraphQL API requests for efficient data retrieval**.
* **Saves event data for historical reference**.
* **Runs as a lightweight browser extension with a simple UI**.
* **Designed with OpenSSF security best practices**.

---

## 📦 Installation
1. **Clone the repository**:
   ```sh
   git clone https://github.com/Guibod/Scrap-Trawler.git
   cd Scrap-Trawler
   ```
2. **Install dependencies**:
   ```sh
   pnpm install
   ```
3. **Build the extension**:
   ```sh
   pnpm build
   ```
4. **Load it in your browser** (for development):
    - Open **Chrome** → **Extensions** → **Enable Developer Mode**
    - Click **Load Unpacked** and select the `dist/` directory

---

## 🏗️ Build & CI/CD
This project uses **GitHub Actions** for automated builds and linting.

- **Lint & Test**: Runs ESLint and unit tests on every push.
- **Build**: Compiles the extension for production.
- **Security Checks**: Uses OpenSSF best practices for secure development.

---

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. **Fork the repo** and create a feature branch.
2. **Follow the code style** (ESLint & Prettier configured).
3. **Submit a PR**, describing your changes.

### Security Practices
This project follows [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/). All PRs are checked for security vulnerabilities using:
- **GitHub Dependabot**
- **Snyk Security**
- **Code Scanning with CodeQL**

---

## 📜 License
This project is open-source under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## 📞 Contact
Have questions? Open an [issue](https://github.com/Guibod/Scrap-Trawler/issues) or join the discussion!

Happy scraping! 🚀
