<script setup lang="ts">
import { ref, computed, watch, nextTick, toRefs } from 'vue'
import { useBadgeStore } from '@/composables/useBadgeStore'
import type { BadgeRecord } from '@/types'
import StatsBar from '@/components/StatsBar.vue'
import ExceptionSummary from '@/components/ExceptionSummary.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import CheckPanel from '@/components/CheckPanel.vue'
import BadgeCardGroup from '@/components/BadgeCardGroup.vue'
import RecordFormModal from '@/components/RecordFormModal.vue'
import BatchToolbar from '@/components/BatchToolbar.vue'
import BatchMode from '@/components/BatchMode.vue'
import HandoverModal from '@/components/HandoverModal.vue'
import HandoverDetailModal from '@/components/HandoverDetailModal.vue'
import ProgressDetailModal from '@/components/ProgressDetailModal.vue'
import LedgerPanel from '@/components/LedgerPanel.vue'
import AppointmentModal from '@/components/AppointmentModal.vue'
import ReissueModal from '@/components/ReissueModal.vue'
import AppointmentDetailModal from '@/components/AppointmentDetailModal.vue'
import ExceptionDetailModal from '@/components/ExceptionDetailModal.vue'
import { useRouter } from 'vue-router'
import { Plus, LayoutGrid, Package, Search, Handshake, GitBranch, BookOpen, QrCode, CalendarClock, ClipboardCheck, AlertTriangle } from 'lucide-vue-next'

const router = useRouter()
const store = useBadgeStore()
const { filter } = toRefs(store)

const showForm = ref(false)
const editingRecord = ref<BadgeRecord | null>(null)
const mode = ref<'normal' | 'batch' | 'ledger'>('normal')
const scrollContainer = ref<HTMLElement | null>(null)

const showHandoverModal = ref(false)
const handoverRecordIds = ref<string[]>([])
const handoverDefaultRecord = ref<BadgeRecord | null>(null)

const showHandoverDetail = ref(false)
const handoverDetailId = ref<string | null>(null)

const showProgressDetail = ref(false)
const progressDetailId = ref<string | null>(null)

const showAppointmentModal = ref(false)
const appointmentRecord = ref<BadgeRecord | null>(null)
const showReissueModal = ref(false)
const reissueRecord = ref<BadgeRecord | null>(null)
const showAppointmentDetail = ref(false)
const appointmentDetailRecord = ref<BadgeRecord | null>(null)

const showExceptionDetail = ref(false)
const exceptionDetailId = ref<string | null>(null)

const colorOrder = ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色', '灰色']

const sortedColorGroups = computed(() => {
  const groups = store.groupedByColor
  return colorOrder
    .filter((c) => groups[c] && groups[c].length > 0)
    .map((c) => ({ color: c, records: groups[c] }))
})

watch(() => filter.value.focusRecordIds, (ids) => {
  if (ids.length > 0) {
    nextTick(() => {
      const firstId = ids[0]
      const el = scrollContainer.value?.querySelector(`[data-record-id="${firstId}"]`) as HTMLElement | null
      if (el && scrollContainer.value) {
        const containerTop = scrollContainer.value.scrollTop
        const elementTop = el.offsetTop
        const elementHeight = el.offsetHeight
        const containerHeight = scrollContainer.value.clientHeight
        scrollContainer.value.scrollTo({
          top: elementTop - containerTop - containerHeight / 2 + elementHeight / 2,
          behavior: 'smooth',
        })
      }
    })
    setTimeout(() => {
      filter.value.focusRecordIds = []
    }, 3000)
  }
}, { deep: true })

function handleAdd() {
  editingRecord.value = null
  showForm.value = true
}

function handleEdit(record: BadgeRecord) {
  editingRecord.value = record
  showForm.value = true
}

function handleDelete(id: string) {
  if (confirm('确定删除此记录？')) {
    store.deleteRecord(id)
  }
}

function handleSave(
  data: Omit<BadgeRecord, 'id' | 'createdAt' | 'updatedAt' | 'progressLogs' | 'currentNode'>,
  options?: { reason?: string },
) {
  if (editingRecord.value) {
    const { handover, ...rest } = data
    store.updateRecord(editingRecord.value.id, { ...rest, handover: editingRecord.value.handover } as Partial<BadgeRecord>, options)
  } else {
    store.addRecord(data)
  }
  showForm.value = false
  editingRecord.value = null
}

function handleClose() {
  showForm.value = false
  editingRecord.value = null
}

function handleRegisterHandover(record: BadgeRecord) {
  handoverRecordIds.value = [record.id]
  handoverDefaultRecord.value = record
  showHandoverModal.value = true
}

function handleViewHandover(id: string) {
  handoverDetailId.value = id
  showHandoverDetail.value = true
}

function handleViewProgress(id: string) {
  progressDetailId.value = id
  showProgressDetail.value = true
}

function handleBatchRegisterHandover() {
  if (store.selectedIds.size === 0) return
  handoverRecordIds.value = Array.from(store.selectedIds)
  handoverDefaultRecord.value = null
  showHandoverModal.value = true
}

function handleHandoverSaved() {
  store.clearSelection()
}

function handleHandoverDetailEdit(record: BadgeRecord) {
  handoverRecordIds.value = [record.id]
  handoverDefaultRecord.value = record
  showHandoverModal.value = true
}

function handleRegisterAppointment(record: BadgeRecord) {
  appointmentRecord.value = record
  showAppointmentModal.value = true
}

function handleViewAppointment(record: BadgeRecord) {
  appointmentDetailRecord.value = record
  showAppointmentDetail.value = true
}

