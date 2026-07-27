export interface LyricLine {
  time: number
  text: string
}

/** Parse timestamped LRC lyrics into chronological lyric lines. */
export function parseLrc(lrcText: string): LyricLine[] {
  const lines: LyricLine[] = []
  const timestampPattern = /\[(\d+):(\d+(?:\.\d+)?)\]/g

  for (const rawLine of lrcText.split(/\r?\n/)) {
    const timestamps = [...rawLine.matchAll(timestampPattern)]
    const text = rawLine.replace(timestampPattern, '').trim()

    if (!text || timestamps.length === 0) continue

    for (const match of timestamps) {
      const minutes = Number(match[1])
      const seconds = Number(match[2])
      if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
        lines.push({ time: minutes * 60 + seconds, text })
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}

/** Return the latest lyric line that has started at the supplied playback time. */
export function findCurrentLine(lines: LyricLine[], currentTime: number): number {
  let currentIndex = -1

  for (let index = 0; index < lines.length; index++) {
    if (lines[index].time > currentTime) break
    currentIndex = index
  }

  return currentIndex
}
