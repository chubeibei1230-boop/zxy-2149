<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertTriangle,
  Filter,
  Search,
  X,
  Calendar,
  UserPlus,
  User,
  GitBranch,
  ArrowRight,
  Home,
  AlertCircle,
  Clock,
  CheckCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-vue-next'
import { useBadgeStore } from '@/composables/useBadgeStore'
import {
  EXCEPTION_TYPE_LIST,
  EXCEPTION_TYPE_LABEL_MAP,
  EXCEPTION_TYPE_COLOR_MAP,
  EXCEPTION_STATUS_LIST,
  EXCEPTION_STATUS_LABEL_MAP,
  EXCEPTION_STATUS_COLOR_MAP,
} from '@/types'
import type { ExceptionRecord } from '@/types'
import ExceptionSummary from '@/components/ExceptionSummary.vue'
import ExceptionDetailModal from '@/components/ExceptionDetailModal.vue'
import ProgressDetailModal from '@/components/ProgressDetailModal.vue'

const router = useRouter()
const store = useBadgeStore()

const showDetailModal = ref(false)
const selectedExceptionId = ref<string | null>(null)
const showProgressModal = ref(false)
const selectedRecordId = ref<string | null>(null)

const pageSize = 10
const currentPage = ref(1)

const pagedExceptions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return store.filteredExceptions.slice(start, end)
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(store.filteredExceptions.length / pageSize))
})

function handleViewDetail(exception: ExceptionRecord) {
  selectedExceptionId.value = exception.id
  showDetailModal.value = true
}

function handleViewRecord(recordId: string) {
  showDetailModal.value = false
  selectedRecordId.value = recordId
  showProgressModal.value = true
}

function handleQuickAssign(exception: ExceptionRecord) {
  const assignee = prompt('请输入处理人姓名：')
  if (assignee?.trim()) {
    store.assignException(exception.id, assignee.trim())
  }
}

function handleQuickResolve(exception: ExceptionRecord) {
  const note = prompt('请输入解决说明：')
  if (note?.trim()) {
    store.resolveException(exception.id, note.trim())
  }
}

function handleQuickReopen(exception: ExceptionRecord) {
  const note = prompt('请输入重新打开原因：')
  if (note?.trim()) {
    store.reopenException(exception.id, note.trim())
  }
}

function handleDelete(exception: ExceptionRecord) {
  if (confirm(`确定删除该异常记录吗？\n\n${exception.title}`)) {
    store.deleteException(exception.id)
  }
}

