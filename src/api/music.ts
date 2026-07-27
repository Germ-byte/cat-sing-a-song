/**
 * 音乐 API 服务
 * 通过 Electron 主进程内嵌的 NeteaseCloudMusicApi 提供服务
 * 本地地址: http://127.0.0.1:35490
 */
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:35490',
  timeout: 15000,
  withCredentials: true,
})

export interface Song {
  id: number
  name: string
  artists: string
  artistsList: { id: number; name: string }[]
  album: string
  albumId: number
  cover: string
  duration: number  // 毫秒
  url?: string
}

export interface SearchResult {
  songs: Song[]
  total: number
}

// ===== 搜索 =====
export async function searchSongs(keywords: string, limit = 30, offset = 0): Promise<SearchResult> {
  try {
    const { data } = await api.get('/cloudsearch', {
      params: { keywords, limit, offset, type: 1 },
    })
    const songs: Song[] = (data?.result?.songs || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      artists: (s.ar || []).map((a: any) => a.name).join(' / '),
      artistsList: (s.ar || []).map((a: any) => ({ id: a.id, name: a.name })),
      album: s.al?.name || '',
      albumId: s.al?.id || 0,
      cover: s.al?.picUrl ? `${s.al.picUrl}?param=200y200` : '',
      duration: s.dt || 0,
    }))
    return { songs, total: data?.result?.songCount || 0 }
  } catch (e) {
    console.error('搜索失败:', e)
    return { songs: [], total: 0 }
  }
}

// ===== 获取播放地址 =====
export async function getSongUrl(id: number): Promise<string> {
  try {
    const { data } = await api.get('/song/url/v1', {
      params: { id, level: 'standard' },
    })
    return data?.data?.[0]?.url || ''
  } catch (e) {
    console.error('获取播放地址失败:', e)
    return ''
  }
}

// ===== 获取歌词 =====
export async function getLyric(id: number): Promise<string> {
  try {
    const { data } = await api.get('/lyric', { params: { id } })
    return data?.lrc?.lyric || ''
  } catch (e) {
    console.error('获取歌词失败:', e)
    return ''
  }
}

// ===== 新歌速递 =====
export async function getNewSongs(type = 0): Promise<Song[]> {
  // type: 0-全部, 7-华语, 96-欧美, 8-日语, 16-韩语
  try {
    const { data } = await api.get('/top/song', { params: { type } })
    return (data?.data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      artists: (s.artists || []).map((a: any) => a.name).join(' / '),
      artistsList: (s.artists || []).map((a: any) => ({ id: a.id, name: a.name })),
      album: s.album?.name || '',
      albumId: s.album?.id || 0,
      cover: s.album?.picUrl ? `${s.album.picUrl}?param=200y200` : '',
      duration: s.duration || 0,
    }))
  } catch (e) {
    console.error('获取新歌失败:', e)
    return []
  }
}

// ===== 排行榜 =====
const RANK_IDS: Record<string, number> = {
  '飙升榜': 19723756,
  '新歌榜': 3779629,
  '热歌榜': 3778678,
  '原创榜': 2884035,
}

export function getRankNames() {
  return Object.keys(RANK_IDS)
}

export async function getRankSongs(name: string): Promise<Song[]> {
  const id = RANK_IDS[name]
  if (!id) return []
  try {
    const { data } = await api.get('/playlist/detail', { params: { id } })
    const trackIds = (data?.playlist?.trackIds || []).slice(0, 50).map((t: any) => t.id)
    if (trackIds.length === 0) return []
    const { data: detail } = await api.get('/song/detail', {
      params: { ids: trackIds.join(',') },
    })
    return (detail?.songs || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      artists: (s.ar || []).map((a: any) => a.name).join(' / '),
      artistsList: (s.ar || []).map((a: any) => ({ id: a.id, name: a.name })),
      album: s.al?.name || '',
      albumId: s.al?.id || 0,
      cover: s.al?.picUrl ? `${s.al.picUrl}?param=200y200` : '',
      duration: s.dt || 0,
    }))
  } catch (e) {
    console.error('获取排行榜失败:', e)
    return []
  }
}

// ===== 推荐歌单 =====
export async function getRecommendPlaylists(limit = 12): Promise<any[]> {
  try {
    const { data } = await api.get('/top/playlist', {
      params: { limit, order: 'hot' },
    })
    return (data?.playlists || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      cover: p.coverImgUrl ? `${p.coverImgUrl}?param=300y300` : '',
      playCount: p.playCount || 0,
    }))
  } catch (e) {
    console.error('获取推荐歌单失败:', e)
    return []
  }
}

// ===== 歌单详情 =====
export async function getPlaylistSongs(playlistId: number): Promise<Song[]> {
  try {
    const { data } = await api.get('/playlist/detail', { params: { id: playlistId } })
    const trackIds = (data?.playlist?.trackIds || []).slice(0, 100).map((t: any) => t.id)
    if (trackIds.length === 0) return []
    const { data: detail } = await api.get('/song/detail', {
      params: { ids: trackIds.join(',') },
    })
    return (detail?.songs || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      artists: (s.ar || []).map((a: any) => a.name).join(' / '),
      artistsList: (s.ar || []).map((a: any) => ({ id: a.id, name: a.name })),
      album: s.al?.name || '',
      albumId: s.al?.id || 0,
      cover: s.al?.picUrl ? `${s.al.picUrl}?param=200y200` : '',
      duration: s.dt || 0,
    }))
  } catch (e) {
    console.error('获取歌单详情失败:', e)
    return []
  }
}

// ===== 工具函数 =====
export function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatPlayCount(count: number): string {
  if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
  return String(count)
}
