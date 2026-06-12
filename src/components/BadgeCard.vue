<template>
  <div
    class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex gap-3 relative overflow-hidden"
  >
    <div
      class="absolute left-0 top-0 bottom-0 w-1"
      :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
    />

    <div class="pl-2 flex items-center">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          :checked="selected"
          class="peer sr-only"
          @change="$emit('toggle-select', record.id)"
        />
        <div
          class="w-4 h-4 rounded border border-slate-300 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors flex items-center justify-center"
        >
          <svg
            v-if="selected"
            class="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </label>
    </div>

    <div class="flex-1 min-w-0 flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span class="font-medium text-sm truncate">{{ record.name }}</span>
      </div>

      <div class="flex items-center gap-2">
        <Building2 class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span class="text-xs text-slate-500 truncate">{{ record.company }}</span>
      </div>

      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
          <Tag class="w-3 h-3" />
          {{ record.attendeeType }}
        </span>

        <span class="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
          <span
            class="w-2 h-2 rounded-full inline-block"
            :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
          />
          {{ record.badgeColor }}
        </span>

        <span class="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
          <Layers class="w-3 h-3" />
          {{ record.printBatch }}
        </span>

        <span
          class="inline-flex items-center text-xs text-white rounded px-1.5 py-0.5"
          :style="{ backgroundColor: STATUS_COLOR_MAP[record.status] }"
        >
          {{ record.status }}
        </span>
      </div>

      <div v-if="record.responsiblePerson" class="flex items-center gap-2">
        <FileText class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span class="text-xs text-slate-500">{{ record.responsiblePerson }}</span>
      </div>

      <div v-if="record.notes" class="flex items-center gap-2">
        <StickyNote class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span class="text-xs text-slate-400 truncate">{{ record.notes }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-1 shrink-0">
      <button
        class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
        @click="$emit('edit', record)"
      >
        <Edit2 class="w-4 h-4" />
      </button>
      <button
        class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
        @click="$emit('delete', record.id)"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BadgeRecord } from '@/types'
import { COLOR_MAP, STATUS_COLOR_MAP } from '@/types'
import { Edit2, Trash2, Building2, Tag, Layers, User, FileText, StickyNote } from 'lucide-vue-next'

defineProps<{
  record: BadgeRecord
  selected: boolean
}>()

defineEmits<{
  edit: [record: BadgeRecord]
  delete: [id: string]
  'toggle-select': [id: string]
}>()
</script>
