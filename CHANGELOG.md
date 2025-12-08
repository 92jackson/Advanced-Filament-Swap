# Changelog

All notable changes to the extension (including the bundled cfg) are documented here. Version numbers follow the extension manifest.

## v0.2.0 — 2025-12-08

### Added

-	Temperature override control in swap modal.
-	Integration to send `AFS_SET_TARGET T=<temp>` for immediate heat and override.
-	M600 `T` parameter support (slicer can pass next filament temperature).
-	`SWAP_PRINT` honors `T` and heats before unload/load.
-	`AFS_SET_TARGET` macro for UI-driven overrides.
-	User-configurable temperature presets in Extension Settings.
-	Support labeled presets via CSV `[LABEL:VALUE]` or plain `VALUE`; brackets optional.

### Changed

-	Removed legacy “Set Temp” prompt in `filament_swap_loading` stage, replaced with split-button UI.
-	Finish restore continues to use stored pre-swap temperature; overrideable when set.
-	`tempPresets` setting changed from numeric array to object list `{ value, label }`.
-	Extension Settings presets input normalizes after save and drops invalid entries.
-	Temp control positioned to the left of the minimize button in the header.
-	English tooltip/help updated for presets CSV format.

### Security

-	Safety unchanged; `AFS_TEMP_CHECK` enforces min/max bounds and blocking heat.

## v0.1.0 — 2025-11-30

### Added

-	Initial extension release.
-	Compatibility with Mainsail and Fluidd.
-	Configuration writer/installer with runout sensor conflict detection and fix flow.
-	Internationalization (English, Spanish, German, French, Chinese).
-	Status telemetry display (hotend temp, position, ETA).
-	Cfg features bundled: helper macros (`AFS_STORE_TEMPERATURE`, `AFS_RESTORE_IDLE_TIMEOUT`, `AFS_INCREMENT_ALERT_COUNT`), `AFS_STATE`, delayed cooldown (`AFS_COOLDOWN_TIMER`, `AFS_COOLDOWN_IF_IDLE`, `cooldown_runout_unprime_mm`), user hooks (`AFS_PRE_SWAP`, `AFS_POST_SWAP`).

### Changed

-	Simplified temperature restoration: uses stored pre-swap temperature.
-	Replaced `NEWJOB` magic numbers with string constants.
-	Replaced `G4 S20` dwells with `M400` + `G4 P1000` in `AFS_LOAD`/`AFS_UNLOAD`.
-	Resume heating targets: removed `M109 S0`; use default target fallback.
-	Idle timeout: store previous timeout at swap start; restore on resume.
-	Simplified `AFS_PUSH`: console output only for `TYPE=1` origin messages.

### Fixed

-	`RUN_OUT` swapping flag scope; checks `AFS_CFG.swapping`.
-	Safe height handling to avoid exceeding max Z.
-	Park position handling; use axis maximums when out of range.
