<template>
  <div class="rounded-xl border border-slate-200 overflow-hidden">
    <button
      class="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      @click="collapsed = !collapsed"
    >
      <span
        class="w-3 h-3 rounded-full shrink-0"
        :style="{ backgroundColor: COLOR_MAP[color] }"
      />
      <span class="font-medium text-sm text-slate-700">{{ color }}</span>
      <span class="text-xs text-slate-400">({{ records.length }})</span>
      <span class="ml-auto">
        <ChevronDown v-if="!collapsed" class="w-4 h-4 text-slate-400" />
        <ChevronRight v-else class="w-4 h-4 text-slate-400" />
      </span>
    </button>

    <div v-show="!collapsed" class="flex flex-col gap-2 p-3">
      <BadgeCard
        v-for="record in records"
        :key="record.id"
        :record="record"
        :selected="selectedIds.has(record.id)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @toggle-select="$emit('toggle-select', $event)"
        @register-handover="$emit('register-handover', $event)"
        @view-handover="$emit('view-handover', $event)"
        @view-progress="$emit('view-progress', $event)"
        @register-appointment="$emit('register-appointment', $event)"
        @view-appointment="$emit('view-appointment', $event)"
        @register-reissue="$emit('register-reissue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BadgeRecord } from '@/types'
import { COLOR_MAP } from '@/types'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { ref } from 'vue'
import BadgeCard from './BadgeCard.vue'

defineProps<{
  color: string
  records: BadgeRecord[]
  selectedIds: Set<string>
}>()

defineEmits<{
  edit: [record: BadgeRecord]
  delete: [id: string]
  'toggle-select': [id: string]
  'register-handover': [record: BadgeRecord]
  'view-handover': [id: string]
  'view-progress': [id: string]
  'register-appointment': [record: BadgeRecord]
  'view-appointment': [record: BadgeRecord]
  'register-reissue': [record: BadgeRecord]
}>()

const collapsed = ref(false)
</script>
