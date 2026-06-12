<script setup lang="ts">
import { useBadgeStore } from '@/composables/useBadgeStore'
import { Users, Printer, CheckCircle, AlertTriangle, ClipboardList, Clock, Handshake, CalendarClock, ClipboardCheck } from 'lucide-vue-next'
import { STATUS_LIST, STATUS_COLOR_MAP, PICKUP_STATUS_COLOR_MAP } from '@/types'
import type { BadgeStatus } from '@/types'

const store = useBadgeStore()

const statusIconMap: Record<BadgeStatus, typeof Users> = {
  '待设计': Clock,
  '待打印': Printer,
  '待领取': ClipboardList,
  '已领取': CheckCircle,
  '需重做': AlertTriangle,
}
</script>

<template>
  <div class="flex items-center gap-3 overflow-x-auto pb-1">
    <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit">
      <Users class="w-4 h-4 text-primary-600 shrink-0" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.stats.total }}</span>
        <span class="text-xs text-slate-500">总计</span>
      </div>
    </div>

    <div
      v-for="status in STATUS_LIST"
      :key="status"
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit"
      :style="{ borderLeftWidth: '3px', borderLeftColor: STATUS_COLOR_MAP[status] }"
    >
      <component :is="statusIconMap[status]" class="w-4 h-4 shrink-0" :style="{ color: STATUS_COLOR_MAP[status] }" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.stats.byStatus[status] || 0 }}</span>
        <span class="text-xs text-slate-500">{{ status }}</span>
      </div>
    </div>

    <div class="w-px h-8 bg-slate-200 mx-1" />

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit"
      style="border-left: 3px solid #22C55E"
    >
      <Handshake class="w-4 h-4 shrink-0 text-green-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.stats.handoverStats.received }}</span>
        <span class="text-xs text-slate-500">已交接</span>
      </div>
    </div>

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit"
      style="border-left: 3px solid #F59E0B"
    >
      <ClipboardList class="w-4 h-4 shrink-0 text-amber-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.stats.handoverStats.notReceived }}</span>
        <span class="text-xs text-slate-500">待交接</span>
      </div>
    </div>

    <div class="w-px h-8 bg-slate-200 mx-1" />

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit"
      style="border-left: 3px solid #3B82F6"
    >
      <CalendarClock class="w-4 h-4 shrink-0 text-blue-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.stats.pickupStats.appointed }}</span>
        <span class="text-xs text-slate-500">已预约</span>
      </div>
    </div>

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit"
      :style="{ borderLeftWidth: '3px', borderLeftColor: PICKUP_STATUS_COLOR_MAP['已逾期'] }"
    >
      <AlertTriangle class="w-4 h-4 shrink-0 text-amber-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold" :class="store.stats.pickupStats.overdue > 0 ? 'text-amber-600' : 'text-slate-800'">{{ store.stats.pickupStats.overdue }}</span>
        <span class="text-xs text-slate-500">逾期</span>
      </div>
    </div>

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit"
      style="border-left: 3px solid #8B5CF6"
    >
      <ClipboardCheck class="w-4 h-4 shrink-0 text-violet-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.stats.pickupStats.reissued }}</span>
        <span class="text-xs text-slate-500">已补领</span>
      </div>
    </div>

    <div class="w-px h-8 bg-slate-200 mx-1" />

    <div
      class="flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5 min-w-fit"
      :class="store.issueCount > 0 ? 'border-red-300' : 'border-slate-200'"
    >
      <AlertTriangle class="w-4 h-4 shrink-0" :class="store.issueCount > 0 ? 'text-amber-500' : 'text-slate-400'" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold" :class="store.issueCount > 0 ? 'text-red-600' : 'text-slate-800'">
          {{ store.issueCount }}
        </span>
        <span class="text-xs text-slate-500">异常</span>
      </div>
      <span
        v-if="store.issueCount > 0"
        class="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full leading-none"
      >
        !
      </span>
    </div>
  </div>
</template>
