<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  X,
  User,
  Clock,
  FileText,
  AlertTriangle,
  AlertCircle,
  GitBranch,
  UserPlus,
  CheckCircle,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  Calendar,
} from 'lucide-vue-next'
import {
  EXCEPTION_TYPE_LABEL_MAP,
  EXCEPTION_TYPE_COLOR_MAP,
  EXCEPTION_STATUS_LABEL_MAP,
  EXCEPTION_STATUS_COLOR_MAP,
  STATUS_COLOR_MAP,
} from '@/types'
import type { ExceptionRecord, BadgeRecord } from '@/types'
import { useBadgeStore } from '@/composables/useBadgeStore'

const props = defineProps<{
  visible: boolean
  exceptionId: string | null
}>()

const emit = defineEmits<{
  close: []
  'view-record': [recordId: string]
}>()

const store = useBadgeStore()

const exception = computed<ExceptionRecord | undefined>(() => {
  if (!props.exceptionId) return undefined
  return store.getExceptionById(props.exceptionId)
})

const relatedRecord = computed<BadgeRecord | undefined>(() => {
  if (!exception.value) return undefined
  return store.getRelatedRecord(exception.value)
})

const activeTab = ref<'info' | 'traces'>('info')
const assignForm = ref({ assignee: '', note: '' })
const resolveForm = ref({ resolutionNote: '' })
const reopenForm = ref({ note: '' })
const noteForm = ref({ note: '' })
const showAssignForm = ref(false)
const showResolveForm = ref(false)
const showReopenForm = ref(false)
const showNoteForm = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    showAssignForm.value = false
    showResolveForm.value = false
    showReopenForm.value = false
    showNoteForm.value = false
    assignForm.value = { assignee: '', note: '' }
    resolveForm.value = { resolutionNote: '' }
    reopenForm.value = { note: '' }
    noteForm.value = { note: '' }
    activeTab.value = 'info'
  }
})

function handleClose() {
  emit('close')
}

function handleViewRecord() {
  if (exception.value?.relatedRecordId) {
    emit('view-record', exception.value.relatedRecordId)
  }
}

function handleAssign() {
  if (!exception.value || !assignForm.value.assignee.trim()) return
  store.assignException(
    exception.value.id,
    assignForm.value.assignee.trim(),
    assignForm.value.note.trim(),
  )
  showAssignForm.value = false
  assignForm.value = { assignee: '', note: '' }
}

function handleResolve() {
  if (!exception.value || !resolveForm.value.resolutionNote.trim()) return
  store.resolveException(
    exception.value.id,
    resolveForm.value.resolutionNote.trim(),
  )
  showResolveForm.value = false
  resolveForm.value = { resolutionNote: '' }
}

function handleReopen() {
  if (!exception.value || !reopenForm.value.note.trim()) return
  store.reopenException(
    exception.value.id,
    reopenForm.value.note.trim(),
  )
  showReopenForm.value = false
  reopenForm.value = { note: '' }
}

function handleUpdateNote() {
  if (!exception.value || !noteForm.value.note.trim()) return
  store.updateExceptionNote(
    exception.value.id,
    noteForm.value.note.trim(),
  )
  showNoteForm.value = false
  noteForm.value = { note: '' }
}

