import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  BadgeRecord,
  FilterState,
  CheckIssue,
  BadgeStatus,
  HandoverInfo,
  ProgressLog,
  ProgressNodeType,
  OperationType,
  LedgerFilterState,
  PickupAppointment,
  PickupReissue,
  PickupStatus,
  PickupMethod,
} from '@/types'
import {
  generateId,
  STATUS_TO_PROGRESS_MAP,
  OPERATION_TYPE_LABELS,
  PROGRESS_NODE_LIST,
} from '@/types'

const STORAGE_KEY = 'badge-checklist-records'
const DEFAULT_OPERATOR = '系统管理员'

function createSeedLog(
  recordId: string,
  operationType: OperationType,
  nodeType: ProgressNodeType,
  status: BadgeStatus | null,
  operator: string,
  operatedAt: string,
  reason: string = '',
): ProgressLog {
  return {
    id: generateId(),
    recordId,
    operationType,
    operationLabel: OPERATION_TYPE_LABELS[operationType],
    nodeType,
    previousStatus: null,
    newStatus: status,
    operator,
    operatedAt,
    reason,
    fieldChanges: {},
  }
}

const SEED_DATA: any[] = [
  {
    id: 'seed1',
    name: '张伟',
    company: '华科技术',
    attendeeType: '嘉宾',
    badgeColor: '红色',
    printBatch: 'A1',
    status: '待打印',
    notes: 'VIP嘉宾',
    responsiblePerson: '李明',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    handover: null,
    currentNode: '打印',
    progressLogs: [
      createSeedLog('seed1', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z', '初始录入'),
      {
        ...createSeedLog('seed1', 'update_status', '设计', '待打印', '李明', '2025-01-01T02:00:00Z', '设计完成，确认排版'),
        previousStatus: '待设计',
      },
    ],
  },
  {
    id: 'seed2',
    name: '王芳',
    company: '创新科技',
    attendeeType: '参展商',
    badgeColor: '蓝色',
    printBatch: 'A1',
    status: '待领取',
    notes: '',
    responsiblePerson: '李明',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed2', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z', '初始录入'),
      {
        ...createSeedLog('seed2', 'update_status', '设计', '待打印', '李明', '2025-01-01T01:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed2', 'update_status', '打印', '待领取', '赵红', '2025-01-01T04:00:00Z', '打印完成，质检合格'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed3',
    name: '张伟',
    company: '数字未来',
    attendeeType: '观众',
    badgeColor: '绿色',
    printBatch: 'A2',
    status: '待设计',
    notes: '',
    responsiblePerson: '',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    handover: null,
    currentNode: '设计',
    progressLogs: [
      createSeedLog('seed3', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z', '线上报名导入'),
    ],
  },
  {
    id: 'seed4',
    name: '刘洋',
    company: '星辰传媒',
    attendeeType: '媒体',
    badgeColor: '紫色',
    printBatch: 'A2',
    status: '已领取',
    notes: '',
    responsiblePerson: '赵红',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-05T10:30:00Z',
    handover: {
      receiverName: '刘洋',
      receivedAt: '2025-01-05T10:30:00Z',
      handoverMethod: '当面领取',
      handler: '赵红',
      handoverNotes: '本人签字确认',
    },
    currentNode: '领取交接',
    progressLogs: [
      createSeedLog('seed4', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z', '媒体对接名单导入'),
      {
        ...createSeedLog('seed4', 'update_status', '设计', '待打印', '赵红', '2025-01-01T01:30:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed4', 'update_status', '打印', '待领取', '赵红', '2025-01-02T09:00:00Z'),
        previousStatus: '待打印',
      },
      {
        ...createSeedLog('seed4', 'register_handover', '领取交接', '已领取', '赵红', '2025-01-05T10:30:00Z', '本人签字确认'),
        previousStatus: '待领取',
        handoverInfo: {
          receiverName: '刘洋',
          receivedAt: '2025-01-05T10:30:00Z',
          handoverMethod: '当面领取',
          handler: '赵红',
          handoverNotes: '本人签字确认',
        },
      },
    ],
  },
  {
    id: 'seed5',
    name: '陈静',
    company: '光速网络',
    attendeeType: '参展商',
    badgeColor: '蓝色',
    printBatch: 'B1',
    status: '需重做',
    notes: '信息有误需重新制作',
    responsiblePerson: '赵红',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    handover: null,
    currentNode: '需重做',
    progressLogs: [
      createSeedLog('seed5', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z'),
      {
        ...createSeedLog('seed5', 'update_status', '设计', '待打印', '赵红', '2025-01-01T01:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed5', 'request_redo', '需重做', '需重做', '李明', '2025-01-02T15:00:00Z', '公司名称拼写错误，需重新制作'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed6',
    name: '赵磊',
    company: '未来教育',
    attendeeType: '工作人员',
    badgeColor: '黄色',
    printBatch: 'B1',
    status: '待打印',
    notes: '',
    responsiblePerson: '',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    handover: null,
    currentNode: '打印',
    progressLogs: [
      createSeedLog('seed6', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z', '工作人员名单'),
      {
        ...createSeedLog('seed6', 'update_status', '设计', '待打印', '李明', '2025-01-01T02:30:00Z'),
        previousStatus: '待设计',
      },
    ],
  },
  {
    id: 'seed7',
    name: '孙丽',
    company: '阳光志愿者',
    attendeeType: '志愿者',
    badgeColor: '橙色',
    printBatch: '',
    status: '已领取',
    notes: '',
    responsiblePerson: '李明',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    handover: null,
    currentNode: '领取交接',
    progressLogs: [
      createSeedLog('seed7', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z'),
      {
        ...createSeedLog('seed7', 'update_status', '设计', '待打印', '李明', '2025-01-01T01:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed7', 'update_status', '打印', '待领取', '李明', '2025-01-01T03:00:00Z'),
        previousStatus: '待打印',
      },
      {
        ...createSeedLog('seed7', 'register_handover', '领取交接', '已领取', '李明', '2025-01-02T08:00:00Z', '志愿者领队统一领取'),
        previousStatus: '待领取',
      },
    ],
  },
  {
    id: 'seed8',
    name: '周涛',
    company: '盛世展览',
    attendeeType: '参展商',
    badgeColor: '蓝色',
    printBatch: 'A1',
    status: '待设计',
    notes: '',
    responsiblePerson: '赵红',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    handover: null,
    currentNode: '设计',
    progressLogs: [
      createSeedLog('seed8', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z', '参展商名单导入'),
    ],
  },
  {
    id: 'seed9',
    name: '吴明',
    company: '科技创新',
    attendeeType: '参展商',
    badgeColor: '蓝色',
    printBatch: 'A1',
    status: '待领取',
    notes: '',
    responsiblePerson: '李明',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T08:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed9', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z'),
      {
        ...createSeedLog('seed9', 'update_status', '设计', '待打印', '李明', '2025-01-01T01:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed9', 'update_status', '打印', '待领取', '赵红', '2025-01-03T08:00:00Z', '打印完成'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed10',
    name: '郑华',
    company: '智能科技',
    attendeeType: '嘉宾',
    badgeColor: '红色',
    printBatch: 'A2',
    status: '待领取',
    notes: 'VIP嘉宾，需专人接待',
    responsiblePerson: '赵红',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T09:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed10', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z', 'VIP嘉宾名单'),
      {
        ...createSeedLog('seed10', 'update_status', '设计', '待打印', '赵红', '2025-01-01T02:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed10', 'update_status', '打印', '待领取', '赵红', '2025-01-03T09:00:00Z', '打印完成，质检合格'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed11',
    name: '孙强',
    company: '数字世界',
    attendeeType: '观众',
    badgeColor: '绿色',
    printBatch: 'B1',
    status: '待领取',
    notes: '',
    responsiblePerson: '',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T10:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed11', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z', '线上报名'),
      {
        ...createSeedLog('seed11', 'update_status', '设计', '待打印', '李明', '2025-01-01T03:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed11', 'update_status', '打印', '待领取', '赵红', '2025-01-03T10:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed12',
    name: '钱敏',
    company: '未来通讯',
    attendeeType: '媒体',
    badgeColor: '紫色',
    printBatch: 'A2',
    status: '待领取',
    notes: '',
    responsiblePerson: '赵红',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T11:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed12', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z', '媒体名单'),
      {
        ...createSeedLog('seed12', 'update_status', '设计', '待打印', '赵红', '2025-01-01T04:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed12', 'update_status', '打印', '待领取', '李明', '2025-01-03T11:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed13',
    name: '黄磊',
    company: '创新科技',
    attendeeType: '参展商',
    badgeColor: '蓝色',
    printBatch: 'B1',
    status: '待领取',
    notes: '',
    responsiblePerson: '李明',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T12:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed13', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z'),
      {
        ...createSeedLog('seed13', 'update_status', '设计', '待打印', '李明', '2025-01-01T05:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed13', 'update_status', '打印', '待领取', '赵红', '2025-01-03T12:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed14',
    name: '林娜',
    company: '阳光志愿者',
    attendeeType: '志愿者',
    badgeColor: '橙色',
    printBatch: '',
    status: '待领取',
    notes: '',
    responsiblePerson: '李明',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T13:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed14', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z', '志愿者招募'),
      {
        ...createSeedLog('seed14', 'update_status', '设计', '待打印', '李明', '2025-01-01T06:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed14', 'update_status', '打印', '待领取', '李明', '2025-01-03T13:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed15',
    name: '周杰',
    company: '盛世展览',
    attendeeType: '参展商',
    badgeColor: '蓝色',
    printBatch: 'A1',
    status: '待领取',
    notes: '',
    responsiblePerson: '赵红',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T14:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed15', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z'),
      {
        ...createSeedLog('seed15', 'update_status', '设计', '待打印', '赵红', '2025-01-01T07:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed15', 'update_status', '打印', '待领取', '李明', '2025-01-03T14:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed16',
    name: '吴芳',
    company: '光速网络',
    attendeeType: '参展商',
    badgeColor: '蓝色',
    printBatch: 'B1',
    status: '待领取',
    notes: '',
    responsiblePerson: '赵红',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T15:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed16', 'create', '新增', '待设计', '赵红', '2025-01-01T00:00:00Z'),
      {
        ...createSeedLog('seed16', 'update_status', '设计', '待打印', '赵红', '2025-01-01T08:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed16', 'update_status', '打印', '待领取', '赵红', '2025-01-03T15:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed17',
    name: '郑伟',
    company: '华科技术',
    attendeeType: '工作人员',
    badgeColor: '黄色',
    printBatch: 'A2',
    status: '待领取',
    notes: '',
    responsiblePerson: '',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T16:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed17', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z', '工作人员名单'),
      {
        ...createSeedLog('seed17', 'update_status', '设计', '待打印', '李明', '2025-01-01T09:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed17', 'update_status', '打印', '待领取', '赵红', '2025-01-03T16:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
  {
    id: 'seed18',
    name: '钱丽',
    company: '数字未来',
    attendeeType: '观众',
    badgeColor: '绿色',
    printBatch: 'B1',
    status: '待领取',
    notes: '',
    responsiblePerson: '李明',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-03T17:00:00Z',
    handover: null,
    currentNode: '待领取',
    progressLogs: [
      createSeedLog('seed18', 'create', '新增', '待设计', '李明', '2025-01-01T00:00:00Z', '线上报名'),
      {
        ...createSeedLog('seed18', 'update_status', '设计', '待打印', '李明', '2025-01-01T10:00:00Z'),
        previousStatus: '待设计',
      },
      {
        ...createSeedLog('seed18', 'update_status', '打印', '待领取', '李明', '2025-01-03T17:00:00Z'),
        previousStatus: '待打印',
      },
    ],
  },
]

function migrateRecord(record: any): BadgeRecord {
  if (!record.progressLogs) {
    record.progressLogs = [
      createSeedLog(
        record.id,
        'create',
        '新增',
        record.status === '已领取' ? '待设计' : record.status,
        record.responsiblePerson || DEFAULT_OPERATOR,
        record.createdAt,
        '历史数据迁移',
      ),
    ]
    if (record.status !== '待设计') {
      record.progressLogs.push({
        ...createSeedLog(
          record.id,
          'update_status',
          STATUS_TO_PROGRESS_MAP[record.status],
          record.status,
          record.responsiblePerson || DEFAULT_OPERATOR,
          record.updatedAt,
          '历史状态迁移',
        ),
        previousStatus: '待设计',
      })
    }
    if (record.handover) {
      record.progressLogs.push({
        ...createSeedLog(
          record.id,
          'register_handover',
          '领取交接',
          '已领取',
          record.handover.handler,
          record.handover.receivedAt,
          record.handover.handoverNotes,
        ),
        previousStatus: '待领取',
        handoverInfo: record.handover,
      })
    }
  }
  if (!record.currentNode) {
    record.currentNode = STATUS_TO_PROGRESS_MAP[record.status]
  }
  if (record.appointment === undefined) {
    record.appointment = null
  }
  if (record.reissue === undefined) {
    record.reissue = null
  }
  if (!record.pickupStatus) {
    if (record.status === '已领取') {
      record.pickupStatus = '已领取'
    } else if (record.appointment) {
      const scheduledTime = new Date(record.appointment.scheduledTime)
      const now = new Date()
      record.pickupStatus = scheduledTime < now ? '已逾期' : '已预约'
    } else {
      record.pickupStatus = '未预约'
    }
  }
  return record as BadgeRecord
}

function loadRecords(): BadgeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(migrateRecord)
      }
    }
  } catch {}
  return SEED_DATA.map(migrateRecord)
}

function saveRecords(records: BadgeRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function createProgressLog(params: {
  recordId: string
  operationType: OperationType
  nodeType: ProgressNodeType
  previousStatus: BadgeStatus | null
  newStatus: BadgeStatus | null
  operator: string
  reason?: string
  fieldChanges?: Record<string, { old: string | null; new: string | null }>
  batchId?: string
  handoverInfo?: HandoverInfo
  appointmentInfo?: PickupAppointment
  reissueInfo?: PickupReissue
}): ProgressLog {
  return {
    id: generateId(),
    recordId: params.recordId,
    operationType: params.operationType,
    operationLabel: OPERATION_TYPE_LABELS[params.operationType],
    nodeType: params.nodeType,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    operator: params.operator,
    operatedAt: new Date().toISOString(),
    reason: params.reason || '',
    fieldChanges: params.fieldChanges || {},
    batchId: params.batchId,
    handoverInfo: params.handoverInfo,
    appointmentInfo: params.appointmentInfo,
    reissueInfo: params.reissueInfo,
  }
}

function diffFields(
  oldRecord: BadgeRecord,
  newData: Partial<BadgeRecord>,
): Record<string, { old: string | null; new: string | null }> {
  const changes: Record<string, { old: string | null; new: string | null }> = {}
  const fieldLabels: Record<string, string> = {
    name: '姓名',
    company: '公司',
    attendeeType: '参会类型',
    badgeColor: '胸卡颜色',
    printBatch: '打印批次',
    notes: '备注',
    responsiblePerson: '负责人',
  }
  for (const [key, label] of Object.entries(fieldLabels)) {
    const oldVal = (oldRecord as any)[key] || null
    const newVal = (newData as any)[key]
    if (newVal !== undefined && (oldVal || '') !== (newVal || '')) {
      changes[label] = { old: oldVal, new: newVal || null }
    }
  }
  return changes
}

export const useBadgeStore = defineStore('badge', () => {
  const records = ref<BadgeRecord[]>(loadRecords())

  watch(records, (val) => {
    saveRecords(val)
  }, { deep: true })

  const ledgerFilter = ref<LedgerFilterState>({
    searchPerson: '',
    printBatch: '',
    status: '',
    progressNode: '',
    operationType: '',
    operator: '',
    startDate: '',
    endDate: '',
    onlyException: false,
  })

  const filter = ref<FilterState>({
    attendeeType: '',
    badgeColor: '',
    printBatch: '',
    responsiblePerson: '',
    status: '',
    searchName: '',
    focusRecordIds: [],
    handoverStatus: '',
    handoverHandler: '',
    handoverStartDate: '',
    handoverEndDate: '',
    pickupStatus: '',
    ledgerFilter: ledgerFilter.value,
  })

  const selectedIds = ref<Set<string>>(new Set())

  const allProgressLogs = computed(() => {
    const logs: ProgressLog[] = []
    for (const r of records.value) {
      logs.push(...(r.progressLogs || []))
    }
    return logs.sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime())
  })

  const allOperators = computed(() => {
    const operators = new Set<string>()
    for (const log of allProgressLogs.value) {
      if (log.operator) operators.add(log.operator)
    }
    return Array.from(operators).sort()
  })

  const filteredLedgerLogs = computed(() => {
    return allProgressLogs.value.filter((log) => {
      const record = records.value.find((r) => r.id === log.recordId)
      if (!record) return false

      if (ledgerFilter.value.searchPerson) {
        const search = ledgerFilter.value.searchPerson.toLowerCase()
        if (
          !record.name.toLowerCase().includes(search) &&
          !record.company.toLowerCase().includes(search)
        ) {
          return false
        }
      }
      if (ledgerFilter.value.printBatch) {
        if (ledgerFilter.value.printBatch === '__empty__') {
          if (record.printBatch) return false
        } else if (record.printBatch !== ledgerFilter.value.printBatch) {
          return false
        }
      }
      if (ledgerFilter.value.status) {
        if (log.newStatus !== ledgerFilter.value.status) return false
      }
      if (ledgerFilter.value.progressNode) {
        if (log.nodeType !== ledgerFilter.value.progressNode) return false
      }
      if (ledgerFilter.value.operationType) {
        if (log.operationType !== ledgerFilter.value.operationType) return false
      }
      if (ledgerFilter.value.operator) {
        if (ledgerFilter.value.operator === '__empty__') {
          if (log.operator) return false
        } else if (log.operator !== ledgerFilter.value.operator) {
          return false
        }
      }
      if (ledgerFilter.value.startDate) {
        const start = new Date(ledgerFilter.value.startDate)
        start.setHours(0, 0, 0, 0)
        const operated = new Date(log.operatedAt)
        operated.setHours(0, 0, 0, 0)
        if (operated < start) return false
      }
      if (ledgerFilter.value.endDate) {
        const end = new Date(ledgerFilter.value.endDate)
        end.setHours(23, 59, 59, 999)
        const operated = new Date(log.operatedAt)
        operated.setHours(0, 0, 0, 0)
        if (operated > end) return false
      }
      if (ledgerFilter.value.onlyException) {
        if (log.nodeType !== '需重做' && !log.reason) return false
      }
      return true
    })
  })

  const filteredRecords = computed(() => {
    return records.value.filter((r) => {
      if (filter.value.attendeeType && r.attendeeType !== filter.value.attendeeType) return false
      if (filter.value.badgeColor && r.badgeColor !== filter.value.badgeColor) return false
      if (filter.value.printBatch === '__empty__') {
        if (r.printBatch) return false
      } else if (filter.value.printBatch && r.printBatch !== filter.value.printBatch) {
        return false
      }
      if (filter.value.responsiblePerson === '__empty__') {
        if (r.responsiblePerson) return false
      } else if (filter.value.responsiblePerson && r.responsiblePerson !== filter.value.responsiblePerson) {
        return false
      }
      if (filter.value.status && r.status !== filter.value.status) return false
      if (filter.value.searchName && !r.name.includes(filter.value.searchName)) return false
      if (filter.value.pickupStatus && r.pickupStatus !== filter.value.pickupStatus) return false
      if (filter.value.handoverStatus === '已领取') {
        if (!r.handover) return false
      } else if (filter.value.handoverStatus === '未领取') {
        if (r.handover) return false
      }
      if (filter.value.handoverHandler === '__empty__') {
        if (r.handover?.handler) return false
      } else if (filter.value.handoverHandler) {
        if (!r.handover || r.handover.handler !== filter.value.handoverHandler) return false
      }
      if ((filter.value.handoverStartDate || filter.value.handoverEndDate) && !r.handover) {
        return false
      }
      if (filter.value.handoverStartDate && r.handover) {
        const start = new Date(filter.value.handoverStartDate)
        const received = new Date(r.handover.receivedAt)
        start.setHours(0, 0, 0, 0)
        received.setHours(0, 0, 0, 0)
        if (received < start) return false
      }
      if (filter.value.handoverEndDate && r.handover) {
        const end = new Date(filter.value.handoverEndDate)
        const received = new Date(r.handover.receivedAt)
        end.setHours(23, 59, 59, 999)
        received.setHours(0, 0, 0, 0)
        if (received > end) return false
      }
      return true
    })
  })

  const groupedByColor = computed(() => {
    const groups: Record<string, BadgeRecord[]> = {}
    for (const r of filteredRecords.value) {
      if (!groups[r.badgeColor]) groups[r.badgeColor] = []
      groups[r.badgeColor].push(r)
    }
    return groups
  })

  const allBatches = computed(() => {
    const batches = new Set<string>()
    for (const r of records.value) {
      if (r.printBatch) batches.add(r.printBatch)
    }
    return Array.from(batches).sort()
  })

  const allResponsiblePersons = computed(() => {
    const persons = new Set<string>()
    for (const r of records.value) {
      if (r.responsiblePerson) persons.add(r.responsiblePerson)
    }
    return Array.from(persons).sort()
  })

  const allHandoverHandlers = computed(() => {
    const handlers = new Set<string>()
    for (const r of records.value) {
      if (r.handover?.handler) handlers.add(r.handover.handler)
    }
    return Array.from(handlers).sort()
  })

  const stats = computed(() => {
    const total = records.value.length
    const byStatus: Record<string, number> = {}
    for (const r of records.value) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1
    }
    const handoverStats = {
      received: records.value.filter((r) => r.handover).length,
      notReceived: records.value.filter((r) => !r.handover).length,
    }
    const pickupStats = {
      appointed: records.value.filter((r) => r.pickupStatus === '已预约').length,
      overdue: records.value.filter((r) => r.pickupStatus === '已逾期').length,
      reissued: records.value.filter((r) => r.pickupStatus === '已补领').length,
      unappointed: records.value.filter((r) => r.pickupStatus === '未预约').length,
    }
    return { total, byStatus, handoverStats, pickupStats }
  })

  const checks = computed<CheckIssue[]>(() => {
    const issues: CheckIssue[] = []

    const nameMap: Record<string, string[]> = {}
    for (const r of records.value) {
      if (!nameMap[r.name]) nameMap[r.name] = []
      nameMap[r.name].push(r.id)
    }
    for (const [name, ids] of Object.entries(nameMap)) {
      if (ids.length >= 2) {
        issues.push({
          type: 'duplicate_name',
          recordIds: ids,
          message: `姓名"${name}"存在 ${ids.length} 条重复记录`,
          severity: 'warning',
        })
      }
    }

    const batchColors: Record<string, Set<string>> = {}
    const batchRecordIds: Record<string, string[]> = {}
    for (const r of records.value) {
      if (!r.printBatch) continue
      if (!batchColors[r.printBatch]) {
        batchColors[r.printBatch] = new Set()
        batchRecordIds[r.printBatch] = []
      }
      batchColors[r.printBatch].add(r.badgeColor)
      batchRecordIds[r.printBatch].push(r.id)
    }
    for (const [batch, colors] of Object.entries(batchColors)) {
      if (colors.size > 1) {
        issues.push({
          type: 'batch_color_mismatch',
          recordIds: batchRecordIds[batch],
          message: `批次"${batch}"存在 ${colors.size} 种颜色，可能存在混乱`,
          severity: 'error',
        })
      }
    }

    for (const r of records.value) {
      if (!r.responsiblePerson) {
        issues.push({
          type: 'missing_responsible',
          recordIds: [r.id],
          message: `"${r.name}"未指定负责人`,
          severity: 'warning',
        })
      }
    }

    for (const r of records.value) {
      if (r.status === '已领取' && !r.printBatch) {
        issues.push({
          type: 'collected_no_batch',
          recordIds: [r.id],
          message: `"${r.name}"已领取但未分配打印批次`,
          severity: 'error',
        })
      }
    }

    const collectedMissingHandoverIds: string[] = []
    for (const r of records.value) {
      if (r.status === '已领取' && !r.handover) {
        collectedMissingHandoverIds.push(r.id)
      }
    }
    if (collectedMissingHandoverIds.length > 0) {
      issues.push({
        type: 'collected_missing_handover',
        recordIds: collectedMissingHandoverIds,
        message: `${collectedMissingHandoverIds.length} 条记录已领取但缺少交接信息`,
        severity: 'error',
      })
    }

    const pendingHasHandoverIds: string[] = []
    for (const r of records.value) {
      if (r.status !== '已领取' && r.handover) {
        pendingHasHandoverIds.push(r.id)
      }
    }
    if (pendingHasHandoverIds.length > 0) {
      issues.push({
        type: 'pending_has_handover',
        recordIds: pendingHasHandoverIds,
        message: `${pendingHasHandoverIds.length} 条记录未领取但已填写交接信息`,
        severity: 'warning',
      })
    }

    return issues
  })

  const issueCount = computed(() => checks.value.length)

  function getRecordById(id: string): BadgeRecord | undefined {
    return records.value.find((r) => r.id === id)
  }

  function addRecord(data: any) {
    const now = new Date().toISOString()
    const initialStatus: BadgeStatus = data.status || '待设计'
    const initialNode: ProgressNodeType = STATUS_TO_PROGRESS_MAP[initialStatus]
    const operator = data.responsiblePerson || DEFAULT_OPERATOR

    const createLog = createProgressLog({
      recordId: '',
      operationType: 'create',
      nodeType: '新增',
      previousStatus: null,
      newStatus: initialStatus,
      operator,
      reason: data.notes || '新增记录',
    })

    const record: BadgeRecord = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      currentNode: initialNode,
      progressLogs: [createLog],
      appointment: data.appointment || null,
      reissue: data.reissue || null,
      pickupStatus: data.pickupStatus || '未预约',
    }
    record.progressLogs[0].recordId = record.id

    if (initialNode !== '新增') {
      record.progressLogs.push(
        createProgressLog({
          recordId: record.id,
          operationType: 'update_status',
          nodeType: initialNode,
          previousStatus: '待设计',
          newStatus: initialStatus,
          operator,
          reason: '初始状态设置',
        }),
      )
    }

    records.value.push(record)
  }

  function updateRecord(
    id: string,
    data: Partial<BadgeRecord>,
    options?: { operator?: string; reason?: string },
  ) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      const oldRecord = { ...records.value[idx] }
      const now = new Date().toISOString()
      const operator = options?.operator || data.responsiblePerson || oldRecord.responsiblePerson || DEFAULT_OPERATOR
      const newRecord = { ...oldRecord, ...data, updatedAt: now }

      const fieldChanges = diffFields(oldRecord, data)
      const hasStatusChange = data.status && data.status !== oldRecord.status
      const hasBatchChange = data.printBatch !== undefined && data.printBatch !== oldRecord.printBatch

      if (hasStatusChange) {
        const newStatus = data.status as BadgeStatus
        const newNode = STATUS_TO_PROGRESS_MAP[newStatus]
        newRecord.currentNode = newNode

        const isRedo = newStatus === '需重做'
        const opType: OperationType = isRedo ? 'request_redo' : 'update_status'

        newRecord.progressLogs = [
          ...oldRecord.progressLogs,
          createProgressLog({
            recordId: id,
            operationType: opType,
            nodeType: newNode,
            previousStatus: oldRecord.status,
            newStatus,
            operator,
            reason: options?.reason || data.notes || (isRedo ? '需重做' : ''),
            fieldChanges: {
              ...fieldChanges,
              '状态': { old: oldRecord.status, new: newStatus },
            },
          }),
        ]
      } else if (hasBatchChange) {
        newRecord.progressLogs = [
          ...oldRecord.progressLogs,
          createProgressLog({
            recordId: id,
            operationType: 'assign_batch',
            nodeType: newRecord.currentNode,
            previousStatus: oldRecord.status,
            newStatus: oldRecord.status,
            operator,
            reason: options?.reason || '分配/修改打印批次',
            fieldChanges,
            batchId: data.printBatch,
          }),
        ]
      } else if (Object.keys(fieldChanges).length > 0) {
        newRecord.progressLogs = [
          ...oldRecord.progressLogs,
          createProgressLog({
            recordId: id,
            operationType: 'update_info',
            nodeType: newRecord.currentNode,
            previousStatus: oldRecord.status,
            newStatus: oldRecord.status,
            operator,
            reason: options?.reason || '修改基础信息',
            fieldChanges,
          }),
        ]
      }

      records.value[idx] = newRecord
    }
  }

  function deleteRecord(id: string) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      records.value.splice(idx, 1)
    }
    selectedIds.value.delete(id)
  }

  function batchUpdateStatus(
    ids: string[],
    status: BadgeStatus,
    options?: { operator?: string; reason?: string },
  ) {
    const now = new Date().toISOString()
    const newNode = STATUS_TO_PROGRESS_MAP[status]
    const isRedo = status === '需重做'
    const opType: OperationType = isRedo ? 'request_redo' : 'batch_update_status'

    for (const id of ids) {
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        const oldRecord = records.value[idx]
        const operator = options?.operator || oldRecord.responsiblePerson || DEFAULT_OPERATOR

        records.value[idx] = {
          ...oldRecord,
          status,
          currentNode: newNode,
          updatedAt: now,
          progressLogs: [
            ...oldRecord.progressLogs,
            createProgressLog({
              recordId: id,
              operationType: opType,
              nodeType: newNode,
              previousStatus: oldRecord.status,
              newStatus: status,
              operator,
              reason: options?.reason || (isRedo ? '批量申请重做' : '批量状态更新'),
              fieldChanges: {
                '状态': { old: oldRecord.status, new: status },
              },
            }),
          ],
        }
      }
    }
  }

  function batchRegisterHandover(
    ids: string[],
    handoverInfo: HandoverInfo,
    options?: { reason?: string },
  ) {
    const now = new Date().toISOString()
    const isBatch = ids.length > 1
    const opType: OperationType = isBatch ? 'batch_register_handover' : 'register_handover'

    for (const id of ids) {
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        const oldRecord = records.value[idx]

        records.value[idx] = {
          ...oldRecord,
          status: '已领取',
          currentNode: '领取交接',
          handover: handoverInfo,
          pickupStatus: '已领取',
          updatedAt: now,
          progressLogs: [
            ...oldRecord.progressLogs,
            createProgressLog({
              recordId: id,
              operationType: opType,
              nodeType: '领取交接',
              previousStatus: oldRecord.status,
              newStatus: '已领取',
              operator: handoverInfo.handler,
              reason: options?.reason || handoverInfo.handoverNotes || '领取交接登记',
              handoverInfo,
              fieldChanges: {
                '状态': { old: oldRecord.status, new: '已领取' },
                '领取人': { old: null, new: handoverInfo.receiverName },
                '交接方式': { old: null, new: handoverInfo.handoverMethod },
                '领取预约状态': { old: oldRecord.pickupStatus, new: '已领取' },
              },
            }),
          ],
        }
      }
    }
  }

  function clearHandover(id: string) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      const oldRecord = records.value[idx]
      const operator = oldRecord.responsiblePerson || DEFAULT_OPERATOR
      const newPickupStatus = oldRecord.appointment ? '已预约' : '未预约'

      records.value[idx] = {
        ...oldRecord,
        handover: null,
        status: '待领取',
        currentNode: '待领取',
        pickupStatus: newPickupStatus,
        updatedAt: new Date().toISOString(),
        progressLogs: [
          ...oldRecord.progressLogs,
          createProgressLog({
            recordId: id,
            operationType: 'clear_handover',
            nodeType: '待领取',
            previousStatus: oldRecord.status,
            newStatus: '待领取',
            operator,
            reason: '撤销领取交接，退回待领取状态',
            fieldChanges: {
              '状态': { old: oldRecord.status, new: '待领取' },
              '交接信息': { old: '已登记', new: null },
              '领取预约状态': { old: oldRecord.pickupStatus, new: newPickupStatus },
            },
          }),
        ],
      }
    }
  }

  function deleteRecords(ids: string[]) {
    records.value = records.value.filter((r) => !ids.includes(r.id))
    for (const id of ids) {
      selectedIds.value.delete(id)
    }
  }

  function registerAppointment(
    id: string,
    appointmentData: {
      scheduledTime: string
      contactInfo: string
      pickupMethod: PickupMethod
      notes: string
      operator: string
    },
  ) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const oldRecord = records.value[idx]
    const now = new Date().toISOString()
    const appointment: PickupAppointment = {
      id: generateId(),
      scheduledTime: new Date(appointmentData.scheduledTime).toISOString(),
      contactInfo: appointmentData.contactInfo.trim(),
      pickupMethod: appointmentData.pickupMethod,
      notes: appointmentData.notes.trim(),
      operator: appointmentData.operator.trim(),
      createdAt: now,
    }
    const newPickupStatus: PickupStatus = '已预约'

    records.value[idx] = {
      ...oldRecord,
      appointment,
      pickupStatus: newPickupStatus,
      updatedAt: now,
      progressLogs: [
        ...oldRecord.progressLogs,
        createProgressLog({
          recordId: id,
          operationType: 'register_appointment',
          nodeType: oldRecord.currentNode,
          previousStatus: oldRecord.status,
          newStatus: oldRecord.status,
          operator: appointmentData.operator.trim(),
          reason: `预约领取：${formatDateTime(appointment.scheduledTime)}，方式：${appointmentData.pickupMethod}`,
          appointmentInfo: appointment,
          fieldChanges: {
            '领取预约状态': { old: oldRecord.pickupStatus, new: newPickupStatus },
            '预约领取时间': { old: null, new: formatDateTime(appointment.scheduledTime) },
            '预计领取方式': { old: null, new: appointmentData.pickupMethod },
          },
        }),
      ],
    }
  }

  function cancelAppointment(id: string, operator?: string) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const oldRecord = records.value[idx]
    if (!oldRecord.appointment) return
    const now = new Date().toISOString()
    const newPickupStatus: PickupStatus = '未预约'

    records.value[idx] = {
      ...oldRecord,
      appointment: null,
      pickupStatus: newPickupStatus,
      updatedAt: now,
      progressLogs: [
        ...oldRecord.progressLogs,
        createProgressLog({
          recordId: id,
          operationType: 'cancel_appointment',
          nodeType: oldRecord.currentNode,
          previousStatus: oldRecord.status,
          newStatus: oldRecord.status,
          operator: operator || oldRecord.responsiblePerson || DEFAULT_OPERATOR,
          reason: '取消预约领取',
          fieldChanges: {
            '领取预约状态': { old: oldRecord.pickupStatus, new: newPickupStatus },
          },
        }),
      ],
    }
  }

  function markOverdue(id: string, operator?: string) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const oldRecord = records.value[idx]
    if (oldRecord.pickupStatus !== '已预约') return
    const now = new Date().toISOString()
    const newPickupStatus: PickupStatus = '已逾期'

    records.value[idx] = {
      ...oldRecord,
      pickupStatus: newPickupStatus,
      updatedAt: now,
      progressLogs: [
        ...oldRecord.progressLogs,
        createProgressLog({
          recordId: id,
          operationType: 'mark_overdue',
          nodeType: oldRecord.currentNode,
          previousStatus: oldRecord.status,
          newStatus: oldRecord.status,
          operator: operator || oldRecord.responsiblePerson || DEFAULT_OPERATOR,
          reason: `预约领取时间已过（${oldRecord.appointment ? formatDateTime(oldRecord.appointment.scheduledTime) : '-'}），标记逾期`,
          fieldChanges: {
            '领取预约状态': { old: oldRecord.pickupStatus, new: newPickupStatus },
          },
        }),
      ],
    }
  }

  function registerReissue(
    id: string,
    reissueData: {
      reason: string
      actualReceiver: string
      handler: string
      processNotes: string
      operator: string
    },
  ) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const oldRecord = records.value[idx]
    const now = new Date().toISOString()
    const reissue: PickupReissue = {
      id: generateId(),
      reason: reissueData.reason.trim(),
      actualReceiver: reissueData.actualReceiver.trim(),
      handler: reissueData.handler.trim(),
      processNotes: reissueData.processNotes.trim(),
      operator: reissueData.operator.trim(),
      createdAt: now,
    }
    const handover: HandoverInfo = {
      receiverName: reissueData.actualReceiver.trim(),
      receivedAt: now,
      handoverMethod: reissueData.reason.trim() === '他人临时代领' ? '他人代领' : '当面领取',
      handler: reissueData.handler.trim(),
      handoverNotes: `补领原因：${reissueData.reason}${reissueData.processNotes ? ` · 处理说明：${reissueData.processNotes}` : ''}`,
    }
    const newPickupStatus: PickupStatus = '已补领'
    const newStatus: BadgeStatus = '已领取'

    records.value[idx] = {
      ...oldRecord,
      reissue,
      handover,
      pickupStatus: newPickupStatus,
      status: newStatus,
      currentNode: '领取交接',
      updatedAt: now,
      progressLogs: [
        ...oldRecord.progressLogs,
        createProgressLog({
          recordId: id,
          operationType: 'register_reissue',
          nodeType: '领取交接',
          previousStatus: oldRecord.status,
          newStatus: newStatus,
          operator: reissueData.operator.trim(),
          reason: `补领/代领：${reissueData.reason}，实际领取人：${reissueData.actualReceiver}`,
          reissueInfo: reissue,
          handoverInfo: handover,
          fieldChanges: {
            '胸卡状态': { old: oldRecord.status, new: newStatus },
            '领取预约状态': { old: oldRecord.pickupStatus, new: newPickupStatus },
            '补领原因': { old: null, new: reissueData.reason },
            '实际领取人': { old: null, new: reissueData.actualReceiver },
          },
        }),
      ],
    }
  }

  function checkOverdueAppointments() {
    const now = new Date()
    const nowIso = now.toISOString()
    for (let i = 0; i < records.value.length; i++) {
      const r = records.value[i]
      if (r.pickupStatus === '已预约' && r.appointment) {
        const scheduledTime = new Date(r.appointment.scheduledTime)
        if (scheduledTime < now) {
          records.value[i] = {
            ...r,
            pickupStatus: '已逾期',
            updatedAt: nowIso,
            progressLogs: [
              ...r.progressLogs,
              createProgressLog({
                recordId: r.id,
                operationType: 'mark_overdue',
                nodeType: r.currentNode,
                previousStatus: r.status,
                newStatus: r.status,
                operator: DEFAULT_OPERATOR,
                reason: `预约时间 ${formatDateTime(r.appointment.scheduledTime)} 已过，系统自动标记为逾期`,
                fieldChanges: {
                  '领取预约状态': { old: '已预约', new: '已逾期' },
                },
              }),
            ],
          }
        }
      }
    }
  }

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  function selectAll() {
    for (const r of filteredRecords.value) {
      selectedIds.value.add(r.id)
    }
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  function setFilter(partial: Partial<FilterState>) {
    Object.assign(filter.value, partial)
  }

  function clearFilter() {
    filter.value = {
      attendeeType: '',
      badgeColor: '',
      printBatch: '',
      responsiblePerson: '',
      status: '',
      searchName: '',
      focusRecordIds: [],
      handoverStatus: '',
      handoverHandler: '',
      handoverStartDate: '',
      handoverEndDate: '',
      pickupStatus: '',
      ledgerFilter: ledgerFilter.value,
    }
  }

  function clearLedgerFilter() {
    ledgerFilter.value = {
      searchPerson: '',
      printBatch: '',
      status: '',
      progressNode: '',
      operationType: '',
      operator: '',
      startDate: '',
      endDate: '',
      onlyException: false,
    }
  }

  function focusOnIssue(issue: CheckIssue) {
    filter.value = {
      attendeeType: '',
      badgeColor: '',
      printBatch: '',
      responsiblePerson: '',
      status: '',
      searchName: '',
      focusRecordIds: [...issue.recordIds],
      handoverStatus: '',
      handoverHandler: '',
      handoverStartDate: '',
      handoverEndDate: '',
      pickupStatus: '',
      ledgerFilter: ledgerFilter.value,
    }
    if (issue.type === 'duplicate_name') {
      const firstRecord = records.value.find((r) => r.id === issue.recordIds[0])
      if (firstRecord) {
        filter.value.searchName = firstRecord.name
      }
    } else if (issue.type === 'batch_color_mismatch') {
      const firstRecord = records.value.find((r) => r.id === issue.recordIds[0])
      if (firstRecord) {
        filter.value.printBatch = firstRecord.printBatch
      }
    } else if (issue.type === 'missing_responsible') {
      filter.value.responsiblePerson = '__empty__'
    } else if (issue.type === 'collected_no_batch') {
      filter.value.status = '已领取'
      filter.value.printBatch = '__empty__'
    } else if (issue.type === 'collected_missing_handover') {
      filter.value.status = '已领取'
      filter.value.handoverStatus = '未领取'
    } else if (issue.type === 'pending_has_handover') {
      filter.value.handoverStatus = '已领取'
    }
  }

  function getBatchStats(batch: string) {
    const batchRecords = records.value.filter((r) => r.printBatch === batch)
    const total = batchRecords.length
    const collected = batchRecords.filter((r) => r.status === '已领取').length
    const redo = batchRecords.filter((r) => r.status === '需重做').length
    const handoverComplete = batchRecords.filter((r) => r.handover).length
    const completionRate = total > 0 ? Math.round((collected / total) * 100) : 0
    const handoverRate = total > 0 ? Math.round((handoverComplete / total) * 100) : 0
    const personDist: Record<string, number> = {}
    for (const r of batchRecords) {
      const person = r.responsiblePerson || '未指定'
      personDist[person] = (personDist[person] || 0) + 1
    }
    const handlerDist: Record<string, number> = {}
    for (const r of batchRecords) {
      const handler = r.handover?.handler || '未交接'
      handlerDist[handler] = (handlerDist[handler] || 0) + 1
    }
    return { total, collected, redo, handoverComplete, completionRate, handoverRate, personDist, handlerDist }
  }

  function formatDateTime(isoStr: string): string {
    const d = new Date(isoStr)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDate(isoStr: string): string {
    const d = new Date(isoStr)
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const pendingRecords = computed(() => {
    return records.value.filter((r) => r.status === '待领取')
  })

  const verificationStats = computed(() => {
    const total = records.value.length
    const pending = records.value.filter((r) => r.status === '待领取').length
    const collected = records.value.filter((r) => r.status === '已领取').length
    const redo = records.value.filter((r) => r.status === '需重做').length
    const pendingWithIssues = records.value.filter(
      (r) => r.status === '待领取' && (!r.printBatch || !r.responsiblePerson),
    ).length
    return { total, pending, collected, redo, pendingWithIssues }
  })

  function searchVerificationRecords(params: {
    name?: string
    company?: string
    printBatch?: string
    badgeColor?: string
  }) {
    return records.value.filter((r) => {
      if (params.name && !r.name.toLowerCase().includes(params.name.toLowerCase())) {
        return false
      }
      if (params.company && !r.company.toLowerCase().includes(params.company.toLowerCase())) {
        return false
      }
      if (params.printBatch && r.printBatch !== params.printBatch) {
        return false
      }
      if (params.badgeColor && r.badgeColor !== params.badgeColor) {
        return false
      }
      return true
    })
  }

  function getRecordAlerts(record: BadgeRecord) {
    const alerts: { type: 'error' | 'warning' | 'success'; message: string }[] = []

    if (record.status === '已领取') {
      alerts.push({
        type: 'success',
        message: record.handover
          ? `已由 ${record.handover.receiverName} 于 ${formatDateTime(record.handover.receivedAt)} 领取`
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

    if (record.pickupStatus === '已预约' && record.appointment) {
      alerts.push({
        type: 'success',
        message: `已预约领取：${formatDateTime(record.appointment.scheduledTime)}，方式：${record.appointment.pickupMethod}${record.appointment.contactInfo ? '，联系方式：' + record.appointment.contactInfo : ''}`,
      })
    }

    if (record.pickupStatus === '已逾期') {
      const overdueTime = record.appointment ? formatDateTime(record.appointment.scheduledTime) : '-'
      alerts.push({
        type: 'warning',
        message: `预约逾期：预约领取时间 ${overdueTime} 已过，请安排补领或重新预约`,
      })
    }

    if (record.pickupStatus === '已补领' && record.reissue) {
      alerts.push({
        type: 'success',
        message: `已补领登记：实际领取人 ${record.reissue.actualReceiver}，经办人 ${record.reissue.handler}，原因：${record.reissue.reason}`,
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
    return `${latest.operator} · ${formatDateTime(latest.operatedAt)} · ${latest.operationLabel}${latest.reason ? ' · ' + latest.reason : ''}`
  }

  checkOverdueAppointments()

  return {
    records,
    filter,
    ledgerFilter,
    selectedIds,
    filteredRecords,
    groupedByColor,
    allBatches,
    allResponsiblePersons,
    allHandoverHandlers,
    allOperators,
    allProgressLogs,
    filteredLedgerLogs,
    stats,
    checks,
    issueCount,
    pendingRecords,
    verificationStats,
    getRecordById,
    addRecord,
    updateRecord,
    deleteRecord,
    batchUpdateStatus,
    batchRegisterHandover,
    clearHandover,
    deleteRecords,
    registerAppointment,
    cancelAppointment,
    markOverdue,
    registerReissue,
    checkOverdueAppointments,
    toggleSelect,
    selectAll,
    clearSelection,
    setFilter,
    clearFilter,
    clearLedgerFilter,
    focusOnIssue,
    getBatchStats,
    searchVerificationRecords,
    getRecordAlerts,
    getLatestSummary,
    formatDateTime,
    formatDate,
  }
})
