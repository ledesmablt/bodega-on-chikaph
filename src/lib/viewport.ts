import { writable } from 'svelte/store'

// export let viewport = new Viewport()
export const viewport = writable({ width: 0, height: 0 })
