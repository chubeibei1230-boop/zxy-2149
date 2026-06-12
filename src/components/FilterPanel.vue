<template>
  <div class="w-60 flex-shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto">
    <div class="flex items-center gap-2 text-slate-700 font-semibold text-sm">
      <Filter class="w-4 h-4" />
      <span>筛选条件</span>
    </div>

    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">姓名搜索</label>
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            v-model="store.filter.searchName"
            type="text"
            placeholder="输入姓名..."
            class="input-field pl-8"
          />
          <button
            v-if="store.filter.searchName"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            @click="store.filter.searchName = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div class="h-px bg-slate-100" />

      <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        <ClipboardList class="w-3.5 h-3.5" />
        基础信息
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">参会类型</label>
        <select v-model="store.filter.attendeeType" class="select-field">
          <option value="">全部</option>
          <option v-for="t in ATTENDEE_TYPE_LIST" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">证件颜色</label>
        <select v-model="store.filter.badgeColor" class="select-field">
          <option value="">全部</option>
          <option v-for="c in COLOR_LIST" :key="c" :value="c">
            {{ c }}
          </option>
        </select>
        <div v-if="store.filter.badgeColor" class="flex items-center gap-1.5 mt-0.5">
          <span
            class="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
            :style="{ backgroundColor: COLOR_MAP[store.filter.badgeColor as BadgeColor] }"
          ></span>
          <span class="text-xs text-slate-500">{{ store.filter.badgeColor }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">打印批次</label>
        <select v-model="store.filter.printBatch" class="select-field">
          <option value="">全部</option>
          <option value="__empty__">未指定</option>
          <option v-for="b in store.allBatches" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">负责人</label>
        <select v-model="store.filter.responsiblePerson" class="select-field">
          <option value="">全部</option>
          <option value="__empty__">未指定</option>
          <option v-for="p in store.allResponsiblePersons" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">状态</label>
        <select v-model="store.filter.status" class="select-field">
          <option value="">全部</option>
          <option v-for="s in STATUS_LIST" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div class="h-px bg-slate-100" />

      <div class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        <Handshake class="w-3.5 h-3.5" />
        领取交接
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">领取状态</label>
        <select v-model="store.filter.handoverStatus" class="select-field">
          <option value="">全部</option>
          <option value="已领取">已领取（有交接信息）</option>
          <option value="未领取">未领取（无交接信息）</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">经办人</label>
        <select v-model="store.filter.handoverHandler" class="select-field">
          <option value="">全部</option>
          <option value="__empty__">未指定</option>
          <option v-for="h in store.allHandoverHandlers" :key="h" :value="h">{{ h }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">领取时间范围</label>
        <div class="flex flex-col gap-1.5">
          <div class="relative">
            <Calendar class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              v-model="store.filter.handoverStartDate"
              type="date"
              class="input-field pl-8 text-xs"
              placeholder="开始日期"
            />
          </div>
          <div class="relative">
            <Calendar class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              v-model="store.filter.handoverEndDate"
              type="date"
              class="input-field pl-8 text-xs"
              placeholder="结束日期"
            />
          </div>
        </div>
      </div>
    </div>

    <button class="btn-secondary flex items-center justify-center gap-1.5 mt-auto" @click="store.clearFilter()">
      <X class="w-3.5 h-3.5" />
      <span>清空筛选</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Filter, X, Search, Handshake, ClipboardList, Calendar } from 'lucide-vue-next'
import { useBadgeStore } from '@/composables/useBadgeStore'
import { COLOR_LIST, ATTENDEE_TYPE_LIST, STATUS_LIST, COLOR_MAP } from '@/types'
import type { BadgeColor, AttendeeType, BadgeStatus } from '@/types'

const store = useBadgeStore()
</script>
