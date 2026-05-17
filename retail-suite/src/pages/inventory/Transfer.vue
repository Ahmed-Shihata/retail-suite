<!-- Transfer.vue -->
<template>

     <div class="w-full flex min-h-screen" style="font-size: 13px;" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1">
       <!-- ══════════════════ HEADER ══════════════════ -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10 rounded-lg shadow-sm"
          :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
        >
          <div class="px-4 py-2 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <ArrowRightLeft class="w-5 h-5" :style="{ color: 'var(--focus-ring)' }" />
              <div>
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Inventory Transfer</h1>
                <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">Manage stock transfers between locations</p>
              </div>
            </div>
            <button
              @click="showAddModal = true"
              class="inline-flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              :style="{ background: 'var(--focus-ring)' }"
            >
              <Plus class="w-4 h-4" />New Transfer
            </button>
          </div>
        </header>
         <!-- ══════════════════ STATISTICS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">
              Statistics
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            <StatsCard title="Total Transfers" :value="transfers.length" color="blue" />
            <StatsCard title="Pending" :value="summaryStats.pending" color="yellow" />
            <StatsCard title="In Transit" :value="summaryStats.inTransit" color="blue" />
            <StatsCard title="Completed" :value="summaryStats.completed" color="green" />
          </div>
        </section>

        <!-- ══════════════════ FILTERS ══════════════════ -->
        <section class="px-3 pt-3">
         <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
              <!-- Reference No. -->
              <div class="col-span-2">
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Reference No.</label>
                <div class="relative">
                <Search class="absolute left-2.5 top-2 w-3 h-3 pointer-events-none" :style="{ color: 'var(--text-muted)' }" />
                <input
                  v-model="searchReference"
                  type="text"
                  class="w-full pl-8 pr-3 py-1.5 rounded-md focus:outline-none text-xs transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }"
                />
              </div>
              </div>

              <!-- From Location -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">From Location</label>
                <select
                  v-model="fromLocation"
                  class="w-full pl-3 pr-3 py-1.5 rounded-md focus:outline-none text-xs transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }"
                >
                  <option value="">All</option>
                  <option value="main">Main Store</option>
                  <option value="branch1">Branch 1</option>
                  <option value="branch2">Branch 2</option>
                </select>
              </div>
              <!-- To Location -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">To Location</label>
                <select
                  v-model="toLocation"
                  class="w-full pl-3 pr-3 py-1.5 rounded-md focus:outline-none text-xs transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }"
                >
                  <option value="">All</option>
                  <option value="main">Main Store</option>
                  <option value="branch1">Branch 1</option>
                  <option value="branch2">Branch 2</option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Status</label>
                <select
                  v-model="statusFilter"
                  class="w-full pl-3 pr-3 py-1.5 rounded-md focus:outline-none text-xs transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <!-- Count -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Count</label>
                <div
                  class="px-2 py-1.5 rounded-md font-semibold text-xs"
                  :style="{
                    background: 'var(--item-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--item-border)'
                  }"
                >
                  {{ filteredTransfers.length }}
                 </div>
              </div>

              <!-- Clear -->
              <div class="flex items-end">
                <button
                  @click="resetFilters"
                  class="w-full px-3 py-1.5 rounded-md text-xs transition-colors"
                  :style="{
                    background: 'var(--item-bg)',
                    color: 'var(--text-sub)',
                    border: '1px solid var(--item-border)'
                  }"
                  @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                  @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </section>

         <!-- ══════════════════ TABLE ══════════════════ -->
         <section class="px-3 pt-3 pb-3">
          <div
            class="rounded-lg shadow-sm flex flex-col overflow-hidden"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
              <!-- Table Header Bar -->
              <div
                class="px-4 py-2 flex items-center gap-2"
                :style="{ borderBottom: '1px solid var(--card-border)' }"
              >
                <arrow-right-left class="w-4 h-4" :style="{ color: 'var(--focus-ring)' }" />
                <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Transfer Records</span>
                <span class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ filteredTransfers.length }}</span>
                <span v-if="loading" class="text-xs ml-auto" :style="{ color: 'var(--text-muted)' }">Loading...</span>
              </div>

              <!-- Table -->
              <div class="overflow-x-auto" style="scrollbar-width: thin;">
              <table class="w-full border-collapse" style="font-size: 12px; min-width: 700px;">
                <thead class="sticky top-0 z-10" :style="{ background: 'var(--item-bg)' }">
                    <tr>
                      <th
                        v-for="label in ['Reference', 'Date', 'From', 'To', 'Item Count', 'Qty', 'Status', 'Actions']"
                        :key="label"
                        class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                        :class="['Item Count','Qty', 'Actions'].includes(label) ? 'text-center' : ''"
                        :style="{ color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }"
                      >
                        {{ label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">

                    <!-- loading -->
                    <tr v-if="loading">
                    <td colspan="7" class="py-10 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5 animate-spin" :style="{ color: 'var(--focus-ring)' }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        <span class="text-xs" :style="{ color: 'var(--text-muted)' }">Loading transfers...</span>
                      </div>
                    </td>
                    </tr>

                    <!-- empty state -->
                    <tr v-else-if="!loading && paginatedTransfers.length === 0">
                      <td colspan="7" class="py-14 text-center">
                        <div class="flex flex-col items-center gap-2">
                          <div
                            class="w-10 h-10 flex items-center justify-center rounded-full mb-1"
                            :style="{ background: 'var(--item-bg)' }"
                          >
                            <ArrowRightLeft class="w-5 h-5" :style="{ color: 'var(--text-muted)' }" />
                          </div>
                          <div class="text-sm font-medium" :style="{ color: 'var(--text-muted)' }">No transfers found</div>
                          <button
                            @click="showAddModal = true"
                            class="mt-3 inline-flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            :style="{ background: 'var(--focus-ring)' }"
                          >
                            <Plus class="w-4 h-4" />Create Transfer
                          </button>
                        </div>
                      </td>
                    </tr>

                    <!-- transfer rows -->
                    <tr
                      v-else
                      v-for="transfer in paginatedTransfers"
                      :key="transfer.id"
                      class="transition-colors"
                      :style="{ borderBottom: '1px solid var(--card-border)' }"
                      @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                      @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
                      >
                      <!-- Reference -->
                      <td class="px-3 py-2 whitespace-nowrap">
                        <span
                        class="font-mono text-xs px-2 py-0.5 rounded font-medium"
                        :style="{ background: 'var(--item-bg)', color: 'var(--text-sub)', border: '1px solid var(--item-border)' }"
                      >{{ transfer.reference }}</span>
                      </td>
                      <!-- Date -->
                      <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-muted)' }">
                        {{ formatDate(transfer.date) }}
                      </td>
                      <!-- From Location -->
                      <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-sub)' }">{{ getLocationName(transfer.fromLocation) }}</td>
                      <!-- To Location -->
                      <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-sub)' }">{{ getLocationName(transfer.toLocation) }}</td>
                      <!-- Item Count -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs text-center" :style="{ color: 'var(--text-muted)' }">
                        <span
                            v-if="transfer.items.length > 0"
                            class="inline-flex items-center justify-center w-5 h-5 text-white rounded-full font-semibold"
                            style="font-size:10px;"
                            :style="{ background: 'var(--focus-ring)' }"
                          >
                          {{ transfer.items.length }}
                        </span>
                      </td>
                      <!-- Total Quantity -->
                      <td class="px-3 py-2 whitespace-nowrap text-center font-semibold text-xs" :style="{ color: 'var(--focus-ring)' }">
                        {{ transfer.items.reduce((sum, i) => sum + i.quantity, 0) }}
                      </td>
                      <!-- Status badge -->
                      <td class="px-3 py-2 text-sm">
                        <span :class="getStatusBadge(transfer.status)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {{ transfer.status }}
                        </span>
                      </td>
                      <!-- Action buttons -->
                     <td class="px-3 py-2 whitespace-nowrap">
                      <div class="flex items-center justify-center gap-1">
                          <button
                            @click="viewTransfer(transfer)"
                            class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                            :style="{ color: 'var(--focus-ring)' }"
                            @mouseover="$event.currentTarget.style.background = 'var(--info-bg)'"
                            @mouseleave="$event.currentTarget.style.background = 'transparent'"
                            title="View"
                          >
                            <Eye class="w-4 h-4" />
                          </button>
                          <button
                            v-if="transfer.status !== 'completed'"
                            @click="editTransfer(transfer)"
                            class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                            :style="{ color: 'var(--warning-border)' }"
                            @mouseover="$event.currentTarget.style.background = 'var(--warning-bg)'"
                            @mouseleave="$event.currentTarget.style.background = 'transparent'"
                            title="Edit"
                          >
                            <Edit2 class="w-4 h-4" />
                          </button>
                          <button
                            @click="deleteTransfer(transfer)"
                            class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                            style="color: #ef4444;"
                            @mouseover="$event.currentTarget.style.background = '#fef2f2'"
                            @mouseleave="$event.currentTarget.style.background = 'transparent'"
                            title="Delete"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div
                v-if="totalPages > 1"
                class="px-4 py-2.5"
                :style="{ borderTop: '1px solid var(--card-border)', background: 'var(--item-bg)' }"
               >
                <div class="flex items-center justify-between">
                <span class="text-xs" :style="{ color: 'var(--text-muted)' }">
                    Total Pages: {{totalPages}}
                   </span>
                    <div class="flex items-center gap-1">
                      <button
                        @click="currentPage = Math.max(1, currentPage - 1)"
                        :disabled="currentPage === 1"
                        class="px-2 py-1 text-xs rounded disabled:opacity-40 transition-colors"
                        :style="{ border: '1px solid var(--card-border)', color: 'var(--text-sub)', background: 'var(--card-bg)' }"
                        @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                        @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
                      >
                        Previous
                      </button>

                      <!-- Page numbers -->
                      <button
                        v-for="page in visiblePages"
                        :key="page"
                        @click="currentPage = page"
                        class="px-2 py-1 text-xs rounded transition-colors font-medium"
                        :style="currentPage === page
                        ? { background: 'var(--focus-ring)', color: '#fff', border: '1px solid var(--focus-ring)' }
                        : { background: 'var(--card-bg)', color: 'var(--text-sub)', border: '1px solid var(--card-border)' }"
                        >{{ page }}</button>

                      <!-- btn Next -->
                      <button
                        @click="currentPage = Math.min(totalPages, currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="px-2 py-1 text-xs rounded disabled:opacity-40 transition-colors"
                        :style="{ border: '1px solid var(--card-border)', color: 'var(--text-sub)', background: 'var(--card-bg)' }"
                        @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
                        @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                      >
                        Next
                      </button>
                    </div>
                </div>
              </div>

              </div>
            </section>

        <!-- Transfer Modal -->
        <TransferModal
          v-if="showAddModal || showEditModal"
          :show="showAddModal || showEditModal"
          :transfer="editingTransfer"
          :is-editing="showEditModal"
          @save="saveTransfer"
          @close="closeModal"
        />

        <!-- Transfer Detail Modal -->
        <TransferDetailModal
          v-if="showDetailModal"
          :transfer="selectedTransfer"
          @close="showDetailModal = false"
        />
      </main>
    </div>