function handleSync() {
  store.syncCheckIssuesToExceptions()
}
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-50">
    <header class="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            class="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            @click="router.push('/')"
            title="返回首页"
          >
            <Home class="w-4 h-4" />
          </button>
          <div class="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <AlertTriangle class="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 class="text-base font-semibold text-slate-800">异常件处理闭环</h1>
            <p class="text-xs text-slate-400">统一管理状态异常、信息缺失、重复人员等问题记录</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-secondary flex items-center gap-1.5 text-sm" @click="handleSync">
            <RefreshCw class="w-4 h-4" />
            同步检测
          </button>
          <span class="text-xs text-slate-500">
            共 <span class="font-semibold text-red-600">{{ store.filteredExceptions.length }}</span> 条记录
          </span>
        </div>
      </div>
      <div class="mt-3">
        <ExceptionSummary />
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <div class="w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
        <div class="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Filter class="w-4 h-4" />
          <span>异常筛选</span>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">关键词搜索</label>
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                v-model="store.exceptionFilter.searchTitle"
                type="text"
                placeholder="标题/描述..."
                class="input-field pl-8 text-xs"
              />
              <button
                v-if="store.exceptionFilter.searchTitle"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                @click="store.exceptionFilter.searchTitle = ''"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="h-px bg-slate-100" />

          <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <AlertTriangle class="w-3.5 h-3.5" />
            异常类型
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">异常类型</label>
            <select v-model="store.exceptionFilter.type" class="select-field text-xs">
              <option value="">全部类型</option>
              <option v-for="t in EXCEPTION_TYPE_LIST" :key="t" :value="t">
                {{ EXCEPTION_TYPE_LABEL_MAP[t] }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">严重程度</label>
            <select v-model="store.exceptionFilter.severity" class="select-field text-xs">
              <option value="">全部程度</option>
              <option value="warning">警告</option>
              <option value="error">严重</option>
            </select>
          </div>

          <div class="h-px bg-slate-100" />

          <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <GitBranch class="w-3.5 h-3.5" />
            处理状态
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">处理状态</label>
            <select v-model="store.exceptionFilter.status" class="select-field text-xs">
              <option value="">全部状态</option>
              <option v-for="s in EXCEPTION_STATUS_LIST" :key="s" :value="s">
                {{ EXCEPTION_STATUS_LABEL_MAP[s] }}
              </option>
            </select>
          </div>

          <div class="h-px bg-slate-100" />

          <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <User class="w-3.5 h-3.5" />
            人员筛选
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">指派处理人</label>
            <select v-model="store.exceptionFilter.assignee" class="select-field text-xs">
              <option value="">全部处理人</option>
              <option value="__empty__">未指派</option>
              <option v-for="a in store.allAssignees" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500">实际处理人</label>
            <select v-model="store.exceptionFilter.handler" class="select-field text-xs">
              <option value="">全部处理人</option>
              <option value="__empty__">未处理</option>
              <option v-for="h in store.allExceptionHandlers" :key="h" :value="h">{{ h }}</option>
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
                v-model="store.exceptionFilter.startDate"
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
                v-model="store.exceptionFilter.endDate"
                type="date"
                class="input-field pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        <button class="btn-secondary flex items-center justify-center gap-1.5 mt-auto" @click="store.clearExceptionFilter()">
          <X class="w-3.5 h-3.5" />
          <span>清空筛选</span>
        </button>
      </div>

      <main class="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="pagedExceptions.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
            <AlertTriangle class="w-12 h-12 mb-3 opacity-40" />
            <p class="text-sm">暂无匹配的异常记录</p>
            <p class="text-xs mt-1">尝试调整筛选条件或点击"同步检测"导入新的异常</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="exception in pagedExceptions"
              :key="exception.id"
              class="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      class="inline-flex items-center gap-1 text-xs text-white rounded px-2 py-0.5 font-medium"
                      :style="{ backgroundColor: EXCEPTION_TYPE_COLOR_MAP[exception.type] }"
                    >
                      <component :is="exception.severity === 'error' ? AlertCircle : AlertTriangle" class="w-3 h-3" />
                      {{ EXCEPTION_TYPE_LABEL_MAP[exception.type] }}
                    </span>
                    <span
                      class="inline-flex items-center text-xs rounded px-2 py-0.5 font-medium"
                      :style="{
                        backgroundColor: EXCEPTION_STATUS_COLOR_MAP[exception.status] + '20',
                        color: EXCEPTION_STATUS_COLOR_MAP[exception.status],
                      }"
                    >
                      <component
                        :is="exception.status === 'pending' ? Clock
                          : exception.status === 'processing' ? UserCheck
                          : exception.status === 'resolved' ? CheckCircle
                          : RefreshCw"
                        class="w-3 h-3"
                      />
                      {{ EXCEPTION_STATUS_LABEL_MAP[exception.status] }}
                    </span>
                    <span
                      class="inline-flex items-center text-xs rounded px-2 py-0.5 font-medium"
                      :class="exception.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'"
                    >
                      {{ exception.severity === 'error' ? '严重' : '警告' }}
                    </span>
                  </div>

                  <div class="text-sm font-medium text-slate-800 mb-1">{{ exception.title }}</div>
                  <div class="text-xs text-slate-600 mb-3 line-clamp-2">{{ exception.description }}</div>

                  <div class="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span class="flex items-center gap-1">
                      <Calendar class="w-3 h-3" />
                      {{ store.formatDateTime(exception.createdAt) }}
                    </span>
                    <span v-if="exception.assignee" class="flex items-center gap-1">
                      <UserPlus class="w-3 h-3" />
                      指派：{{ exception.assignee }}
                    </span>
                    <span v-if="exception.handler" class="flex items-center gap-1">
                      <User class="w-3 h-3" />
                      处理：{{ exception.handler }}
                    </span>
                    <span v-if="exception.relatedRecordId" class="flex items-center gap-1 text-primary-600">
                      已关联胸卡记录
                    </span>
                  </div>
                </div>

                <div class="flex flex-col gap-1 shrink-0">
                  <button
                    class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors"
                    @click="handleViewDetail(exception)"
                    title="查看详情"
                  >
                    <GitBranch class="w-4 h-4" />
                  </button>
                  <button
                    v-if="exception.status !== 'resolved'"
                    class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                    @click="handleQuickAssign(exception)"
                    title="指派处理人"
                  >
                    <UserPlus class="w-4 h-4" />
                  </button>
                  <button
                    v-if="exception.status !== 'resolved'"
                    class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-green-600 transition-colors"
                    @click="handleQuickResolve(exception)"
                    title="标记解决"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <button
                    v-if="exception.status === 'resolved'"
                    class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                    @click="handleQuickReopen(exception)"
                    title="重新打开"
                  >
                    <RefreshCw class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                    @click="handleDelete(exception)"
                    title="删除"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div v-if="exception.relatedRecordId" class="mt-3 pt-3 border-t border-slate-100">
                <div
                  class="flex items-center justify-between bg-slate-50 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  @click="handleViewRecord(exception.relatedRecordId)"
                >
                  <div class="flex items-center gap-2">
                    <User class="w-3.5 h-3.5 text-slate-400" />
                    <span class="text-xs text-slate-600">
                      关联胸卡：
                      <span class="font-medium text-slate-800">
                        {{ store.getRecordById(exception.relatedRecordId)?.name || '未知' }}
                      </span>
                      <span v-if="store.getRecordById(exception.relatedRecordId)?.company" class="text-slate-500">
                        · {{ store.getRecordById(exception.relatedRecordId)?.company }}
                      </span>
                    </span>
                  </div>
                  <div class="flex items-center gap-1 text-xs text-primary-600 font-medium">
                    查看进度
                    <ArrowRight class="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="store.filteredExceptions.length > pageSize" class="flex items-center justify-center gap-2 px-6 py-4 border-t border-slate-200 bg-white shrink-0">
          <button
            class="px-3 py-1.5 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          <span class="text-xs text-slate-500">
            第 <span class="font-medium text-slate-700">{{ currentPage }}</span> / {{ totalPages }} 页
          </span>
          <button
            class="px-3 py-1.5 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
        </div>
      </main>
    </div>

    <ExceptionDetailModal
      :visible="showDetailModal"
      :exception-id="selectedExceptionId"
      @close="showDetailModal = false; selectedExceptionId = null"
      @view-record="handleViewRecord"
    />

    <ProgressDetailModal
      :visible="showProgressModal"
      :record-id="selectedRecordId"
      @close="showProgressModal = false; selectedRecordId = null"
    />
  </div>
</template>
