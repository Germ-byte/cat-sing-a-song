<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  total: number
  pageSize?: number
  current: number
}>(), {
  pageSize: 30,
})

const emit = defineEmits<{
  'update:current': [page: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pages = computed(() => {
  const t = totalPages.value
  const c = props.current
  if (t <= 7) {
    return Array.from({ length: t }, (_, i) => i + 1)
  }
  const result: (number | '...')[] = [1]
  if (c > 4) {
    result.push('...')
  }
  const start = Math.max(2, c - 1)
  const end = Math.min(t - 1, c + 1)
  // Adjust range to always show 3 middle numbers when possible
  let s = start
  let e = end
  if (c <= 4) {
    s = 2
    e = 5
  } else if (c >= t - 3) {
    s = t - 4
    e = t - 1
  }
  for (let i = s; i <= e; i++) {
    result.push(i)
  }
  if (c < t - 3) {
    result.push('...')
  }
  result.push(t)
  return result
})

function go(page: number) {
  if (page < 1 || page > totalPages.value || page === props.current) return
  emit('update:current', page)
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="page-btn"
      :disabled="current <= 1"
      @click="go(current - 1)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <template v-for="(p, i) in pages" :key="i">
      <span v-if="p === '...'" class="page-ellipsis">...</span>
      <button
        v-else
        class="page-btn"
        :class="{ active: p === current }"
        @click="go(p)"
      >{{ p }}</button>
    </template>

    <button
      class="page-btn"
      :disabled="current >= totalPages"
      @click="go(current + 1)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 20px 0 8px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
  line-height: 1;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.page-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-ellipsis {
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
  letter-spacing: 2px;
}
</style>
