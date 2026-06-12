<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { X, Clock, Phone, FileText, User, CalendarClock, Truck } from 'lucide-vue-next'
import { PICKUP_METHOD_LIST } from '@/types'
import type { PickupMethod, BadgeRecord } from '@/types'
import { useBadgeStore } from '@/composables/useBadgeStore'
import { COLOR_MAP } from '@/types'

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

const form = reactive<{
  scheduledTime: string
  contactInfo: string
  pickupMethod: PickupMethod | ''
  notes: string
  operator: string
}>({
  scheduledTime: '',
  contactInfo: '',
  pickupMethod: '',
  notes: '',
  operator: '',
})

function getLocalDateTime() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  const local = new Date(now.getTime() - tzOffset)
  return local.toISOString().slice(0, 16)
}

function resetForm() {
  if (props.record?.appointment) {
    const a = props.record.appointment
    const d = new Date(a.scheduledTime)
    const tzOffset = d.getTimezoneOffset() * 60000
    const local = new Date(d.getTime() - tzOffset)
    form.scheduledTime = local.toISOString().slice(0, 16)
    form.contactInfo = a.contactInfo
    form.pickupMethod = a.pickupMethod
    form.notes = a.notes
    form.operator = a.operator
  } else if (props.record) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tzOffset = tomorrow.getTimezoneOffset() * 60000
    const local = new Date(tomorrow.getTime() - tzOffset)
    form.scheduledTime = local.toISOString().slice(0, 16)
    form.contactInfo = ''
    form.pickupMethod = '现场自取'
    form.notes = ''
    form.operator = props.record.responsiblePerson || ''
  } else {
    form.scheduledTime = ''
    form.contactInfo = ''
    form.pickupMethod = ''
    form.notes = ''
    form.operator = ''
  }
}

watch(() => props.visible, (val) => {
  if (val) resetForm()
})

const isFormValid = computed(() => {
  return !!form.scheduledTime && !!form.pickupMethod && !!form.operator.trim()
})

const validationErrors = computed(() => {
  const errors: string[] = []
  if (!form.scheduledTime) errors.push('请选择预约领取时间')
  if (!form.pickupMethod) errors.push('请选择预计领取方式')
  if (!form.operator.trim()) errors.push('请填写经办人')
  return errors
})

function handleSave() {
  if (!isFormValid.value || !props.record) return
  store.registerAppointment(props.record.id, {
    scheduledTime: form.scheduledTime,
    contactInfo: form.contactInfo.trim(),
    pickupMethod: form.pickupMethod as PickupMethod,
    notes: form.notes.trim(),
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
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-blue-50">
          <div class="flex items-center gap-2">
            <CalendarClock class="w-5 h-5 text-blue-600" />
            <h2 class="text-lg font-semibold text-slate-800">预约领取登记</h2>
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
            <div>
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
          </div>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              预约领取时间 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.scheduledTime" type="datetime-local" class="input-field" />
            <p class="mt-1 text-xs text-slate-400">设置参会人预计到场领取胸卡的时间</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-slate-400" />
              领取人联系方式
            </label>
            <input v-model="form.contactInfo" type="text" class="input-field" placeholder="手机号或其他联系方式" />
            <p class="mt-1 text-xs text-slate-400">方便工作人员在领取时间到达前进行提醒</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <Truck class="w-3.5 h-3.5 text-slate-400" />
              预计领取方式 <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="method in PICKUP_METHOD_LIST"
                :key="method"
                class="cursor-pointer"
              >
                <input
                  type="radio"
                  :value="method"
                  v-model="form.pickupMethod"
                  class="peer sr-only"
                />
                <div
                  class="px-3 py-2 rounded-lg border text-sm text-center transition-all"
                  :class="form.pickupMethod === method
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
                >
                  {{ method }}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-slate-400" />
              经办人 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.operator" type="text" class="input-field" placeholder="请输入经办人姓名" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-slate-400" />
              备注
            </label>
            <textarea v-model="form.notes" class="input-field" rows="2" placeholder="其他需要备注的信息" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <div v-if="validationErrors.length && !isFormValid" class="flex-1 text-xs text-red-500">
            {{ validationErrors.join('，') }}
          </div>
          <div v-else class="flex-1" />
          <button class="btn-secondary" @click="$emit('close')">取消</button>
          <button class="btn-primary" :disabled="!isFormValid" @click="handleSave">确认预约</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