const actionTraceLabels: Record<string, string> = {
  'create': '创建异常',
  'assign': '指派处理人',
  'update_note': '更新说明',
  'resolve': '标记解决',
  'reopen': '重新打开',
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && exception" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-500" />
            <h2 class="text-lg font-semibold text-slate-800">异常详情</h2>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div class="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <span
            class="inline-flex items-center gap-1 text-xs text-white rounded px-2 py-1 font-medium"
            :style="{ backgroundColor: EXCEPTION_TYPE_COLOR_MAP[exception.type] }"
          >
            <component :is="exception.severity === 'error' ? AlertCircle : AlertTriangle" class="w-3 h-3" />
            {{ EXCEPTION_TYPE_LABEL_MAP[exception.type] }}
          </span>
          <span
            class="inline-flex items-center text-xs rounded px-2 py-1 font-medium"
            :style="{
              backgroundColor: EXCEPTION_STATUS_COLOR_MAP[exception.status] + '20',
              color: EXCEPTION_STATUS_COLOR_MAP[exception.status],
            }"
          >
            {{ EXCEPTION_STATUS_LABEL_MAP[exception.status] }}
          </span>
          <span
            class="inline-flex items-center text-xs rounded px-2 py-1 font-medium"
            :class="exception.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'"
          >
            {{ exception.severity === 'error' ? '严重' : '警告' }}
          </span>
        </div>

        <div class="flex border-b border-slate-200 shrink-0">
          <button
            class="flex items-center gap-1.5 px-6 py-3 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'info'
              ? 'text-primary-600 border-primary-600'
              : 'text-slate-500 border-transparent hover:text-slate-700'"
            @click="activeTab = 'info'"
          >
            <FileText class="w-4 h-4" />
            基本信息
          </button>
          <button
            class="flex items-center gap-1.5 px-6 py-3 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'traces'
              ? 'text-primary-600 border-primary-600'
              : 'text-slate-500 border-transparent hover:text-slate-700'"
            @click="activeTab = 'traces'"
          >
            <GitBranch class="w-4 h-4" />
            处理轨迹
            <span class="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-xs">{{ exception.traces.length }}</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="activeTab === 'info'" class="p-6 space-y-6">
            <div class="space-y-3">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">异常标题</div>
              <div class="text-base font-medium text-slate-800">{{ exception.title }}</div>
            </div>

            <div class="space-y-3">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">异常描述</div>
              <div class="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">
                {{ exception.description }}
              </div>
            </div>

            <div v-if="relatedRecord" class="space-y-3">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">关联胸卡记录</div>
              <div
                class="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                @click="handleViewRecord"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <User class="w-4 h-4 text-slate-400" />
                    <span class="font-medium text-slate-800">{{ relatedRecord.name }}</span>
                    <span class="text-sm text-slate-500">{{ relatedRecord.company }}</span>
                    <span
                      class="inline-flex items-center text-xs text-white rounded px-1.5 py-0.5"
                      :style="{ backgroundColor: STATUS_COLOR_MAP[relatedRecord.status] }"
                    >
                      {{ relatedRecord.status }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1 text-xs text-primary-600 font-medium">
                    查看详情
                    <ArrowRight class="w-3 h-3" />
                  </div>
                </div>
                <div class="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>参会类型：{{ relatedRecord.attendeeType }}</span>
                  <span>打印批次：{{ relatedRecord.printBatch || '未分配' }}</span>
                  <span>负责人：{{ relatedRecord.responsiblePerson || '未指定' }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar class="w-3.5 h-3.5" />
                  创建时间
                </div>
                <div class="text-sm text-slate-700">{{ store.formatDateTime(exception.createdAt) }}</div>
              </div>
              <div class="space-y-2">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5" />
                  最后更新
                </div>
                <div class="text-sm text-slate-700">{{ store.formatDateTime(exception.updatedAt) }}</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <UserPlus class="w-3.5 h-3.5" />
                  指派处理人
                </div>
                <div class="text-sm text-slate-700">{{ exception.assignee || '未指派' }}</div>
              </div>
              <div class="space-y-2">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User class="w-3.5 h-3.5" />
                  实际处理人
                </div>
                <div class="text-sm text-slate-700">{{ exception.handler || '未处理' }}</div>
              </div>
            </div>

            <div v-if="exception.processingNote" class="space-y-3">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare class="w-3.5 h-3.5" />
                处理说明
              </div>
              <div class="text-sm text-slate-700 bg-blue-50 rounded-lg p-3 border border-blue-200">
                {{ exception.processingNote }}
              </div>
            </div>

            <div v-if="exception.resolutionNote" class="space-y-3">
              <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle class="w-3.5 h-3.5" />
                解决说明
              </div>
              <div class="text-sm text-slate-700 bg-green-50 rounded-lg p-3 border border-green-200">
                {{ exception.resolutionNote }}
              </div>
            </div>

            <div v-if="showAssignForm" class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              <div class="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <UserPlus class="w-4 h-4 text-primary-600" />
                指派处理人
              </div>
              <div class="space-y-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">处理人 *</label>
                  <input
                    v-model="assignForm.assignee"
                    type="text"
                    placeholder="请输入处理人姓名"
                    class="input-field text-sm"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">备注说明</label>
                  <textarea
                    v-model="assignForm.note"
                    placeholder="请输入备注说明（可选）"
                    rows="2"
                    class="input-field text-sm resize-none"
                  />
                </div>
                <div class="flex justify-end gap-2">
                  <button class="btn-secondary text-sm" @click="showAssignForm = false">取消</button>
                  <button
                    class="btn-primary text-sm"
                    :disabled="!assignForm.assignee.trim()"
                    @click="handleAssign"
                  >
                    确认指派
                  </button>
                </div>
              </div>
            </div>

            <div v-if="showResolveForm" class="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
              <div class="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                <CheckCircle class="w-4 h-4" />
                标记已解决
              </div>
              <div class="space-y-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">解决说明 *</label>
                  <textarea
                    v-model="resolveForm.resolutionNote"
                    placeholder="请详细描述解决方案和结果"
                    rows="3"
                    class="input-field text-sm resize-none"
                  />
                </div>
                <div class="flex justify-end gap-2">
                  <button class="btn-secondary text-sm" @click="showResolveForm = false">取消</button>
                  <button
                    class="btn-primary text-sm"
                    :disabled="!resolveForm.resolutionNote.trim()"
                    @click="handleResolve"
                  >
                    确认解决
                  </button>
                </div>
              </div>
            </div>

            <div v-if="showReopenForm" class="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
              <div class="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                <RefreshCw class="w-4 h-4" />
                重新打开
              </div>
              <div class="space-y-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">重新打开原因 *</label>
                  <textarea
                    v-model="reopenForm.note"
                    placeholder="请详细说明重新打开的原因"
                    rows="3"
                    class="input-field text-sm resize-none"
                  />
                </div>
                <div class="flex justify-end gap-2">
                  <button class="btn-secondary text-sm" @click="showReopenForm = false">取消</button>
                  <button
                    class="btn-danger text-sm"
                    :disabled="!reopenForm.note.trim()"
                    @click="handleReopen"
                  >
                    确认重新打开
                  </button>
                </div>
              </div>
            </div>

            <div v-if="showNoteForm" class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div class="text-sm font-semibold text-blue-700 flex items-center gap-1.5">
                <MessageSquare class="w-4 h-4" />
                补充处理说明
              </div>
              <div class="space-y-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-500">处理说明 *</label>
                  <textarea
                    v-model="noteForm.note"
                    placeholder="请输入处理说明，记录当前处理进展或相关信息"
                    rows="3"
                    class="input-field text-sm resize-none"
                  />
                </div>
                <div class="flex justify-end gap-2">
                  <button class="btn-secondary text-sm" @click="showNoteForm = false">取消</button>
                  <button
                    class="btn-primary text-sm"
                    :disabled="!noteForm.note.trim()"
                    @click="handleUpdateNote"
                  >
                    确认保存
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'traces'" class="p-6">
            <div class="relative pl-6 space-y-6">
              <div class="absolute left-[11px] top-1 bottom-1 w-0.5 bg-slate-200" />

              <div
                v-for="trace in [...exception.traces].reverse()"
                :key="trace.id"
                class="relative"
              >
                <div
                  class="absolute -left-[22px] top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                  :style="{
                    backgroundColor: trace.action === 'create' ? '#6366F1'
                      : trace.action === 'assign' ? '#3B82F6'
                      : trace.action === 'resolve' ? '#22C55E'
                      : trace.action === 'reopen' ? '#EF4444'
                      : '#8B5CF6',
                  }"
                >
                  <div class="w-1.5 h-1.5 bg-white rounded-full" />
                </div>

                <div class="rounded-lg border border-slate-200 p-3 bg-white">
                  <div class="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center text-xs rounded px-2 py-0.5 font-medium text-white"
                        :style="{
                          backgroundColor: trace.action === 'create' ? '#6366F1'
                            : trace.action === 'assign' ? '#3B82F6'
                            : trace.action === 'resolve' ? '#22C55E'
                            : trace.action === 'reopen' ? '#EF4444'
                            : '#8B5CF6',
                        }"
                      >
                        {{ actionTraceLabels[trace.action] }}
                      </span>
                      <span v-if="trace.assignee" class="text-xs text-slate-500">
                        指派给：<span class="font-medium text-slate-700">{{ trace.assignee }}</span>
                      </span>
                    </div>
                    <span class="text-xs text-slate-400">{{ store.formatDateTime(trace.operatedAt) }}</span>
                  </div>
                  <div class="text-sm text-slate-700">{{ trace.note }}</div>
                  <div class="mt-2 text-xs text-slate-500">
                    操作人：<span class="font-medium text-slate-700">{{ trace.operator }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <div class="text-xs text-slate-500">
            <span v-if="exception.status === 'resolved'">该异常已解决，如需重新处理请点击"重新打开"</span>
            <span v-else-if="exception.status === 'processing'">处理中，请填写处理说明或标记解决</span>
            <span v-else>请先指派处理人开始处理</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="exception.status !== 'resolved'"
              class="btn-secondary text-sm flex items-center gap-1.5"
              @click="showAssignForm = !showAssignForm; showResolveForm = false; showReopenForm = false; showNoteForm = false"
            >
              <UserPlus class="w-4 h-4" />
              指派处理人
            </button>
            <button
              v-if="exception.status !== 'resolved'"
              class="btn-secondary text-sm flex items-center gap-1.5"
              @click="showNoteForm = !showNoteForm; showAssignForm = false; showResolveForm = false; showReopenForm = false"
            >
              <MessageSquare class="w-4 h-4" />
              补充说明
            </button>
            <button
              v-if="exception.status !== 'resolved'"
              class="btn-primary text-sm flex items-center gap-1.5"
              @click="showResolveForm = !showResolveForm; showAssignForm = false; showReopenForm = false; showNoteForm = false"
            >
              <CheckCircle class="w-4 h-4" />
              标记已解决
            </button>
            <button
              v-if="exception.status === 'resolved'"
              class="btn-danger text-sm flex items-center gap-1.5"
              @click="showReopenForm = !showReopenForm; showAssignForm = false; showResolveForm = false; showNoteForm = false"
            >
              <RefreshCw class="w-4 h-4" />
              重新打开
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
