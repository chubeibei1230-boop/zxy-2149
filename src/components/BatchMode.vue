<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBadgeStore } from '@/composables/useBadgeStore'
import { COLOR_MAP, STATUS_COLOR_MAP, STATUS_LIST } from '@/types'
import type { BadgeRecord, BadgeStatus } from '@/types'
import { Package, CheckCircle, AlertTriangle, Users, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-vue-next'

const emit = defineEmits<{
  back: []
}>()

const store = useBadgeStore()

const activeBatch = ref<string | null>(null)

const batchRecords = computed(() => {
  if (!activeBatch.value) return []
  return store.records.filter((r) => r.printBatch === activeBatch.value)
})

const batchStats = computed(() => {
  if (!activeBatch.value) return null
  return store.getBatchStats(activeBatch.value)
})

const batchPersonDistMax = computed(() => {
  if (!batchStats.value) return 1
  const vals = Object.values(batchStats.value.personDist)
  return vals.length > 0 ? Math.max(...vals) : 1
})

const batchSelectedIds = computed(() => {
  return new Set(batchRecords.value.filter((r) => store.selectedIds.has(r.id)).map((r) => r.id))
})

const batchSelectedCount = computed(() => batchSelectedIds.value.size)

const batchAllSelected = computed(() => {
  return batchRecords.value.length > 0 && batchSelectedIds.value.size === batchRecords.value.length
})

const expandedPersonDist = ref(true)

function selectBatch(batch: string) {
  activeBatch.value = batch
}

function toggleBatchSelect(id: string) {
  store.toggleSelect(id)
}

function toggleBatchSelectAll() {
  if (batchAllSelected.value) {
    for (const r of batchRecords.value) {
      store.selectedIds.delete(r.id)
    }
  } else {
    for (const r of batchRecords.value) {
      store.selectedIds.add(r.id)
    }
  }
}

function handleBatchStatusUpdate(status: BadgeStatus) {
  store.batchUpdateStatus(Array.from(batchSelectedIds.value), status)
}

function handleBatchDelete() {
  store.deleteRecords(Array.from(batchSelectedIds.value))
}

function getBatchCount(batch: string) {
  return store.records.filter((r) => r.printBatch === batch).length
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white shrink-0">
      <button
        class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
        @click="emit('back')"
      >
        <ArrowLeft class="w-4 h-4" />
        返回普通模式
      </button>
      <h2 class="text-base font-semibold text-slate-800">批量生产模式</h2>
    </div>

    <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0">
      <Package class="w-4 h-4 text-primary-600 shrink-0" />
      <span class="text-xs font-medium text-slate-500 shrink-0">批次：</span>
      <button
        v-for="batch in store.allBatches"
        :key="batch"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0"
        :class="activeBatch === batch
          ? 'bg-primary-600 text-white'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'"
        @click="selectBatch(batch)"
      >
        {{ batch }}
        <span
          class="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded text-xs font-semibold"
          :class="activeBatch === batch ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
        >
          {{ getBatchCount(batch) }}
        </span>
      </button>
      <span v-if="store.allBatches.length === 0" class="text-xs text-slate-400">暂无批次数据</span>
    </div>

    <div v-if="activeBatch && batchStats" class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Package class="w-4 h-4 text-primary-600" />
            {{ activeBatch }} 批次统计
          </h3>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-slate-50 rounded-lg px-3 py-2.5 flex flex-col">
              <span class="text-xs text-slate-500">总计</span>
              <span class="text-lg font-bold text-slate-800">{{ batchStats.total }}</span>
            </div>
            <div class="bg-slate-50 rounded-lg px-3 py-2.5 flex flex-col">
              <span class="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3 text-green-500" />
                已领取
              </span>
              <span class="text-lg font-bold text-green-600">{{ batchStats.collected }}</span>
            </div>
            <div class="bg-slate-50 rounded-lg px-3 py-2.5 flex flex-col">
              <span class="text-xs text-slate-500 flex items-center gap-1">
                <AlertTriangle class="w-3 h-3 text-red-500" />
                需重做
              </span>
              <span class="text-lg font-bold text-red-600">{{ batchStats.redo }}</span>
            </div>
            <div class="bg-slate-50 rounded-lg px-3 py-2.5 flex flex-col">
              <span class="text-xs text-slate-500">完成率</span>
              <span class="text-lg font-bold text-primary-600">{{ batchStats.completionRate }}%</span>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-medium text-slate-500">完成进度</span>
              <span class="text-xs text-slate-400">{{ batchStats.collected }} / {{ batchStats.total }}</span>
            </div>
            <div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-600 rounded-full transition-all duration-300"
                :style="{ width: batchStats.completionRate + '%' }"
              />
            </div>
          </div>

          <div>
            <button
              class="w-full flex items-center gap-2 text-left"
              @click="expandedPersonDist = !expandedPersonDist"
            >
              <Users class="w-4 h-4 text-slate-400" />
              <span class="text-xs font-medium text-slate-500">负责人分布</span>
              <ChevronDown v-if="expandedPersonDist" class="w-3.5 h-3.5 text-slate-400 ml-auto" />
              <ChevronRight v-else class="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>
            <div v-show="expandedPersonDist" class="mt-2 space-y-2">
              <div
                v-for="(count, person) in batchStats.personDist"
                :key="person"
                class="flex items-center gap-2"
              >
                <span class="text-xs text-slate-600 w-16 truncate shrink-0">{{ person }}</span>
                <div class="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                  <div
                    class="h-full bg-primary-400 rounded transition-all duration-300"
                    :style="{ width: (count / batchPersonDistMax * 100) + '%' }"
                  />
                </div>
                <span class="text-xs font-medium text-slate-500 w-8 text-right shrink-0">{{ count }}</span>
              </div>
              <div v-if="Object.keys(batchStats.personDist).length === 0" class="text-xs text-slate-400">
                暂无负责人数据
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                :checked="batchAllSelected"
                class="peer sr-only"
                @change="toggleBatchSelectAll"
              />
              <div
                class="w-4 h-4 rounded border border-slate-300 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors flex items-center justify-center"
              >
                <svg
                  v-if="batchAllSelected"
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
            <span class="text-xs text-slate-500">全选</span>
            <span class="text-xs text-slate-400 ml-auto">共 {{ batchRecords.length }} 条记录</span>
          </div>

          <div class="divide-y divide-slate-100 max-h-[40vh] overflow-y-auto">
            <div
              v-for="record in batchRecords"
              :key="record.id"
              class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <label class="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  :checked="store.selectedIds.has(record.id)"
                  class="peer sr-only"
                  @change="toggleBatchSelect(record.id)"
                />
                <div
                  class="w-4 h-4 rounded border border-slate-300 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors flex items-center justify-center"
                >
                  <svg
                    v-if="store.selectedIds.has(record.id)"
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

              <span class="text-sm font-medium text-slate-800 w-20 truncate">{{ record.name }}</span>
              <span class="text-xs text-slate-500 w-24 truncate hidden sm:block">{{ record.company }}</span>
              <span class="text-xs text-slate-500 w-16 truncate hidden md:block">{{ record.attendeeType }}</span>

              <span class="inline-flex items-center gap-1 shrink-0">
                <span
                  class="w-2 h-2 rounded-full inline-block"
                  :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
                />
                <span class="text-xs text-slate-500 hidden sm:inline">{{ record.badgeColor }}</span>
              </span>

              <span
                class="inline-flex items-center text-xs text-white rounded px-1.5 py-0.5 shrink-0"
                :style="{ backgroundColor: STATUS_COLOR_MAP[record.status] }"
              >
                {{ record.status }}
              </span>

              <span class="text-xs text-slate-500 w-16 truncate text-right ml-auto shrink-0">
                {{ record.responsiblePerson || '-' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!activeBatch && store.allBatches.length > 0" class="flex-1 flex items-center justify-center">
      <div class="text-center text-slate-400">
        <Package class="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p class="text-sm">请选择一个批次查看详情</p>
      </div>
    </div>

    <div v-if="store.allBatches.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center text-slate-400">
        <Package class="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p class="text-sm">暂无批次数据</p>
        <p class="text-xs mt-1">请先为记录分配打印批次</p>
      </div>
    </div>

    <div
      v-if="activeBatch && batchSelectedCount > 0"
      class="flex items-center gap-3 px-4 py-3 bg-white border-t border-slate-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] shrink-0 overflow-x-auto"
    >
      <span class="text-xs text-slate-500 whitespace-nowrap">
        已选 <span class="font-semibold text-primary-600">{{ batchSelectedCount }}</span> 项
      </span>

      <div class="h-5 w-px bg-slate-200 shrink-0" />

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500 whitespace-nowrap">批量设置状态：</span>
        <button
          v-for="status in STATUS_LIST"
          :key="status"
          class="inline-flex items-center text-xs text-white rounded px-2 py-1 transition-opacity hover:opacity-80 whitespace-nowrap"
          :style="{ backgroundColor: STATUS_COLOR_MAP[status] }"
          @click="handleBatchStatusUpdate(status)"
        >
          {{ status }}
        </button>
      </div>

      <div class="h-5 w-px bg-slate-200 shrink-0" />

      <button
        class="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors whitespace-nowrap"
        @click="handleBatchDelete"
      >
        删除选中
      </button>

      <button
        class="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto whitespace-nowrap"
        @click="() => { for (const r of batchRecords) store.selectedIds.delete(r.id) }"
      >
        取消选择
      </button>
    </div>
  </div>
</template>
