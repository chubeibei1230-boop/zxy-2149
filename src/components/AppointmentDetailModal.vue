<script setup lang="ts">
import { computed } from 'vue'
import { X, Clock, Phone, User, FileText, CalendarClock, Truck, AlertTriangle, ClipboardCheck, MessageSquare } from 'lucide-vue-next'
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
  'register-appointment': [record: BadgeRecord]
  'cancel-appointment': [record: BadgeRecord]
  'register-reissue': [record: BadgeRecord]
  'mark-overdue': [record: BadgeRecord]
}>()

const store = useBadgeStore()

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && record" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-blue-50">
          <div class="flex items-center gap-2">
            <CalendarClock class="w-5 h-5 text-blue-600" />
            <h2 class="text-lg font-semibold text-slate-800">预约详情</h2>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
              :style="{ backgroundColor: COLOR_MAP[record.badgeColor] }"
            >
              {{ record.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-slate-800">{{ record.name }}</span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  :style="{ backgroundColor: PICKUP_STATUS_COLOR_MAP[record.pickupStatus] }"
                >
                  {{ record.pickupStatus }}
                </span>
              </div>
              <div class="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span>{{ record.company }}</span>
                <span>{{ record.attendeeType }}</span>
                <span>{{ record.printBatch || '未分配' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="record.appointment" class="px-6 py-4 space-y-4">
          <div class="text-xs font-semibold text-blue-700 flex items-center gap-1.5 bg-blue-50 px-3 py-2 rounded-lg">
            <CalendarClock class="w-3.5 h-3.5" />
            预约信息
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-start gap-2">
              <Clock class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p class="text-xs text-slate-500">预约领取时间</p>
                <p class="text-sm font-medium text-slate-800">{{ store.formatDateTime(record.appointment.scheduledTime) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <Truck class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p class="text-xs text-slate-500">预计领取方式</p>
                <p class="text-sm font-medium text-slate-800">{{ record.appointment.pickupMethod }}</p>
              </div>
            </div>
          </div>

          <div v-if="record.appointment.contactInfo" class="flex items-start gap-2">
            <Phone class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-500">联系方式</p>
              <p class="text-sm font-medium text-slate-800">{{ record.appointment.contactInfo }}</p>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <User class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-500">经办人</p>
              <p class="text-sm font-medium text-slate-800">{{ record.appointment.operator }}</p>
            </div>
          </div>

          <div v-if="record.appointment.notes" class="flex items-start gap-2">
            <FileText class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-500">预约备注</p>
              <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ record.appointment.notes }}</p>
            </div>
          </div>

          <div class="text-xs text-slate-400">
            预约登记时间：{{ store.formatDateTime(record.appointment.createdAt) }}
          </div>
        </div>

        <div v-if="record.reissue" class="px-6 py-4 space-y-4 border-t border-slate-100">
          <div class="text-xs font-semibold text-violet-700 flex items-center gap-1.5 bg-violet-50 px-3 py-2 rounded-lg">
            <ClipboardCheck class="w-3.5 h-3.5" />
            补领/代领信息
          </div>

          <div class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-500">领取原因</p>
              <p class="text-sm font-medium text-slate-800">{{ record.reissue.reason }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-start gap-2">
              <User class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p class="text-xs text-slate-500">实际领取人</p>
                <p class="text-sm font-medium text-slate-800">{{ record.reissue.actualReceiver }}</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <FileText class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p class="text-xs text-slate-500">经办人</p>
                <p class="text-sm font-medium text-slate-800">{{ record.reissue.handler }}</p>
              </div>
            </div>
          </div>

          <div v-if="record.reissue.processNotes" class="flex items-start gap-2">
            <MessageSquare class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-500">处理说明</p>
              <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ record.reissue.processNotes }}</p>
            </div>
          </div>

          <div class="text-xs text-slate-400">
            补领登记时间：{{ store.formatDateTime(record.reissue.createdAt) }} · 操作人：{{ record.reissue.operator }}
          </div>
        </div>

        <div v-if="!record.appointment && !record.reissue" class="px-6 py-8 text-center">
          <CalendarClock class="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p class="text-sm text-slate-500">暂无预约信息</p>
          <p class="text-xs text-slate-400 mt-1">该胸卡尚未登记预约领取</p>
        </div>

        <div class="flex items-center gap-2 px-6 py-4 border-t border-slate-200 flex-wrap">
          <button
            v-if="record.pickupStatus === '已预约'"
            class="btn-secondary text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
            @click="$emit('mark-overdue', record)"
          >
            标记逾期
          </button>
          <button
            v-if="record.pickupStatus === '已预约' || record.pickupStatus === '已逾期'"
            class="btn-secondary text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            @click="$emit('cancel-appointment', record)"
          >
            取消预约
          </button>
          <button
            v-if="record.pickupStatus !== '已领取'"
            class="btn-secondary text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200"
            @click="$emit('register-reissue', record)"
          >
            补领/代领
          </button>
          <button
            v-if="!record.appointment && record.pickupStatus !== '已领取'"
            class="btn-secondary text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            @click="$emit('register-appointment', record)"
          >
            登记预约
          </button>
          <div class="flex-1" />
          <button class="btn-secondary" @click="handleClose">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
