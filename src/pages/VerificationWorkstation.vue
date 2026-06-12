<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useBadgeStore } from '@/composables/useBadgeStore'
import type { BadgeRecord, HandoverInfo, BadgeStatus } from '@/types'
import {
  Search,
  User,
  Building2,
  Layers,
  Tag,
  Clock,
  Handshake,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  QrCode,
  Zap,
  History,
  FileText,
  RefreshCw,
  CalendarClock,
  ClipboardCheck,
} from 'lucide-vue-next'
import {
  COLOR_MAP,
  STATUS_COLOR_MAP,
  COLOR_LIST,
  PROGRESS_NODE_ORDER,
  PROGRESS_NODE_LIST,
  PICKUP_STATUS_COLOR_MAP,
} from '@/types'
import VerificationModal from '@/components/VerificationModal.vue'
import ProgressDetailModal from '@/components/ProgressDetailModal.vue'
import AppointmentModal from '@/components/AppointmentModal.vue'
import ReissueModal from '@/components/ReissueModal.vue'
import AppointmentDetailModal from '@/components/AppointmentDetailModal.vue'

const store = useBadgeStore()

const searchForm = reactive({
  name: '',
  company: '',
  printBatch: '',
  badgeColor: '',
})

const showVerificationModal = ref(false)
const selectedRecord = ref<BadgeRecord | null>(null)
const showProgressDetail = ref(false)
const progressDetailId = ref<string | null>(null)

const showAppointmentModal = ref(false)
const appointmentRecord = ref<BadgeRecord | null>(null)
const showReissueModal = ref(false)
const reissueRecord = ref<BadgeRecord | null>(null)
const showAppointmentDetail = ref(false)
const appointmentDetailRecord = ref<BadgeRecord | null>(null)

const searchResults = computed(() => {
  const hasSearch = searchForm.name || searchForm.company || searchForm.printBatch || searchForm.badgeColor
  if (!hasSearch) {
    return store.records
      .filter((r) => r.status === '待领取')
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const results = store.records.filter((r) => {
    if (searchForm.name && !r.name.toLowerCase().includes(searchForm.name.toLowerCase())) {
      return false
    }
    if (searchForm.company && !r.company.toLowerCase().includes(searchForm.company.toLowerCase())) {
      return false
    }
    if (searchForm.printBatch && r.printBatch !== searchForm.printBatch) {
      return false
    }
    if (searchForm.badgeColor && r.badgeColor !== searchForm.badgeColor) {
      return false
    }
    return true
  })

  return results.sort((a, b) => {
    const pickupPriority: Record<string, number> = {
      '已预约': 0,
      '已逾期': 1,
      '已补领': 2,
      '未预约': 3,
      '已领取': 4,
    }
    const statusPriority: Record<BadgeStatus, number> = {
      '待领取': 0,
      '已领取': 1,
      '需重做': 2,
      '待打印': 3,
      '待设计': 4,
    }
    const prioA = statusPriority[a.status] ?? 5
    const prioB = statusPriority[b.status] ?? 5
    if (prioA !== prioB) return prioA - prioB
    const pickA = pickupPriority[a.pickupStatus] ?? 5
    const pickB = pickupPriority[b.pickupStatus] ?? 5
    if (pickA !== pickB) return pickA - pickB
    return a.name.localeCompare(b.name)
  })
})

const quickStats = computed(() => {
  const pending = store.records.filter((r) => r.status === '待领取').length
  const collected = store.records.filter((r) => r.status === '已领取').length
  const redo = store.records.filter((r) => r.status === '需重做').length
  const total = store.records.length
  return { pending, collected, redo, total }
})

function clearSearch() {
  searchForm.name = ''
  searchForm.company = ''
  searchForm.printBatch = ''
  searchForm.badgeColor = ''
}

function getStatusIcon(status: BadgeStatus) {
  switch (status) {
    case '已领取':
      return CheckCircle
    case '需重做':
      return XCircle
    case '待领取':
      return Clock
    default:
      return Clock
  }
}

function getRecordAlert(record: BadgeRecord) {
  const alerts: { type: 'error' | 'warning' | 'success'; message: string }[] = []

  if (record.status === '已领取') {
    alerts.push({
      type: 'success',
      message: record.handover
        ? `已由 ${record.handover.receiverName} 于 ${store.formatDateTime(record.handover.receivedAt)} 领取`
        : '状态异常：已领取但无交接信息',
    })
  }

  if (record.status === '需重做') {
    const redoLog = [...record.progressLogs]
      .sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime())
      .find((l) => l.nodeType === '需重做')
    alerts.push({
      type: 'error',
      message: `需重做：${redoLog?.reason || '信息有误，需重新制作'}`,
    })
  }

  if (record.status === '待领取' && !record.printBatch) {
    alerts.push({
      type: 'warning',
      message: '信息不完整：未分配打印批次',
    })
  }

  if (record.status === '待领取' && !record.responsiblePerson) {
    alerts.push({
      type: 'warning',
      message: '信息不完整：未指定负责人',
    })
  }

  if (record.status !== '已领取' && record.handover) {
    alerts.push({
      type: 'warning',
      message: '状态异常：未领取但已填写交接信息',
    })
  }

  if (record.status === '已领取' && !record.handover) {
    alerts.push({
      type: 'error',
      message: '状态异常：已领取但缺少交接信息',
    })
  }

  return alerts
}

