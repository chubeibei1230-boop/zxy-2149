<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div class="flex items-center gap-2">
            <GitBranch class="w-5 h-5 text-primary-600" />
            <h2 class="text-lg font-semibold text-slate-800">进度追踪详情</h2>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div v-if="record" class="overflow-y-auto flex-1">
          <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-2">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <User class="w-4 h-4 text-slate-500" />
                <span class="font-semibold text-slate-800">{{ record.name }}</span>
              </div>
              <span class="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
                <Building2 class="w-3 h-3" />
                {{ record.company || '-' }}
              </span>
              <span class="inline-flex items-center gap-1 text-xs text-white rounded px-1.5 py-0.5" :style="{ backgroundColor: STATUS_COLOR_MAP[record.status] }">
                {{ record.status }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span>参会类型：{{ record.attendeeType }}</span>
              <span>打印批次：{{ record.printBatch || '未分配' }}</span>
              <span>负责人：{{ record.responsiblePerson || '未指定' }}</span>
            </div>
          </div>

          <div class="px-6 py-4 border-b border-slate-200">
            <div class="text-xs font-medium text-slate-500 mb-3 flex items-center gap-1.5">
              <Workflow class="w-3.5 h-3.5" />
              处理进度节点
            </div>
            <div class="relative">
              <div class="flex items-center justify-between">
                <div
                  v-for="(node, idx) in PROGRESS_NODE_LIST"
                  :key="node"
                  class="flex flex-col items-center relative z-10"
                  :style="{ width: (100 / PROGRESS_NODE_LIST.length) + '%' }"
                >
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm transition-all"
                    :class="nodeProgressMap[node] === 'done'
                      ? 'bg-green-500'
                      : nodeProgressMap[node] === 'current'
                      ? 'bg-primary-500 ring-4 ring-primary-100 scale-110'
                      : 'bg-slate-300'"
                  >
                    <Check v-if="nodeProgressMap[node] === 'done'" class="w-4 h-4" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <span class="text-xs mt-2 text-center" :class="nodeProgressMap[node] !== 'pending' ? 'text-slate-700 font-medium' : 'text-slate-400'">
                    {{ node }}
                  </span>
                  <span v-if="getNodeTime(node)" class="text-xs text-slate-400 mt-0.5">
                    {{ getNodeTime(node) }}
                  </span>
                </div>
              </div>
              <div class="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-0">
                <div
                  class="h-full bg-green-500 transition-all duration-300"
                  :style="{ width: progressPercent + '%' }"
                />
              </div>
            </div>
          </div>

          <div class="px-6 py-4">
            <div class="text-xs font-medium text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5" />
              操作流转记录
            </div>
            <div class="relative pl-6 space-y-4">
              <div class="absolute left-[11px] top-1 bottom-1 w-0.5 bg-slate-200" />

              <div
                v-for="log in sortedLogs"
                :key="log.id"
                class="relative"
              >
                <div
                  class="absolute -left-[22px] top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                  :style="{ backgroundColor: PROGRESS_NODE_COLOR_MAP[log.nodeType] }"
                >
                  <div class="w-1.5 h-1.5 bg-white rounded-full" />
                </div>

                <div
                  class="rounded-lg border p-3 transition-colors"
                  :class="log.nodeType === '需重做'
                    ? 'bg-red-50 border-red-200'
                    : log.reason
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-slate-200'"
                >
                  <div class="flex items-start justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        class="inline-flex items-center text-xs text-white rounded px-1.5 py-0.5 font-medium"
                        :style="{ backgroundColor: PROGRESS_NODE_COLOR_MAP[log.nodeType] }"
                      >
                        {{ log.nodeType }}
                      </span>
                      <span class="text-xs font-medium text-slate-700">{{ log.operationLabel }}</span>
                      <span
                        v-if="log.previousStatus && log.newStatus && log.previousStatus !== log.newStatus"
                        class="inline-flex items-center gap-1 text-xs text-slate-500"
                      >
                        <span class="text-slate-400">{{ log.previousStatus }}</span>
                        <ArrowRight class="w-3 h-3" />
                        <span class="font-medium text-slate-700">{{ log.newStatus }}</span>
                      </span>
                    </div>
                    <span class="text-xs text-slate-400 whitespace-nowrap">
                      {{ formatDateTime(log.operatedAt) }}
                    </span>
                  </div>

                  <div class="mt-2 flex items-center gap-3 text-xs flex-wrap">
                    <div class="flex items-center gap-1 text-slate-500">
                      <User class="w-3 h-3" />
                      <span>操作人：</span>
                      <span class="font-medium text-slate-700">{{ log.operator || '-' }}</span>
                    </div>
                    <div v-if="log.batchId" class="flex items-center gap-1 text-slate-500">
                      <Layers class="w-3 h-3" />
                      <span>批次：</span>
                      <span class="font-medium text-slate-700">{{ log.batchId }}</span>
                    </div>
                    <div v-if="log.handoverInfo" class="flex items-center gap-1 text-slate-500">
                      <Handshake class="w-3 h-3" />
                      <span>领取人：</span>
                      <span class="font-medium text-slate-700">{{ log.handoverInfo.receiverName }}</span>
                      <span class="text-slate-400">（{{ log.handoverInfo.handoverMethod }}）</span>
                    </div>
                    <div v-if="log.appointmentInfo" class="flex items-center gap-1 text-slate-500">
                      <CalendarClock class="w-3 h-3" />
                      <span>预约领取：</span>
                      <span class="font-medium text-slate-700">{{ formatDateTime(log.appointmentInfo.scheduledTime) }}</span>
                      <span class="text-slate-400">（{{ log.appointmentInfo.pickupMethod }}）</span>
                    </div>
                    <div v-if="log.reissueInfo" class="flex items-center gap-1 text-slate-500">
                      <ClipboardCheck class="w-3 h-3" />
                      <span>补领/代领：</span>
                      <span class="font-medium text-slate-700">{{ log.reissueInfo.actualReceiver }}</span>
                      <span class="text-slate-400">（{{ log.reissueInfo.reason }}）</span>
                    </div>
                  </div>

                  <div v-if="log.reason" class="mt-2 flex items-start gap-1.5">
                    <StickyNote class="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                    <span class="text-xs text-amber-700">{{ log.reason }}</span>
                  </div>

                  <div v-if="Object.keys(log.fieldChanges).length > 0" class="mt-2 space-y-1">
                    <div
                      v-for="(change, field) in log.fieldChanges"
                      :key="field"
                      class="flex items-center gap-2 text-xs"
                    >
                      <span class="text-slate-500">{{ field }}：</span>
                      <span
                        v-if="change.old"
                        class="inline-flex items-center gap-0.5 text-red-600 bg-red-50 px-1 rounded line-through"
                      >
                        {{ change.old }}
                      </span>
                      <ArrowRight v-if="change.old && change.new" class="w-3 h-3 text-slate-400" />
                      <span
                        v-if="change.new"
                        class="inline-flex items-center gap-0.5 text-green-600 bg-green-50 px-1 rounded font-medium"
                      >
                        {{ change.new }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
          <button class="btn-secondary" @click="handleClose">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, User, Building2, Workflow, Clock, Check, ArrowRight, StickyNote, Layers, Handshake, GitBranch, CalendarClock, ClipboardCheck } from 'lucide-vue-next'
import { useBadgeStore } from '@/composables/useBadgeStore'
import {
  STATUS_COLOR_MAP,
  PROGRESS_NODE_LIST,
  PROGRESS_NODE_COLOR_MAP,
  PROGRESS_NODE_ORDER,
} from '@/types'
import type { BadgeRecord, ProgressNodeType } from '@/types'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  visible: boolean
  recordId: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useBadgeStore()

const record = computed<BadgeRecord | null>(() => {
  if (!props.recordId) return null
  return store.getRecordById(props.recordId) || null
})

const sortedLogs = computed(() => {
  if (!record.value) return []
  return [...record.value.progressLogs].sort(
    (a, b) => new Date(a.operatedAt).getTime() - new Date(b.operatedAt).getTime(),
  )
})

const visitedNodes = computed(() => {
  const nodes = new Set<ProgressNodeType>(['新增'])
  for (const log of sortedLogs.value) {
    nodes.add(log.nodeType)
  }
  return nodes
})

const nodeProgressMap = computed(() => {
  const map: Record<string, 'done' | 'current' | 'pending'> = {}
  const currentOrder = record.value ? PROGRESS_NODE_ORDER[record.value.currentNode] : 0
  for (const node of PROGRESS_NODE_LIST) {
    const order = PROGRESS_NODE_ORDER[node]
    if (order < currentOrder) {
      map[node] = 'done'
    } else if (order === currentOrder) {
      map[node] = 'current'
    } else {
      map[node] = 'pending'
    }
  }
  return map
})

const progressPercent = computed(() => {
  if (!record.value) return 0
  const currentOrder = PROGRESS_NODE_ORDER[record.value.currentNode]
  const total = PROGRESS_NODE_LIST.length - 1
  return Math.min(100, Math.round((currentOrder / total) * 100))
})

function getNodeTime(node: ProgressNodeType): string | null {
  const log = [...sortedLogs.value].reverse().find((l) => l.nodeType === node)
  if (!log) return null
  const d = new Date(log.operatedAt)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatDateTime(isoStr: string): string {
  return store.formatDateTime(isoStr)
}

function handleClose() {
  emit('close')
}
</script>
