# Advanced Filament Swap for Moonraker Printers (AFS)

![AFS Logo](assets/logo.png)

**Advanced Filament Swap** is a powerful browser extension designed to enhance your 3D printing workflow on Moonraker-based printers. It integrates directly into your web interface (such as Mainsail or Fluidd) to provide a guided, interactive, and highly configurable filament change process.

Whether you're dealing with a mid-print filament change (M600), runouts, or just swapping colors between prints, AFS takes the guesswork out of the process with a visual timeline, automated macros, and smart safeguards.

## Demos

[![Demo 1](https://img.youtube.com/vi/osOXfzRxjKA/0.jpg)](https://youtu.be/osOXfzRxjKA) [![Demo 2](https://img.youtube.com/vi/yw7z2yx4DHE/0.jpg)](https://youtu.be/yw7z2yx4DHE)

## ✨ Features

-   **🖥️ Seamless Integration**: Works on top of any Moonraker-based web interface. The extension injects a non-intrusive control button directly into your dashboard.
-   **🔄 Guided Workflow**: A clear, step-by-step visual timeline guides you through heating, unloading, loading, and purging.
-   **⚙️ Complete Customization**:
    -   Configure load/unload lengths, speeds, and temperatures.
    -   Set "Smart Park" coordinates with automatic max-travel detection.
    -   Customize purge amounts and retraction settings.
-   **🧩 Powerful Macro System**:
    -   Trigger custom G-code or existing macros at specific stages (Pre-Load, Post-Unload, etc.).
    -   Fully compatible with your existing Klipper macros.
-   **🔊 Smart Alerts**:
    -   Browser-based audio notifications for Filament Runout and M600 events.
    -   Plays M300 tunes directly through your browser (no beeper required on the printer!).
-   **🌍 Multi-Language Support**: Available in English, Spanish, German, French, and Chinese.
-   **💾 Backup & Restore**: Easily export your AFS configuration to JSON and restore it on other machines.

## 📋 Requirements

This extension is designed to work with standard Moonraker and Klipper installations.

-   **Moonraker**: Requires a standard installation with access to the `printer.objects.subscribe` API and file management endpoints (`/server/files/config`). Most modern versions (post-2021) support this out of the box.
-   **Klipper**: No specific version requirements, but must support standard macro definition features.
-   **Web Interface**: Compatible with **Mainsail**, **Fluidd**, or any other interface that runs on top of Moonraker via a Web Browser.

## 🚀 Installation

### For Chrome / Edge / Brave

1.  **Download the Source**: Clone this repository or download the ZIP and extract it to a folder on your computer.
    ```bash
    git clone https://github.com/92jackson/Advanced-Filament-Swap.git
    ```
2.  **Open Extensions Management**:
    -   In Chrome, go to `chrome://extensions`.
    -   In Edge, go to `edge://extensions`.
3.  **Enable Developer Mode**: Toggle the switch in the top right corner.
4.  **Load Unpacked**: Click the **"Load unpacked"** button and select the folder where you extracted the extension.
5.  **Access**: Open your printer's web interface (e.g., `http://mainsail.local`). You should see a new **AFS** icon button in the interface (usually bottom-left).

## 🛠️ Configuration

1.  Click the **AFS** icon in your web interface to open the Settings Modal.
2.  **First Run**: The extension may prompt you to perform an initial setup or check for configuration conflicts.
3.  **Customize**: Navigate through the tabs to adjust temperatures, speeds, and parking positions to match your printer's capabilities.
4.  **Save**: Changes are saved to your browser's local storage and synced with your printer where applicable.

## 🤝 Support & Community

Need help? Found a bug? Want to request a feature?

-   **Discord**: Join the community on [Discord](https://discord.gg/e3eXGTJbjx) for real-time support and discussions.
-   **GitHub Issues**: Report bugs or suggest enhancements on our [Issues Page](https://github.com/92jackson/mainsail-advanced-filament-swap/issues).

---

<div align="center">
  <p>Find this project useful?</p>
  <a href="https://buymeacoffee.com/92jackson">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="180" />
  </a>
</div>
