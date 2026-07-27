<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  visible: boolean
  title: string
  mode: 'input' | 'confirm'
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  message?: string
}>()

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
  (e: 'update:visible', val: boolean): void
}>()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.visible, (val) => {
  if (val) {
    inputValue.value = props.defaultValue || ''
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }
})

function onConfirm() {
  emit('confirm', inputValue.value)
  emit('update:visible', false)
}

function onCancel() {
  emit('cancel')
  emit('update:visible', false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') onConfirm()
  if (e.key === 'Escape') onCancel()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="onCancel" @keydown="onKeydown">
      <div class="modal-box">
        <div class="modal-title">{{ title }}</div>

        <p v-if="mode === 'confirm' && message" class="modal-message">{{ message }}</p>

        <input
          v-if="mode === 'input'"
          ref="inputRef"
          v-model="inputValue"
          class="modal-input"
          :placeholder="placeholder || ''"
          @keydown.enter="onConfirm"
        />

        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="onCancel">
            {{ cancelText || '取消' }}
          </button>
          <button class="modal-btn modal-btn-confirm" @click="onConfirm">
            {{ confirmText || '确定' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.15s ease;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-box {
  width: 380px;
  max-width: 90vw;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  animation: slide-up 0.2s ease;
}
@keyframes slide-up {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.modal-message {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-input {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: var(--transition);
  margin-bottom: 20px;
}
.modal-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.modal-input::placeholder {
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-btn {
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: var(--transition);
}
.modal-btn-cancel {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}
.modal-btn-cancel:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.modal-btn-confirm {
  background: var(--accent);
  color: #fff;
}
.modal-btn-confirm:hover {
  background: var(--accent-hover);
}
</style>
