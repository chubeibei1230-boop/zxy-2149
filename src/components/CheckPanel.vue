<template>
  <div v-if="store.issueCount > 0 && !dismissed" class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
    <div
      class="flex items-center justify-between px-3 py-2 cursor-pointer select-none hover:bg-slate-50 transition-colors"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-2">
        <component :is="expanded ? ChevronDown : ChevronRight" class="w-4 h-4 text-slate-400" />
        <span class="text-sm font-semibold text-slate-700">数据检查</span>
        <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold leading-none">
          {{ store.issueCount }}
        </span>
      </div>
      <button
        class="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        @click.stop="dismissed = true"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <div v-if="expanded" class="border-t border-slate-100 px-3 py-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
      <div
        v-for="(issue, index) in store.checks"
        :key="index"
        class="flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
        :class="issue.severity === 'warning'
          ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
          : 'bg-red-50 border border-red-200 hover:bg-red-100'"
        @click="store.focusOnIssue(issue)"
      >
        <component
          :is="issue.severity === 'warning' ? AlertTriangle : AlertCircle"
          class="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
          :class="issue.severity === 'warning' ? 'text-amber-500' : 'text-red-500'"
        />
        <span class="text-xs text-slate-700 leading-relaxed">{{ issue.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, AlertCircle, X, ChevronDown, ChevronRight } from 'lucide-vue-next'
import { useBadgeStore } from '@/composables/useBadgeStore'
import type { CheckIssue } from '@/types'

const store = useBadgeStore()
const expanded = ref(true)
const dismissed = ref(false)
</script>
