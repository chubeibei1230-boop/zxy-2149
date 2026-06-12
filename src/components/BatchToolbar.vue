<template>
  <div
    v-if="store.selectedIds.size > 0"
    class="sticky bottom-0 bg-white border-t shadow-lg px-6 py-3 flex items-center gap-3"
  >
    <span class="text-sm font-medium text-slate-700 whitespace-nowrap">
      已选择 {{ store.selectedIds.size }} 条
    </span>

    <button
      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
      @click="store.selectAll()"
    >
      <CheckCheck class="w-3.5 h-3.5" />
      全选
    </button>

    <button
      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
      @click="store.clearSelection()"
    >
      <X class="w-3.5 h-3.5" />
      取消选择
    </button>

    <div class="w-px h-5 bg-slate-200" />

    <button
      v-for="status in STATUS_LIST"
      :key="status"
      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-white transition-opacity hover:opacity-80"
      :style="{ backgroundColor: STATUS_COLOR_MAP[status] }"
      @click="handleBatchStatus(status)"
    >
      <CheckSquare class="w-3.5 h-3.5" />
      {{ status }}
    </button>

    <div class="w-px h-5 bg-slate-200" />

    <button
      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
      @click="handleBatchDelete"
    >
      <Trash2 class="w-3.5 h-3.5" />
      删除所选
    </button>
  </div>
</template>

<script setup lang="ts">
import { useBadgeStore } from '@/composables/useBadgeStore'
import { STATUS_LIST, STATUS_COLOR_MAP } from '@/types'
import type { BadgeStatus } from '@/types'
import { CheckSquare, Trash2, X, CheckCheck } from 'lucide-vue-next'

const store = useBadgeStore()

function handleBatchStatus(status: BadgeStatus) {
  store.batchUpdateStatus(Array.from(store.selectedIds), status)
  store.clearSelection()
}

function handleBatchDelete() {
  store.deleteRecords(Array.from(store.selectedIds))
  store.clearSelection()
}
</script>
