export type PickupMethod = '现场自取' | '他人代领' | '快递邮寄' | '电子交接'

export const PICKUP_METHOD_LIST: PickupMethod[] = ['现场自取', '他人代领', '快递邮寄', '电子交接']

export type PickupStatus = '未预约' | '已预约' | '已逾期' | '已补领' | '已领取'

export const PICKUP_STATUS_LIST: PickupStatus[] = ['未预约', '已预约', '已逾期', '已补领', '已领取']

export const PICKUP_STATUS_COLOR_MAP: Record<PickupStatus, string> = {
  '未预约': '#94A3B8',
  '已预约': '#3B82F6',
  '已逾期': '#F59E0B',
  '已补领': '#8B5CF6',
  '已领取': '#22C55E',
}

export interface PickupAppointment {
  id: string
  scheduledTime: string
  contactInfo: string
  pickupMethod: PickupMethod
  notes: string
  operator: string
  createdAt: string
}

export interface PickupReissue {
  id: string
  reason: string
  actualReceiver: string
  handler: string
  processNotes: string
  operator: string
  createdAt: string
}

export type BadgeStatus = '待设计' | '待打印' | '待领取' | '已领取' | '需重做'

export type ProgressNodeType = '新增' | '设计' | '打印' | '待领取' | '领取交接' | '需重做'

export const PROGRESS_NODE_LIST: ProgressNodeType[] = ['新增', '设计', '打印', '待领取', '领取交接', '需重做']

export const PROGRESS_NODE_ORDER: Record<ProgressNodeType, number> = {
  '新增': 0,
  '设计': 1,
  '打印': 2,
  '待领取': 3,
  '领取交接': 4,
  '需重做': 5,
}

export const PROGRESS_NODE_COLOR_MAP: Record<ProgressNodeType, string> = {
  '新增': '#6366F1',
  '设计': '#8B5CF6',
  '打印': '#F59E0B',
  '待领取': '#3B82F6',
  '领取交接': '#22C55E',
  '需重做': '#EF4444',
}

export const STATUS_TO_PROGRESS_MAP: Record<BadgeStatus, ProgressNodeType> = {
  '待设计': '设计',
  '待打印': '打印',
  '待领取': '待领取',
  '已领取': '领取交接',
  '需重做': '需重做',
}

export type OperationType =
  | 'create'
  | 'update_status'
  | 'update_info'
  | 'batch_update_status'
  | 'register_handover'
  | 'batch_register_handover'
  | 'clear_handover'
  | 'assign_batch'
  | 'request_redo'
  | 'delete'
  | 'register_appointment'
  | 'cancel_appointment'
  | 'mark_overdue'
  | 'register_reissue'

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  'create': '新增记录',
  'update_status': '状态变更',
  'update_info': '信息修改',
  'batch_update_status': '批量状态变更',
  'register_handover': '领取交接登记',
  'batch_register_handover': '批量领取交接',
  'clear_handover': '清除交接信息',
  'assign_batch': '分配打印批次',
  'request_redo': '申请重做',
  'delete': '删除记录',
  'register_appointment': '预约领取登记',
  'cancel_appointment': '取消预约',
  'mark_overdue': '标记逾期',
  'register_reissue': '补领/代领登记',
}

export interface ProgressLog {
  id: string
  recordId: string
  operationType: OperationType
  operationLabel: string
  nodeType: ProgressNodeType
  previousStatus: BadgeStatus | null
  newStatus: BadgeStatus | null
  operator: string
  operatedAt: string
  reason: string
  fieldChanges: Record<string, { old: string | null; new: string | null }>
  batchId?: string
  handoverInfo?: HandoverInfo
  appointmentInfo?: PickupAppointment
  reissueInfo?: PickupReissue
}

export type BadgeColor = '红色' | '蓝色' | '绿色' | '黄色' | '紫色' | '橙色' | '灰色'

export type AttendeeType = '嘉宾' | '参展商' | '观众' | '工作人员' | '媒体' | '志愿者' | '其他'

export type HandoverMethod = '当面领取' | '快递邮寄' | '他人代领' | '电子交接'

export const HANDOVER_METHOD_LIST: HandoverMethod[] = ['当面领取', '快递邮寄', '他人代领', '电子交接']

export interface HandoverInfo {
  receiverName: string
  receivedAt: string
  handoverMethod: HandoverMethod
  handler: string
  handoverNotes: string
}

export interface BadgeRecord {
  id: string
  name: string
  company: string
  attendeeType: AttendeeType
  badgeColor: BadgeColor
  printBatch: string
  status: BadgeStatus
  notes: string
  responsiblePerson: string
  createdAt: string
  updatedAt: string
  handover: HandoverInfo | null
  appointment: PickupAppointment | null
  reissue: PickupReissue | null
  pickupStatus: PickupStatus
  progressLogs: ProgressLog[]
  currentNode: ProgressNodeType
}

export type CheckIssueType = 'duplicate_name' | 'batch_color_mismatch' | 'missing_responsible' | 'collected_no_batch' | 'collected_missing_handover' | 'pending_has_handover'

export interface CheckIssue {
  type: CheckIssueType
  recordIds: string[]
  message: string
  severity: 'warning' | 'error'
}

export interface LedgerFilterState {
  searchPerson: string
  printBatch: string
  status: string
  progressNode: string
  operationType: string
  operator: string
  startDate: string
  endDate: string
  onlyException: boolean
}

export interface FilterState {
  attendeeType: string
  badgeColor: string
  printBatch: string
  responsiblePerson: string
  status: string
  searchName: string
  focusRecordIds: string[]
  handoverStatus: string
  handoverHandler: string
  handoverStartDate: string
  handoverEndDate: string
  pickupStatus: string
  ledgerFilter: LedgerFilterState
}

export const STATUS_LIST: BadgeStatus[] = ['待设计', '待打印', '待领取', '已领取', '需重做']

export const COLOR_LIST: BadgeColor[] = ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色', '灰色']

export const ATTENDEE_TYPE_LIST: AttendeeType[] = ['嘉宾', '参展商', '观众', '工作人员', '媒体', '志愿者', '其他']

export const COLOR_MAP: Record<BadgeColor, string> = {
  '红色': '#EF4444',
  '蓝色': '#3B82F6',
  '绿色': '#22C55E',
  '黄色': '#EAB308',
  '紫色': '#A855F7',
  '橙色': '#F97316',
  '灰色': '#6B7280',
}

export const STATUS_COLOR_MAP: Record<BadgeStatus, string> = {
  '待设计': '#8B5CF6',
  '待打印': '#F59E0B',
  '待领取': '#3B82F6',
  '已领取': '#22C55E',
  '需重做': '#EF4444',
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}
