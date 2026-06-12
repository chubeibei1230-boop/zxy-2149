<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBadgeStore } from '@/composables/useBadgeStore'
import type { BadgeRecord } from '@/types'
import StatsBar from '@/components/StatsBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import CheckPanel from '@/components/CheckPanel.vue'
import BadgeCardGroup from '@/components/BadgeCardGroup.vue'
import RecordFormModal from '@/components/RecordFormModal.vue'
import BatchToolbar from '@/components/BatchToolbar.vue'
import BatchMode from '@/components/BatchMode.vue'
import { Plus, LayoutGrid, Package, Search } from 'lucide-vue-next'

const store = useBadgeStore()

const showForm = ref(false)
const editingRecord = ref<BadgeRecord | null>(null)
const mode = ref<'normal' | 'batch'>('normal')

const colorOrder = ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色', '灰色']

const sortedColorGroups = computed(() => {
  const groups = store.groupedByColor
  return colorOrder
    .filter((c) => groups[c] && groups[c].length > 0)
    .map((c) => ({ color: c, records: groups[c] }))
})

function handleAdd() {
  editingRecord.value = null
  showForm.value = true
}

function handleEdit(record: BadgeRecord) {
  editingRecord.value = record
  showForm.value = true
}

function handleDelete(id: string) {
  if (confirm('确定删除此记录？')) {
    store.deleteRecord(id)
  }
}

function handleSave(data: Omit<BadgeRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  if (editingRecord.value) {
    store.updateRecord(editingRecord.value.id, data)
  } else {
    store.addRecord(data)
  }
  showForm.value = false
  editingRecord.value = null
}

function handleClose() {
  showForm.value = false
  editingRecord.value = null
}
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-50">
    <header class="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <LayoutGrid class="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 class="text-base font-semibold text-slate-800">展会胸卡制作清单</h1>
            <p class="text-xs text-slate-400">管理胸卡设计、打印与领取全流程</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="mode === 'normal'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="mode = 'normal'"
          >
            <LayoutGrid class="w-4 h-4" />
            常规模式
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="mode === 'batch'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="mode = 'batch'"
          >
            <Package class="w-4 h-4" />
            批次制作
          </button>
          <div class="w-px h-6 bg-slate-200 mx-1" />
          <button class="btn-primary flex items-center gap-1.5" @click="handleAdd">
            <Plus class="w-4 h-4" />
            新增胸卡
          </button>
        </div>
      </div>
      <div class="mt-3">
        <StatsBar />
      </div>
    </header>

    <BatchMode v-if="mode === 'batch'" @back="mode = 'normal'" />

    <div v-else class="flex flex-1 overflow-hidden">
      <FilterPanel />

      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="px-6 pt-4">
          <CheckPanel />
        </div>

        <div class="flex-1 overflow-y-auto px-6 pb-20">
          <div v-if="store.filteredRecords.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search class="w-12 h-12 mb-3 opacity-40" />
            <p class="text-sm">暂无匹配的胸卡记录</p>
            <p class="text-xs mt-1">尝试调整筛选条件或新增记录</p>
          </div>

          <div v-else class="space-y-4 pt-3">
            <BadgeCardGroup
              v-for="group in sortedColorGroups"
              :key="group.color"
              :color="group.color"
              :records="group.records"
              :selected-ids="store.selectedIds"
              @edit="handleEdit"
              @delete="handleDelete"
              @toggle-select="store.toggleSelect"
            />
          </div>
        </div>

        <BatchToolbar />
      </main>
    </div>

    <RecordFormModal
      :visible="showForm"
      :record="editingRecord"
      @close="handleClose"
      @save="handleSave"
    />
  </div>
</template>
