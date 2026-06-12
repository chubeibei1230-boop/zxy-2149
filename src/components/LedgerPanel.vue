<template>
  <div class="flex flex-col h-full">
    <div class="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <BookOpen class="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-slate-800">操作台账</h2>
          <p class="text-xs text-slate-400">追溯每张胸卡的完整处理过程与责任归属</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">
          共 <span class="font-semibold text-indigo-600">{{ store.filteredLedgerLogs.length }}</span> 条记录
        </span>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
        <div class="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Filter class="w-4 h-4" />
          <span>台账筛选</span>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">人员搜索</label>
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                v-model="store.ledgerFilter.searchPerson"
                type="text"
                placeholder="姓名/公司..."
                class="input-field pl-8 text-xs"
              />
              <button
                v-if="store.ledgerFilter.searchPerson"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                @click="store.ledgerFilter.searchPerson = ''"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="h-px bg-slate-100" />

          <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <GitBranch class="w-3.5 h-3.5" />
            进度与操作
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">进度节点</label>
            <select v-model="store.ledgerFilter.progressNode" class="select-field text-xs">
              <option value="">全部节点</option>
              <option v-for="n in PROGRESS_NODE_LIST" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">操作类型</label>
            <select v-model="store.ledgerFilter.operationType" class="select-field text-xs">
              <option value="">全部操作</option>
              <option v-for="(label, key) in OPERATION_TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">变更状态</label>
            <select v-model="store.ledgerFilter.status" class="select-field text-xs">
              <option value="">全部状态</option>
              <option v-for="s in STATUS_LIST" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div class="h-px bg-slate-100" />

          <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Layers class="w-3.5 h-3.5" />
            批次与人员
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">打印批次</label>
            <select v-model="store.ledgerFilter.printBatch" class="select-field text-xs">
              <option value="">全部批次</option>
              <option value="__empty__">未指定批次</option>
              <option v-for="b in store.allBatches" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">操作人</label>
            <select v-model="store.ledgerFilter.operator" class="select-field text-xs">
              <option value="">全部操作人</option>
              <option value="__empty__">未指定</option>
              <option v-for="o in store.allOperators" :key="o" :value="o">{{ o }}</option>
            </select>
          </div>

          <div class="h-px bg-slate-100" />

          <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5" />
            时间范围
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">开始日期</label>
            <div class="relative">
              <Calendar class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                v-model="store.ledgerFilter.startDate"
                type="date"
                class="input-field pl-8 text-xs"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">结束日期</label>
            <div class="relative">
              <Calendar class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                v-model="store.ledgerFilter.endDate"
                type="date"
                class="input-field pl-8 text-xs"
              />
            </div>
          </div>

          <div class="h-px bg-slate-100" />

          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="store.ledgerFilter.onlyException"
              type="checkbox"
              class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span class="text-xs text-slate-600">仅显示异常/有备注记录</span>
          </label>
        </div>

        <button class="btn-secondary flex items-center justify-center gap-1.5 mt-auto" @click="store.clearLedgerFilter()">
          <X class="w-3.5 h-3.5" />
          <span>清空筛选</span>
        </button>
      </div>

      <main class="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="store.filteredLedgerLogs.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
            <BookOpen class="w-12 h-12 mb-3 opacity-40" />
            <p class="text-sm">暂无匹配的台账记录</p>
            <p class="text-xs mt-1">尝试调整筛选条件</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="log in store.filteredLedgerLogs"
              :key="log.id"
              class="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-start justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-2 flex-wrap">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    :style="{ backgroundColor: PROGRESS_NODE_COLOR_MAP[log.nodeType] }"
                  >
                    <span class="text-xs text-white font-semibold">
                      {{ PROGRESS_NODE_ORDER[log.nodeType] + 1 }}
                    </span>
                  </div>
                  <div>
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
                        <span class="text-slate-400 line-through">{{ log.previousStatus }}</span>
                        <ArrowRight class="w-3 h-3" />
                        <span
                          class="font-medium text-white rounded px-1.5 py-0.5"
                          :style="{ backgroundColor: STATUS_COLOR_MAP[log.newStatus] }"
                        >
                          {{ log.newStatus }}
                        </span>
                      </span>
                      <span
                        v-if="log.nodeType === '需重做'"
                        class="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded px-1.5 py-0.5"
                      >
                        <AlertTriangle class="w-3 h-3" />
                        异常
                      </span>
                    </div>
                    <div v-if="getRecordInfo(log.recordId)" class="mt-1 flex items-center gap-3 text-xs flex-wrap">
                      <div class="flex items-center gap-1">
                        <User class="w-3 h-3 text-slate-400" />
                        <span class="font-medium text-slate-700">{{ getRecordInfo(log.recordId)?.name }}</span>
                        <span class="text-slate-400">-</span>
                        <span class="text-slate-500">{{ getRecordInfo(log.recordId)?.company }}</span>
                      </div>
                      <div v-if="getRecordInfo(log.recordId)?.printBatch" class="flex items-center gap-1 text-slate-500">
                        <Layers class="w-3 h-3" />
                        <span>{{ getRecordInfo(log.recordId)?.printBatch }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1 shrink-0">
                  <span class="text-xs text-slate-400 whitespace-nowrap">
                    {{ store.formatDateTime(log.operatedAt) }}
                  </span>
                  <button
                    class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    @click="$emit('view-record', log.recordId)"
                  >
                    <Eye class="w-3 h-3" />
                    查看记录
                  </button>
                </div>
              </div>

              <div class="mt-2 flex items-center gap-3 text-xs flex-wrap border-t border-slate-100 pt-2">
                <div class="flex items-center gap-1 text-slate-500">
                  <UserCheck class="w-3 h-3" />
                  <span>操作人：</span>
                  <span class="font-medium text-slate-700">{{ log.operator || '-' }}</span>
                </div>
                <div v-if="log.batchId" class="flex items-center gap-1 text-slate-500">
                  <Layers class="w-3 h-3" />
                  <span>关联批次：</span>
                  <span class="font-medium text-slate-700">{{ log.batchId }}</span>
                </div>
                <div v-if="log.handoverInfo" class="flex items-center gap-1 text-slate-500">
                  <Handshake class="w-3 h-3" />
                  <span>领取人：</span>
                  <span class="font-medium text-green-700">{{ log.handoverInfo.receiverName }}</span>
                  <span class="text-slate-400">（{{ log.handoverInfo.handoverMethod }}）</span>
                </div>
              </div>

              <div v-if="log.reason" class="mt-2 flex items-start gap-1.5 bg-amber-50 rounded p-2 border border-amber-100">
                <StickyNote class="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                <span class="text-xs text-amber-700">{{ log.reason }}</span>
              </div>

              <div v-if="Object.keys(log.fieldChanges).length > 0" class="mt-2 space-y-1">
                <div
                  v-for="(change, field) in log.fieldChanges"
                  :key="field"
                  class="flex items-center gap-2 text-xs"
                >
                  <span class="text-slate-500 w-16 shrink-0">{{ field }}：</span>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      v-if="change.old"
                      class="inline-flex items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded line-through"
                    >
                      {{ change.old }}
                    </span>
                    <ArrowRight v-if="change.old && change.new" class="w-3 h-3 text-slate-400 shrink-0" />
                    <span
                      v-if="change.new"
                      class="inline-flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium"
                    >
                      {{ change.new }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Filter,
  Search,
  X,
  Calendar,
  Layers,
  BookOpen,
  ArrowRight,
  User,
  UserCheck,
  Handshake,
  AlertTriangle,
  StickyNote,
  Eye,
  GitBranch,
} from 'lucide-vue-next'
import { useBadgeStore } from '@/composables/useBadgeStore'
import {
  PROGRESS_NODE_LIST,
  PROGRESS_NODE_COLOR_MAP,
  PROGRESS_NODE_ORDER,
  OPERATION_TYPE_LABELS,
  STATUS_LIST,
  STATUS_COLOR_MAP,
} from '@/types'
import type { BadgeRecord } from '@/types'

const store = useBadgeStore()

defineEmits<{
  'view-record': [id: string]
}>()

function getRecordInfo(id: string): BadgeRecord | undefined {
  return store.getRecordById(id)
}
</script>
