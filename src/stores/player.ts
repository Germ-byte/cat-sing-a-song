import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSongUrl, type Song } from '@/api/music'

export type PlayMode = 'sequence' | 'loop' | 'random' | 'single'

export const usePlayerStore = defineStore('player', () => {
  const playlist = ref<Song[]>([])
  const currentSong = ref<Song | null>(null)
  const currentIndex = ref(-1)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(80)
  const isMuted = ref(false)
  const playMode = ref<PlayMode>('sequence')
  const playHistory = ref<Song[]>([])

  const progress = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

  let audio: HTMLAudioElement | null = null

  function initAudio() {
    if (audio) return
    audio = new Audio()
    audio.volume = volume.value / 100

    audio.addEventListener('timeupdate', () => { currentTime.value = audio!.currentTime })
    audio.addEventListener('loadedmetadata', () => { duration.value = audio!.duration })
    audio.addEventListener('ended', handleEnd)
    audio.addEventListener('play', () => { isPlaying.value = true })
    audio.addEventListener('pause', () => { isPlaying.value = false })
    audio.addEventListener('error', (e) => { console.error('播放错误:', e) })
  }

  async function play(song: Song) {
    initAudio()
    let url = song.url
    if (!url) {
      url = await getSongUrl(song.id)
    }
    if (!url) {
      console.error('无法获取播放地址, id:', song.id)
      // 尝试下一首
      playNext()
      return
    }
    audio!.src = url
    audio!.play().catch(e => console.error('play() error:', e))
    currentSong.value = { ...song, url }

    const idx = playlist.value.findIndex(s => s.id === song.id)
    if (idx === -1) {
      playlist.value.push({ ...song, url })
      currentIndex.value = playlist.value.length - 1
    } else {
      currentIndex.value = idx
    }

    // 历史
    playHistory.value = playHistory.value.filter(s => s.id !== song.id)
    playHistory.value.unshift({ ...song, url })
    if (playHistory.value.length > 200) playHistory.value.length = 200
  }

  function pause() { audio?.pause() }
  function resume() { audio?.play() }
  function togglePlay() { isPlaying.value ? pause() : resume() }

  function playPrev() {
    if (!playlist.value.length) return
    let i = currentIndex.value - 1
    if (i < 0) i = playMode.value === 'loop' ? playlist.value.length - 1 : 0
    play(playlist.value[i])
  }

  function playNext() {
    if (!playlist.value.length) return
    if (playMode.value === 'random') {
      play(playlist.value[Math.floor(Math.random() * playlist.value.length)])
      return
    }
    let i = currentIndex.value + 1
    if (i >= playlist.value.length) i = playMode.value === 'loop' ? 0 : playlist.value.length - 1
    play(playlist.value[i])
  }

  function handleEnd() {
    if (playMode.value === 'single') {
      audio!.currentTime = 0
      audio!.play()
    } else {
      playNext()
    }
  }

  function seek(t: number) { if (audio) audio.currentTime = t }
  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(100, v))
    if (audio) audio.volume = volume.value / 100
    if (v > 0) isMuted.value = false
  }
  function toggleMute() {
    isMuted.value = !isMuted.value
    if (audio) audio.volume = isMuted.value ? 0 : volume.value / 100
  }
  function toggleMode() {
    const modes: PlayMode[] = ['sequence', 'loop', 'random', 'single']
    playMode.value = modes[(modes.indexOf(playMode.value) + 1) % modes.length]
  }

  function addToPlaylist(song: Song) {
    if (!playlist.value.some(s => s.id === song.id)) playlist.value.push(song)
  }
  function removeFromPlaylist(i: number) {
    playlist.value.splice(i, 1)
    if (i < currentIndex.value) currentIndex.value--
    else if (i === currentIndex.value) { currentSong.value = null; audio?.pause() }
  }
  function clearPlaylist() {
    playlist.value = []; currentSong.value = null; currentIndex.value = -1; audio?.pause()
  }
  function clearHistory() { playHistory.value = [] }

  // 播放全部
  function playAll(songs: Song[]) {
    playlist.value = [...songs]
    if (songs.length) {
      currentIndex.value = 0
      play(songs[0])
    }
  }

  return {
    playlist, currentSong, currentIndex, isPlaying,
    currentTime, duration, volume, isMuted, playMode, playHistory,
    progress,
    play, pause, resume, togglePlay, playPrev, playNext,
    seek, setVolume, toggleMute, toggleMode,
    addToPlaylist, removeFromPlaylist, clearPlaylist, clearHistory,
    playAll,
  }
})
