<script setup lang="ts">
import { computed } from 'vue'
import { X, User, Clock, Handshake, FileText, ClipboardList } from 'lucide-vue-next'
import type { BadgeRecord } from '@/types'
import { useBadgeStore } from '@/composables/useBadgeStore'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  visible: boolean
  recordId: string | null
}>()

const emit = defineEmits<{
  close: []
  edit: [record: BadgeRecord]
}>()

const store = useBadgeStore()

const record = computed<BadgeRecord | null>(() => {
  if (!props.recordId) return null
  return store.records.find((r) => r.id === props.recordId) || null
})

const handover = computed(() => record.value?.handover || null)

function formatDateTime(isoStr: string) {
  const d = new Date(isoStr)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleClose() {
  emit('close')
}

function handleEdit() {
  if (record.value) {
    emit('edit', record.value)
  }
  emit('close')
}

function handleClearHandover() {
  if (record.value && confirm('确定清除该记录的交接信息吗？状态不会自动变更。')) {
    store.clearHandover(record.value.id)
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && record" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <Handshake class="w-5 h-5 text-green-600" />
            <h2 class="text-lg font-semibold text-slate-800">交接信息详情</h2>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div class="px-6 py-4">
          <div class="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
            <p class="text-sm font-medium text-slate-800">{{ record.name }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ record.company }} · {{ record.attendeeType }}</p>
          </div>

          <div v-if="handover" class="space-y-4">
            <div class="flex items-start gap-3">
              <User class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div class="flex-1">
                <p class="text-xs text-slate-500">领取人</p>
                <p class="text-sm font-medium text-slate-800">{{ handover.receiverName }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Clock class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div class="flex-1">
                <p class="text-xs text-slate-500">领取时间</p>
                <p class="text-sm font-medium text-slate-800">{{ formatDateTime(handover.receivedAt) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <ClipboardList class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div class="flex-1">
                <p class="text-xs text-slate-500">交接方式</p>
                <p class="text-sm font-medium text-slate-800">{{ handover.handoverMethod }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <FileText class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div class="flex-1">
                <p class="text-xs text-slate-500">经办人</p>
                <p class="text-sm font-medium text-slate-800">{{ handover.handler }}</p>
              </div>
            </div>

            <div v-if="handover.handoverNotes" class="flex items-start gap-3">
              <FileText class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div class="flex-1">
                <p class="text-xs text-slate-500">交接备注</p>
                <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ handover.handoverNotes }}</p>
              </div>
            </div>
          </div>

          <div v-else class="py-8 text-center">
            <Handshake class="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p class="text-sm text-slate-500">暂无交接信息</p>
            <p class="text-xs text-slate-400 mt-1">该胸卡尚未完成领取登记</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button
            v-if="handover"
            class="btn-secondary text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            @click="handleClearHandover"
          >
            清除交接
          </button>
          <div class="flex-1" />
          <button class="btn-secondary" @click="handleClose">关闭</button>
          <button class="btn-primary" @click="handleEdit">
            {{ handover ? '修改交接' : '登记领取' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
