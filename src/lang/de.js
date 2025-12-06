window.I18nTranslations = window.I18nTranslations || {};
window.I18nTranslations.de = {
	name: 'Deutsch',
	modal: {
		title: 'Filamentwechsel',
		status_log: 'Statusprotokoll',
		connection_lost: 'Verbindung verloren, verbinde neu ...',
		minimize_restore: 'Minimieren/Wiederherstellen',
		hotend: 'Hotend',
		pos: 'Pos',
		eta: 'Zeit',
		done: 'Fertig',
		reheat: 'Hotend aufheizen',
		timeline: {
			runout: 'Leer',
			unload: 'Entladen',
			load: 'Laden',
			prepare: 'Bereit',
			loaded: 'Geladen',
			complete: 'Fertig',
			confirm: 'Bestätigen',
			save: 'Speichern',
			apply: 'Anwenden',
			fix: 'Korrigieren',
			include: 'Include',
			restart: 'Neustart',
		},
		log: {
			validating_config: 'Konfiguration wird validiert...',
			rebuilding_blocks: 'Konfigurationsblöcke werden neu aufgebaut...',
			writing_cfg: 'Schreibe adv_filament_swap.cfg...',
			scan_runout: 'Suche nach Runout-Sensor-Konflikten...',
			check_runout_config: 'Prüfe Runout-Sensor-Konfiguration...',
			fix_runout_in_file: 'Korrigiere Runout-Sensor in {file}...',
			runout_fixed: 'Runout-Sensor korrigiert.',
			no_runout_detected: 'Keine Runout-Sensor-Konflikte erkannt.',
			checking_include: 'Prüfe Include in printer.cfg...',
			add_include: 'Füge Include zu printer.cfg hinzu...',
			include_added: 'Include zu printer.cfg hinzugefügt...',
			restarting: 'Starte Klipper-Firmware neu...',
			reconnecting: 'Verbinde erneut mit dem Drucker...',
			file_saved: 'Datei gespeichert.',
			validating_uninstall: 'Deinstallation wird validiert...',
			remove_include: 'Entferne Include aus printer.cfg...',
			include_removed: 'Include entfernt.',
			restore_runout: 'Stelle Runout-Sensor-Konfiguration wieder her...',
			deleting_cfg: 'Lösche adv_filament_swap.cfg...',
			cfg_deleted: 'Konfigurationsdatei gelöscht.',
			uninstall_success: 'Deinstallation erfolgreich abgeschlossen.',
			success: 'Konfiguration erfolgreich aktualisiert.',
		},
		stages: {
			apply: {
				title: 'Anwenden',
				desc: 'Bitte warten, während Änderungen angewendet werden.',
			},
			run_out: {
				title: 'Filament leer',
				label: 'Leer',
				desc: 'Dein Drucker hat kein Filament mehr! Um Schäden zu vermeiden, ziehe das restliche Filament manuell vom Sensor weg und fahre dann mit dem Button "Start Wechsel" fort.',
			},
			filament_swap_unloading: {
				title: 'Filament entladen',
				label: 'Entladen',
				desc: 'Dein aktuelles Filament wird entladen. Bitte warten...',
			},
			filament_swap_loading: {
				title: 'Neues Filament laden',
				label: 'Laden',
				desc: 'Führe neues Filament ein, bis es das Hotend erreicht. Verwende die Vorschubsteuerung, um voreingestellte Längen zu spülen oder zu purgen.',
			},
			manual_swap_prepare: {
				title: 'Wartungsposition',
				label: 'Bereit',
				desc: 'Hotend aufgeheizt und geparkt. Du kannst das Filament manuell herausziehen oder "Filament entladen" verwenden. Dann "Filament laden" nutzen, um das neue Material vorzuschieben.',
			},
			load_new_loaded: {
				title: 'Filament geladen',
				label: 'Geladen',
				desc: "Filament geladen! Verwende die Vorschubsteuerung zum Spülen, bis die Farbe sauber ist, oder 'Fertig' zum Fortsetzen.",
			},
			complete: {
				title: 'Wechsel abgeschlossen',
				label: 'Fertig',
				desc: 'Filamentwechsel abgeschlossen! Druck wird fortgesetzt...',
			},
		},
		macros: {
			start_swap: 'Start Wechsel',
			finish: 'Fertig',
			close: 'Schließen',
		},
		statusMessages: {
			homing: 'Referenzfahrt (Homing)',
			parking: 'Druckkopf parken',
			purging: 'Überschüssiges Filament spülen...',
			loading: 'Filament laden...',
			unloading: 'Filament entladen...',
			temp_set: 'Hotend-Temperatur setzen',
			heating: 'Hotend aufheizen',
			temp_restored: 'Temperatur wiederhergestellt',
			cooling: 'Heizungen ausgeschaltet',
			resuming: 'Druck fortsetzen...',
			complete_idle: 'Wechsel abgeschlossen',
			waiting: 'Warte auf Benutzereingabe...',
			unpriming: 'Hotend entlasten (Unpriming)',
		},
	},
	settings: {
		menu: {
			status: 'Status & Install',
			config: 'Wechsel-Konfiguration',
			backup: 'Backup & Wiederherstellung',
			extension: 'Erweiterungs-Einstellungen',
			about: 'Über',
		},
		common: {
			enabled: 'Aktiviert',
			disabled: 'Deaktiviert',
			close: 'Schließen',
			cancel: 'Abbrechen',
			save: 'Änderungen am Drucker speichern',
			install_repair: 'Installieren / Reparieren',
			restart_refresh: 'Neu starten & Aktualisieren',
			refresh_page: 'Seite aktualisieren',
			uninstall: 'Deinstallieren',
			uninstall_delete_file: 'Deinstallieren & Datei löschen',
			uninstall_confirm:
				'Möchtest du Advanced Filament Swap wirklich deinstallieren?\n\nDies entfernt die Include-Zeile aus deiner printer.cfg, stellt gesicherte runout_gcode-Werte wieder her, löscht optional die adv_filament_swap.cfg und startet Klipper neu.',
			uninstalling: 'Deinstalliere...',
			uninstall_success: 'Erfolgreich deinstalliert.',
			uninstall_fail: 'Deinstallation fehlgeschlagen: {error}',
			open_advanced: 'Erweiterte Konfiguration öffnen',
			loading: 'Lade Konfiguration und analysiere Drucker...',
			failed_load: 'Daten konnten nicht geladen werden: {error}',
			save_success:
				'Konfiguration erfolgreich gespeichert! Bitte starte Klipper bei Bedarf neu (Makros laden normalerweise automatisch neu).',
			save_fail: 'Speichern fehlgeschlagen: {error}',
			unsaved_warning:
				'Du hast ungespeicherte Änderungen. Möchtest du wirklich verlassen? Änderungen gehen verloren.',
			enable: 'Aktivieren',
			use_max: 'Nutze Max ({max}mm)',
			time: {
				second: 'Sekunde',
				seconds: 'Sekunden',
				minute: 'Minute',
				minutes: 'Minuten',
				hour: 'Stunde',
				hours: 'Stunden',
			},
			unload_filament: 'Filament entladen',
			load_filament_x: 'Filament laden ({x}mm)',
			load_x: 'Lade {x}mm',
			purge_x: 'Spüle {x}mm',
			expand: 'Erweitern',
			collapse: 'Einklappen',
		},
		status: {
			title: 'Status & Installation',
			installed: 'Advanced Filament Swap ist installiert',
			installed_msg: 'Konfigurationsdatei erkannt und in printer.cfg eingebunden.',
			legacy: 'Legacy-Konfiguration erkannt',
			legacy_msg:
				'Installierte AFS-Konfiguration verwendet Legacy-Format und ist nicht kompatibel. Klicke auf Installieren / Reparieren, um zu aktualisieren.',
			not_installed: 'Nicht installiert',
			not_installed_msg: 'Advanced Filament Swap ist nicht installiert.',
			incomplete: 'Installation unvollständig',
			incomplete_msg:
				'Konfigurationsdatei existiert, ist aber nicht in printer.cfg eingebunden.',
			missing_config:
				'Konfigurationsdatei (adv_filament_swap.cfg) nicht gefunden. Klicke auf Installieren, um sie zu erstellen.',
			conflicts_title: 'Mögliche Konflikte erkannt',
			conflicts_override_msg:
				'Die folgenden Makros sind in deiner Konfiguration definiert. AFS hat Vorrang, da es zuletzt eingebunden wird, aber deine ursprüngliche Konfiguration bleibt unberührt:',
			conflicts_modify_msg:
				'Die folgenden Konfigurationen werden vom Installationsprogramm geändert, um Kompatibilität zu gewährleisten:',
			summary_title: 'Aktuelle Konfigurationsübersicht',
			show_more: 'Mehr Einstellungen anzeigen',
			show_less: 'Weniger anzeigen',
			no_runout_conflicts: 'Keine Runout-Sensor-Konflikte erkannt.',
			in_file: 'in {file}',
			install_confirm_title: 'Installieren / Reparieren',
			install_confirm_desc:
				'Dies aktualisiert die oben angezeigte Konfiguration. Fortfahren?',
			saving_title: 'Konfiguration wird gespeichert',
			saving_desc: 'Schreibe adv_filament_swap.cfg...',
			fix_runout_title: 'Runout-Sensor wird korrigiert',
			fix_runout_desc: 'Stelle sicher, dass runout_gcode RUN_OUT ist...',
			add_include_title: 'Include wird hinzugefügt',
			add_include_desc: 'Füge [include adv_filament_swap.cfg] zur printer.cfg hinzu...',
			restart_title: 'Firmware wird neu gestartet',
			restart_desc: 'Klipper-Firmware wird neu gestartet. Dies kann einen Moment dauern...',
			success_title: 'Installation abgeschlossen',
			success_desc:
				'Advanced Filament Swap installiert. Neustarten und aktualisieren, um Änderungen anzuwenden.',
			install_blocked_title: 'Installation blockiert',
			install_blocked_desc:
				'Ein aktiver Druck läuft. Stoppe den Druck und versuche es erneut.',
			uninstall_confirm_title: 'Advanced Filament Swap deinstallieren',
			uninstall_confirm_desc:
				'Dies entfernt die Include-Zeile aus der printer.cfg, stellt gesicherte runout_gcode-Werte wieder her, löscht optional die adv_filament_swap.cfg und startet Klipper neu. Fortfahren?',
			uninstall_blocked_title: 'Deinstallation blockiert',
			uninstall_blocked_desc:
				'Ein aktiver Druck läuft. Stoppe den Druck und versuche es erneut.',
			uninstall_success_title: 'Deinstallation abgeschlossen',
			uninstall_success_desc:
				'Advanced Filament Swap deinstalliert. Neustart durchgeführt. Seite aktualisieren, um Änderungen anzuwenden.',
			applyingUninstallTitle: 'Applying Uninstall',
			applyingUninstallDesc: 'Removing include, restoring runout, and restarting firmware...',
			timelineApply: 'Apply',
			timelineConfirm: 'Confirm',
			timelineComplete: 'Complete',
			afs_title: 'Advanced Filament Swap',
			include_title: 'printer.cfg Include',
			runout_title: 'Runout Sensor',
			macros_title: 'Macros',
			invalid_config: 'Invalid Config',
			ok: 'OK',
			max: 'Max',
			tip_install:
				'Empfohlene Korrekturen anwenden und AFS installieren/reparieren; aktualisiert die Übersicht.',
			tip_advanced:
				'Erweitert öffnen, um Einstellungen zu bearbeiten; gespeicherte Änderungen aktualisieren die Übersicht.',
			footer_afs_install:
				'Klicke auf „Installieren / Reparieren“, um Advanced Filament Swap zu installieren.',
			footer_afs_legacy:
				'Klicke auf „Installieren / Reparieren“, um auf das neueste Konfigurationsformat zu aktualisieren.',
			footer_include_missing:
				'Klicke auf „Installieren / Reparieren“, um die Include-Zeile für adv_filament_swap.cfg hinzuzufügen.',
			footer_runout_fix:
				'Klicke auf „Installieren / Reparieren“, um die Runout-Sensor-Konfiguration zu aktualisieren.',
			footer_macros_ok:
				'Keine Änderungen nötig. AFS-Makros haben Priorität und überschreiben sicher.',
			footer_general_advice:
				'Verwende „Installieren / Reparieren“, um die empfohlenen Korrekturen automatisch anzuwenden.',
		},
		config: {
			title: 'Filamentwechsel Konfiguration',
			tip: 'Passe Verhalten und Nachrichten an. Die meisten Benutzer benötigen nur die Kerneinstellungen; Nachrichtensektionen sind optional.',
			sections: {
				defaults: 'Kerneinstellungen',
				defaults_desc:
					'Grundlegendes Verhalten und Sicherheitsoptionen, die Aufheizen, Parkbewegungen, Spüllängen und Konsolenausgabe steuern.',
				originStrings: 'Phasen-Konsolennachrichten',
				originStrings_desc:
					'Konsolennachrichten, die während der Hauptphasen des Wechselprozesses gesendet werden.',
				statusStrings: 'Status-Konsolennachrichten',
				statusStrings_desc:
					'Kurze Fortschrittsnachrichten, die während des gesamten Prozesses zur Konsole hinzugefügt werden.',
			},
			groups: {
				Temperature: 'Temperatur',
				Movement: 'Bewegung & Parken',
				Filament: 'Filament-Handling',
				System: 'System',
				Other: 'Sonstiges',
			},
			params: {
				default_temp: {
					label: 'Standardtemperatur',
					desc: 'Hotend-Temperatur während eines Filamentwechsels, wenn keine gesetzt ist.',
				},
				cooldown_m600: {
					label: 'Abkühlen bei M600',
					desc: 'Hotend ausschalten, wenn ein vom Slicer initiierter Wechsel zu lange wartet.',
				},
				cooldown_runout: {
					label: 'Abkühlen bei Runout',
					desc: 'Hotend ausschalten, wenn ein Runout-initiierter Wechsel zu lange wartet.',
				},
				cooldown_runout_unprime_mm: {
					label: 'Runout Entlastungslänge (mm)',
					desc: 'Diese Menge nach einem Runout extruieren und dann zurückziehen, um zu verhindern, dass sich Filament im Hotend festsetzt. HINWEIS: Stelle sicher, dass dieser Wert nicht größer ist als der Abstand zwischen Extruder und Runout-Sensor.',
				},
				cooldown_delay: {
					label: 'Leerlauf-Abkühlverzögerung (s)',
					desc: 'Wartezeit, bevor das Hotend während eines inaktiven Wechsels ausgeschaltet wird.',
				},
				auto_unload_manual: {
					label: 'Auto-Entladen bei manuellem Wechsel',
					desc: 'Führe automatisch den Entladeschritt aus, wenn du einen manuellen Wechsel startest.',
				},
				park_x: {
					label: 'Parken X',
					desc: 'X-Position für den Wechsel. Setze -1 für maximale Reise.',
				},
				park_y: {
					label: 'Parken Y',
					desc: 'Y-Position für den Wechsel. Setze -1 für maximale Reise.',
				},
				park_z: {
					label: 'Z anheben (mm)',
					desc: 'Abstand, um den der Druckkopf zu Beginn eines Filamentwechsels angehoben wird.',
				},
				zmin: {
					label: 'Minimales Z zum Parken (mm)',
					desc: 'Wenn die Düse zu nah am Druckbett ist, hebe mindestens auf diese Höhe an, bevor geparkt wird.',
				},
				load_new: {
					label: 'Lade-/Spüllänge (mm)',
					desc: 'Wie viel neues Filament geschoben wird, um die alte Farbe zu spülen.',
				},
				unload: {
					label: 'Entladelänge (mm)',
					desc: 'Wie viel Filament beim Entladen aus dem Hotend zurückgezogen wird.',
				},
				unload_speed: {
					label: 'Entladegeschwindigkeit',
					desc: 'Wie schnell das Filament beim Entladen zurückgezogen wird.',
				},
				load_speed: {
					label: 'Lade-/Spülgeschwindigkeit',
					desc: 'Wie schnell das Filament beim Laden/Spülen extruiert wird.',
				},
				park_speed: {
					label: 'Park-Reisegeschwindigkeit',
					desc: 'Geschwindigkeit der Reisebewegungen beim Parken des Werkzeugkopfs.',
				},
				retract_park: {
					label: 'Park-Rückzug (mm)',
					desc: 'Menge, die vor der Bewegung zur Parkposition zurückgezogen wird (verhindert Oozing).',
				},
				timeout: {
					label: 'Zeitlimit (s)',
					desc: 'Maximale Wartezeit auf Benutzerinteraktion vor Abbruch/Timeout.',
				},
				post_origin_console: {
					label: 'Poste Ursprungsnachrichten',
					desc: 'Poste "Phasen"-Nachrichten in die Konsole.',
				},
				post_status_console: {
					label: 'Poste Statusnachrichten',
					desc: 'Poste "Status"-Nachrichten in die Konsole.',
				},
				enable_beeper: {
					label: 'Beeper aktivieren',
					desc: 'Piepen bei Alarmen (erfordert M300 Makro oder Beeper-Gerät).',
				},
				sound_m600: {
					label: 'M600 Sound',
					desc: 'Sound to play on M600',
					options: {
						RUN_OUT: 'Run Out',
						CAKE: 'Cake',
					},
				},
				sound_runout: {
					label: 'Runout Sound',
					desc: 'Sound to play on RUN_OUT',
					options: {
						RUN_OUT: 'Run Out',
						CAKE: 'Cake',
					},
				},
			},
			originStrings: {
				run_out: {
					label: 'Runout Alarmtext',
					desc: 'Wird angezeigt, wenn Filamentmangel erkannt wird, bevor der Wechsel beginnt.',
					defaultValue:
						'"KEIN FILAMENT! Entferne das restliche Filament und klicke [[[FILAMENT_SWAP]]] um den Wechselprozess zu starten."',
				},
				manual_swap_prepare: {
					label: 'Manueller Wechsel Bereit Text',
					desc: 'Wird angezeigt, wenn der Drucker geparkt und bereit für einen manuellen Wechsel ist.',
					defaultValue:
						'"Wartungsposition bereit. Du kannst manuell entladen durch Ziehen, oder klicke [[[AFS_UNLOAD]]] um den Extruder zu nutzen. Dann nutze [[[LOAD_FILAMENT]]] um neues Filament zu fördern."',
				},
				filament_swap_unloading: {
					label: 'Entladen Text',
					desc: 'Wird angezeigt, während das Filament entladen wird.',
					defaultValue:
						'"FILAMENTWECHSEL GESTARTET. Filament wird entladen, bitte warten ..."',
				},
				filament_swap_loading: {
					label: 'Laden Text',
					desc: 'Wird angezeigt, wenn der Drucker darauf wartet, dass du neues Filament lädst.',
					defaultValue: '"Lade dein neues Filament und klicke dann [[[LOAD_FILAMENT]]]."',
				},
				load_new_loaded: {
					label: 'Geladen Text',
					desc: 'Wird angezeigt, sobald das neue Filament das Hotend erreicht hat.',
					defaultValue:
						'"Filament geladen! Nutze [[[LOAD_FILAMENT]]] um mehr zu spülen oder [[[FINISH_SWAP]]] um den Druck fortzusetzen."',
				},
				complete: {
					label: 'Fertig Text',
					desc: 'Wird angezeigt, wenn der Filamentwechsel beendet ist und der Drucker fortsetzt.',
					defaultValue:
						'"FILAMENTWECHSEL ABGESCHLOSSEN! Drucker setzt fort, bitte warten ..."',
				},
			},
			statusStrings: {
				homing: {
					label: 'Homing',
					desc: 'Drucker referenziert Achsen.',
					defaultValue: '"Referenzfahrt (Homing)"',
				},
				parking: {
					label: 'Parken',
					desc: 'Drucker bewegt sich zur Wartungsposition.',
					defaultValue: '"Druckkopf parken"',
				},
				purging: {
					label: 'Spülen',
					desc: 'Drucker spült überschüssiges Filament.',
					defaultValue: '"Überschüssiges Filament spülen..."',
				},
				loading: {
					label: 'Laden',
					desc: 'Drucker fördert Filament.',
					defaultValue: '"Filament laden..."',
				},
				unloading: {
					label: 'Entladen',
					desc: 'Drucker zieht Filament aus dem Hotend zurück.',
					defaultValue: '"Filament entladen..."',
				},
				temp_set: {
					label: 'Temperatur setzen',
					desc: 'Zieltemperatur wird ohne Warten gesetzt.',
					defaultValue: '"Hotend-Temperatur setzen"',
				},
				heating: {
					label: 'Heizen',
					desc: 'Drucker heizt auf Zieltemperatur.',
					defaultValue: '"Hotend aufheizen"',
				},
				temp_restored: {
					label: 'Temperatur wiederhergestellt',
					desc: 'Ursprüngliche Temperatur wurde nach dem Wechsel wiederhergestellt.',
					defaultValue: '"Temperatur wiederhergestellt"',
				},
				cooling: {
					label: 'Abkühlen',
					desc: 'Hotend wurde ausgeschaltet.',
					defaultValue: '"Heizungen ausgeschaltet"',
				},
				resuming: {
					label: 'Druck fortsetzen',
					desc: 'Drucker setzt den Druck fort.',
					defaultValue: '"Druck fortsetzen..."',
				},
				complete_idle: {
					label: 'Wechsel fertig',
					desc: 'Wechsel beendet ohne Druckfortsetzung.',
					defaultValue: '"Wechsel abgeschlossen"',
				},
				waiting: {
					label: 'Warte auf Eingabe',
					desc: 'Drucker wartet auf deine nächste Aktion.',
					defaultValue: '"Warte auf Benutzereingabe..."',
				},
				unpriming: {
					label: 'Entlasten',
					desc: 'Extrudieren dann zurückziehen vor dem Abkühlen, um Druck abzubauen.',
					defaultValue: '"Hotend entlasten (Unpriming)"',
				},
			},
			macros: {
				pre_title: 'Pre-Swap Makro',
				pre_desc:
					'Führe ein benutzerdefiniertes Makro oder G-Code aus, bevor der Filamentwechsel beginnt.',
				post_title: 'Post-Swap Makro',
				post_desc:
					'Führe ein benutzerdefiniertes Makro oder G-Code ganz am Ende des Prozesses aus (z.B. Düsenreinigung).',
				pre_action: 'Pre-Swap Aktion',
				post_action: 'Post-Swap Aktion',
				pre_msg: 'Pre-Swap Nachricht',
				post_msg: 'Post-Swap Nachricht',
				custom_gcode: 'Benutzerdefinierter G-Code',
				empty: '(Leer)',
				lines: 'Zeilen',
				preview: 'Makro-Vorschau (Nur Lesen)',
				msg_label: 'Statusnachricht (Optional)',
				msg_desc: 'Eine Nachricht, die vor der Ausführung der Aktion angezeigt wird.',
				predefined: 'Vordefinierte Makros:',
				action_label: 'Auszuführende Aktion',
				none: 'Keine',
				custom_gcode_opt: 'Benutzerdefinierter G-Code...',
				loading_preview: 'Lade Vorschau...',
				empty_macro: '; (Leeres Makro)',
				failed_preview: '; Vorschau konnte nicht geladen werden',
				preview_button: 'Preview Sound',
			},
		},
		backup: {
			title: 'Backup & Wiederherstellung',
			not_found_title: 'Konfiguration nicht gefunden',
			not_found_msg:
				'Du musst die Erweiterung installieren und konfigurieren, bevor du Einstellungen sichern kannst.',
			export_title: 'Konfiguration exportieren',
			export_desc:
				'Lade deine aktuellen Einstellungen als JSON-Datei herunter. Dies beinhaltet alle Werte, Nachrichten und Schalter.',
			download_btn: 'Backup herunterladen (.json)',
			import_title: 'Konfiguration wiederherstellen',
			import_desc:
				'Stelle Einstellungen aus einer zuvor gespeicherten JSON-Datei wieder her. Dies überschreibt deine aktuellen Werte.',
			select_btn: 'Backup-Datei wählen...',
			confirm_restore:
				'Möchtest du diese Konfiguration wirklich wiederherstellen? Aktuelle Einstellungen werden überschrieben.',
			restore_success:
				'Konfiguration wiederhergestellt! Überprüfe deine Einstellungen und klicke auf "Änderungen am Drucker speichern".',
			restore_fail: 'Import fehlgeschlagen: {error}',
			invalid_file: 'Ungültige Backup-Datei: Abschnitt "defaults" fehlt.',
		},
		extension: {
			title: 'Erweiterungs-Einstellungen',
			language: 'Sprache',
			language_desc: 'Wähle die Sprache für die Erweiterungsoberfläche.',
			useBrowserNotifications: 'Browser-Benachrichtigungen',
			alarmOnM600: 'Alarm bei M600',
			alarmOnRunout: 'Alarm bei Runout',
			browserAlarms: 'Browser Alarms',
			browserAlarmNote: 'Browser must remain open for alarms to play.',
			testButton: 'Test',
			alarmOnPrintComplete: 'Alarm On Print Complete',
			convertedTunes: 'Converted M300 Tunes',
			printCompleteTip:
				'<strong>Tip:</strong> Use one of these sounds at the end of a print (using your printer\'s beeper) by adding <code class="inline">AFS_NOISE SOUND=CAKE</code> to the end of your <code class="inline">END_PRINT</code> macro.',
			extensionName: 'Advanced Filament Swap for Moonraker',
			logoAlt: 'AFS Logo',
			enableDebugLogging: 'Debug-Logging',
			notifications: 'Browser-Benachrichtigungen',
			notifications_desc:
				'Zeige Systembenachrichtigungen, wenn Aufmerksamkeit erforderlich ist.',
			sound: 'Sound-Alarme',
			sound_desc: 'Spiele einen Ton ab, wenn Aufmerksamkeit erforderlich ist.',
			debug: 'Debug-Logging',
			debug_desc:
				'Aktiviere ausführliches Protokollieren in der Browserkonsole zur Fehlerbehebung.',
			setup_completed: 'Einrichtung abgeschlossen am',
			never: 'Nie',
			reset: 'Erweiterungs-Einstellungen zurücksetzen',
			reset_confirm:
				'Möchtest du wirklich alle Erweiterungs-Einstellungen auf Standard zurücksetzen?',
		},
		about: {
			title: 'Über',
			version: 'Version',
			cfg_version: 'Config Version',
			developed_by: 'Entwickelt von',
			github: 'GitHub',
			discord: 'Discord',
			sponsors: 'Sponsoren',
			sponsors_desc: 'Besonderen Dank an diese Unterstützer!',
			fetch_fail: 'Konnte Sponsoren nicht laden. Bitte versuche es später erneut.',
			loading: 'Loading...',
			unknown: 'Unknown',
		},
	},
};
