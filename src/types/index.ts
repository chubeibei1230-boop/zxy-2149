export type BadgeStatus = '待设计' | '待打印' | '待领取' | '已领取' | '需重做'

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
}

export type CheckIssueType = 'duplicate_name' | 'batch_color_mismatch' | 'missing_responsible' | 'collected_no_batch' | 'collected_missing_handover' | 'pending_has_handover'

export interface CheckIssue {
  type: CheckIssueType
  recordIds: string[]
  message: string
  severity: 'warning' | 'error'
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
