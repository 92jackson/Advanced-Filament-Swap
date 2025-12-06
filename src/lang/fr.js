window.I18nTranslations = window.I18nTranslations || {};
window.I18nTranslations.fr = {
	name: 'Français',
	modal: {
		title: 'Changement de Filament',
		status_log: "Journal d'état",
		connection_lost: 'Connexion perdue, reconnexion...',
		minimize_restore: 'Réduire/Restaurer',
		hotend: 'Hotend',
		pos: 'Pos',
		eta: 'Temps',
		done: 'Fait',
		reheat: 'Réchauffer Hotend',
		timeline: {
			runout: 'Fin',
			unload: 'Décharger',
			load: 'Charger',
			prepare: 'Préparer',
			loaded: 'Chargé',
			complete: 'Complet',
			confirm: 'Confirmer',
			save: 'Sauvegarder',
			apply: 'Appliquer',
			fix: 'Corriger',
			include: 'Inclure',
			restart: 'Redémarrer',
		},
		log: {
			validating_config: 'Validation de la configuration...',
			rebuilding_blocks: 'Reconstruction des blocs de configuration...',
			writing_cfg: 'Écriture de adv_filament_swap.cfg...',
			scan_runout: 'Analyse des conflits du capteur de fin de filament...',
			check_runout_config:
				'Vérification de la configuration du capteur de fin de filament...',
			fix_runout_in_file: 'Correction du capteur de fin de filament dans {file}...',
			runout_fixed: 'Capteur de fin de filament corrigé.',
			no_runout_detected: 'Aucun conflit du capteur de fin de filament détecté.',
			checking_include: 'Vérification de l’inclusion dans printer.cfg...',
			add_include: "Ajout de l'include à printer.cfg...",
			include_added: 'Include ajouté à printer.cfg...',
			restarting: 'Redémarrage du firmware Klipper...',
			reconnecting: 'Reconnexion à l’imprimante...',
			file_saved: 'Fichier enregistré.',
			validating_uninstall: 'Validation de la désinstallation...',
			remove_include: 'Suppression de l’inclusion de printer.cfg...',
			include_removed: 'Inclusion supprimée.',
			restore_runout: 'Restauration de la configuration du capteur de fin de filament...',
			deleting_cfg: 'Suppression de adv_filament_swap.cfg...',
			cfg_deleted: 'Fichier de configuration supprimé.',
			uninstall_success: 'Désinstallation terminée avec succès.',
			success: 'Configuration mise à jour avec succès.',
		},
		stages: {
			apply: {
				title: 'Appliquer',
				desc: 'Veuillez patienter pendant l’application des changements.',
			},
			run_out: {
				title: 'Fin de Filament',
				label: 'Fin',
				desc: 'Votre imprimante n\'a plus de filament ! Pour éviter tout dommage, retirez manuellement le filament restant du capteur puis continuez avec le bouton "Démarrer Changement".',
			},
			filament_swap_unloading: {
				title: 'Déchargement du Filament',
				label: 'Décharger',
				desc: 'Votre filament actuel se décharge. Veuillez patienter...',
			},
			filament_swap_loading: {
				title: 'Charger Nouveau Filament',
				label: 'Charger',
				desc: "Insérez le nouveau filament jusqu'à ce qu'il atteigne la buse. Utilisez la commande d'Avance pour purger les longueurs prédéfinies.",
			},
			manual_swap_prepare: {
				title: 'Position de Maintenance',
				label: 'Préparer',
				desc: 'Hotend chauffée et parquée. Vous pouvez retirer le filament manuellement ou utiliser Décharger Filament. Ensuite utilisez Charger Filament pour avancer le nouveau matériau.',
			},
			load_new_loaded: {
				title: 'Filament Chargé',
				label: 'Chargé',
				desc: "Filament chargé ! Utilisez la commande d'Avance pour purger jusqu'à ce que la couleur soit propre, ou 'Terminer' pour reprendre.",
			},
			complete: {
				title: 'Changement Terminé',
				label: 'Complet',
				desc: "Changement de filament terminé ! Reprise de l'impression...",
			},
		},
		macros: {
			start_swap: 'Démarrer Changement',
			finish: 'Terminer',
			close: 'Fermer',
		},
		statusMessages: {
			homing: "Mise à l'origine (Homing)",
			parking: 'Parcage de la tête',
			purging: 'Purge du filament...',
			loading: 'Chargement du filament...',
			unloading: 'Déchargement du filament...',
			temp_set: 'Réglage température hotend',
			heating: 'Chauffe hotend',
			temp_restored: 'Température restaurée',
			cooling: 'Chauffage éteint',
			resuming: 'Reprise impression...',
			complete_idle: 'Changement terminé',
			waiting: 'En attente utilisateur...',
			unpriming: 'Dé-amorçage hotend',
		},
	},
	settings: {
		menu: {
			status: 'État & Install',
			config: 'Config Changement Filament',
			backup: 'Sauvegarde & Restauration',
			extension: 'Paramètres Extension',
			about: 'À propos',
		},
		common: {
			enabled: 'Activé',
			disabled: 'Désactivé',
			close: 'Fermer',
			cancel: 'Annuler',
			save: "Enregistrer sur l'imprimante",
			install_repair: 'Installer / Réparer',
			restart_refresh: 'Redémarrer & Actualiser',
			refresh_page: 'Actualiser la page',
			uninstall: 'Désinstaller',
			uninstall_delete_file: 'Désinstaller & Supprimer le fichier',
			uninstall_confirm:
				'Êtes-vous sûr de vouloir désinstaller Advanced Filament Swap ?\n\nCela va supprimer la ligne [include] de votre printer.cfg, restaurer les valeurs runout_gcode sauvegardées, éventuellement supprimer adv_filament_swap.cfg, puis redémarrer Klipper.',
			uninstalling: 'Désinstallation...',
			uninstall_success: 'Désinstallé avec succès.',
			uninstall_fail: 'Échec désinstallation : {error}',
			open_advanced: 'Ouvrir Configuration Avancée',
			loading: 'Chargement configuration et analyse imprimante...',
			failed_load: 'Échec chargement données : {error}',
			save_success:
				'Configuration enregistrée ! Veuillez redémarrer Klipper si nécessaire (les macros se rechargent généralement automatiquement).',
			save_fail: 'Échec enregistrement : {error}',
			unsaved_warning:
				'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ? Les changements seront perdus.',
			enable: 'Activer',
			use_max: 'Utiliser Max ({max}mm)',
			time: {
				second: 'seconde',
				seconds: 'secondes',
				minute: 'minute',
				minutes: 'minutes',
				hour: 'heure',
				hours: 'heures',
			},
			unload_filament: 'Décharger Filament',
			load_filament_x: 'Charger Filament ({x}mm)',
			load_x: 'Charger {x}mm',
			purge_x: 'Purger {x}mm',
			expand: 'Développer',
			collapse: 'Réduire',
		},
		status: {
			title: 'État & Installation',
			installed: 'Advanced Filament Swap est Installé',
			installed_msg: 'Fichier de configuration détecté et inclus dans printer.cfg.',
			legacy: 'Configuration Legacy détectée',
			legacy_msg:
				"La configuration AFS installée utilise un format legacy et n'est pas compatible. Cliquez sur Installer / Réparer pour mettre à jour.",
			not_installed: 'Non Installé',
			not_installed_msg: "Advanced Filament Swap n'est pas installé.",
			incomplete: 'Installation Incomplète',
			incomplete_msg: "Le fichier config existe mais n'est pas inclus dans printer.cfg.",
			missing_config:
				'Fichier de configuration (adv_filament_swap.cfg) non trouvé. Cliquez sur Installer pour le créer.',
			conflicts_title: 'Conflits Potentiels Détectés',
			conflicts_override_msg:
				'The following macros are defined in your config. AFS will take precedence because it is included last, but your original config remains untouched:',
			conflicts_modify_msg:
				'The following configurations will be modified by the installer to ensure compatibility:',
			summary_title: 'Résumé Configuration Actuelle',
			show_more: 'Afficher Plus de Paramètres',
			show_less: 'Afficher Moins',
			no_runout_conflicts: 'Aucun conflit du capteur de runout détecté.',
			in_file: 'dans {file}',
			install_confirm_title: 'Installer / Réparer',
			install_confirm_desc:
				'Cela mettra à jour la configuration affichée ci-dessus. Continuer ?',
			saving_title: 'Sauvegarde de la configuration',
			saving_desc: 'Écriture de adv_filament_swap.cfg...',
			fix_runout_title: 'Correction du capteur de runout',
			fix_runout_desc: 'Vérification que runout_gcode est RUN_OUT...',
			add_include_title: 'Ajout de l’include',
			add_include_desc: 'Ajout de [include adv_filament_swap.cfg] à printer.cfg...',
			restart_title: 'Redémarrage du firmware',
			restart_desc: 'Redémarrage du firmware Klipper. Cela peut prendre un moment...',
			success_title: 'Installation terminée',
			success_desc:
				'Advanced Filament Swap installé. Redémarrer et actualiser pour appliquer les changements.',
			install_blocked_title: 'Installation bloquée',
			install_blocked_desc:
				'Une impression est en cours. Arrêtez l’impression puis réessayez.',
			uninstall_confirm_title: 'Désinstaller Advanced Filament Swap',
			uninstall_confirm_desc:
				'Cela supprimera l’inclusion de printer.cfg, restaurera les valeurs runout_gcode sauvegardées, pourra supprimer adv_filament_swap.cfg, et redémarrera Klipper. Continuer ?',
			uninstall_blocked_title: 'Désinstallation bloquée',
			uninstall_blocked_desc:
				'Une impression est en cours. Arrêtez l’impression puis réessayez.',
			uninstall_success_title: 'Désinstallation terminée',
			uninstall_success_desc:
				'Advanced Filament Swap désinstallé. Redémarrage effectué. Actualisez la page pour appliquer les changements.',
			tip_install:
				'Applique les corrections recommandées et installe/répare AFS ; met à jour le résumé.',
			tip_advanced:
				'Ouvre Avancé pour modifier les paramètres ; les changements enregistrés mettent à jour le résumé.',
			footer_afs_install:
				'Cliquez sur « Installer / Réparer » pour installer Advanced Filament Swap.',
			footer_afs_legacy:
				'Cliquez sur « Installer / Réparer » pour mettre à jour vers le dernier format de configuration.',
			footer_include_missing:
				"Cliquez sur « Installer / Réparer » pour ajouter la ligne d'inclusion pour adv_filament_swap.cfg.",
			footer_runout_fix:
				'Cliquez sur « Installer / Réparer » pour mettre à jour la configuration du capteur de fin de filament.',
			footer_macros_ok:
				'Aucun changement nécessaire. Les macros AFS ont priorité et écrasent en toute sécurité.',
			footer_general_advice:
				'Utilisez « Installer / Réparer » pour appliquer automatiquement les correctifs recommandés.',
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
		},
		config: {
			title: 'Configuration Changement Filament',
			tip: "Personnalisez le comportement et les messages. La plupart des utilisateurs n'ont besoin que des Paramètres Principaux.",
			sections: {
				defaults: 'Paramètres Principaux',
				defaults_desc:
					'Comportement principal et options de sécurité contrôlant la chauffe, le parcage, les longueurs de purge et la sortie console.',
				originStrings: 'Messages Console Étapes',
				originStrings_desc:
					'Messages console publiés durant les étapes principales du processus de changement.',
				statusStrings: 'Messages Console État',
				statusStrings_desc:
					'Courts messages de progression ajoutés à la console tout au long du processus.',
			},
			groups: {
				Temperature: 'Température',
				Movement: 'Mouvement & Parcage',
				Filament: 'Gestion Filament',
				System: 'Système',
				Other: 'Autre',
			},
			params: {
				default_temp: {
					label: 'Température par Défaut',
					desc: "Température hotend utilisée pendant un changement si aucune n'est définie.",
				},
				cooldown_m600: {
					label: 'Refroidir sur M600',
					desc: 'Éteindre la hotend si un changement initié par le slicer attend trop longtemps.',
				},
				cooldown_runout: {
					label: 'Refroidir sur Fin Filament',
					desc: 'Éteindre la hotend si un changement initié par fin de filament attend trop longtemps.',
				},
				cooldown_runout_unprime_mm: {
					label: 'Longueur Dé-amorçage Fin Filament (mm)',
					desc: "Extruder puis rétracter cette quantité après fin de filament pour éviter que le filament ne fige dans la hotend. NOTE : assurez-vous que cette valeur n'est pas supérieure à la distance entre l'extrudeur et le capteur de fin de filament.",
				},
				cooldown_delay: {
					label: 'Délai Refroidissement Inactif (s)',
					desc: "Temps à attendre avant d'éteindre la hotend pendant un changement inactif.",
				},
				auto_unload_manual: {
					label: 'Auto-Décharge en Changement Manuel',
					desc: "Exécuter automatiquement l'étape de déchargement au début d'un changement manuel.",
				},
				park_x: {
					label: 'Parcage X',
					desc: 'Position X pour le changement. Mettre -1 pour utiliser le max.',
				},
				park_y: {
					label: 'Parcage Y',
					desc: 'Position Y pour le changement. Mettre -1 pour utiliser le max.',
				},
				park_z: {
					label: 'Lever Z (mm)',
					desc: "Distance pour lever la tête d'impression au début d'un changement.",
				},
				zmin: {
					label: 'Z Minimum Pour Parcage (mm)',
					desc: 'Si la buse est trop proche du lit, lever au moins à cette hauteur avant de parquer.',
				},
				load_new: {
					label: 'Longueur Charge/Purge (mm)',
					desc: "Quantité de nouveau filament à pousser pour purger l'ancienne couleur.",
				},
				unload: {
					label: 'Longueur Décharge (mm)',
					desc: 'Quantité à rétracter hors de la hotend lors du déchargement.',
				},
				unload_speed: {
					label: 'Vitesse Décharge',
					desc: 'Vitesse de rétraction pendant le déchargement.',
				},
				load_speed: {
					label: 'Vitesse Charge/Purge',
					desc: "Vitesse d'extrusion pendant la charge/purge.",
				},
				park_speed: {
					label: 'Vitesse Déplacement Parcage',
					desc: 'Vitesse des mouvements lors du parcage de la tête.',
				},
				retract_park: {
					label: 'Rétraction Parcage (mm)',
					desc: 'Quantité à rétracter avant de bouger vers la position de parcage (évite le suintement).',
				},
				timeout: {
					label: 'Limite de Temps (s)',
					desc: "Temps maximum d'attente interaction utilisateur avant abandon/timeout.",
				},
				post_origin_console: {
					label: 'Publier Messages Origine',
					desc: 'Publier les messages d\'"Étape" dans la console.',
				},
				post_status_console: {
					label: 'Publier Messages État',
					desc: 'Publier les messages d\'"État" dans la console.',
				},
				enable_beeper: {
					label: 'Activer Beeper',
					desc: 'Bip sur alertes (requiert macro M300 ou dispositif beeper).',
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
					label: 'Texte Alerte Fin Filament',
					desc: 'Affiché quand une fin de filament est détectée avant le début du changement.',
					defaultValue:
						'"FIN DE FILAMENT ! Retirez le filament restant et cliquez sur [[[FILAMENT_SWAP]]] pour commencer le remplacement."',
				},
				manual_swap_prepare: {
					label: 'Texte Prêt Changement Manuel',
					desc: "Affiché quand l'imprimante est parquée et prête pour un changement manuel.",
					defaultValue:
						'"Position maintenance prête. Vous pouvez décharger manuellement en tirant, ou cliquez [[[AFS_UNLOAD]]] pour utiliser l\'extrudeur. Puis utilisez [[[LOAD_FILAMENT]]] pour avancer le nouveau filament."',
				},
				filament_swap_unloading: {
					label: 'Texte Déchargement',
					desc: 'Affiché pendant que le filament est déchargé.',
					defaultValue:
						'"CHANGEMENT FILAMENT COMMENCÉ. Déchargement filament, veuillez patienter ..."',
				},
				filament_swap_loading: {
					label: 'Texte Chargement',
					desc: "Affiché quand l'imprimante attend que vous chargiez le nouveau filament.",
					defaultValue:
						'"Chargez votre nouveau filament puis cliquez sur [[[LOAD_FILAMENT]]]."',
				},
				load_new_loaded: {
					label: 'Texte Chargé',
					desc: "Affiché une fois le nouveau filament avancé jusqu'à la hotend.",
					defaultValue:
						'"Filament chargé ! Utilisez [[[LOAD_FILAMENT]]] pour purger plus ou [[[FINISH_SWAP]]] pour reprendre l\'impression."',
				},
				complete: {
					label: 'Texte Complet',
					desc: "Affiché quand le changement est terminé et l'imprimante reprend.",
					defaultValue:
						'"CHANGEMENT FILAMENT COMPLET ! Reprise impression, veuillez patienter ..."',
				},
			},
			statusStrings: {
				homing: {
					label: "Mise à l'origine",
					desc: "L'imprimante fait ses origines.",
					defaultValue: '"Mise à l\'origine (Homing)"',
				},
				parking: {
					label: 'Parcage',
					desc: "L'imprimante va en position de maintenance.",
					defaultValue: '"Parcage de la tête"',
				},
				purging: {
					label: 'Purge',
					desc: "L'imprimante purge le filament en excès.",
					defaultValue: '"Purge du filament..."',
				},
				loading: {
					label: 'Chargement',
					desc: "L'imprimante avance le filament.",
					defaultValue: '"Chargement du filament..."',
				},
				unloading: {
					label: 'Déchargement',
					desc: "L'imprimante rétracte le filament hors de la hotend.",
					defaultValue: '"Déchargement du filament..."',
				},
				temp_set: {
					label: 'Réglage Température',
					desc: 'La température cible est réglée sans attendre.',
					defaultValue: '"Réglage température hotend"',
				},
				heating: {
					label: 'Chauffe',
					desc: "L'imprimante chauffe à la température cible.",
					defaultValue: '"Chauffe hotend"',
				},
				temp_restored: {
					label: 'Température Restaurée',
					desc: 'La température originale a été restaurée après le changement.',
					defaultValue: '"Température restaurée"',
				},
				cooling: {
					label: 'Refroidissement',
					desc: 'La hotend a été éteinte.',
					defaultValue: '"Chauffage éteint"',
				},
				resuming: {
					label: 'Reprise Impression',
					desc: "L'imprimante reprend l'impression.",
					defaultValue: '"Reprise impression..."',
				},
				complete_idle: {
					label: 'Changement Complet',
					desc: 'Changement terminé sans impression à reprendre.',
					defaultValue: '"Changement terminé"',
				},
				waiting: {
					label: 'Attente Entrée',
					desc: "L'imprimante attend que vous choisissiez la prochaine action.",
					defaultValue: '"En attente utilisateur..."',
				},
				unpriming: {
					label: 'Dé-amorçage',
					desc: 'Extruder puis rétracter avant refroidissement pour libérer la pression.',
					defaultValue: '"Dé-amorçage hotend"',
				},
			},
			macros: {
				pre_title: 'Macro Pré-Swap',
				pre_desc: 'Exécuter une macro ou G-Code personnalisé avant le début du processus.',
				post_title: 'Macro Post-Swap',
				post_desc:
					'Exécuter une macro ou G-Code à la toute fin du processus (ex: essuyage buse).',
				pre_action: 'Action Pré-Swap',
				post_action: 'Action Post-Swap',
				pre_msg: 'Message Pré-Swap',
				post_msg: 'Message Post-Swap',
				custom_gcode: 'G-Code Personnalisé',
				empty: '(Vide)',
				lines: 'lignes',
				preview: 'Aperçu Macro (Lecture seule)',
				msg_label: "Message d'État (Optionnel)",
				msg_desc: "Un message à afficher avant d'exécuter l'action personnalisée.",
				predefined: 'Macros Prédéfinies :',
				action_label: 'Action à exécuter',
				none: 'Aucun',
				custom_gcode_opt: 'G-Code personnalisé...',
				loading_preview: "Chargement de l'aperçu...",
				empty_macro: '; (Macro vide)',
				failed_preview: "; Échec du chargement de l'aperçu",
				preview_button: 'Preview Sound',
			},
		},
		backup: {
			title: 'Sauvegarde & Restauration',
			not_found_title: 'Configuration Non Trouvée',
			not_found_msg:
				"Vous devez installer et configurer l'extension avant de pouvoir sauvegarder les paramètres.",
			export_title: 'Exporter Configuration',
			export_desc:
				'Téléchargez vos paramètres actuels en fichier JSON. Inclut toutes vos valeurs personnalisées.',
			download_btn: 'Télécharger Sauvegarde (.json)',
			import_title: 'Restaurer Configuration',
			import_desc:
				'Restaurez les paramètres depuis un fichier JSON. Cela écrasera vos valeurs actuelles.',
			select_btn: 'Sélectionner Fichier...',
			confirm_restore:
				'Êtes-vous sûr de vouloir restaurer cette configuration ? Les paramètres actuels seront écrasés.',
			restore_success:
				'Configuration restaurée ! Vérifiez vos paramètres et cliquez sur "Enregistrer sur l\'imprimante".',
			restore_fail: 'Échec importation : {error}',
			invalid_file: 'Fichier sauvegarde invalide : Section defaults manquante.',
		},
		extension: {
			title: 'Paramètres Extension',
			language: 'Langue',
			language_desc: "Sélectionnez la langue de l'interface.",
			useBrowserNotifications: 'Notifications Navigateur',
			alarmOnM600: 'Alarme sur M600',
			alarmOnRunout: 'Alarme sur Fin Filament',
			browserAlarms: 'Browser Alarms',
			browserAlarmNote: 'Browser must remain open for alarms to play.',
			testButton: 'Test',
			alarmOnPrintComplete: 'Alarm On Print Complete',
			convertedTunes: 'Converted M300 Tunes',
			printCompleteTip:
				'<strong>Tip:</strong> Use one of these sounds at the end of a print (using your printer\'s beeper) by adding <code class="inline">AFS_NOISE SOUND=CAKE</code> to the end of your <code class="inline">END_PRINT</code> macro.',
			extensionName: 'Advanced Filament Swap for Moonraker',
			logoAlt: 'AFS Logo',
			enableDebugLogging: 'Logs de Débogage',
			notifications: 'Notifications Navigateur',
			notifications_desc:
				'Afficher des notifications système quand une attention est requise.',
			sound: 'Alertes Sonores',
			sound_desc: 'Jouer un son quand une attention est requise.',
			debug: 'Logs de Débogage',
			debug_desc: 'Activer les logs verbeux dans la console du navigateur pour le dépannage.',
			setup_completed: 'Installation terminée le',
			never: 'Jamais',
			reset: 'Réinitialiser Paramètres Extension',
			reset_confirm:
				"Êtes-vous sûr de vouloir réinitialiser tous les paramètres de l'extension ?",
		},
		about: {
			title: 'À propos',
			version: 'Version',
			cfg_version: 'Config Version',
			developed_by: 'Développé par',
			github: 'GitHub',
			discord: 'Discord',
			sponsors: 'Sponsors',
			sponsors_desc: 'Un grand merci à ces contributeurs !',
			fetch_fail: 'Échec chargement donateurs. Réessayez plus tard.',
			loading: 'Loading...',
			unknown: 'Unknown',
		},
	},
};
