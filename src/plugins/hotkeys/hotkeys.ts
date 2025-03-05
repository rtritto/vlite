import type Player from 'core/player.js'

type pluginParameter = {
	player: Player
	options: {
		seekTime?: number
		volumeStep?: number
	}
}

/**
 * Vlitejs Hotkeys plugin
 * @module Vlitejs/plugins/Hotkeys
 */
export default class Hotkeys {
	player: any
	seekTime: number
	volumeStep: number

	providers = ['html5', 'youtube', 'dailymotion', 'vimeo']
	types = ['video', 'audio']

	/**
	 * @constructor
	 * @param options
	 * @param options.player Player instance
	 * @param options.options Plugins options
	 */
	constructor({ player, options = {} }: pluginParameter) {
		this.player = player
		this.seekTime = options.seekTime ?? 5
		this.volumeStep = options.volumeStep ?? 0.1

		this.onKeydown = this.onKeydown.bind(this)
	}

	/**
	 * Initialize
	 */
	init() {
		this.addEvents()
	}

	/**
	 * Add event listeners
	 */
	addEvents() {
		this.player.elements.container.addEventListener('keydown', this.onKeydown)
	}

	/**
	 * On keydown event on the media element
	 * @param e Event listener datas
	 */
	onKeydown(e: KeyboardEvent) {
		const { keyCode } = e
		if ([9, 32, 37, 39].includes(keyCode)) {
			// Stop and start the auto hide timer on selected key code
			this.player.Vlitejs.stopAutoHideTimer()
			this.player.Vlitejs.startAutoHideTimer()
		}
		if (keyCode === 37 || keyCode === 39) {
			e.preventDefault() // Prevent default behavior on input range
			// Backward or forward video with arrow keys
			this.fastForward(keyCode === 37 ? 'backward' : 'forward')
		}
		if (keyCode === 38 || keyCode === 40) {
			e.preventDefault() // Prevent the vertical scroll of the page
			// Increase or decrease volume with arrow keys
			if (keyCode === 38) {
				this.increaseVolume()
			} else {
				this.decreaseVolume()
			}
		}
		if (keyCode === 32) {
			// Toggle the media playback with spacebar key
			this.player.controlBar.togglePlayPause(e)
		}
	}

	/**
	 * Trigger the video fast forward (front and rear)
	 * @param direction Direction (backward|forward)
	 */
	fastForward(direction: string) {
		this.player.getCurrentTime().then((seconds: number) => {
			this.player.seekTo(
				direction === 'backward' ? seconds - this.seekTime : seconds + this.seekTime
			)
		})
	}

	/**
	 * Increase the player volume
	 */
	increaseVolume() {
		this.player.isMuted && this.player.unMute()
		this.player.getVolume().then((volume: number) => {
			this.player.setVolume(Math.min(Math.round((volume + this.volumeStep) * 10) / 10, 1))
		})
	}

	/**
	 * Decrease the player volume
	 */
	decreaseVolume() {
		this.player.getVolume().then((volume: number) => {
			this.player.setVolume(Math.max(Math.round((volume - this.volumeStep) * 10) / 10, 0))
		})
	}

	/**
	 * Destroy the plugin
	 */
	destroy() {
		this.player.elements.container.removeEventListener('keydown', this.onKeydown)
	}
}