function handleCancelAppointment(record: BadgeRecord) {
  if (confirm('确定取消该预约吗？')) {
    store.cancelAppointment(record.id)
    showAppointmentDetail.value = false
    appointmentDetailRecord.value = null
  }
}

function handleMarkOverdue(record: BadgeRecord) {
  store.markOverdue(record.id)
  showAppointmentDetail.value = false
  appointmentDetailRecord.value = null
}

function handleRegisterReissue(record: BadgeRecord) {
  reissueRecord.value = record
  showReissueModal.value = true
}

function handleLedgerViewRecord(id: string) {
  handleViewProgress(id)
}

function handleExceptionViewRecord(recordId: string) {
  handleViewProgress(recordId)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-50">
    <header class="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <LayoutGrid class="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 class="text-base font-semibold text-slate-800">展会胸卡制作清单</h1>
            <p class="text-xs text-slate-400">管理胸卡设计、打印、领取与交接全流程</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="mode === 'normal'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="mode = 'normal'"
          >
            <LayoutGrid class="w-4 h-4" />
            常规模式
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="mode === 'batch'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="mode = 'batch'"
          >
            <Package class="w-4 h-4" />
            批次制作
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="mode === 'ledger'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="mode = 'ledger'"
          >
            <BookOpen class="w-4 h-4" />
            操作台账
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="store.exceptionStats.unresolved > 0
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="router.push('/exceptions')"
          >
            <AlertTriangle class="w-4 h-4" />
            异常处理
            <span
              v-if="store.exceptionStats.unresolved > 0"
              class="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full leading-none"
            >
              {{ store.exceptionStats.unresolved }}
            </span>
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            @click="router.push('/verification')"
          >
            <QrCode class="w-4 h-4" />
            现场核销
          </button>
          <div class="w-px h-6 bg-slate-200 mx-1" />
          <button class="btn-primary flex items-center gap-1.5" @click="handleAdd">
            <Plus class="w-4 h-4" />
            新增胸卡
          </button>
        </div>
      </div>
      <div class="mt-3">
        <StatsBar />
      </div>
      <div class="mt-3" v-if="store.exceptions.length > 0">
        <ExceptionSummary />
      </div>
    </header>

    <BatchMode v-if="mode === 'batch'" @back="mode = 'normal'" />

    <LedgerPanel v-else-if="mode === 'ledger'" @view-record="handleLedgerViewRecord" />

    <div v-else class="flex flex-1 overflow-hidden">
      <FilterPanel />

      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="px-6 pt-4">
          <CheckPanel />
        </div>

        <div ref="scrollContainer" class="flex-1 overflow-y-auto px-6 pb-20">
          <div v-if="store.filteredRecords.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search class="w-12 h-12 mb-3 opacity-40" />
            <p class="text-sm">暂无匹配的胸卡记录</p>
            <p class="text-xs mt-1">尝试调整筛选条件或新增记录</p>
          </div>

          <div v-else class="space-y-4 pt-3">
            <BadgeCardGroup
              v-for="group in sortedColorGroups"
              :key="group.color"
              :color="group.color"
              :records="group.records"
              :selected-ids="store.selectedIds"
              @edit="handleEdit"
              @delete="handleDelete"
              @toggle-select="store.toggleSelect"
              @register-handover="handleRegisterHandover"
              @view-handover="handleViewHandover"
              @view-progress="handleViewProgress"
              @register-appointment="handleRegisterAppointment"
              @view-appointment="handleViewAppointment"
              @register-reissue="handleRegisterReissue"
            />
          </div>
        </div>

        <BatchToolbar @batch-handover="handleBatchRegisterHandover" @batch-mark-received="handleBatchRegisterHandover" />
      </main>
    </div>

    <RecordFormModal
      :visible="showForm"
      :record="editingRecord"
      @close="handleClose"
      @save="handleSave"
    />

    <HandoverModal
      :visible="showHandoverModal"
      :record-ids="handoverRecordIds"
      :default-record="handoverDefaultRecord"
      @close="showHandoverModal = false"
      @saved="handleHandoverSaved"
    />

    <HandoverDetailModal
      :visible="showHandoverDetail"
      :record-id="handoverDetailId"
      @close="showHandoverDetail = false"
      @edit="handleHandoverDetailEdit"
    />

    <ProgressDetailModal
      :visible="showProgressDetail"
      :record-id="progressDetailId"
      @close="showProgressDetail = false"
    />

    <AppointmentModal
      :visible="showAppointmentModal"
      :record="appointmentRecord"
      @close="showAppointmentModal = false"
      @saved="showAppointmentModal = false; appointmentRecord = null"
    />

    <ReissueModal
      :visible="showReissueModal"
      :record="reissueRecord"
      @close="showReissueModal = false"
      @saved="showReissueModal = false; reissueRecord = null"
    />

    <AppointmentDetailModal
      :visible="showAppointmentDetail"
      :record="appointmentDetailRecord"
      @close="showAppointmentDetail = false; appointmentDetailRecord = null"
      @register-appointment="showAppointmentDetail = false; appointmentDetailRecord = null; handleRegisterAppointment($event)"
      @cancel-appointment="handleCancelAppointment"
      @register-reissue="showAppointmentDetail = false; appointmentDetailRecord = null; handleRegisterReissue($event)"
      @mark-overdue="handleMarkOverdue"
    />

    <ExceptionDetailModal
      :visible="showExceptionDetail"
      :exception-id="exceptionDetailId"
      @close="showExceptionDetail = false; exceptionDetailId = null"
      @view-record="handleExceptionViewRecord"
    />
  </div>
</template>
