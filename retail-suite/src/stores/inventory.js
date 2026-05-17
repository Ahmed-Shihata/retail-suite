import { defineStore } from 'pinia'
import { ref, computed, watch, toRaw } from 'vue'
import { api } from '@/services/auth.js';
import { call } from 'frappe-ui'
import { useShiftStore } from '@/stores/shift'
import {itemList} from '@/composables/pos'
import { generateBarcodePreview,addItemBarcode, getBarcodesFromFrappeDB, handleDeleteBarcodeFrappe } from '@/composables/barcode'
export const useInventoryStore = defineStore('inventory', () => {
    // State
    const items = ref([])
    const uoms = ref([])
    const categories = ref([])
    const warehouses = ref([])
    const tracking = ref([])
    const purchases = ref([])
    const transfers = ref([])
    const adjustments = ref([])
    const loading = ref(false)
    const error = ref(null)

    // stores
    const shiftStore = useShiftStore()


    const pos_profile = computed(() => shiftStore.pos_profile)

    // Computed
    const totalValue = computed(() => {
        return items.value.reduce((sum, item) => sum + (item.rate * (item.qty || 0)), 0)
    })

    const lowStockItems = computed(() => {
        return items.value.filter(item => (item.qty || 0) > 0 && (item.qty || 0) < 10)
    })

    const outOfStockItems = computed(() => {
        return items.value.filter(item => (item.qty || 0) === 0)
    })

    // Actions
    const loadWarehouses = async () => {
        loading.value = true
        error.value = null
        try{
            const response = await api.get('/api/resource/Warehouse',{
                params:{
                    fields: JSON.stringify([
                        "name",
                        "account",
                        "phone_no",
                        "company",
                        "is_group"
                    ])
                }
            })
            warehouses.value = response.data.data
            console.log("loadWarehouses", warehouses.value)
            return response.data.data
        }catch(error){

        }
    }
    const loadItems = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await itemList()
            // response.data.data في ERPNext عادة بيكون array
            items.value = response || []
            console.log("Items loaded: API:", items.value)
            return response
        } catch (err) {
            error.value = err.message
            console.error('Error loading items:', err)
        } finally {
            loading.value = false
        }
    }
    const loadUOM = async ()=>{
        loading.value = true
        error.value = null
        try {
            const response = await api.get('/api/method/retail.retail.api.inventory.get_unit_of_measures')
            uoms.value = response || []
            console.log("uoms from store ", response)
            return response
        } catch (err) {
            error.value = err.message
            console.error('Error loading items:', err)
            throw err
        } finally {
            loading.value = false
        }
    }
    const defaultItemSeries = async()=>{
        const response = await api.get('/api/method/retail.retail.api.inventory.get_default_item_series')
        console.log('series response',response)
        return response
    }
    const loadCategories = async ()=>{
          loading.value = true
          error.value = null
        try {

            const response = await api.get('/api/method/retail.retail.api.inventory.get_item_category')
            categories.value = response || []
            console.log("categories from store ",categories.value)
            return response
        } catch (err) {
            error.value = err.message
            console.error('Error loading categories:', err)
            throw err
        } finally {
            loading.value = false
        }
    }
    const addItem = async (itemData) => {
        try {
            const response = await call('retail.retail.api.inventory.add_item', {
                item_data:itemData})
            console.log('ADD Item API',response)
            return response
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const updateItem = async (itemId, itemData) => {
        try {
            console.log("itemData",itemData)
            const response = await call("retail.retail.api.inventory.update_item",  {
                "item_code": itemId,
                "item_data": itemData
            })

            const updatedItem = response.data
            console.log("updated +Item+",response)
            console.log("updated +Item+ itemId",response.data.item_code)
            console.log("updated itemId ", itemId)
            console.log("updated itemData ", itemData)
            const index = items.value.findIndex(
            i => i.item_code === response.data.item_code || i.name === response.data.name
            )

            if (index !== -1 && updatedItem) {
            items.value[index] = {
                ...items.value[index],
                ...updatedItem
            }
            }
            console.log("Items after Update ", items)
             return updatedItem

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const deleteItem = async (itemId) => {
        try {
            console.log("item you ean't to delete is", itemId)
           const response = await call("retail.retail.api.inventory.delete_item", {
                item_code: itemId
            });
            console.log("deleteItem response",response)
            return response
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    // Purchase Receipt Actions
    const addPurchaseReceipt = async (purchaseData) => {
        try {
            const response = await api.post('/api/resource/Purchase Receipt', purchaseData)
            purchases.value.push(response.data.data)
            return response.data.data
        } catch (err) {
            error.value = err.message
            throw err
        }
    }
        const loadPurchaseReceipts = async () => {
            loading.value = true
            try {
                const response = await api.get(
                    '/api/method/retail.retail.api.inventory_tracking.get_purchase_receipts'
                )

                console.log("response loadPurchaseReceipts", response)

                purchases.value = response.data.message || []
                return purchases.value

            } catch (err) {
                error.value = err.message
            } finally {
                loading.value = false
            }
        }

    // Transfer Actions
    const addTransfer = async (transferData) => {
        try {
            const response = await api.post('/api/resource/Stock Transfer', transferData)
            transfers.value.push(response.data.data)
            return response.data.data
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const loadTransfers = async () => {
        loading.value = true
        try {
            const response = await api.get('/api/resource/Stock Transfer')
            transfers.value = response.data.data || []
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    // Adjustment Actions
    const addAdjustment = async (adjustmentData) => {
        try {
            const response = await api.post('/api/resource/Stock Adjustment', adjustmentData)
            adjustments.value.push(response.data.data)
            return response.data.data
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const loadAdjustments = async () => {
        loading.value = true
        try {
            const response = await api.get('/api/resource/Stock Adjustment')
            adjustments.value = response.data.data || []
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    // Tracking Actions
    const logTracking = async (trackingData) => {
        try {
            const response = await api.post('/api/method/retail.retail.api.inventory_tracking.get_stock_ledger_data', trackingData)
            tracking.value.push(response.data.message)
            return response.data.message
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const loadTracking = async (filters = {}) => {
        loading.value = true
        try {
            const params = new URLSearchParams(filters)
            const response = await api.get(`/api/resource/Stock Tracking?${params}`)
            tracking.value = response.data.data || []
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    // Search & Filter
    const searchItems = (query) => {
        const q = query.toLowerCase()
        return items.value.filter(item =>
            item.item_code?.toLowerCase().includes(q) ||
            item.item_name?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        )
    }

    const getItemsByCategory = (category) => {
        return items.value.filter(item => item.item_group === category)
    }

    return {
        // State
        warehouses,
        items,
        uoms,
        categories,
        tracking,
        purchases,
        transfers,
        adjustments,
        loading,
        error,

        // Computed
        totalValue,
        lowStockItems,
        outOfStockItems,

        // Actions
        loadWarehouses,
        loadItems,
        loadUOM,
        loadCategories,
        addItem,
        updateItem,
        deleteItem,
        addPurchaseReceipt,
        loadPurchaseReceipts,
        addTransfer,
        loadTransfers,
        addAdjustment,
        loadAdjustments,
        logTracking,
        loadTracking,
        searchItems,
        getItemsByCategory,
        defaultItemSeries
    }
})
