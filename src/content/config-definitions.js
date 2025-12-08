/**
 * Configuration Definitions
 *
 * This file defines the schema, keys, types, and FACTORY DEFAULTS (in English) for the configuration.
 *
 * I18N NOTE:
 * The 'label' and 'desc' fields here serve as:
 * 1. The English fallback text.
 * 2. The source for comments in the generated 'adv_filament_swap.cfg' file (keeping the file in English).
 *
 * The GUI automatically looks up localized strings in 'i18n.js' using the 'key':
 * - Params: settings.config.params.[key].label
 * - Status: settings.config.statusStrings.[key].label
 * - Stages: modal.stages.[key].title
 */
window.ConfigDefinitions = {
	defaults: [
		{
			key: 'default_temp',
			defaultValue: '200',
			label: 'Default Temperature',
			desc: 'Hotend temperature used during a filament swap when none is set.',
			legacy: 'variable_default_temp',
		},
		{
			key: 'cooldown_m600',
			defaultValue: '1',
			label: 'Cooldown On M600',
			desc: 'Turn off the hotend if a slicer-initiated swap waits too long.',
			legacy: 'variable_cooldown',
		},
		{
			key: 'cooldown_runout',
			defaultValue: '1',
			label: 'Cooldown On Runout',
			desc: 'Turn off the hotend if a runout-initiated swap waits too long.',
			legacy: 'variable_cooldown',
		},
		{
			key: 'cooldown_runout_unprime_mm',
			defaultValue: '0',
			label: 'Runout Unprime Length (mm)',
			desc: "Extrude then retract this amount after a runout to prevent filament setting inside the hotend (so that the filament can be manually removed after hotend cooldown). NOTE: ensure this value isn't larger than the distance between your extruder and your runout sensor. May not be appropiate for all printers.",
			parents: ['cooldown_runout'],
			indent: true,
		},
		{
			key: 'cooldown_delay',
			defaultValue: '120',
			label: 'Idle Cooldown Delay (s)',
			desc: 'Time to wait before turning off the hotend during an idle swap.',
			parents: ['cooldown_m600', 'cooldown_runout'],
			indent: true,
		},
		{
			key: 'auto_unload_manual',
			defaultValue: '0',
			label: 'Auto-Unload In Manual Swap',
			desc: 'Automatically run the unload step when you start a manual swap.',
		},
		{
			key: 'park_x',
			defaultValue: '-1',
			label: 'Park X',
			desc: 'X position to move the print head to for the swap. Set -1 to use max travel.',
			type: 'number',
			legacy: 'variable_park_x',
		},
		{
			key: 'park_y',
			defaultValue: '-1',
			label: 'Park Y',
			desc: 'Y position to move the print head to for the swap. Set -1 to use max travel.',
			type: 'number',
			legacy: 'variable_park_y',
		},
		{
			key: 'park_z',
			defaultValue: '25',
			label: 'Lift Z (mm)',
			desc: 'Distance from print to raise the print head by at the start of a filament swap.',
			legacy: 'variable_park_z',
		},
		{
			key: 'zmin',
			defaultValue: '50',
			label: 'Minimum Z For Park (mm)',
			desc: 'If the nozzle is too close to the print bed, lift to at least this height before parking for the swap.',
			legacy: 'variable_zmin',
		},
		{
			key: 'load_new',
			defaultValue: '150',
			label: 'Load/Purge Length (mm)',
			desc: 'How much to push new filament to purge old color during the swap.',
			legacy: 'variable_load_new',
		},
		{
			key: 'unload',
			defaultValue: '300',
			label: 'Unload Length (mm)',
			desc: 'How much to retract filament out of the hotend when unloading.',
			legacy: 'variable_unload',
		},
		{
			key: 'unload_speed',
			defaultValue: '1000',
			label: 'Unload Speed',
			desc: 'How fast to retract filament during unload.',
			legacy: 'variable_unload_speed',
		},
		{
			key: 'load_speed',
			defaultValue: '200',
			label: 'Load/Purge Speed',
			desc: 'How fast to advance filament during load and purge.',
			legacy: 'variable_load_speed',
		},
		{
			key: 'park_speed',
			defaultValue: '10000',
			label: 'Park Move Speed',
			desc: 'How fast the head moves to the swap position.',
			legacy: 'variable_park_speed',
		},
		{
			key: 'retract_park',
			defaultValue: '6.5',
			label: 'Pause Retract (mm)',
			desc: 'How much to retract at pause to reduce oozing; the same amount is restored on resume.',
			legacy: 'variable_retract_park',
		},
		{
			key: 'timeout',
			defaultValue: '43200',
			label: 'User Input Timeout (s)',
			desc: 'Time allowed to respond during a swap before it times out.',
			legacy: 'variable_timeout',
		},
		{
			key: 'post_origin_console',
			defaultValue: '1',
			label: 'Console Messages',
			desc: 'Show swap start messages in the console.',
		},
		{
			key: 'post_status_console',
			defaultValue: '0',
			label: 'Console Status Messages',
			desc: 'Also show status update messages in the console.',
			parents: ['post_origin_console'],
			indent: true,
		},
		{
			key: 'enable_beeper',
			defaultValue: '1',
			label: 'Enable Sounds',
			desc: 'Turn on swap and runout printer beeper sounds.',
		},
		{
			key: 'sound_m600',
			defaultValue: '"FILAMENT_SWAP"',
			label: 'M600 Sound',
			desc: 'Sound to play on M600',
			parents: ['enable_beeper'],
			indent: true,
			type: 'select',
			options: ['FILAMENT_SWAP', 'RUN_OUT', 'CAKE', 'BEEP', 'ALERT', 'CHIME'],
			preview: true,
		},
		{
			key: 'sound_runout',
			defaultValue: '"RUN_OUT"',
			label: 'Runout Sound',
			desc: 'Sound to play on RUN_OUT',
			parents: ['enable_beeper'],
			indent: true,
			type: 'select',
			options: ['FILAMENT_SWAP', 'RUN_OUT', 'CAKE', 'BEEP', 'ALERT', 'CHIME'],
			preview: true,
		},
	],
	originStrings: [
		{
			key: 'run_out',
			defaultValue:
				'"OUT OF FILAMENT! Remove the remaining filament then click [[[FILAMENT_SWAP]]] to start the filament replacement process."',
			label: 'Runout Alert Text',
			desc: 'Shown when filament runout is detected before the swap begins.',
		},
		{
			key: 'manual_swap_prepare',
			defaultValue:
				'"Maintenance position ready. You can unload manually by pulling the filament, or click [[[AFS_UNLOAD]]] to use the extruder. Then use [[[LOAD_FILAMENT]]] to advance new filament."',
			label: 'Manual Swap Ready Text',
			desc: 'Shown when the printer is parked and ready for a manual swap.',
		},
		{
			key: 'filament_swap_unloading',
			defaultValue: '"FILAMENT SWAP STARTED. Filament unloading, please wait ..."',
			label: 'Unloading Text',
			desc: 'Shown while the filament is being unloaded.',
		},
		{
			key: 'filament_swap_loading',
			defaultValue: '"Load your new filament then click [[[LOAD_FILAMENT]]]."',
			label: 'Loading Text',
			desc: 'Shown when the printer is waiting for you to load new filament.',
		},
		{
			key: 'load_new_loaded',
			defaultValue:
				'"Filament loaded! Use [[[LOAD_FILAMENT]]] to bleed more or [[[FINISH_SWAP]]] to resume printing."',
			label: 'Loaded Text',
			desc: 'Shown once the new filament is advanced to the hotend.',
		},
		{
			key: 'complete',
			defaultValue: '"FILAMENT SWAP COMPLETE! Printer resuming, please wait ..."',
			label: 'Complete Text',
			desc: 'Shown when the filament swap is finished and the printer resumes.',
		},
	],
	statusStrings: [
		{
			key: 'homing',
			defaultValue: '"Homing the print head"',
			label: 'Homing',
			desc: 'Printer is homing axes.',
		},
		{
			key: 'parking',
			defaultValue: '"Parking the print head"',
			label: 'Parking',
			desc: 'Printer is moving to the maintenance position.',
		},
		{
			key: 'purging',
			defaultValue: '"Purging extra filament..."',
			label: 'Purging',
			desc: 'Printer is purging extra filament.',
		},
		{
			key: 'loading',
			defaultValue: '"Loading filament..."',
			label: 'Loading',
			desc: 'Printer is advancing filament.',
		},
		{
			key: 'unloading',
			defaultValue: '"Unloading filament..."',
			label: 'Unloading',
			desc: 'Printer is retracting filament out of the hotend.',
		},
		{
			key: 'temp_set',
			defaultValue: '"Setting hotend temperature"',
			label: 'Setting Temperature',
			desc: 'Target temperature is being set without waiting.',
		},
		{
			key: 'heating',
			defaultValue: '"Heating hotend"',
			label: 'Heating',
			desc: 'Printer is heating to the target temperature.',
		},
		{
			key: 'temp_restored',
			defaultValue: '"Temperature restored"',
			label: 'Temperature Restored',
			desc: 'Original temperature has been restored after the swap.',
		},
		{
			key: 'cooling',
			defaultValue: '"Heaters turned off"',
			label: 'Cooling',
			desc: 'Hotend has been turned off.',
		},
		{
			key: 'resuming',
			defaultValue: '"Resuming print..."',
			label: 'Resuming Print',
			desc: 'Printer is resuming the print.',
		},
		{
			key: 'complete_idle',
			defaultValue: '"Swap complete"',
			label: 'Swap Complete',
			desc: 'Swap finished with no print to resume.',
		},
		{
			key: 'waiting',
			defaultValue: '"Waiting for user input..."',
			label: 'Waiting For Input',
			desc: 'Printer is waiting for you to choose the next action.',
		},
		{
			key: 'unpriming',
			defaultValue: '"Unpriming hotend"',
			label: 'Unpriming',
			desc: 'Extrude then retract before cooling to clear pressure.',
		},
	],
	modalConfig: {
		stages: {
			run_out: {
				title: 'Filament Runout',
				timelineLabel: 'Runout',
				description:
					'Your printer has run out of filament! To prevent damage, manually pull the remaining filament away from the sensor then continue with the "Start Swap" button.',
				upcomingStages: ['Unload', 'Load', 'Loaded', 'Complete'],
				macros: [
					{
						label: 'Start Swap',
						gcode: 'FILAMENT_SWAP',
						primary: true,
					},
				],
				colorScheme: '#d32f2f',
			},
			filament_swap_unloading: {
				title: 'Unloading Filament',
				timelineLabel: 'Unload',
				description: 'Your current filament is unloading. Please wait...',
				upcomingStages: ['Load', 'Loaded', 'Complete'],
				macros: [],
				colorScheme: '#f57f17',
			},
			filament_swap_loading: {
				title: 'Load New Filament',
				timelineLabel: 'Load',
				description:
					'Insert new filament until it reaches the hotend. Use the Advance control to bleed or purge preset lengths.',
				upcomingStages: ['Loaded', 'Complete'],
				showTempControl: true,
				macros: [
					{
						label: 'Finish',
						gcode: 'FINISH_SWAP',
						primary: true,
					},
				],
				colorScheme: '#1976d2',
			},
			manual_swap_prepare: {
				title: 'Maintenance Position',
				timelineLabel: 'Prepare',
				description:
					'Hotend heated and parked. You can pull the filament out manually or use Unload Filament. Then use Load Filament to advance the new filament.',
				upcomingStages: ['Loaded', 'Complete'],
				showTempControl: true,
				macros: [
					{
						label: 'Finish',
						gcode: 'FINISH_SWAP',
						primary: true,
					},
				],
				colorScheme: '#f57f17',
			},
			load_new_loaded: {
				title: 'Filament Loaded',
				timelineLabel: 'Loaded',
				description:
					"Filament loaded! Use the Advance control to purge preset lengths until color is clean, or 'Finish' to resume.",
				upcomingStages: ['Complete'],
				showTempControl: true,
				macros: [
					{
						label: 'Finish',
						gcode: 'FINISH_SWAP',
						primary: true,
					},
				],
				colorScheme: '#388e3c',
			},
			complete: {
				title: 'Swap Complete',
				timelineLabel: 'Complete',
				description: 'Filament swap complete! Resuming print...',
				macros: [
					{
						label: 'Close',
						action: 'close',
						primary: false,
					},
				],
				colorScheme: '#43a047',
			},
		},
		statusMessages: {
			homing: 'Homing the print head',
			parking: 'Parking the print head',
			purging: 'Purging extra filament...',
			loading: 'Loading filament...',
			unloading: 'Unloading filament...',
			temp_set: 'Setting hotend temperature',
			heating: 'Heating hotend',
			temp_restored: 'Temperature restored',
			cooling: 'Heaters turned off',
			resuming: 'Resuming print...',
			complete_idle: 'Swap complete',
			waiting: 'Waiting for user input...',
			unpriming: 'Unpriming hotend',
		},
	},
};
