<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { X, User, Clock, FileText, Handshake, ClipboardList } from 'lucide-vue-next'
import { HANDOVER_METHOD_LIST } from '@/types'
import type { HandoverInfo, HandoverMethod, BadgeRecord } from '@/types'
import { useBadgeStore } from '@/composables/useBadgeStore'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  visible: boolean
  recordIds: string[]
  defaultRecord?: BadgeRecord | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useBadgeStore()

const isBatch = computed(() => props.recordIds.length > 1)

const targetRecords = computed(() => {
  return store.records.filter((r) => props.recordIds.includes(r.id))
})

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
  if (props.defaultRecord?.handover) {
    const h = props.defaultRecord.handover
    form.receiverName = h.receiverName
    const d = new Date(h.receivedAt)
    const tzOffset = d.getTimezoneOffset() * 60000
    const local = new Date(d.getTime() - tzOffset)
    form.receivedAt = local.toISOString().slice(0, 16)
    form.handoverMethod = h.handoverMethod
    form.handler = h.handler
    form.handoverNotes = h.handoverNotes
  } else if (!isBatch.value && props.defaultRecord) {
    form.receiverName = props.defaultRecord.name
    form.receivedAt = getLocalDateTime()
    form.handoverMethod = '当面领取'
    form.handler = props.defaultRecord.responsiblePerson || ''
    form.handoverNotes = ''
  } else {
    form.receiverName = ''
    form.receivedAt = getLocalDateTime()
    form.handoverMethod = '当面领取'
    form.handler = ''
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
  if (!isFormValid.value) return
  const handoverInfo: HandoverInfo = {
    receiverName: form.receiverName.trim(),
    receivedAt: new Date(form.receivedAt).toISOString(),
    handoverMethod: form.handoverMethod as HandoverMethod,
    handler: form.handler.trim(),
    handoverNotes: form.handoverNotes.trim(),
  }
  store.batchRegisterHandover(props.recordIds, handoverInfo)
  emit('saved')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <Handshake class="w-5 h-5 text-primary-600" />
            <h2 class="text-lg font-semibold text-slate-800">
              {{ isBatch ? `批量领取登记（${recordIds.length}条）` : '领取登记' }}
            </h2>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div v-if="isBatch && targetRecords.length > 0" class="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <p class="text-xs text-blue-700">
            将为以下 <span class="font-semibold">{{ targetRecords.length }}</span> 条胸卡记录登记领取交接信息，状态将自动更新为「已领取」
          </p>
          <div class="mt-2 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
            <span
              v-for="r in targetRecords.slice(0, 10)"
              :key="r.id"
              class="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 rounded px-2 py-0.5"
            >
              {{ r.name }}
              <span class="text-blue-400">{{ r.company }}</span>
            </span>
            <span v-if="targetRecords.length > 10" class="text-xs text-blue-500">
              等 {{ targetRecords.length }} 人
            </span>
          </div>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-slate-400" />
              领取人 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.receiverName" type="text" class="input-field" placeholder="请输入领取人姓名" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              领取时间 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.receivedAt" type="datetime-local" class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <ClipboardList class="w-3.5 h-3.5 text-slate-400" />
              交接方式 <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
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
                  class="px-3 py-2 rounded-lg border text-sm text-center transition-all"
                  :class="form.handoverMethod === method
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
                >
                  {{ method }}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-slate-400" />
              经办人 <span class="text-red-500">*</span>
            </label>
            <input v-model="form.handler" type="text" class="input-field" placeholder="请输入经办人姓名" />
            <p class="mt-1 text-xs text-slate-400">负责办理本次领取交接的工作人员</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-slate-400" />
              备注
            </label>
            <textarea v-model="form.handoverNotes" class="input-field" rows="3" placeholder="请输入交接备注信息，如代领关系、签收确认等" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <div v-if="validationErrors.length && !isFormValid" class="flex-1 text-xs text-red-500">
            {{ validationErrors.join('，') }}
          </div>
          <div v-else class="flex-1" />
          <button class="btn-secondary" @click="handleClose">取消</button>
          <button class="btn-primary" :disabled="!isFormValid" @click="handleSave">确认登记</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
