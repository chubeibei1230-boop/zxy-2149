<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { X, User, Clock, FileText, Handshake, ClipboardList, CheckCircle, AlertTriangle, Zap } from 'lucide-vue-next'
import { HANDOVER_METHOD_LIST, COLOR_MAP } from '@/types'
import type { HandoverInfo, HandoverMethod, BadgeRecord } from '@/types'
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

const form = reactive<{
  receiverName: string
  receivedAt: string
  handoverMethod: HandoverMethod | ''
  handler: string
  handoverNotes: string
}>({
  receiverName: '',
  receivedAt: '',
  handoverMethod: '',
  handler: '',
  handoverNotes: '',
})

function getLocalDateTime() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  const local = new Date(now.getTime() - tzOffset)
  return local.toISOString().slice(0, 16)
}

function resetForm() {
  if (props.record) {
    form.receiverName = props.record.name
    form.receivedAt = getLocalDateTime()
    form.handoverMethod = '当面领取'
    form.handler = props.record.responsiblePerson || '现场工作人员'
    form.handoverNotes = ''
  } else {
    form.receiverName = ''
    form.receivedAt = getLocalDateTime()
    form.handoverMethod = '当面领取'
    form.handler = '现场工作人员'
    form.handoverNotes = ''
  }
}

watch(() => props.visible, (val) => {
  if (val) resetForm()
})

function handleClose() {
  emit('close')
}

const isFormValid = computed(() => {
  return !!form.receiverName.trim() && !!form.receivedAt && !!form.handoverMethod && !!form.handler.trim()
})

const validationErrors = computed(() => {
  const errors: string[] = []
  if (!form.receiverName.trim()) errors.push('领取人不能为空')
  if (!form.receivedAt) errors.push('请选择领取时间')
  if (!form.handoverMethod) errors.push('请选择交接方式')
  if (!form.handler.trim()) errors.push('经办人不能为空')
  return errors
})

function handleSave() {
  if (!isFormValid.value || !props.record) return

  const handoverInfo: HandoverInfo = {
    receiverName: form.receiverName.trim(),
    receivedAt: new Date(form.receivedAt).toISOString(),
    handoverMethod: form.handoverMethod as HandoverMethod,
    handler: form.handler.trim(),
    handoverNotes: form.handoverNotes.trim(),
  }

  store.batchRegisterHandover([props.record.id], handoverInfo)
  emit('saved')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && record" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold">领取核销登记</h2>
                <p class="text-xs text-emerald-100">确认信息无误后完成核销</p>
              </div>
            </div>
            <button class="p-1.5 rounded-lg hover:bg-white/20 transition-colors" @click="handleClose">
              <X :size="20" />
            </button>
          </div>
        </div>

        <div class="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md"
              :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
            >
              {{ record.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-slate-800">{{ record.name }}</span>
                <span
                  class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
                  />
                  {{ record.badgeColor }} · {{ record.printBatch || '未分配' }}
                </span>
              </div>
              <div class="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span>{{ record.company }}</span>
                <span>{{ record.attendeeType }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle class="w-4 h-4 text-blue-500" />
              <span class="text-sm text-blue-700 font-medium">待领取</span>
            </div>
          </div>
        </div>

        <div v-if="record.notes || !record.responsiblePerson || !record.printBatch" class="px-6 py-3 bg-amber-50 border-b border-amber-100">
          <div v-if="!record.printBatch" class="flex items-center gap-2 text-amber-700 text-sm mb-1">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>注意：未分配打印批次，请现场确认胸卡已制作完成</span>
          </div>
          <div v-if="!record.responsiblePerson" class="flex items-center gap-2 text-amber-700 text-sm mb-1">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>注意：未指定负责人，请现场核实身份信息</span>
          </div>
          <div v-if="record.notes" class="flex items-center gap-2 text-slate-600 text-sm">
            <FileText class="w-4 h-4 shrink-0" />
            <span>备注：{{ record.notes }}</span>
          </div>
        </div>

        <div class="px-6 py-5 space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User class="w-4 h-4 text-slate-400" />
                领取人 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.receiverName" type="text" class="input-field text-base py-3" placeholder="请输入领取人姓名" />
              <p class="mt-1 text-xs text-slate-400">如非本人领取，请填写实际领取人姓名</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-slate-400" />
                领取时间 <span class="text-red-500">*</span>
              </label>
              <input v-model="form.receivedAt" type="datetime-local" class="input-field text-base py-3" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <ClipboardList class="w-4 h-4 text-slate-400" />
              交接方式 <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-4 gap-2">
              <label
                v-for="method in HANDOVER_METHOD_LIST"
                :key="method"
                class="cursor-pointer"
              >
                <input
                  type="radio"
                  :value="method"
                  v-model="form.handoverMethod"
                  class="peer sr-only"
                />
                <div
                  class="px-3 py-3 rounded-lg border text-sm text-center transition-all"
                  :class="form.handoverMethod === method
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
                >
                  {{ method }}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Handshake class="w-4 h-4 text-slate-400" />
              经办人 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.handler" type="text" class="input-field text-base py-3" placeholder="请输入经办人姓名" />
            <p class="mt-1 text-xs text-slate-400">负责办理本次领取交接的现场工作人员</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText class="w-4 h-4 text-slate-400" />
              备注
            </label>
            <textarea v-model="form.handoverNotes" class="input-field text-base py-3" rows="2" placeholder="请输入交接备注信息，如代领关系、身份证号、签收确认等" />
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div v-if="validationErrors.length && !isFormValid" class="text-xs text-red-500">
            {{ validationErrors.join('，') }}
          </div>
          <div v-else class="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle class="w-4 h-4 text-emerald-500" />
            <span>信息确认无误后点击完成核销</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-secondary px-5 py-2.5" @click="handleClose">取消</button>
            <button class="btn-primary px-6 py-2.5 flex items-center gap-1.5" :disabled="!isFormValid" @click="handleSave">
              <CheckCircle class="w-4 h-4" />
              确认核销
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
