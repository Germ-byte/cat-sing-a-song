import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Song } from '@/api/music'

export interface FavoritePlaylist {
  id: string
  name: string
  songs: Song[]
  createdAt: number
}

const STORAGE_KEY = 'catdesk-favorite-playlists'

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function loadFromStorage(): FavoritePlaylist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch (e) {
    console.error('读取收藏歌单失败:', e)
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const playlists = ref<FavoritePlaylist[]>(loadFromStorage())

  watch(
    playlists,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch (e) {
        console.error('保存收藏歌单失败:', e)
      }
    },
    { deep: true }
  )

  function createPlaylist(name: string): FavoritePlaylist {
    const playlist: FavoritePlaylist = {
      id: genId(),
      name: name.trim() || '新建歌单',
      songs: [],
      createdAt: Date.now(),
    }
    playlists.value.push(playlist)
    return playlist
  }

  function deletePlaylist(id: string) {
    const idx = playlists.value.findIndex(p => p.id === id)
    if (idx !== -1) playlists.value.splice(idx, 1)
  }

  function renamePlaylist(id: string, name: string) {
    const playlist = playlists.value.find(p => p.id === id)
    if (playlist && name.trim()) playlist.name = name.trim()
  }

  function addSongToPlaylist(playlistId: string, song: Song) {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (!playlist) return
    if (!playlist.songs.some(s => s.id === song.id)) {
      playlist.songs.push({ ...song })
    }
  }

  function removeSongFromPlaylist(playlistId: string, songId: number) {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (!playlist) return
    const idx = playlist.songs.findIndex(s => s.id === songId)
    if (idx !== -1) playlist.songs.splice(idx, 1)
  }

  function getPlaylist(id: string): FavoritePlaylist | undefined {
    return playlists.value.find(p => p.id === id)
  }

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylist,
  }
})
