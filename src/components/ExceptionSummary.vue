<script setup lang="ts">
import { useBadgeStore } from '@/composables/useBadgeStore'
import { AlertTriangle, Clock, CheckCircle, RefreshCw, PlusCircle, XCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const store = useBadgeStore()
const router = useRouter()

function goToExceptionPool() {
  router.push('/exceptions')
}
</script>

<template>
  <div class="flex items-center gap-3 overflow-x-auto pb-1">
    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit cursor-pointer hover:shadow-md transition-all"
      @click="goToExceptionPool"
    >
      <AlertTriangle class="w-4 h-4 text-red-500 shrink-0" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.exceptionStats.total }}</span>
        <span class="text-xs text-slate-500">异常总数</span>
      </div>
    </div>

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit cursor-pointer hover:shadow-md transition-all"
      style="border-left: 3px solid #EF4444"
      @click="goToExceptionPool"
    >
      <XCircle class="w-4 h-4 shrink-0 text-red-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-red-600">{{ store.exceptionStats.unresolved }}</span>
        <span class="text-xs text-slate-500">未解决</span>
      </div>
      <span
        v-if="store.exceptionStats.unresolved > 0"
        class="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full leading-none"
      >
        !
      </span>
    </div>

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit cursor-pointer hover:shadow-md transition-all"
      style="border-left: 3px solid #3B82F6"
      @click="goToExceptionPool"
    >
      <PlusCircle class="w-4 h-4 shrink-0 text-blue-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold" :class="store.exceptionStats.todayNew > 0 ? 'text-blue-600' : 'text-slate-800'">
          {{ store.exceptionStats.todayNew }}
        </span>
        <span class="text-xs text-slate-500">今日新增</span>
      </div>
      <span
        v-if="store.exceptionStats.todayNew > 0"
        class="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full leading-none"
      >
        新
      </span>
    </div>

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit cursor-pointer hover:shadow-md transition-all"
      style="border-left: 3px solid #22C55E"
      @click="goToExceptionPool"
    >
      <CheckCircle class="w-4 h-4 shrink-0 text-green-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.exceptionStats.resolved }}</span>
        <span class="text-xs text-slate-500">已解决</span>
      </div>
    </div>

    <div class="w-px h-8 bg-slate-200 mx-1" />

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit cursor-pointer hover:shadow-md transition-all"
      style="border-left: 3px solid #F59E0B"
      @click="goToExceptionPool"
    >
      <Clock class="w-4 h-4 shrink-0 text-amber-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.exceptionStats.pending }}</span>
        <span class="text-xs text-slate-500">待处理</span>
      </div>
    </div>

    <div
      class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-fit cursor-pointer hover:shadow-md transition-all"
      style="border-left: 3px solid #8B5CF6"
      @click="goToExceptionPool"
    >
      <RefreshCw class="w-4 h-4 shrink-0 text-violet-500" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-800">{{ store.exceptionStats.processing }}</span>
        <span class="text-xs text-slate-500">处理中</span>
      </div>
    </div>
  </div>
</template>
