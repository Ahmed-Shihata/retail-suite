// Store invoice.js
import { defineStore } from 'pinia'
import { initDB } from '../db/indexedDB'
import { getPosInvoices, getReturnableInvoices, submitInvoice } from '@/composables/pos'
import { useShiftStore } from './shift'
// 2️⃣ Options Store (Options API) ✅
export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    invoices: [],
    db: null,
    isLoading: false,
    currentInvoice: null,
    cashiers: [], // List of unique cashiers
    selectedInvoice: null
  }),

  getters: {
    // Get invoices count
    invoicesCount: (state) => state.invoices.length,

    // Get today's invoices
    todaysInvoices: (state) => {
      const today = new Date().toDateString()
      return state.invoices.filter(invoice =>
        new Date(invoice.createdAt).toDateString() === today
      )
    },

    // Get invoices by date range
    getInvoicesByDateRange: (state) => {
      return (startDate, endDate) => {
        const start = new Date(startDate).getTime()
        const end = new Date(endDate).getTime()

        return state.invoices.filter(invoice => {
          const invoiceDate = new Date(invoice.createdAt).getTime()
          return invoiceDate >= start && invoiceDate <= end
        })
      }
    },

    // Get invoices by status
    getInvoicesByStatus: (state) => {
      return (status) => {
        return state.invoices.filter(invoice => invoice.status === status)
      }
    },

    // Get total sales
    totalSales: (state) => {
      return state.invoices.reduce((total, invoice) => {
        return total + (invoice.summary?.total || 0)
      }, 0)
    },

    // Get today's sales
    todaysSales: (state) => {
      const today = new Date().toDateString()
      return state.invoices
        .filter(invoice => new Date(invoice.createdAt).toDateString() === today)
        .reduce((total, invoice) => total + (invoice.summary?.total || 0), 0)
    },

    // Get average invoice amount
    averageInvoiceAmount: (state) => {
      if (state.invoices.length === 0) return 0
      return state.totalSales / state.invoices.length
    },

    // Get invoices statistics
    invoicesStats: (state) => {
      const total = state.invoices.length
      const today = state.todaysInvoices.length
      const thisMonth = state.invoices.filter(invoice => {
        const invoiceMonth = new Date(invoice.createdAt).getMonth()
        const currentMonth = new Date().getMonth()
        return invoiceMonth === currentMonth
      }).length

      return {
        total,
        today,
        thisMonth,
        totalSales: state.totalSales,
        todaysSales: state.todaysSales,
        averageAmount: state.averageInvoiceAmount
      }
    }
  },

  actions: {
    // Load invoices from database
    async allReturnableInvoices() {
      try {
        const allgetReturnableInvoices = await getReturnableInvoices()
        if (allgetReturnableInvoices.length > 0) {

          return allgetReturnableInvoices
        }
        console.log("allgetReturnableInvoices", allgetReturnableInvoices)
      } catch (error) {
        console.error('Failed to load invoices:', error)
      }
    },
    async loadInvoices() {
      try {

        const allInvoices = await getPosInvoices({})
        this.invoices = allInvoices.invoices.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        console.log('Loaded invoices:', this.invoices)
        if (this.invoices.length > 0) {
          const cashiersSet = new Set()
          this.invoices.forEach(inv => {
            if (inv.owner) {
              cashiersSet.add(inv.owner)
            }
          })
          this.cashiers = Array.from(cashiersSet)
          console.log('this.cashiersSet', this.cashiers)
          return this.invoices
        }
        //

      } catch (error) {
        console.error('Failed to load invoices:', error)
      }
    },

    // Save invoice to database
    async saveInvoice(invoiceData) {
      try {
        const dbInstance = await initDB()

        // Generate invoice ID if not provided
        const invoice = {
          id: invoiceData.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          receiptNo: invoiceData.receiptNo || this.generateReceiptNo(),
          items: invoiceData.items || [],
          summary: invoiceData.summary || {},
          shiftInfo: invoiceData.shiftInfo || {},
          shiftId: invoiceData.shiftInfo?.shiftId || null,
          cashier: invoiceData.shiftInfo?.cashier || 'Unknown',
          paymentMethod: invoiceData.paymentMethod || 'cash',
          customerInfo: invoiceData.customerInfo || null,
          status: 'completed',
          createdAt: invoiceData.timestamp || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: invoiceData.notes || '',
          // Additional metadata
          metadata: {
            deviceInfo: this.getDeviceInfo(),
            appVersion: '1.0.0',
            source: 'pos'
          }
        }

        // Save to database
        const tx = dbInstance.transaction('invoices', 'readwrite')
        const store = tx.objectStore('invoices')
        const plainInvoice = JSON.parse(JSON.stringify(invoice)) // Ensure no reactive proxies
        await store.add(plainInvoice)
        await tx.done

        // Add to local state
        this.invoices.unshift(invoice)

        return invoice
      } catch (error) {
        console.error('Failed to save invoice:', error)
        throw error
      }
    },

    // ============================================
    // ✅ الحل الصحيح في invoices.js
    // ============================================
    async addTransaction(transactionData) {
  try {
    console.log('=== addTransaction Started ===')
    console.log('Transaction Data Received:', transactionData)

    const shiftStore = useShiftStore()

    // =============================
    // 1. Validation
    // =============================
    if (!transactionData?.items?.length) {
      throw new Error('Invalid transaction data - items missing')
    }
    if (!shiftStore.pos_profile) {
      throw new Error('POS Profile not loaded')
    }
    if (!shiftStore.currentCustomer) {
      throw new Error('Customer not selected')
    }

    const { summary, paymentMethod, items, transactionId, mode } = transactionData
    const paidAmount  = parseFloat(summary.cash  ?? 0)
    const totalAmount = parseFloat(summary.total ?? 0)

    // =============================
    // 2. Build Payloads
    // =============================

    // payments لازم يكون فيه amount = paid_amount عشان get_cash_account يشتغل صح
    // وكمان عشان ERPNext يعرف الـ mode_of_payment الصح
    const invoicePayload = {
      doctype          : "Sales Invoice",
      is_pos           : 1,
      ignore_pricing_rule: 1,
      company          : shiftStore.pos_profile.company,
      naming_series    : shiftStore.pos_profile.naming_series,
      customer         : shiftStore.currentCustomer.name,
      posting_date     : new Date().toISOString().slice(0, 10),
      pos_profile      : shiftStore.pos_profile.name,
      paymentMethod    : paymentMethod,   // الـ backend بيقرأ invoice.get("paymentMethod")
      payments: [
        {
          mode_of_payment: paymentMethod,
          amount         : paidAmount     // المبلغ المدفوع الفعلي مش الـ total
        }
      ],
      items: items.map(item => ({
        item_code      : item.item_code,
        qty            : item.qty,
        rate           : item.rate,
        income_account : shiftStore.pos_profile.income_account,
        expense_account: shiftStore.pos_profile.expense_account,
        warehouse      : shiftStore.pos_profile.warehouse
      })),
      posa_pos_opening_shift: shiftStore.pos_opening_shift?.name,
      summary: {
        cash : paidAmount,
        total: totalAmount
      }
    }

    // dataPayload — الـ backend بيحسب credit_change بنفسه
    // بس بنبعت due_date والبيانات اللي يحتاجها apply_customer_credit
    const dataPayload = {
      due_date              : new Date().toISOString().slice(0, 10),
      transactionId         : transactionId,
      mode                  : mode,
      redeemed_customer_credit: transactionData.redeemed_customer_credit ?? false,
      customer_credit_dict  : transactionData.customer_credit_dict  ?? [],
    }

    console.log('📋 Invoice Payload:', invoicePayload)
    console.log('📋 Data Payload:', dataPayload)
    console.log('📤 Calling submitInvoice...')

    // =============================
    // 3. Call Backend
    // =============================
    const invoiceResponse = await submitInvoice(invoicePayload, JSON.stringify(dataPayload))

    console.log('📥 submitInvoice returned:', invoiceResponse)

    // =============================
    // 4. Validate Response
    // =============================
    if (!invoiceResponse?.name) {
      throw new Error('Could not get invoice number from response')
    }

    // =============================
    // 5. Return Result
    // =============================
    return {
      success      : true,
      invoiceNo    : invoiceResponse.name,
      invoiceId    : invoiceResponse.name,
      transactionId: transactionId,
      customerName : shiftStore.currentCustomer.name,
      amount       : totalAmount,
      paid         : paidAmount,
      change       : Math.max(paidAmount - totalAmount, 0),  // الباقي للعميل
      outstanding  : invoiceResponse.outstanding ?? Math.max(totalAmount - paidAmount, 0),
      timestamp    : invoiceResponse.posting_date || new Date().toISOString(),
      invoiceData  : invoiceResponse
    }

  } catch (error) {
    console.error('❌ addTransaction Error:', error)

    // =============================
    // Error Parsing
    // =============================
    let message = error.message || 'Something went wrong'

    // _server_messages بييجي كـ JSON string محتاج parsing
    const serverMessages = error?.response?.data?._server_messages
    if (serverMessages) {
      try {
        const parsed = JSON.parse(serverMessages)
        // كل message جوا المصفوفة هو نفسه JSON string
        const inner = JSON.parse(parsed[0])
        message = inner.message || message
      } catch {
        message = serverMessages
      }
    } else {
      message =
        error?.response?.data?.exception ||
        error?.response?.data?.message   ||
        error.message                     ||
        'Something went wrong'
    }

    throw new Error(message)
  }
},
    // async addTransaction(transactionData) {
    //   try {
    //     console.log('=== addTransaction Started ===')
    //     console.log('Transaction Data Received:', transactionData)

    //     const shiftStore = useShiftStore()

    //     // تحقق من البيانات
    //     if (!transactionData || !transactionData.items) {
    //       throw new Error('Invalid transaction data - items missing')
    //     }

    //     if (!shiftStore.pos_profile) {
    //       throw new Error('POS Profile not loaded')
    //     }

    //     if (!shiftStore.currentCustomer) {
    //       throw new Error('Customer not selected')
    //     }

    //     // بناء payload
    //     const invoicePayload = {
    //       doctype: "Sales Invoice",
    //       is_pos: 1,
    //       ignore_pricing_rule: 1,
    //       company: shiftStore.pos_profile.company,
    //       naming_series: shiftStore.pos_profile.naming_series,
    //       customer: shiftStore.currentCustomer.name,
    //       posting_date: new Date().toISOString().slice(0, 10),
    //       pos_profile: shiftStore.pos_profile.name,

    //       payments: [
    //         {
    //           mode_of_payment: transactionData.paymentMethod,
    //           amount: transactionData.summary.cash
    //         }
    //       ],

    //       items: transactionData.items.map(item => ({
    //         item_code: item.item_code,
    //         qty: item.qty,
    //         rate: item.rate,
    //         income_account: shiftStore.pos_profile.income_account,
    //         expense_account: shiftStore.pos_profile.expense_account,
    //         warehouse: shiftStore.pos_profile.warehouse
    //       })),

    //       posa_pos_opening_shift: shiftStore.pos_opening_shift?.name,
    //     }

    //     const dataPayload = {
    //       credit_change: transactionData.summary.change,
    //       due_date: new Date().toISOString().slice(0, 10),
    //       transactionId: transactionData.transactionId,
    //       mode: transactionData.mode
    //     }
    //     // ✅ استدعي submitIvoice
    //     console.log('📋 Invoice Payload:', invoicePayload)
    //     console.log('📋 Data Payload:', dataPayload)
    //     console.log('📤 Calling submitIvoice...')
    //     const invoiceResponse = await submitIvoice(invoicePayload, JSON.stringify(dataPayload))

    //     console.log('📥 submitIvoice returned:', invoiceResponse)
    //     console.log('📥 Type:', typeof invoiceResponse)

    //     // استخرج invoiceNo
    //     const invoiceNo = invoiceResponse?.name

    //     if (!invoiceNo) {
    //       console.error('❌ No invoice name found')
    //       console.error('Response:', invoiceResponse)
    //       throw new Error('Could not get invoice number from response')
    //     }

    //     console.log('✅ Invoice Number:', invoiceNo)

    //     // ✅ أرجع النتيجة
    //     const result = {
    //       success: true,
    //       invoiceNo: invoiceNo,
    //       invoiceId: invoiceNo,
    //       transactionId: transactionData.transactionId,
    //       customerName: shiftStore.currentCustomer.name,
    //       amount: transactionData.summary.total,
    //       change: transactionData.summary.change,
    //       cash: transactionData.summary.cash,
    //       timestamp: invoiceResponse?.posting_date || new Date().toISOString(),
    //       invoiceData: invoiceResponse  // الـ invoice كاملة
    //     }

    //     console.log('✅ Final Result:', result)
    //     return result

    //   } catch (error) {
    //     console.error('❌ addTransaction Error:', error.message)
    //     console.log('❌ ❌ error',error)
    //         const message =
    //              error?.response?.data?.exception ||
    //             error?.response?.data?.message ||
    //             error?.response?.data?._server_messages ||
    //             error.message ||
    //             'Something went wrong'

    //     throw new Error(message)
    //   }
    // },
    // Get invoice by ID
    async getInvoiceById(id) {
      try {

        return "invoice"
      } catch (error) {
        console.error('Failed to get invoice:', error)
        return null
      }
    },

    // Get invoice by receipt number
    async getInvoiceByReceiptNo(receiptNo) {
      try {
        const dbInstance = await initDB()

        const tx = dbInstance.transaction('invoices', 'readonly')
        const store = tx.objectStore('invoices')
        const index = store.index('receiptNo')
        const invoice = await index.get(receiptNo)

        return invoice
      } catch (error) {
        console.error('Failed to get invoice by receipt number:', error)
        return null
      }
    },

    // Update invoice
    async updateInvoice(id, updates) {
      try {
        const dbInstance = await initDB()

        const existingInvoice = await this.getInvoiceById(id)
        if (!existingInvoice) {
          throw new Error('Invoice not found')
        }

        const updatedInvoice = {
          ...existingInvoice,
          ...updates,
          updatedAt: new Date().toISOString()
        }

        const tx = dbInstance.transaction('invoices', 'readwrite')
        const store = tx.objectStore('invoices')
        await store.put(updatedInvoice)
        await tx.done

        // Update local state
        const index = this.invoices.findIndex(inv => inv.id === id)
        if (index !== -1) {
          this.invoices[index] = updatedInvoice
        }

        return updatedInvoice
      } catch (error) {
        console.error('Failed to update invoice:', error)
        throw error
      }
    },

    // Delete invoice (soft delete - mark as deleted)
    async deleteInvoice(id) {
      try {
        const invoice = await this.getInvoiceById(id)
        if (!invoice) {
          throw new Error('Invoice not found')
        }

        // Soft delete - mark as deleted instead of actually removing
        await this.updateInvoice(id, {
          status: 'deleted',
          deletedAt: new Date().toISOString()
        })

        return true
      } catch (error) {
        console.error('Failed to delete invoice:', error)
        throw error
      }
    },

    // Search invoices
    searchInvoices(query) {
      if (!query) return this.invoices

      const searchTerm = query.toLowerCase()
      console.log('searchTerm', searchTerm)
      console.log('this.invoices', this.invoices)
      return this.invoices.filter(invoice => {
        return (
          invoice.name.toLowerCase().includes(searchTerm) ||
          invoice.owner.toLowerCase().includes(searchTerm) ||
          invoice.items.some(item =>
            item.item_code.toLowerCase().includes(searchTerm)
          ) ||
          (invoice.customer || '').toLowerCase().includes(searchTerm) ||
          (invoice.notes || '').toLowerCase().includes(searchTerm)
        )
      })
    },

    // Generate receipt number
    generateReceiptNo(prefix = 'TW') {
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
      return `${prefix}${timestamp}${random}`
    },

    // Get device info for metadata
    getDeviceInfo() {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString()
      }
    },

    // Export invoices data
    async exportInvoices(filters = {}) {
      try {
        let invoicesToExport = [...this.invoices]

        // Apply filters
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate).getTime()
          const end = new Date(filters.endDate).getTime()

          invoicesToExport = invoicesToExport.filter(invoice => {
            const invoiceDate = new Date(invoice.createdAt).getTime()
            return invoiceDate >= start && invoiceDate <= end
          })
        }

        if (filters.status) {
          invoicesToExport = invoicesToExport.filter(invoice =>
            invoice.status === filters.status
          )
        }

        if (filters.cashier) {
          invoicesToExport = invoicesToExport.filter(invoice =>
            invoice.cashier === filters.cashier
          )
        }

        const exportData = {
          invoices: invoicesToExport,
          summary: {
            totalInvoices: invoicesToExport.length,
            totalAmount: invoicesToExport.reduce((sum, inv) => sum + (inv.summary?.total || 0), 0),
            dateRange: {
              from: invoicesToExport.length > 0 ?
                invoicesToExport[invoicesToExport.length - 1].createdAt : null,
              to: invoicesToExport.length > 0 ?
                invoicesToExport[0].createdAt : null
            }
          },
          exportedAt: new Date().toISOString(),
          filters: filters
        }

        return exportData
      } catch (error) {
        console.error('Failed to export invoices:', error)
        throw error
      }
    },

    // Get sales summary by date range
    getSalesSummary(startDate, endDate) {
      const invoicesInRange = this.getInvoicesByDateRange(startDate, endDate)

      const summary = {
        totalInvoices: invoicesInRange.length,
        totalSales: invoicesInRange.reduce((sum, inv) => sum + (inv.summary?.total || 0), 0),
        totalTax: invoicesInRange.reduce((sum, inv) => sum + (inv.summary?.tax || 0), 0),
        totalDiscount: invoicesInRange.reduce((sum, inv) => sum + (inv.summary?.discount || 0), 0),
        averageInvoice: 0,
        paymentMethods: {},
        topItems: {},
        dailyBreakdown: {}
      }

      // Calculate average
      if (summary.totalInvoices > 0) {
        summary.averageInvoice = summary.totalSales / summary.totalInvoices
      }

      // Payment methods breakdown
      invoicesInRange.forEach(invoice => {
        const method = invoice.paymentMethod || 'cash'
        summary.paymentMethods[method] = (summary.paymentMethods[method] || 0) + (invoice.summary?.total || 0)
      })

      // Top selling items
      invoicesInRange.forEach(invoice => {
        invoice.items?.forEach(item => {
          const key = item.item_name
          if (!summary.topItems[key]) {
            summary.topItems[key] = { quantity: 0, revenue: 0 }
          }
          summary.topItems[key].quantity += item.qty
          summary.topItems[key].revenue += (item.rate * item.qty)
        })
      })

      // Daily breakdown
      invoicesInRange.forEach(invoice => {
        const date = new Date(invoice.createdAt).toDateString()
        if (!summary.dailyBreakdown[date]) {
          summary.dailyBreakdown[date] = { invoices: 0, sales: 0 }
        }
        summary.dailyBreakdown[date].invoices += 1
        summary.dailyBreakdown[date].sales += (invoice.summary?.total || 0)
      })

      return summary
    },

    // Clear all invoices (for testing/reset)
    async clearAllInvoices() {
      try {
        const dbInstance = await initDB()

        const tx = dbInstance.transaction('invoices', 'readwrite')
        const store = tx.objectStore('invoices')
        await store.clear()
        await tx.done

        this.invoices = []
      } catch (error) {
        console.error('Failed to clear invoices:', error)
        throw error
      }
    },

    // Set current invoice for detailed view
    setCurrentInvoice(invoice) {
      this.currentInvoice = invoice
    },
    setReturnInvoice(selectedInvoice) {
      this.selectedInvoice = selectedInvoice
      return this.selectedInvoice
    },
    getCurrentInvoice() {
      return this.currentInvoice
    }
  }
})
