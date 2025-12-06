window.I18nTranslations = window.I18nTranslations || {};
window.I18nTranslations.es = {
	name: 'Español',
	modal: {
		title: 'Cambio de Filamento',
		status_log: 'Registro de Estado',
		connection_lost: 'Conexión perdida, reconectando...',
		minimize_restore: 'Minimizar/Restaurar',
		hotend: 'Hotend',
		pos: 'Pos',
		eta: 'TE',
		done: 'Hecho',
		reheat: 'Recalentar Hotend',
		timeline: {
			runout: 'Agotado',
			unload: 'Descargar',
			load: 'Cargar',
			prepare: 'Preparar',
			loaded: 'Cargado',
			complete: 'Completo',
			confirm: 'Confirmar',
			save: 'Guardar',
			fix: 'Corregir',
			include: 'Incluir',
			restart: 'Reiniciar',
		},
		log: {
			rebuilding_blocks: 'Reconstruyendo bloques de configuración...',
			writing_cfg: 'Escribiendo adv_filament_swap.cfg...',
			scan_runout: 'Analizando conflictos del sensor de runout...',
			fix_runout_in_file: 'Corrigiendo sensor de runout en {file}...',
			no_runout_detected: 'No se detectaron conflictos del sensor de runout.',
			add_include: 'Añadiendo include en printer.cfg...',
			restarting: 'Reiniciando el firmware Klipper...',
			success: 'Configuración actualizada correctamente.',
		},
		stages: {
			run_out: {
				title: 'Filamento Agotado',
				label: 'Agotado',
				desc: '¡Tu impresora se ha quedado sin filamento! Para evitar daños, retira manualmente el filamento restante del sensor y continúa con el botón "Iniciar Cambio".',
			},
			filament_swap_unloading: {
				title: 'Descargando Filamento',
				label: 'Descargar',
				desc: 'Tu filamento actual se está descargando. Por favor espera...',
			},
			filament_swap_loading: {
				title: 'Cargar Nuevo Filamento',
				label: 'Cargar',
				desc: 'Inserta el nuevo filamento hasta que llegue al hotend. Usa el control de Avance para purgar longitudes preestablecidas.',
			},
			manual_swap_prepare: {
				title: 'Posición de Mantenimiento',
				label: 'Preparar',
				desc: 'Hotend calentado y aparcado. Puedes retirar el filamento manualmente o usar Descargar Filamento. Luego usa Cargar Filamento para avanzar el nuevo material.',
			},
			load_new_loaded: {
				title: 'Filamento Cargado',
				label: 'Cargado',
				desc: "¡Filamento cargado! Usa el control de Avance para purgar hasta que el color salga limpio, o 'Finalizar' para reanudar.",
			},
			complete: {
				title: 'Cambio Completo',
				label: 'Completo',
				desc: '¡Cambio de filamento completo! Reanudando impresión...',
			},
		},
		macros: {
			start_swap: 'Iniciar Cambio',
			finish: 'Finalizar',
			close: 'Cerrar',
		},
		statusMessages: {
			homing: 'Haciendo home al cabezal',
			parking: 'Aparcando el cabezal',
			purging: 'Purgando filamento extra...',
			loading: 'Cargando filamento...',
			unloading: 'Descargando filamento...',
			temp_set: 'Ajustando temperatura del hotend',
			heating: 'Calentando hotend',
			temp_restored: 'Temperatura restaurada',
			cooling: 'Calentadores apagados',
			resuming: 'Reanudando impresión...',
			complete_idle: 'Cambio completo',
			waiting: 'Esperando entrada del usuario...',
			unpriming: 'Descebando hotend',
		},
	},
	settings: {
		menu: {
			status: 'Estado e Instalación',
			config: 'Config. Cambio Filamento',
			backup: 'Respaldo y Restauración',
			extension: 'Ajustes de Extensión',
			about: 'Acerca de',
		},
		common: {
			enabled: 'Habilitado',
			disabled: 'Deshabilitado',
			close: 'Cerrar',
			cancel: 'Cancelar',
			save: 'Guardar Cambios en Impresora',
			install_repair: 'Instalar / Reparar',
			restart_refresh: 'Reiniciar & Actualizar',
			refresh_page: 'Actualizar página',
			uninstall: 'Desinstalar',
			uninstall_confirm:
				'¿Estás seguro de que quieres desinstalar Advanced Filament Swap?\n\nEsto eliminará la línea [include] de tu printer.cfg.\nEl archivo de configuración (adv_filament_swap.cfg) NO será eliminado.',
			uninstalling: 'Desinstalando...',
			uninstall_success: 'Desinstalado con éxito.',
			uninstall_fail: 'Fallo al desinstalar: {error}',
			open_advanced: 'Abrir Configuración Avanzada',
			loading: 'Cargando configuración y analizando impresora...',
			failed_load: 'Fallo al cargar datos: {error}',
			save_success:
				'¡Configuración guardada con éxito! Por favor reinicia Klipper si es necesario (usualmente las macros se recargan automáticamente).',
			save_fail: 'Fallo al guardar: {error}',
			unsaved_warning:
				'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Los cambios se perderán.',
			enable: 'Habilitar',
			use_max: 'Usar Max ({max}mm)',
			time: {
				second: 'segundo',
				seconds: 'segundos',
				minute: 'minuto',
				minutes: 'minutos',
				hour: 'hora',
				hours: 'horas',
			},
			unload_filament: 'Descargar Filamento',
			load_filament_x: 'Cargar Filamento ({x}mm)',
			load_x: 'Cargar {x}mm',
			purge_x: 'Purgar {x}mm',
			expand: 'Expandir',
			collapse: 'Contraer',
		},
		status: {
			title: 'Estado e Instalación',
			installed: 'Advanced Filament Swap está Instalado',
			installed_msg: 'Archivo de configuración detectado e incluido en printer.cfg.',
			legacy: 'Configuración Legacy Detectada',
			legacy_msg:
				'La configuración AFS instalada usa formato legacy y no es compatible. Haz clic en Instalar / Reparar para actualizar.',
			not_installed: 'No Instalado',
			not_installed_msg: 'Advanced Filament Swap no está instalado.',
			incomplete: 'Instalación Incompleta',
			incomplete_msg: 'El archivo config existe pero no está incluido en printer.cfg.',
			missing_config:
				'Archivo de configuración (adv_filament_swap.cfg) no encontrado. Clic en Instalar para crearlo.',
			conflicts_title: 'Conflictos Potenciales Detectados',
			conflicts_override_msg:
				'Las siguientes macros están definidas en tu config. AFS tendrá prioridad porque se incluye al final, pero tu config original permanece intacta:',
			conflicts_modify_msg:
				'Las siguientes configuraciones serán modificadas por el instalador para asegurar compatibilidad:',
			summary_title: 'Resumen de Configuración Actual',
			show_more: 'Mostrar Más Ajustes',
			show_less: 'Mostrar Menos',
			no_runout_conflicts: 'No se detectaron conflictos del sensor de runout.',
			in_file: 'en {file}',
			install_confirm_title: 'Instalar / Reparar',
			install_confirm_desc: 'Esto actualizará la configuración mostrada arriba. ¿Continuar?',
			saving_title: 'Guardando configuración',
			saving_desc: 'Escribiendo adv_filament_swap.cfg...',
			fix_runout_title: 'Corrigiendo sensor de runout',
			fix_runout_desc: 'Asegurando que runout_gcode sea RUN_OUT...',
			add_include_title: 'Añadiendo include',
			add_include_desc: 'Añadiendo [include adv_filament_swap.cfg] a printer.cfg...',
			restart_title: 'Reiniciando firmware',
			restart_desc: 'Reiniciando el firmware Klipper. Esto puede tardar un momento...',
			success_title: 'Instalación completa',
			success_desc:
				'Advanced Filament Swap instalado. Reinicia y actualiza para aplicar los cambios.',
			install_blocked_title: 'Instalación bloqueada',
			install_blocked_desc:
				'Hay una impresión activa. Detén la impresión y vuelve a intentarlo.',
			tip_install:
				'Aplica correcciones recomendadas e instala/repara AFS; actualiza el resumen.',
			tip_advanced:
				'Abrir Avanzado para editar ajustes; los cambios guardados actualizan el resumen.',
			footer_afs_install:
				'Haz clic en «Instalar / Reparar» para instalar Advanced Filament Swap.',
			footer_afs_legacy:
				'Haz clic en «Instalar / Reparar» para actualizar al último formato de configuración.',
			footer_include_missing:
				'Haz clic en «Instalar / Reparar» para añadir la línea include de adv_filament_swap.cfg.',
			footer_runout_fix:
				'Haz clic en «Instalar / Reparar» para actualizar la configuración del sensor de fin de filamento.',
			footer_macros_ok:
				'No se requieren cambios. Las macros de AFS tienen prioridad y sobrescriben de forma segura.',
			footer_general_advice:
				'Usa «Instalar / Reparar» para aplicar automáticamente las correcciones recomendadas.',
			uninstall_success_desc:
				'Advanced Filament Swap desinstalado. Reinicio realizado. Actualizar página para aplicar cambios.',
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
			title: 'Configuración de Cambio de Filamento',
			tip: 'Personaliza el comportamiento y mensajes. La mayoría de usuarios solo necesitan los Ajustes Principales.',
			sections: {
				defaults: 'Ajustes Principales',
				defaults_desc:
					'Comportamiento principal y opciones de seguridad que controlan calentamiento, aparcado, purgas y salida de consola.',
				originStrings: 'Mensajes de Consola (Etapas)',
				originStrings_desc:
					'Mensajes de consola publicados durante las etapas principales del proceso de cambio.',
				statusStrings: 'Mensajes de Consola (Estado)',
				statusStrings_desc:
					'Mensajes breves de progreso añadidos a la consola durante todo el proceso.',
			},
			groups: {
				Temperature: 'Temperatura',
				Movement: 'Movimiento y Aparcado',
				Filament: 'Manejo de Filamento',
				System: 'Sistema',
				Other: 'Otro',
			},
			params: {
				default_temp: {
					label: 'Temperatura Predeterminada',
					desc: 'Temperatura del hotend usada durante un cambio cuando no hay ninguna establecida.',
				},
				cooldown_m600: {
					label: 'Enfriar en M600',
					desc: 'Apagar el hotend si un cambio iniciado por el slicer espera demasiado.',
				},
				cooldown_runout: {
					label: 'Enfriar en Agotamiento',
					desc: 'Apagar el hotend si un cambio por agotamiento espera demasiado.',
				},
				cooldown_runout_unprime_mm: {
					label: 'Longitud Descebado Agotamiento (mm)',
					desc: 'Extruir y luego retraer esta cantidad tras agotamiento para evitar que el filamento se asiente en el hotend. NOTA: asegurar que este valor no sea mayor que la distancia entre extrusor y sensor.',
				},
				cooldown_delay: {
					label: 'Retardo Enfriamiento Inactivo (s)',
					desc: 'Tiempo a esperar antes de apagar el hotend durante un cambio inactivo.',
				},
				auto_unload_manual: {
					label: 'Auto-Descarga en Cambio Manual',
					desc: 'Ejecutar automáticamente el paso de descarga al iniciar un cambio manual.',
				},
				park_x: {
					label: 'Aparcar X',
					desc: 'Posición X para mover el cabezal durante el cambio. Pon -1 para usar máx recorrido.',
				},
				park_y: {
					label: 'Aparcar Y',
					desc: 'Posición Y para mover el cabezal durante el cambio. Pon -1 para usar máx recorrido.',
				},
				park_z: {
					label: 'Elevar Z (mm)',
					desc: 'Distancia a elevar el cabezal desde la impresión al inicio del cambio.',
				},
				zmin: {
					label: 'Z Mínimo Para Aparcar (mm)',
					desc: 'Si la boquilla está muy cerca de la cama, elevar al menos a esta altura antes de aparcar.',
				},
				load_new: {
					label: 'Longitud Carga/Purga (mm)',
					desc: 'Cuánto empujar el nuevo filamento para purgar el color anterior.',
				},
				unload: {
					label: 'Longitud Descarga (mm)',
					desc: 'Cuánto retraer el filamento fuera del hotend al descargar.',
				},
				unload_speed: {
					label: 'Velocidad Descarga',
					desc: 'Rapidez de retracción durante la descarga.',
				},
				load_speed: {
					label: 'Velocidad Carga/Purga',
					desc: 'Rapidez de extrusión durante la carga/purga.',
				},
				park_speed: {
					label: 'Velocidad Viaje Aparcado',
					desc: 'Velocidad de movimientos de viaje al aparcar el cabezal.',
				},
				retract_park: {
					label: 'Retracción al Aparcar (mm)',
					desc: 'Cantidad a retraer antes de mover a posición de aparcado (evita goteo).',
				},
				timeout: {
					label: 'Límite de Tiempo (s)',
					desc: 'Tiempo máximo a esperar interacción del usuario antes de abortar.',
				},
				post_origin_console: {
					label: 'Publicar Mensajes de Origen',
					desc: 'Publicar mensajes de "Etapa" en la consola.',
				},
				post_status_console: {
					label: 'Publicar Mensajes de Estado',
					desc: 'Publicar mensajes de "Estado" en la consola.',
				},
				enable_beeper: {
					label: 'Habilitar Pitido',
					desc: 'Pitar en alertas (requiere macro M300 o dispositivo beeper).',
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
					label: 'Texto Alerta Agotamiento',
					desc: 'Mostrado cuando se detecta falta de filamento antes de iniciar el cambio.',
					defaultValue:
						'"¡SIN FILAMENTO! Retira el filamento restante y clic en [[[FILAMENT_SWAP]]] para iniciar el reemplazo."',
				},
				manual_swap_prepare: {
					label: 'Texto Listo Cambio Manual',
					desc: 'Mostrado cuando la impresora está aparcada y lista para cambio manual.',
					defaultValue:
						'"Posición de mantenimiento lista. Puedes descargar manualmente tirando, o clic [[[AFS_UNLOAD]]] para usar el extrusor. Luego usa [[[LOAD_FILAMENT]]] para avanzar nuevo filamento."',
				},
				filament_swap_unloading: {
					label: 'Texto Descargando',
					desc: 'Mostrado mientras el filamento está siendo descargado.',
					defaultValue:
						'"CAMBIO FILAMENTO INICIADO. Descargando filamento, por favor espera ..."',
				},
				filament_swap_loading: {
					label: 'Texto Cargando',
					desc: 'Mostrado cuando la impresora espera que cargues nuevo filamento.',
					defaultValue: '"Carga tu nuevo filamento y luego clic en [[[LOAD_FILAMENT]]]."',
				},
				load_new_loaded: {
					label: 'Texto Cargado',
					desc: 'Mostrado una vez el nuevo filamento avanza al hotend.',
					defaultValue:
						'"¡Filamento cargado! Usa [[[LOAD_FILAMENT]]] para purgar más o [[[FINISH_SWAP]]] para reanudar impresión."',
				},
				complete: {
					label: 'Texto Completo',
					desc: 'Mostrado cuando el cambio termina y la impresora reanuda.',
					defaultValue: '"¡CAMBIO COMPLETO! Impresora reanudando, por favor espera ..."',
				},
			},
			statusStrings: {
				homing: {
					label: 'Haciendo Home',
					desc: 'La impresora está haciendo home a los ejes.',
					defaultValue: '"Haciendo home al cabezal"',
				},
				parking: {
					label: 'Aparcando',
					desc: 'La impresora se mueve a posición de mantenimiento.',
					defaultValue: '"Aparcando el cabezal"',
				},
				purging: {
					label: 'Purgando',
					desc: 'La impresora está purgando filamento extra.',
					defaultValue: '"Purgando filamento extra..."',
				},
				loading: {
					label: 'Cargando',
					desc: 'La impresora está avanzando filamento.',
					defaultValue: '"Cargando filamento..."',
				},
				unloading: {
					label: 'Descargando',
					desc: 'La impresora está retrayendo filamento fuera del hotend.',
					defaultValue: '"Descargando filamento..."',
				},
				temp_set: {
					label: 'Ajustando Temperatura',
					desc: 'La temperatura objetivo se está fijando sin esperar.',
					defaultValue: '"Ajustando temperatura del hotend"',
				},
				heating: {
					label: 'Calentando',
					desc: 'La impresora está calentando a la temperatura objetivo.',
					defaultValue: '"Calentando hotend"',
				},
				temp_restored: {
					label: 'Temperatura Restaurada',
					desc: 'La temperatura original ha sido restaurada tras el cambio.',
					defaultValue: '"Temperatura restaurada"',
				},
				cooling: {
					label: 'Enfriando',
					desc: 'El hotend ha sido apagado.',
					defaultValue: '"Calentadores apagados"',
				},
				resuming: {
					label: 'Reanudando Impresión',
					desc: 'La impresora está reanudando la impresión.',
					defaultValue: '"Reanudando impresión..."',
				},
				complete_idle: {
					label: 'Cambio Completo',
					desc: 'Cambio finalizado sin impresión para reanudar.',
					defaultValue: '"Cambio completo"',
				},
				waiting: {
					label: 'Esperando Entrada',
					desc: 'La impresora espera que elijas la siguiente acción.',
					defaultValue: '"Esperando entrada del usuario..."',
				},
				unpriming: {
					label: 'Descebando',
					desc: 'Extruir y luego retraer antes de enfriar para limpiar presión.',
					defaultValue: '"Descebando hotend"',
				},
			},
			macros: {
				pre_title: 'Macro Pre-Cambio',
				pre_desc:
					'Ejecutar una macro o G-Code personalizado antes de que inicie el proceso.',
				post_title: 'Macro Post-Cambio',
				post_desc:
					'Ejecutar una macro o G-Code al final del proceso (ej. para limpiar boquilla).',
				pre_action: 'Acción Pre-Cambio',
				post_action: 'Acción Post-Cambio',
				pre_msg: 'Mensaje Pre-Cambio',
				post_msg: 'Mensaje Post-Cambio',
				custom_gcode: 'G-Code Personalizado',
				empty: '(Vacío)',
				lines: 'líneas',
				preview: 'Vista Previa Macro (Solo lectura)',
				msg_label: 'Mensaje de Estado (Opcional)',
				msg_desc: 'Un mensaje a mostrar antes de ejecutar la acción personalizada.',
				predefined: 'Macros Predefinidas:',
				action_label: 'Acción a Ejecutar',
				none: 'Ninguna',
				custom_gcode_opt: 'G-Code Personalizado...',
				loading_preview: 'Cargando vista previa...',
				empty_macro: '; (Macro vacía)',
				failed_preview: '; Fallo al cargar vista previa',
				preview_button: 'Preview Sound',
			},
		},
		backup: {
			title: 'Respaldo y Restauración',
			not_found_title: 'Configuración No Encontrada',
			not_found_msg:
				'Debes instalar y configurar la extensión antes de poder respaldar ajustes.',
			export_title: 'Exportar Configuración',
			export_desc:
				'Descarga tu configuración actual como archivo JSON. Incluye valores personalizados, mensajes y opciones.',
			download_btn: 'Descargar Respaldo (.json)',
			import_title: 'Restaurar Configuración',
			import_desc:
				'Restaura ajustes desde un archivo JSON previo. Esto sobrescribirá tus valores actuales.',
			select_btn: 'Seleccionar Archivo...',
			confirm_restore:
				'¿Seguro que quieres restaurar esta configuración? Los ajustes actuales se sobrescribirán.',
			restore_success:
				'¡Configuración restaurada! Revisa tus ajustes y clic en "Guardar Cambios en Impresora".',
			restore_fail: 'Fallo al importar configuración: {error}',
			invalid_file: 'Archivo de respaldo inválido: Falta sección defaults.',
		},
		extension: {
			title: 'Ajustes de Extensión',
			language: 'Idioma',
			language_desc: 'Selecciona el idioma para la interfaz de la extensión.',
			useBrowserNotifications: 'Notificaciones Navegador',
			alarmOnM600: 'Alarma en M600',
			alarmOnRunout: 'Alarma en Agotamiento',
			browserAlarms: 'Browser Alarms',
			browserAlarmNote: 'Browser must remain open for alarms to play.',
			testButton: 'Test',
			alarmOnPrintComplete: 'Alarm On Print Complete',
			convertedTunes: 'Converted M300 Tunes',
			printCompleteTip:
				'<strong>Tip:</strong> Use one of these sounds at the end of a print (using your printer\'s beeper) by adding <code class="inline">AFS_NOISE SOUND=CAKE</code> to the end of your <code class="inline">END_PRINT</code> macro.',
			extensionName: 'Advanced Filament Swap for Moonraker',
			logoAlt: 'AFS Logo',
			enableDebugLogging: 'Registro de Depuración',
			notifications: 'Notificaciones Navegador',
			notifications_desc: 'Mostrar notificaciones del sistema cuando se necesita atención.',
			sound: 'Alertas de Sonido',
			sound_desc: 'Reproducir sonido cuando se necesita atención.',
			debug: 'Registro de Depuración',
			debug_desc: 'Habilitar registro detallado en la consola del navegador.',
			setup_completed: 'Instalación completada el',
			never: 'Nunca',
			reset: 'Restablecer Ajustes Extensión',
			reset_confirm:
				'¿Seguro que quieres restablecer todos los ajustes de extensión a predeterminados?',
		},
		about: {
			title: 'Acerca de',
			version: 'Versión',
			cfg_version: 'Config Version',
			developed_by: 'Desarrollado por',
			github: 'GitHub',
			discord: 'Discord',
			sponsors: 'Patrocinadores',
			sponsors_desc: '¡Agradecimiento especial a estos colaboradores!',
			fetch_fail: 'Fallo al cargar donantes. Intenta más tarde.',
			loading: 'Loading...',
			unknown: 'Unknown',
		},
	},
};