</template>

<script setup>
import { ref, computed, reactive }   from 'vue'
import MainLayout          from '@/layout/MainLayout.vue'
import Sidebar             from '@/layout/Sidebar.vue'
import StatsCard           from '@/layout/StatsCard.vue'
import TransferModal       from '@/components/modals/TransferModal.vue'
import TransferDetailModal from '@/components/modals/TransferDetailModal.vue'
import { ArrowRightLeft, Plus, Eye, Edit2, Trash2 } from 'lucide-vue-next'

const loading         = ref(false)
const searchReference = ref('')
const fromLocation = ref('')
const toLocation = ref('')
const statusFilter = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const editingTransfer = ref(null)
const selectedTransfer = ref(null)

  // Pagination
const currentPage  = ref(1)
const itemsPerPage = ref(5)

const paginatedTransfers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTransfers.value.slice(start, start + itemsPerPage.value)
})

// Mock data - replace with actual API
const transfers = ref([
  {
    id: 1,
    reference: 'TRF-001',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    fromLocation: 'main',
    toLocation: 'branch1',
    items: [
      { itemCode: 'ITEM001', itemName: 'Coffee Beans', quantity: 20 }
    ],
    status: 'completed'
  },
  {
    id: 2,
    reference: 'TRF-002',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    fromLocation: 'branch1',
    toLocation: 'branch2',
    items: [
      { itemCode: 'ITEM002', itemName: 'Tea Leaves', quantity: 15 }
    ],
    status: 'in-transit'
  },
  {
    id: 3,
    reference: 'TRF-003',
    date: new Date(),
    fromLocation: 'main',
    toLocation: 'branch2',
    items: [
      { itemCode: 'ITEM003', itemName: 'Pastry', quantity: 30 }
    ],
    status: 'pending'
  },
  {
    id: 4,
    reference: 'TRF-004',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    fromLocation: 'branch2',
    toLocation: 'main',
    items: [
      { itemCode: 'ITEM004', itemName: 'Milk', quantity: 50 }
    ],
    status: 'completed'
  },
  {
    id: 5,
    reference: 'TRF-005',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    fromLocation: 'branch1',
    toLocation: 'main',
    items: [
      { itemCode: 'ITEM005', itemName: 'Sugar', quantity: 40 }
    ],
    status: 'in-transit'
  },
    {
      id: 6,
      reference: 'TRF-006',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      fromLocation: 'main',
      toLocation: 'branch1',
      items: [
        { itemCode: 'ITEM006', itemName: 'Syrup', quantity: 25 }
      ],
      status: 'pending'
    },
      {
        id: 7,
        reference: 'TRF-007',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        fromLocation: 'branch2',
        toLocation: 'branch1',
        items: [
          { itemCode: 'ITEM007', itemName: 'Cups', quantity: 100 }
        ],
        status: 'completed'
      },
      {
        id: 8,
        reference: 'TRF-008',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        fromLocation: 'branch1',
        toLocation: 'branch2',
        items: [
          { itemCode: 'ITEM008', itemName: 'Napkins', quantity: 200 }
        ],
        status: 'in-transit'
      },
      {
        id: 9,
        reference: 'TRF-009',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        fromLocation: 'main',
        toLocation: 'branch2',
        items: [
          { itemCode: 'ITEM009', itemName: 'Straws', quantity: 150 }
        ],
        status: 'pending'
      },
        {
          id: 10,
          reference: 'TRF-010',
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          fromLocation: 'branch2',
          toLocation: 'main',
          items: [
            { itemCode: 'ITEM010', itemName: 'Cups', quantity: 80 }
          ],
          status: 'completed'
        },
        {
          id: 11,
          reference: 'TRF-011',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          fromLocation: 'branch1',
          toLocation: 'main',
          items: [
            { itemCode: 'ITEM011', itemName: 'Spoons', quantity: 300 }
          ],
          status: 'in-transit'
        },
        {
          id: 12,
          reference: 'TRF-012',
          date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          fromLocation: 'main',
          toLocation: 'branch1',
          items: [
            { itemCode: 'ITEM012', itemName: 'Forks', quantity: 250 }
          ],
          status: 'pending'
        },
        {
        id: 13,
        reference: 'TRF-004',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fromLocation: 'branch2',
        toLocation: 'main',
        items: [
          { itemCode: 'ITEM004', itemName: 'Milk', quantity: 50 }
        ],
        status: 'completed'
      },
      {
        id: 14,
        reference: 'TRF-005',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        fromLocation: 'branch1',
        toLocation: 'main',
        items: [
          { itemCode: 'ITEM005', itemName: 'Sugar', quantity: 40 }
        ],
        status: 'in-transit'
      },
        {
          id: 15,
          reference: 'TRF-006',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          fromLocation: 'main',
          toLocation: 'branch1',
          items: [
            { itemCode: 'ITEM006', itemName: 'Syrup', quantity: 25 }
          ],
          status: 'pending'
        },
          {
            id: 16,
            reference: 'TRF-007',
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            fromLocation: 'branch2',
            toLocation: 'branch1',
            items: [
              { itemCode: 'ITEM007', itemName: 'Cups', quantity: 100 }
            ],
            status: 'completed'
          },
          {
            id: 17,
            reference: 'TRF-008',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            fromLocation: 'branch1',
            toLocation: 'branch2',
            items: [
              { itemCode: 'ITEM008', itemName: 'Napkins', quantity: 200 }
            ],
            status: 'in-transit'
          },
          {
            id: 18,
            reference: 'TRF-009',
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            fromLocation: 'main',
            toLocation: 'branch2',
            items: [
              { itemCode: 'ITEM009', itemName: 'Straws', quantity: 150 }
            ],
            status: 'pending'
          },
            {
              id: 19,
              reference: 'TRF-010',
              date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
              fromLocation: 'branch2',
              toLocation: 'main',
              items: [
                { itemCode: 'ITEM010', itemName: 'Cups', quantity: 80 }
              ],
              status: 'completed'
            },
            {
              id: 20,
              reference: 'TRF-011',
              date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              fromLocation: 'branch1',
              toLocation: 'main',
              items: [
                { itemCode: 'ITEM011', itemName: 'Spoons', quantity: 300 }
              ],
              status: 'in-transit'
            },
            {
              id: 21,
              reference: 'TRF-012',
              date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
              fromLocation: 'main',
              toLocation: 'branch1',
              items: [
                { itemCode: 'ITEM012', itemName: 'Forks', quantity: 250 }
              ],
              status: 'pending'
            }
])

