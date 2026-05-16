// Store cart.js
import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { createSalesReturn, createSalesOrder } from '@/composables/pos'
export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [],
    cash: 0,
    change: 0,
    moneys: [2000, 5000, 10000, 20000, 50000, 100000], // Quick cash amounts
    taxRate: 0, // Tax percentage (0 = no tax)
    discountRate: 0, // Discount percentage
    isProcessing: false,
    isReturnMode: false,
    returnAgainst: ref(null),
    pos_profile_name: ref(null),
    returndoc: ref(null)
  }),

  getters: {
    // Get total number of items in cart
    itemsCount: (state) => {
      return state.cart.reduce((total, item) => total + item.qty, 0)
    },

    // Get subtotal (before tax and discount)
    subtotal: (state) => {
      return state.cart.reduce((total, item) => {
        return total + (item.rate * item.qty)
      }, 0)
    },

    // Get tax amount
    taxAmount: (state) => {
      const subtotal = state.cart.reduce((total, item) => {
        return total + (item.rate * item.qty)
      }, 0)
      return Math.round(subtotal * (state.taxRate / 100))
    },

    // Get discount amount
    discountAmount: (state) => {
      const subtotal = state.cart.reduce((total, item) => {
        return total + (item.rate * item.qty)
      }, 0)
      return Math.round(subtotal * (state.discountRate / 100))
    },

    // Get total price (subtotal + tax - discount)
    totalPrice: (state) => {
      const subtotal = state.cart.reduce((total, item) => {
        return total + (item.rate * item.qty)
      }, 0)
      const tax = Math.round(subtotal * (state.taxRate / 100))
      const discount = Math.round(subtotal * (state.discountRate / 100))
      return subtotal + tax - discount
    },

    // Calculate change
    changeAmount: (state) => {
      const total = state.cart.reduce((sum, item) => {
        return sum + (item.rate * item.qty)
      }, 0)
      const tax = Math.round(total * (state.taxRate / 100))
      const discount = Math.round(total * (state.discountRate / 100))
      const finalTotal = total + tax - discount

      return state.cash - finalTotal
    },

    // Check if transaction can be submitted
    canSubmit: (state) => {
      const total = state.cart.reduce((sum, item) => {
        return sum + (item.rate * item.qty)
      }, 0)
      const tax = Math.round(total * (state.taxRate / 100))
      const discount = Math.round(total * (state.discountRate / 100))
      const finalTotal = total + tax - discount

      return state.cart.length > 0 && state.cash >= finalTotal && !state.isProcessing
    },

    // Get cart summary
    cartSummary: (state) => {
      const subtotal = state.cart.reduce((total, item) => {
        return total + (item.rate * item.qty)
      }, 0)
      const tax = Math.round(subtotal * (state.taxRate / 100))
      const discount = Math.round(subtotal * (state.discountRate / 100))
      const total = subtotal + tax - discount

      return {
        itemsCount: state.cart.reduce((sum, item) => sum + item.qty, 0),
        subtotal,
        tax,
        discount,
        total,
        cash: state.cash,
        change: state.cash - total
      }
    }
  },

  actions: {
    setReturnAgainst(invoice, pos_profile_name) {
      this.returnAgainst = invoice
      this.pos_profile_name  = pos_profile_name
      console.log('✅ returnAgainst set:', this.returnAgainst)
    },
    async handleReturnSubmit() {
      try {
        await this.processReturnTransaction({
          is_return: 1,
          pos_profile_name:this.pos_profile_name,
          return_against: this.returnAgainst.name,
          customer: this.returnAgainst.customer,
          items: this.cart.map(item => ({
            ...item,
            qty: Math.abs(item.qty),
          }))
        })
        window.$toast.success('Return processed successfully!')
      } catch (error) {
        console.error('Return failed:', error)
        alert('Failed to process return.')
      }
    },
    async processReturnTransaction(returnDoc) {
      if (!returnDoc || !returnDoc.items) {
        console.error('❌ Invalid returnDoc:', returnDoc)
        return
      }

      console.log('🔁 Processing return for:', returnDoc.name)

      // فعّل وضع المرتجع
      this.isReturnMode = true
      // نفضي الكارت الحالي
      this.clearCart()

      // حمّل عناصر المرتجع بكميات سالبة
      returnDoc.items.forEach(it => {
        const item = {
          item_code: it.item_code || it.id,
          item_name: it.item_name || it.name,
          price: it.rate || it.price || 0,
          image: it.image || '',
          category: it.category || '',
          qty: it.qty,
          originalQuantity: it.qty, // عشان نمنع التجاوز
          isReturn: true
        }
        this.cart.push(item)
      })

      // خصومات المرتجع (اختياري)
      if (returnDoc.discount_amount) {
        this.discountRate = Math.abs(returnDoc.discount_amount)
      }

      this.updateChange()

      console.log('✅ Return items loaded:', this.cart)
      console.log("✅ returnDoc", returnDoc)
      console.log("✅ returnDoc items", returnDoc.items)
      console.log("✅ this.returnAgainst.name", this.returnAgainst.name)
      console.log("✅ returnDoc.name", returnDoc.name)
      const returnResponse = await createSalesReturn(this.returnAgainst.name, returnDoc.items, this.pos_profile_name)
      console.log("returnResponse", returnResponse)
      if (returnResponse) {
        this.clearCart()
      }
    },

    async processTransactionCreateOrder(customer, transactionData) {
    try {
      const orderResponse = await createSalesOrder(customer, transactionData)
      console.log('Order Response:', orderResponse);
      return orderResponse;
    } catch (error) {
      console.error('Error creating sales order:', error);
      throw error;
    }
  },

    loadReturnItems(items = []) {
      // نفضي الكارت الأول
      this.clearCart()

      items.forEach(it => {
        const product = {
          item_code: it.item_code || it.id,
          item_name: it.item_name || it.name,
          rate: it.rate || it.rate || it.price || 0,
          image: it.image || '',
          category: it.category || '',
          // الكمية الحالية صفر (لسه العميل هيختار إيه يرجعه)
          qty: -it.qty,
          // نحفظ الكمية الأصلية علشان نمنع الزيادة عنها
          originalQuantity: it.qty || it.quantity || 1,
          isReturn: true // ممكن تستخدمها لتخصيص عرض الكارت
        }
        this.cart.push(product)
      })

      this.updateChange()
    },
    addToCart(product, barcode = null) {
      console.log('Product', product)
      const existingItem = this.cart.find(item => item.item_code === product.item_code)
      console.log('exexistingItem', existingItem)
      const qtyToAdd = product.qty || 1
      if (existingItem) {
        existingItem.qty += qtyToAdd
         console.log('📝 Updated qty to:', existingItem.qty)
      } else {
        const cartItem = {
          item_code: product.item_code,
          item_name: product.item_name,
          rate: product.rate,
          image: product.image,
          barcode: barcode?.code || "",
          category: product.item_group,
          qty: qtyToAdd,
          addedAt: new Date().toISOString()
        }
        this.cart.push(cartItem)
        console.log('✨ New item added:', cartItem)
      }

      this.updateChange()
      // Update change calculation
    },

    // Remove item from cart completely
    removeFromCart(item_code) {
      const index = this.cart.findIndex(item => item.item_code === item_code)
      if (index !== -1) {
        this.cart.splice(index, 1)
        this.updateChange()
      }
    },

    // Update item quantity
    updateQuantity(item_code, newQty, mode) {

      const item = this.cart.find(item => item.item_code === item_code)
      if (!item) return
      // 🧩 لو الوضع "مرتجع"
      console.log("Mode1", mode)
      if (mode === 'return') {
        // في حالة المرتجع الكمية لازم تكون سالبة (مثلاً -1، -2 ...)
        if (newQty > 0) {
          newQty = -Math.abs(newQty)
        }
        console.log("Mode2", mode)

        if (item.originalQuantity && Math.abs(newQty) > item.originalQuantity) {
          if (window.$toast) {
            window.$toast.warning('Can not Return than Original Quantity')
          }
          return
        }
        console.log("Mode3", mode)

        // تحدّث الكمية
        item.qty = newQty
        console.log("item.qty4 ", item.qty)
      } else {
        // 🧾 وضع البيع العادي
        if (newQty <= 0) {
          this.removeFromCart(item_code)
        } else {
          item.qty = newQty
        }
      }

      // إعادة حساب الباقي / التغيير بعد كل تحديث
      this.updateChange()
      return mode, item_code, newQty
    },

    // Add/subtract quantity
    addQuantity(item_code, amount) {
      const item = this.cart.find(item => item.item_code === item_code)
      if (item) {
        const newQty = item.qty + amount
        if (newQty <= 0) {
          this.removeFromCart(item_code)
        } else {
          item.qty = newQty
          this.updateChange()
        }
      }
    },

    // Set cash amount
    setCash(amount) {
      this.cash = Math.max(0, amount)
      this.updateChange()
    },

    // Add cash amount
    addCash(amount) {
      this.cash += amount
      this.updateChange()
    },

    // Update cash from string input
    updateCashFromString(cashString) {
      // Remove non-numeric characters except decimal point
      const cleanedString = cashString.replace(/[^\d.]/g, '')
      const cashAmount = parseFloat(cleanedString) || 0
      this.setCash(cashAmount)
    },

    // Update change calculation
    updateChange() {
      const total = this.totalPrice
      this.change = this.cash - total
      console.log("total and this.change", total, this.change)

    },

    // Clear entire cart
    clearCart() {
      this.cart = []
      this.cash = 0
      this.change = 0
      this.isProcessing = false
      // this.returnAgainst = null
    },

    // Set tax rate
    setTaxRate(rate) {
      this.taxRate = Math.max(0, Math.min(100, rate))
      this.updateChange()
    },

    // Set discount rate
    setDiscountRate(rate) {
      this.discountRate = Math.max(0, Math.min(100, rate))
      this.updateChange()
    },

    // Apply discount amount
    applyDiscountAmount(amount) {
      const subtotal = this.subtotal
      if (subtotal > 0) {
        const percentage = (amount / subtotal) * 100
        this.setDiscountRate(Math.min(100, percentage))
      }
    },

    // Process transaction
    async processTransaction(mode, originalInvoice = null) {
      console.log("MODE RECEIVED:", mode);
      // if (!this.canSubmit) {
      //   throw new Error('Cannot process transaction')
      // }

      this.isProcessing = true

      try {
        const transactionData = {
          items: toRaw(this.cart),
          summary: this.cartSummary,
          timestamp: new Date().toISOString(),
          transactionId: this.generateTransactionId(),
          mode,
          originalInvoice
        }

        // Here you could save to database or send to API
        await this.saveTransaction(transactionData)

        return transactionData
      } catch (error) {
        console.error('Transaction processing failed:', error)
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    // Generate transaction ID
    generateTransactionId() {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 1000)
      return `TXN${timestamp}${random.toString().padStart(3, '0')}`
    },

    // Save transaction (placeholder - implement based on your needs)
    async saveTransaction(transactionData) {

      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Transaction saved:', transactionData)
          resolve(transactionData)
        }, 500)
      })
    },

    // Get item by product ID
    getCartItem(item_code) {
      return this.cart.find(item => item.item_code === item_code)
    },

    // Check if product is in cart
    isInCart(item_code) {
      return this.cart.some(item => item.item_code === item_code)
    },

    // Get quantity of specific product in cart
    getProductQuantity(item_code) {
      const item = this.cart.find(item => item.item_code === item_code)
      return item ? item.qty : 0
    },

    // Calculate exact change breakdown (for cash register)
    getChangeBreakdown() {
      let remainingChange = this.changeAmount
      const denominations = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100, 50, 25, 10, 5, 1]
      const breakdown = []

      for (const denom of denominations) {
        if (remainingChange >= denom) {
          const count = Math.floor(remainingChange / denom)
          breakdown.push({ denomination: denom, count })
          remainingChange -= count * denom
        }
      }

      return breakdown
    },

    // Reset to initial state
    resetCart() {
      this.$reset()
    },

  },
})
