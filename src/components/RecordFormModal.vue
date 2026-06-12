<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import { X, AlertTriangle } from 'lucide-vue-next'
import { COLOR_LIST, ATTENDEE_TYPE_LIST, STATUS_LIST, COLOR_MAP } from '@/types'
import type { BadgeRecord, BadgeColor, AttendeeType, BadgeStatus } from '@/types'
import { useBadgeStore } from '@/composables/useBadgeStore'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  visible: boolean
  record: BadgeRecord | null
}>()

const emit = defineEmits<{
  close: []
  save: [
    data: Omit<BadgeRecord, 'id' | 'createdAt' | 'updatedAt' | 'progressLogs' | 'currentNode'>,
    options?: { reason?: string },
  ]
}>()

const store = useBadgeStore()

const isEdit = computed(() => !!props.record)
const previousStatus = ref<BadgeStatus | ''>('')
const showRedoReason = computed(() => {
  if (!isEdit.value) return false
  return form.status === '需重做' && previousStatus.value !== '需重做'
})

const redoReason = ref('')

const form = reactive({
  name: '',
  company: '',
  attendeeType: '' as AttendeeType | '',
  badgeColor: '' as BadgeColor | '',
  printBatch: '',
  status: '' as BadgeStatus | '',
  notes: '',
  responsiblePerson: '',
})

function resetForm() {
  if (props.record) {
    form.name = props.record.name
    form.company = props.record.company
    form.attendeeType = props.record.attendeeType
    form.badgeColor = props.record.badgeColor
    form.printBatch = props.record.printBatch
    form.status = props.record.status
    form.notes = props.record.notes
    form.responsiblePerson = props.record.responsiblePerson
    previousStatus.value = props.record.status
  } else {
    form.name = ''
    form.company = ''
    form.attendeeType = ''
    form.badgeColor = ''
    form.printBatch = ''
    form.status = ''
    form.notes = ''
    form.responsiblePerson = ''
    previousStatus.value = ''
  }
  redoReason.value = ''
}

watch(() => props.visible, (val) => {
  if (val) resetForm()
})

function handleClose() {
  emit('close')
}

const isFormValid = computed(() => {
  const baseValid = !!form.name.trim() && !!form.attendeeType && !!form.badgeColor && !!form.status
  if (showRedoReason.value && !redoReason.value.trim()) return false
  return baseValid
})

const validationErrors = computed(() => {
  const errors: string[] = []
  if (!form.name.trim()) errors.push('姓名不能为空')
  if (!form.attendeeType) errors.push('请选择参会类型')
  if (!form.badgeColor) errors.push('请选择胸卡颜色')
  if (!form.status) errors.push('请选择状态')
  if (showRedoReason.value && !redoReason.value.trim()) errors.push('请填写重做原因')
  return errors
})

function handleSave() {
  if (!isFormValid.value) return
  const saveData: any = {
    name: form.name,
    company: form.company,
    attendeeType: form.attendeeType as AttendeeType,
    badgeColor: form.badgeColor as BadgeColor,
    printBatch: form.printBatch,
    status: form.status as BadgeStatus,
    notes: form.notes,
    responsiblePerson: form.responsiblePerson,
    handover: null,
  }
  const options = showRedoReason.value && redoReason.value.trim()
    ? { reason: redoReason.value.trim() }
    : undefined
  emit('save', saveData, options)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ isEdit ? '编辑胸卡' : '新增胸卡' }}
          </h2>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">姓名 <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" class="input-field" placeholder="请输入姓名" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">公司</label>
            <input v-model="form.company" type="text" class="input-field" placeholder="请输入公司名称" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">参会类型 <span class="text-red-500">*</span></label>
            <select v-model="form.attendeeType" class="select-field">
              <option value="" disabled>请选择参会类型</option>
              <option v-for="item in ATTENDEE_TYPE_LIST" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">胸卡颜色 <span class="text-red-500">*</span></label>
            <select v-model="form.badgeColor" class="select-field">
              <option value="" disabled>请选择胸卡颜色</option>
              <option v-for="color in COLOR_LIST" :key="color" :value="color">
                {{ color }}
              </option>
            </select>
            <div v-if="form.badgeColor" class="flex items-center gap-1.5 mt-1.5">
              <span class="w-3 h-3 rounded-full inline-block" :style="{ backgroundColor: COLOR_MAP[form.badgeColor] }" />
              <span class="text-xs text-slate-500">{{ form.badgeColor }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">打印批次</label>
            <input v-model="form.printBatch" type="text" class="input-field" placeholder="请输入打印批次" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">状态 <span class="text-red-500">*</span></label>
            <select v-model="form.status" class="select-field">
              <option value="" disabled>请选择状态</option>
              <option v-for="item in STATUS_LIST" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea v-model="form.notes" class="input-field" rows="3" placeholder="请输入备注信息" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">负责人</label>
            <input v-model="form.responsiblePerson" type="text" class="input-field" placeholder="请输入负责人" />
          </div>

          <div v-if="showRedoReason" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <AlertTriangle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div class="flex-1">
                <label class="block text-sm font-medium text-red-700 mb-1">
                  重做原因 <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="redoReason"
                  class="input-field bg-white border-red-300"
                  rows="3"
                  placeholder="请详细说明需要重做的原因，如：信息错误、打印质量问题、遗失等"
                />
                <p class="mt-1 text-xs text-red-500">此原因将记录在操作台账中，便于后续追溯</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <div v-if="validationErrors.length && !isFormValid" class="flex-1 text-xs text-red-500">
            {{ validationErrors.join('，') }}
          </div>
          <div v-else class="flex-1" />
          <button class="btn-secondary" @click="handleClose">取消</button>
          <button class="btn-primary" :disabled="!isFormValid" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