const filteredTransfers = computed(() => {
  let data = [...transfers.value]

  if (searchReference.value) {
    data = data.filter(t => t.reference.toLowerCase().includes(searchReference.value.toLowerCase()))
  }

  if (fromLocation.value) {
    data = data.filter(t => t.fromLocation === fromLocation.value)
  }

  if (toLocation.value) {
    data = data.filter(t => t.toLocation === toLocation.value)
  }

  if (statusFilter.value) {
    data = data.filter(t => t.status === statusFilter.value)
  }

  return data.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const summaryStats = computed(() => {
  return {
    pending: transfers.value.filter(t => t.status === 'pending').length,
    inTransit: transfers.value.filter(t => t.status === 'in-transit').length,
    completed: transfers.value.filter(t => t.status === 'completed').length
  }
})

const getStatusBadge = (status) => {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-transit': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const getLocationName = (location) => {
  const names = {
    main: 'Main Store',
    branch1: 'Branch 1',
    branch2: 'Branch 2'
  }
  return names[location] || location
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const viewTransfer = (transfer) => {
  selectedTransfer.value = transfer
  showDetailModal.value = true
}

const editTransfer = (transfer) => {
  editingTransfer.value = { ...transfer }
  showEditModal.value = true
}

const saveTransfer = (transferData) => {
  if (showEditModal.value && editingTransfer.value) {
    const index = transfers.value.findIndex(t => t.id === editingTransfer.value.id)
    transfers.value[index] = { ...editingTransfer.value, ...transferData }
  } else {
    transfers.value.push({
      id: Math.max(...transfers.value.map(t => t.id), 0) + 1,
      ...transferData
    })
  }
  closeModal()
}

const deleteTransfer = (transfer) => {
      transfers.value = transfers.value.filter(t => t.id !== transfer.id)
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingTransfer.value = null
}

const totalPages = computed(() => {
    return Math.ceil(filteredTransfers.value.length / itemsPerPage.value)
})
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end   = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const resetFilters = () => {
    searchReference.value = ''
    fromLocation.value = ''
    toLocation.value = ''
    statusFilter.value = ''
    currentPage.value = 1
  }
</script>
