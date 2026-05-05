import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import {getSuppliersBills} from '@/services/api.js'
// 1️⃣ Setup Store (Composition API) ✅
export const useBillsStore = defineStore('bills',()=>{
    const bills = ref([])
    const pendingBills = ref([])
    const billsCount = ref(0)
    const totalPurchase = ref(0)
    const amountDue = ref(0)

    const loadBills = async(filters={})=>{
        try{
            const response = await getSuppliersBills(filters)
            console.log("loadBills",response)
            bills.value = response.invoices
            billsCount.value = response.count
            totalPurchase.value = response.total
            amountDue.value = response.due
            pendingBills.value = response.count_pending_inv
            console.log("bills",bills.value)
        }catch(error){
            console.error(error)
        }
    }
    const loadpendingBills = async()=>{
        try{
            const filters = {"status":"Draft"}
            const response = await loadBills(filters)
            // pendingBills.value = response.invoices.length
            console.log("loadpendingBills",response)
        }catch(error){
            console.error(error)
        }
    }
    return {
        // State
        bills,
        pendingBills,
        billsCount,
        totalPurchase,
        amountDue,
        // Actions
        loadBills,
        loadpendingBills
    }
})
