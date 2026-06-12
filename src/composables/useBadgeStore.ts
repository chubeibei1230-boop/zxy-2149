import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { BadgeRecord, FilterState, CheckIssue, BadgeStatus, HandoverInfo } from '@/types'
import { generateId } from '@/types'

const STORAGE_KEY = 'badge-checklist-records'

const SEED_DATA: BadgeRecord[] = [
  { id: 'seed1', name: '张伟', company: '华科技术', attendeeType: '嘉宾', badgeColor: '红色', printBatch: 'A1', status: '待打印', notes: 'VIP嘉宾', responsiblePerson: '李明', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: null },
  { id: 'seed2', name: '王芳', company: '创新科技', attendeeType: '参展商', badgeColor: '蓝色', printBatch: 'A1', status: '待领取', notes: '', responsiblePerson: '李明', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: null },
  { id: 'seed3', name: '张伟', company: '数字未来', attendeeType: '观众', badgeColor: '绿色', printBatch: 'A2', status: '待设计', notes: '', responsiblePerson: '', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: null },
  { id: 'seed4', name: '刘洋', company: '星辰传媒', attendeeType: '媒体', badgeColor: '紫色', printBatch: 'A2', status: '已领取', notes: '', responsiblePerson: '赵红', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: { receiverName: '刘洋', receivedAt: '2025-01-05T10:30:00Z', handoverMethod: '当面领取', handler: '赵红', handoverNotes: '本人签字确认' } },
  { id: 'seed5', name: '陈静', company: '光速网络', attendeeType: '参展商', badgeColor: '蓝色', printBatch: 'B1', status: '需重做', notes: '信息有误需重新制作', responsiblePerson: '赵红', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: null },
  { id: 'seed6', name: '赵磊', company: '未来教育', attendeeType: '工作人员', badgeColor: '黄色', printBatch: 'B1', status: '待打印', notes: '', responsiblePerson: '', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: null },
  { id: 'seed7', name: '孙丽', company: '阳光志愿者', attendeeType: '志愿者', badgeColor: '橙色', printBatch: '', status: '已领取', notes: '', responsiblePerson: '李明', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: null },
  { id: 'seed8', name: '周涛', company: '盛世展览', attendeeType: '参展商', badgeColor: '蓝色', printBatch: 'A1', status: '待设计', notes: '', responsiblePerson: '赵红', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', handover: null },
]

function loadRecords(): BadgeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [...SEED_DATA]
}

function saveRecords(records: BadgeRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export const useBadgeStore = defineStore('badge', () => {
  const records = ref<BadgeRecord[]>(loadRecords())

  watch(records, (val) => {
    saveRecords(val)
  }, { deep: true })

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
  })

  const selectedIds = ref<Set<string>>(new Set())

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
    return { total, byStatus, handoverStats }
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

  function addRecord(data: Omit<BadgeRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const record: BadgeRecord = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    records.value.push(record)
  }

  function updateRecord(id: string, data: Partial<BadgeRecord>) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      records.value[idx] = { ...records.value[idx], ...data, updatedAt: new Date().toISOString() }
    }
  }

  function deleteRecord(id: string) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      records.value.splice(idx, 1)
    }
    selectedIds.value.delete(id)
  }

  function batchUpdateStatus(ids: string[], status: BadgeStatus) {
    const now = new Date().toISOString()
    for (const id of ids) {
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        records.value[idx] = { ...records.value[idx], status, updatedAt: now }
      }
    }
  }

  function batchRegisterHandover(ids: string[], handoverInfo: HandoverInfo) {
    const now = new Date().toISOString()
    for (const id of ids) {
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) {
        records.value[idx] = {
          ...records.value[idx],
          status: '已领取',
          handover: handoverInfo,
          updatedAt: now,
        }
      }
    }
  }

  function clearHandover(id: string) {
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      records.value[idx] = {
        ...records.value[idx],
        handover: null,
        updatedAt: new Date().toISOString(),
      }
    }
  }

  function deleteRecords(ids: string[]) {
    records.value = records.value.filter((r) => !ids.includes(r.id))
    for (const id of ids) {
      selectedIds.value.delete(id)
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

  return {
    records,
    filter,
    selectedIds,
    filteredRecords,
    groupedByColor,
    allBatches,
    allResponsiblePersons,
    allHandoverHandlers,
    stats,
    checks,
    issueCount,
    addRecord,
    updateRecord,
    deleteRecord,
    batchUpdateStatus,
    batchRegisterHandover,
    clearHandover,
    deleteRecords,
    toggleSelect,
    selectAll,
    clearSelection,
    setFilter,
    clearFilter,
    focusOnIssue,
    getBatchStats,
  }
})
