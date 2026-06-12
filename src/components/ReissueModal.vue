<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { X, FileText, User, AlertCircle, ClipboardCheck, MessageSquare } from 'lucide-vue-next'
import type { BadgeRecord } from '@/types'
import { COLOR_MAP, PICKUP_STATUS_COLOR_MAP } from '@/types'
import { useBadgeStore } from '@/composables/useBadgeStore'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  visible: boolean
  record: BadgeRecord | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useBadgeStore()

const REISSUE_REASONS = ['错过预约时间', '他人临时代领', '本人无法到场', '预约信息变更', '其他原因']

const form = reactive<{
  reason: string
  actualReceiver: string
  handler: string
  processNotes: string
  operator: string
}>({
  reason: '',
  actualReceiver: '',
  handler: '',
  processNotes: '',
  operator: '',
})

function resetForm() {
  if (props.record) {
    form.reason = ''
    form.actualReceiver = ''
    form.handler = props.record.responsiblePerson || ''
    form.processNotes = ''
    form.operator = props.record.responsiblePerson || ''
  } else {
    form.reason = ''
    form.actualReceiver = ''
    form.handler = ''
    form.processNotes = ''
    form.operator = ''
  }
}

watch(() => props.visible, (val) => {
  if (val) resetForm()
})

const isFormValid = computed(() => {
  return !!form.reason.trim() && !!form.actualReceiver.trim() && !!form.handler.trim() && !!form.operator.trim()
})

const validationErrors = computed(() => {
  const errors: string[] = []
  if (!form.reason.trim()) errors.push('请填写领取原因')
  if (!form.actualReceiver.trim()) errors.push('请填写实际领取人')
  if (!form.handler.trim()) errors.push('请填写经办人')
  if (!form.operator.trim()) errors.push('请填写操作人')
  return errors
})

function handleSave() {
  if (!isFormValid.value || !props.record) return
  store.registerReissue(props.record.id, {
    reason: form.reason.trim(),
    actualReceiver: form.actualReceiver.trim(),
    handler: form.handler.trim(),
    processNotes: form.processNotes.trim(),
    operator: form.operator.trim(),
  })
  emit('saved')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && record" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-violet-50">
          <div class="flex items-center gap-2">
            <ClipboardCheck class="w-5 h-5 text-violet-600" />
            <h2 class="text-lg font-semibold text-slate-800">补领/代领登记</h2>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
              :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
            >
              {{ record.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-slate-800">{{ record.name }}</span>
                <span class="text-xs text-slate-500">{{ record.company }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span>{{ record.attendeeType }}</span>
                <span>·</span>
                <span>{{ record.printBatch || '未分配批次' }}</span>
              </div>
            </div>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
              :style="{ backgroundColor: PICKUP_STATUS_COLOR_MAP[record.pickupStatus] }"
            >
              {{ record.pickupStatus }}
            </span>
          </div>
          <div v-if="record.appointment" class="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            原预约信息：{{ store.formatDateTime(record.appointment.scheduledTime) }} · {{ record.appointment.pickupMethod }}
          </div>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <AlertCircle class="w-3.5 h-3.5 text-slate-400" />
              领取原因 <span class="text-red-500">*</span>
            </label>
            <div class="flex flex-wrap gap-2 mb-2">
              <button
                v-for="r in REISSUE_REASONS"
                :key="r"
                class="px-3 py-1.5 rounded-lg border text-xs transition-all"
                :class="form.reason === r
                  ? 'border-violet-500 bg-violet-50 text-violet-700 font-medium'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
                @click="form.reason = r"
              >
                {{ r }}
              </button>
            </div>
            <input v-model="form.reason" type="text" class="input-field" placeholder="或直接输入领取原因" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-slate-400" />
              实际领取人 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.actualReceiver" type="text" class="input-field" placeholder="请输入实际领取人姓名" />
            <p class="mt-1 text-xs text-slate-400">如非本人领取，请填写实际代领人姓名</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-slate-400" />
              经办人 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.handler" type="text" class="input-field" placeholder="请输入经办人姓名" />
            <p class="mt-1 text-xs text-slate-400">负责办理本次补领/代领的现场工作人员</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <MessageSquare class="w-3.5 h-3.5 text-slate-400" />
              处理说明
            </label>
            <textarea v-model="form.processNotes" class="input-field" rows="2" placeholder="补充说明处理情况、代领关系等" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-slate-400" />
              操作人 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.operator" type="text" class="input-field" placeholder="请输入操作人姓名" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <div v-if="validationErrors.length && !isFormValid" class="flex-1 text-xs text-red-500">
            {{ validationErrors.join('，') }}
          </div>
          <div v-else class="flex-1" />
          <button class="btn-secondary" @click="$emit('close')">取消</button>
          <button class="btn-primary" :disabled="!isFormValid" @click="handleSave">确认登记</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