function getLatestSummary(record: BadgeRecord) {
  const logs = [...record.progressLogs].sort(
    (a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime(),
  )
  if (logs.length === 0) return '暂无处理记录'
  const latest = logs[0]
  return `${latest.operator} · ${store.formatDateTime(latest.operatedAt)} · ${latest.operationLabel}${latest.reason ? ' · ' + latest.reason : ''}`
}

function handleVerify(record: BadgeRecord) {
  if (record.status !== '待领取') {
    return
  }
  selectedRecord.value = record
  showVerificationModal.value = true
}

function handleVerificationSaved() {
  selectedRecord.value = null
  clearSearch()
}

function handleViewProgress(id: string) {
  progressDetailId.value = id
  showProgressDetail.value = true
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
    appointmentDetailRecord.value = null
    showAppointmentDetail.value = false
  }
}

function handleMarkOverdue(record: BadgeRecord) {
  store.markOverdue(record.id)
  appointmentDetailRecord.value = null
  showAppointmentDetail.value = false
}

function handleRegisterReissue(record: BadgeRecord) {
  reissueRecord.value = record
  showReissueModal.value = true
}

function goBack() {
  window.history.back()
}
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-50">
    <header class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 shrink-0 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            @click="goBack"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <QrCode class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-lg font-bold">展会现场领取核销工作台</h1>
            <p class="text-xs text-emerald-100">快速搜索、一键核销、实时同步</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ quickStats.pending }}</div>
              <div class="text-xs text-emerald-100">待领取</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ quickStats.collected }}</div>
              <div class="text-xs text-emerald-100">已领取</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ quickStats.redo }}</div>
              <div class="text-xs text-emerald-100">需重做</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ quickStats.total }}</div>
              <div class="text-xs text-emerald-100">总记录</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2 flex-1 min-w-[200px]">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="searchForm.name"
              type="text"
              placeholder="输入姓名快速搜索..."
              class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              @keyup.enter="() => {}"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Building2 class="w-4 h-4 text-slate-400" />
          <input
            v-model="searchForm.company"
            type="text"
            placeholder="公司名称"
            class="w-40 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>

        <div class="flex items-center gap-2">
          <Layers class="w-4 h-4 text-slate-400" />
          <select
            v-model="searchForm.printBatch"
            class="w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="">全部批次</option>
            <option v-for="batch in store.allBatches" :key="batch" :value="batch">
              {{ batch }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <Tag class="w-4 h-4 text-slate-400" />
          <select
            v-model="searchForm.badgeColor"
            class="w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="">全部颜色</option>
            <option v-for="color in COLOR_LIST" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
        </div>

        <button
          class="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-1.5"
          @click="clearSearch"
        >
          <RefreshCw class="w-4 h-4" />
          重置
        </button>
      </div>

      <div class="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span class="flex items-center gap-1">
          <Zap class="w-3.5 h-3.5 text-emerald-500" />
          共找到 <span class="font-semibold text-slate-700">{{ searchResults.length }}</span> 条记录
        </span>
        <span v-if="searchResults.filter(r => r.status === '待领取').length > 0" class="flex items-center gap-1">
          <Clock class="w-3.5 h-3.5 text-blue-500" />
          其中待领取 <span class="font-semibold text-blue-600">{{ searchResults.filter(r => r.status === '待领取').length }}</span> 条
        </span>
        <span v-if="searchResults.filter(r => r.status === '已领取').length > 0" class="flex items-center gap-1">
          <CheckCircle class="w-3.5 h-3.5 text-green-500" />
          已领取 <span class="font-semibold text-green-600">{{ searchResults.filter(r => r.status === '已领取').length }}</span> 条
        </span>
        <span v-if="searchResults.filter(r => r.status === '需重做').length > 0" class="flex items-center gap-1">
          <XCircle class="w-3.5 h-3.5 text-red-500" />
          需重做 <span class="font-semibold text-red-600">{{ searchResults.filter(r => r.status === '需重做').length }}</span> 条
        </span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="searchResults.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
        <Search class="w-16 h-16 mb-4 opacity-30" />
        <p class="text-base font-medium">未找到匹配的记录</p>
        <p class="text-sm mt-1">请调整搜索条件或检查录入信息</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="record in searchResults"
          :key="record.id"
          class="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden"
          :class="{
            'border-emerald-300 bg-emerald-50/30': record.status === '已领取',
            'border-red-300 bg-red-50/30': record.status === '需重做',
            'border-blue-300': record.status === '待领取',
            'border-slate-200': !['已领取', '需重做', '待领取'].includes(record.status),
          }"
        >
          <div class="flex items-stretch">
            <div
              class="w-1.5 shrink-0"
              :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
            />

            <div class="flex-1 p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                      :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
                    >
                      {{ record.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-lg font-semibold text-slate-800">{{ record.name }}</span>
                        <span
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          :style="{
                            backgroundColor: STATUS_COLOR_MAP[record.status] + '20',
                            color: STATUS_COLOR_MAP[record.status],
                          }"
                        >
                          <component :is="getStatusIcon(record.status)" class="w-3 h-3" />
                          {{ record.status }}
                        </span>
                        <span
                          v-if="record.pickupStatus !== '未预约' && record.pickupStatus !== '已领取'"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          :style="{ backgroundColor: PICKUP_STATUS_COLOR_MAP[record.pickupStatus] }"
                        >
                          <CalendarClock v-if="record.pickupStatus === '已预约'" class="w-3 h-3" />
                          <AlertTriangle v-else-if="record.pickupStatus === '已逾期'" class="w-3 h-3" />
                          <ClipboardCheck v-else-if="record.pickupStatus === '已补领'" class="w-3 h-3" />
                          {{ record.pickupStatus }}
                        </span>
                        <span
                          class="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5"
                        >
                          <span
                            class="w-2 h-2 rounded-full inline-block"
                            :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
                          />
                          {{ record.badgeColor }}
                        </span>
                      </div>
                      <div class="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span class="flex items-center gap-1">
                          <Building2 class="w-3.5 h-3.5" />
                          {{ record.company }}
                        </span>
                        <span class="flex items-center gap-1">
                          <Tag class="w-3.5 h-3.5" />
                          {{ record.attendeeType }}
                        </span>
                        <span class="flex items-center gap-1">
                          <Layers class="w-3.5 h-3.5" />
                          {{ record.printBatch || '未分配' }}
                        </span>
                        <span v-if="record.responsiblePerson" class="flex items-center gap-1">
                          <User class="w-3.5 h-3.5" />
                          负责人：{{ record.responsiblePerson }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 pl-15">
                    <div v-for="(alert, idx) in getRecordAlert(record)" :key="idx" class="mb-2">
                      <div
                        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                        :class="{
                          'bg-red-50 text-red-700 border border-red-200': alert.type === 'error',
                          'bg-amber-50 text-amber-700 border border-amber-200': alert.type === 'warning',
                          'bg-green-50 text-green-700 border border-green-200': alert.type === 'success',
                        }"
                      >
                        <AlertTriangle v-if="alert.type === 'error' || alert.type === 'warning'" class="w-4 h-4 shrink-0" />
                        <CheckCircle v-else class="w-4 h-4 shrink-0" />
                        <span>{{ alert.message }}</span>
                      </div>
                    </div>

                    <div v-if="record.handover" class="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      <Handshake class="w-4 h-4 shrink-0" />
                      <span>
                        交接信息：{{ record.handover.receiverName }} · {{ record.handover.handoverMethod }} · 经办人：{{ record.handover.handler }}
                        <span v-if="record.handover.handoverNotes"> · 备注：{{ record.handover.handoverNotes }}</span>
                      </span>
                    </div>

                    <div v-if="record.appointment && !record.handover" class="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      <CalendarClock class="w-4 h-4 shrink-0" />
                      <span>
                        预约领取：{{ store.formatDateTime(record.appointment.scheduledTime) }} · {{ record.appointment.pickupMethod }}
                        <span v-if="record.appointment.contactInfo"> · 联系方式：{{ record.appointment.contactInfo }}</span>
                      </span>
                      <button
                        class="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                        @click="handleViewAppointment(record)"
                      >
                        查看详情
                      </button>
                    </div>

                    <div v-if="record.reissue" class="mt-2 flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg text-sm text-violet-700">
                      <ClipboardCheck class="w-4 h-4 shrink-0" />
                      <span>
                        已补领登记：{{ record.reissue.actualReceiver }} · {{ record.reissue.reason }}
                      </span>
                    </div>

                    <div class="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <History class="w-3.5 h-3.5" />
                      <span class="truncate">最新处理：{{ getLatestSummary(record) }}</span>
                      <button
                        class="ml-2 text-emerald-600 hover:text-emerald-700 font-medium shrink-0"
                        @click="handleViewProgress(record.id)"
                      >
                        查看完整历史
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2 shrink-0">
                  <button
                    v-if="record.status === '待领取'"
                    class="px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 shadow-sm hover:shadow"
                    @click="handleVerify(record)"
                  >
                    <Zap class="w-4 h-4" />
                    一键核销
                  </button>
                  <div class="flex items-center gap-2">
                    <button
                      v-if="record.status === '待领取' && !record.appointment && !record.reissue"
                      class="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center gap-1.5"
                      @click="handleRegisterAppointment(record)"
                    >
                      <CalendarClock class="w-3.5 h-3.5" />
                      预约
                    </button>
                    <button
                      v-if="record.status === '待领取' && (record.appointment || record.reissue)"
                      class="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center gap-1.5"
                      @click="handleViewAppointment(record)"
                    >
                      <CalendarClock class="w-3.5 h-3.5" />
                      预约详情
                    </button>
                    <button
                      v-if="record.status === '待领取' && !record.reissue"
                      class="px-3 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors text-xs font-medium flex items-center gap-1.5"
                      @click="handleRegisterReissue(record)"
                    >
                      <ClipboardCheck class="w-3.5 h-3.5" />
                      补领
                    </button>
                  </div>
                  <button
                    v-if="record.status !== '待领取'"
                    class="px-5 py-3 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed font-medium flex items-center gap-2"
                    disabled
                  >
                    <CheckCircle v-if="record.status === '已领取'" class="w-4 h-4" />
                    <XCircle v-else class="w-4 h-4" />
                    {{ record.status === '已领取' ? '已核销' : '不可核销' }}
                  </button>

                  <div class="relative flex items-center justify-between mt-2 px-1">
                    <div
                      v-for="(node, idx) in PROGRESS_NODE_LIST"
                      :key="node"
                      class="flex flex-col items-center z-10"
                      :style="{ width: (100 / PROGRESS_NODE_LIST.length) + '%' }"
                    >
                      <div
                        class="w-2.5 h-2.5 rounded-full transition-all"
                        :class="PROGRESS_NODE_ORDER[node] < PROGRESS_NODE_ORDER[record.currentNode]
                          ? 'bg-green-500'
                          : PROGRESS_NODE_ORDER[node] === PROGRESS_NODE_ORDER[record.currentNode]
                          ? 'bg-emerald-500 ring-2 ring-emerald-200 scale-125'
                          : 'bg-slate-200'"
                      />
                    </div>
                    <div class="absolute top-[5px] left-0 right-0 h-0.5 bg-slate-200 -z-0">
                      <div
                        class="h-full bg-green-500 transition-all"
                        :style="{
                          width: Math.min(100, Math.round((PROGRESS_NODE_ORDER[record.currentNode] / (PROGRESS_NODE_LIST.length - 1)) * 100)) + '%',
                        }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <VerificationModal
      :visible="showVerificationModal"
      :record="selectedRecord"
      @close="showVerificationModal = false"
      @saved="handleVerificationSaved"
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
  </div>
</template>
