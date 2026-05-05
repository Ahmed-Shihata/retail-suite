<template>
  <div fluid>
    <v-row v-show="!dialog">
      <!-- Main Content Section -->
      <v-col md="8" cols="12" class="pb-2 pr-0">
        <v-card
          class="main mx-auto grey lighten-5 mt-3 p-3 pb-16 overflow-y-auto"
          style="max-height: 94vh; height: 94vh"
        >
          <!-- Customer Section -->
          <Customer />
          <v-divider></v-divider>

          <!-- Invoices Section -->
          <div v-if="pos_profile?.posa_allow_reconcile_payments">
            <v-row>
              <v-col md="7" cols="12">
                <p>
                  <strong>{{ ('Invoices') }}</strong>
                  <span v-if="total_outstanding_amount" class="primary--text">
                    {{ ('- Total Outstanding') }} :
                    {{ pos_profile.currency }}
                    {{ formatCurrency(total_outstanding_amount) }}
                  </span>
                </p>
              </v-col>
              <v-col md="5" cols="12">
                <p v-if="total_selected_invoices" class="golden--text text-end">
                  <span>{{ ('Total Selected :') }}</span>
                  <span>
                    {{ pos_profile.currency }}
                    {{ formatCurrency(total_selected_invoices) }}
                  </span>
                </p>
              </v-col>
            </v-row>

            <!-- Search Row -->
            <v-row align="center" no-gutters class="mb-1">
              <v-col md="4" cols="12">
                <v-select
                  dense
                  outlined
                  hide-details
                  clearable
                  background-color="white"
                  v-model="pos_profile_search"
                  :items="pos_profiles_list"
                  item-value="name"
                  :label="('Select POS Profile')"
                  class="select-field"
                ></v-select>
              </v-col>
              <v-col></v-col>
              <v-col md="3" cols="12">
                <v-btn
                  block
                  color="warning"
                  dark
                  @click="get_outstanding_invoices"
                  class="search-btn"
                >
                  {{ ('Search') }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Invoices Table -->
            <v-data-table
              :headers="invoices_headers"
              :items="outstanding_invoices"
              item-key="name"
              class="elevation-1 mt-0 data-table"
              show-select
              v-model="selected_invoices"
              :loading="invoices_loading"
              checkbox-color="primary"
              @item-selected="onInvoiceSelected"
            >
              <template v-slot:item.grand_total="{ item }">
                <span class="currency-text">{{ item.currency }} {{ formatCurrency(item.grand_total) }}</span>
              </template>
              <template v-slot:item.outstanding_amount="{ item }">
                <span class="primary--text currency-text">
                  {{ item.currency }}
                  {{ formatCurrency(item.outstanding_amount) }}
                </span>
              </template>
            </v-data-table>
            <v-divider></v-divider>
          </div>

          <!-- Payments Section -->
          <div
            v-if="
              pos_profile?.posa_allow_reconcile_payments &&
              unallocated_payments?.length
            "
          >
            <v-row>
              <v-col md="7" cols="12">
                <p>
                  <strong>{{ ('Payments') }}</strong>
                  <span v-if="total_unallocated_amount" class="primary--text">
                    {{ ('- Total Unallocated') }} :
                    {{ pos_profile.currency }}
                    {{ formatCurrency(total_unallocated_amount) }}
                  </span>
                </p>
              </v-col>
              <v-col md="5" cols="12">
                <p v-if="total_selected_payments" class="golden--text text-end">
                  <span>{{ ('Total Selected :') }}</span>
                  <span>
                    {{ pos_profile.currency }}
                    {{ formatCurrency(total_selected_payments) }}
                  </span>
                </p>
              </v-col>
            </v-row>

            <!-- Payments Table -->
            <v-data-table
              :headers="unallocated_payments_headers"
              :items="unallocated_payments"
              item-key="name"
              class="elevation-1 mt-0 data-table"
              :single-select="singleSelect"
              show-select
              v-model="selected_payments"
              :loading="unallocated_payments_loading"
              checkbox-color="primary"
            >
              <template v-slot:item.paid_amount="{ item }">
                <span class="currency-text">{{ item.currency }} {{ formatCurrency(item.paid_amount) }}</span>
              </template>
              <template v-slot:item.unallocated_amount="{ item }">
                <span class="primary--text currency-text">
                  {{ item.currency }}
                  {{ formatCurrency(item.unallocated_amount) }}
                </span>
              </template>
            </v-data-table>
            <v-divider></v-divider>
          </div>

          <!-- M-Pesa Payments Section -->
          <div v-if="pos_profile?.posa_allow_reconcile_payments">
            <v-row>
              <v-col md="8" cols="12">
                <p>
                  <span><strong>{{ ('Search Mpesa Payments') }}</strong></span>
                </p>
              </v-col>
              <v-col md="4" cols="12" v-if="total_selected_mpesa_payments">
                <p class="golden--text text-end">
                  <span>{{ ('Total Selected :') }}</span>
                  <span>
                    {{ pos_profile.currency }}
                    {{ formatCurrency(total_selected_mpesa_payments) }}
                  </span>
                </p>
              </v-col>
            </v-row>

            <!-- M-Pesa Search Row -->
            <v-row align="center" no-gutters class="mb-1">
              <v-col md="4" cols="12" class="mr-1">
                <v-text-field
                  dense
                  outlined
                  color="primary"
                  :label="('Search by Name')"
                  background-color="white"
                  hide-details
                  v-model="mpesa_search_name"
                  clearable
                  class="search-field"
                ></v-text-field>
              </v-col>
              <v-col md="4" cols="12" class="mr-1">
                <v-text-field
                  dense
                  outlined
                  color="primary"
                  :label="('Search by Mobile')"
                  background-color="white"
                  hide-details
                  v-model="mpesa_search_mobile"
                  clearable
                  class="search-field"
                ></v-text-field>
              </v-col>
              <v-col></v-col>
              <v-col md="3" cols="12">
                <v-btn
                  block
                  color="warning"
                  dark
                  @click="get_draft_mpesa_payments_register"
                  class="search-btn"
                >
                  {{ ('Search') }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- M-Pesa Payments Table -->
            <v-data-table
              :headers="mpesa_payment_headers"
              :items="mpesa_payments"
              item-key="name"
              class="elevation-1 mt-0 data-table"
              :single-select="singleSelect"
              show-select
              v-model="selected_mpesa_payments"
              :loading="mpesa_payments_loading"
              checkbox-color="primary"
            >
              <template v-slot:item.amount="{ item }">
                <span class="primary--text currency-text">
                  {{ item.currency }} {{ formatCurrency(item.amount) }}
                </span>
              </template>
            </v-data-table>
          </div>
        </v-card>
      </v-col>

      <!-- Totals Section -->
      <v-col md="4" cols="12" class="pb-3">
        <v-card
          class="invoices mx-auto grey lighten-5 mt-3 p-3 totals-card"
          style="max-height: 94vh; height: 94vh; overflow-y: auto"
        >
          <strong>
            <h4 class="primary--text totals-title">{{ ('Totals') }}</h4>

            <!-- Total Invoices -->
            <v-row class="totals-row">
              <v-col md="7" class="mt-1">
                <span class="totals-label">{{ ('Total Invoices:') }}</span>
              </v-col>
              <v-col md="5">
                <v-text-field
                  class="p-0 m-0 totals-field"
                  dense
                  color="primary"
                  background-color="white"
                  hide-details
                  :value="formatCurrency(total_selected_invoices)"
                  readonly
                  flat
                  :prefix="pos_profile.currency"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Total Payments -->
            <v-row v-if="total_selected_payments" class="totals-row">
              <v-col md="7" class="mt-1">
                <span class="totals-label">{{ ('Total Payments:') }}</span>
              </v-col>
              <v-col md="5">
                <v-text-field
                  class="p-0 m-0 totals-field"
                  dense
                  color="primary"
                  background-color="white"
                  hide-details
                  :value="formatCurrency(total_selected_payments)"
                  readonly
                  flat
                  :prefix="pos_profile.currency"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Total M-Pesa -->
            <v-row v-if="total_selected_mpesa_payments" class="totals-row">
              <v-col md="7" class="mt-1">
                <span class="totals-label">{{ ('Total Mpesa:') }}</span>
              </v-col>
              <v-col md="5">
                <v-text-field
                  class="p-0 m-0 totals-field"
                  dense
                  color="primary"
                  background-color="white"
                  hide-details
                  :value="formatCurrency(total_selected_mpesa_payments)"
                  readonly
                  flat
                  :prefix="pos_profile.currency"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider v-if="payment_methods.length" class="my-3"></v-divider>

            <!-- Make New Payment Section -->
            <div v-if="pos_profile.posa_allow_make_new_payments" class="payment-section">
              <h4 class="primary--text payment-section-title">{{ ('Make New Payment') }}</h4>
              <v-row
                v-for="method in payment_methods"
                :key="method.row_id"
                class="payment-method-row"
              >
                <v-col md="7">
                  <span class="mt-1 payment-method-label">{{ method.mode_of_payment }}:</span>
                </v-col>
                <v-col md="5">
                  <v-text-field
                    class="p-0 m-0 totals-field"
                    dense
                    color="primary"
                    background-color="white"
                    hide-details
                    :value="formatCurrency(method.amount)"
                    @input="setFormatedCurrency(method, 'amount', $event)"
                    flat
                    :prefix="pos_profile.currency"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- Difference -->
            <v-row class="difference-row">
              <v-col md="7">
                <h4 class="primary--text difference-title">{{ ('Difference:') }}</h4>
              </v-col>
              <v-col md="5">
                <v-text-field
                  class="p-0 m-0 totals-field"
                  dense
                  color="primary"
                  background-color="white"
                  hide-details
                  :value="formatCurrency(total_of_diff)"
                  flat
                  readonly
                  :prefix="pos_profile.currency"
                  :class="{ 'difference-positive': total_of_diff >= 0, 'difference-negative': total_of_diff < 0 }"
                ></v-text-field>
              </v-col>
            </v-row>
          </strong>

          <div class="submit-btn-container">
            <v-btn block color="primary" dark @click="submit" class="submit-btn">
              {{ ('Submit') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useShiftStore } from '@/stores/shift'
import { ref, computed, watch, onMounted } from 'vue'
import Customer from '@/components/modals/CustomerModal.vue'


    const shiftStore = useShiftStore()

    const pos_profile = computed(() => shiftStore.pos_profile || {})

    const dialog = ref(false)
    const singleSelect = ref(false)
    const invoices_loading = ref(false)
    const unallocated_payments_loading = ref(false)
    const mpesa_payments_loading = ref(false)

    const pos_profile_search = ref(null)
    const pos_profiles_list = ref([])
    const outstanding_invoices = ref([])
    const selected_invoices = ref([])

    const unallocated_payments = ref([])
    const selected_payments = ref([])

    const mpesa_search_name = ref('')
    const mpesa_search_mobile = ref('')
    const mpesa_payments = ref([])
    const selected_mpesa_payments = ref([])

    const payment_methods = ref([])

    const invoices_headers = ref([
      { text: 'Invoice', value: 'name', sortable: true },
      { text: 'Customer', value: 'customer', sortable: true },
      { text: 'Date', value: 'posting_date', sortable: true },
      { text: 'Due Date', value: 'due_date', sortable: true },
      { text: 'Total', value: 'grand_total', align: 'end', sortable: true },
      { text: 'Outstanding', value: 'outstanding_amount', align: 'end', sortable: true }
    ])

    const unallocated_payments_headers = ref([
      { text: 'Payment', value: 'name', sortable: true },
      { text: 'Reference', value: 'reference_no', sortable: true },
      { text: 'Date', value: 'posting_date', sortable: true },
      { text: 'Paid Amount', value: 'paid_amount', align: 'end', sortable: true },
      { text: 'Unallocated', value: 'unallocated_amount', align: 'end', sortable: true }
    ])

    const mpesa_payment_headers = ref([
      { text: 'Name', value: 'name', sortable: true },
      { text: 'Mobile', value: 'mobile', sortable: true },
      { text: 'Transaction ID', value: 'transaction_id', sortable: true },
      { text: 'Amount', value: 'amount', align: 'end', sortable: true }
    ])

    const total_outstanding_amount = computed(() => {
      return outstanding_invoices.value.reduce((sum, inv) => sum + (inv.outstanding_amount || 0), 0)
    })

    const total_selected_invoices = computed(() => {
      return selected_invoices.value.reduce((sum, inv) => sum + (inv.outstanding_amount || 0), 0)
    })

    const total_unallocated_amount = computed(() => {
      return unallocated_payments.value.reduce((sum, pmt) => sum + (pmt.unallocated_amount || 0), 0)
    })

    const total_selected_payments = computed(() => {
      return selected_payments.value.reduce((sum, pmt) => sum + (pmt.unallocated_amount || 0), 0)
    })

    const total_selected_mpesa_payments = computed(() => {
      return selected_mpesa_payments.value.reduce((sum, pmt) => sum + (pmt.amount || 0), 0)
    })

    const total_of_diff = computed(() => {
      const invoices = total_selected_invoices.value
      const payments = total_selected_payments.value
      const mpesa = total_selected_mpesa_payments.value
      const new_payments = payment_methods.value.reduce((sum, m) => sum + (m.amount || 0), 0)

      return invoices - (payments + mpesa + new_payments)
    })

    const formatCurrency = (value) => {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    }

    const setFormatedCurrency = (method, field, value) => {
      if (value !== null && value !== undefined) {
        method[field] = parseFloat(value) || 0
      }
    }

    const onInvoiceSelected = (event) => {
      console.log('Invoice selected:', event)
    }

    const get_outstanding_invoices = async () => {
      invoices_loading.value = true
      try {
        outstanding_invoices.value = []
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        invoices_loading.value = false
      }
    }

    const get_draft_mpesa_payments_register = async () => {
      mpesa_payments_loading.value = true
      try {
        mpesa_payments.value = []
      } catch (error) {
        console.error('Error fetching M-Pesa payments:', error)
      } finally {
        mpesa_payments_loading.value = false
      }
    }

    const submit = async () => {
      try {
        const data = {
          invoices: selected_invoices.value,
          payments: selected_payments.value,
          mpesa_payments: selected_mpesa_payments.value,
          new_payments: payment_methods.value
        }

        console.log('Submitting payment data:', data)
      } catch (error) {
        console.error('Error submitting payment:', error)
      }
    }

    watch(pos_profile, (val) => {
      console.log('pos_profile updated:', val)
    })

    onMounted(async () => {
      pos_profiles_list.value = []
      payment_methods.value = []
    })

</script>

<style scoped>
/* General Styles */
.overflow-y-auto {
  overflow-y: auto;
}

.golden--text {
  color: #ffc107 !important;
  font-weight: 600;
}

.primary--text {
  color: #1976d2 !important;
}

/* Search and Select Fields */
.select-field ::v-deep .v-input__slot {
  border-radius: 4px;
  transition: all 0.3s ease;
}

.select-field:hover ::v-deep .v-input__slot {
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.search-field ::v-deep .v-input__slot {
  border-radius: 4px;
  transition: all 0.3s ease;
}

.search-field:focus-within ::v-deep .v-input__slot {
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}

/* Search Button */
.search-btn {
  border-radius: 4px !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-btn:hover {
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  transform: translateY(-2px);
}

/* Data Tables */
.data-table ::v-deep .v-data-table {
  border-radius: 4px;
  background: #fafafa;
}

.data-table ::v-deep .v-data-table__wrapper {
  border-radius: 4px;
}

.data-table ::v-deep thead tr {
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.data-table ::v-deep th {
  font-weight: 700;
  color: #424242;
  padding: 12px 8px;
}

.data-table ::v-deep tbody tr {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.data-table ::v-deep tbody tr:hover {
  background-color: #f9f9f9;
}

.data-table ::v-deep .v-data-table__selected {
  background-color: #e3f2fd !important;
}

.currency-text {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Totals Card */
.totals-card {
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  position: relative;
}

.totals-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Totals Rows */
.totals-row {
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.totals-row:hover {
  background-color: #fafafa;
}

.totals-label {
  font-weight: 600;
  color: #616161;
  font-size: 14px;
}

/* Totals Fields */
.totals-field ::v-deep .v-input__slot {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px;
  padding: 4px 8px !important;
}

.totals-field ::v-deep input {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  text-align: right;
  color: #1976d2;
  font-size: 14px;
}

.totals-field ::v-deep .v-text-field__prefix {
  color: #9e9e9e;
  font-weight: 600;
  margin-right: 4px;
}

/* Payment Section */
.payment-section {
  margin: 8px 0;
}

.payment-section-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.payment-method-row {
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.payment-method-label {
  font-weight: 500;
  color: #424242;
  font-size: 13px;
}

/* Difference Row */
.difference-row {
  margin-top: 12px;
  padding: 12px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 12px;
}

.difference-title {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difference-positive ::v-deep input {
  color: #4caf50 !important;
  font-weight: 700;
}

.difference-negative ::v-deep input {
  color: #f44336 !important;
  font-weight: 700;
}

/* Submit Button Container */
.submit-btn-container {
  position: absolute;
  bottom: 0;
  width: calc(100% - 24px);
  padding: 16px 12px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.8));
  border-top: 1px solid #e0e0e0;
}

.submit-btn {
  border-radius: 4px !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 12px !important;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.35);
  transform: translateY(-2px);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

/* Dividers */
.my-3 {
  margin: 12px 0 !important;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .totals-title {
    font-size: 16px;
  }

  .totals-label {
    font-size: 13px;
  }

  .submit-btn-container {
    width: 100%;
  }
}
</style>
