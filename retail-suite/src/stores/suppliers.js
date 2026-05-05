// src/stores/suppliers.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import {
    SuppliersFinancialData,
    SupplierFinancialDetails,
    createSupplierApi,
    getSupplierGroups,

    updateSupplierApi,
    updateSupplierContactsApi,
    deleteSupplierApi,

  } from '@/services/api'
export const useSuppliersStore = defineStore('suppliers', () => {
  // State
  const suppliers = ref([])
  const loading = ref(false)
  const error = ref(null)
  const supplierGroups = ref([])
  // Computed
  const supplierCount = computed(() => suppliers.value.length)
  const activeSuppliers = computed(() =>
    suppliers.value.filter(s => s.status === 'active')
  )
  const totalDueAmount = computed(() =>
    suppliers.value.reduce((sum, s) => sum + (s.due_amount || 0), 0)
  )
  const totalSupplies = computed(() =>
    suppliers.value.reduce((sum, s) => sum + (s.totalSupplies || 0), 0)
  )

  // Actions
  const loadSupplierGroups = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getSupplierGroups()
      supplierGroups.value = response || []
      console.log("supplierGroups =>=>", response)
      return supplierGroups.value
    } catch (err) {
      error.value = err.message || 'Failed to load supplier groups'
      console.error('Error loading supplier groups:', err)
    }
    finally {
      loading.value = false
    }
  }
  const fetchSuppliersFinancialData = async (posProfile) => {
    loading.value = true
    error.value = null
    try {
      // Replace with your actual API endpoint
      const response = await SuppliersFinancialData(posProfile)
      console.log("response =>=>", response)
      suppliers.value = response || []
      return response
    //   return suppliers.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch suppliers'
      console.error('Error fetching suppliers:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
    // 2
    const fetchSupplierFullFinancialDetails = async(supplier_name)=>{
        loading.value = true
        error.value = null
        try {
        // Replace with your actual API endpoint
        const response = await SupplierFinancialDetails(supplier_name)
        console.log("response =>=>", response)
        return response
        //   return suppliers.value
        } catch (err) {
        error.value = err.message || 'Failed to fetch suppliers'
        console.error('Error fetching suppliers:', err)
        throw err
        } finally {
        loading.value = false
        }
  }
  const createSupplier = async (supplierData) => {
    loading.value = true
    error.value = null
    try {
      console.log("supplierData to create =>", supplierData)
      const response = await createSupplierApi(supplierData)
      console.log("response createSupplier", response)
      const newSupplier = response.data
      suppliers.value.push(newSupplier)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to create supplier'
      throw err
    } finally {
      loading.value = false
    }
  }
  const updateSupplier = async (supplierName, supplierData) => {
    loading.value = true
    error.value = null
    try {
      const response = await updateSupplierApi(supplierName, supplierData)
      console.log("response updateSupplier", response)
      const updatedSupplier = response
      return updatedSupplier
    } catch (err) {
      error.value = err.message || 'Failed to update supplier'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSupplierContacts = async (supplierName, contacts) => {
    loading.value = true
    error.value = null
    try {
      const response = await updateSupplierContactsApi(supplierName, contacts)
      console.log("response updateSupplierContacts", response)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to update supplier contacts'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSupplier = async (supplierId) => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/suppliers/${supplierId}`)
      suppliers.value = suppliers.value.filter(s => s.id !== supplierId)
    } catch (err) {
      error.value = err.message || 'Failed to delete supplier'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSupplierById = (supplierId) => {
    return suppliers.value.find(s => s.id === supplierId)
  }

  const searchSuppliers = (query) => {
    if (!query) return suppliers.value
    const lowerQuery = query.toLowerCase()
    return suppliers.value.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.email?.toLowerCase().includes(lowerQuery) ||
      s.first_mobile?.includes(query) ||
      s.second_mobile?.includes(query)
    )
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    suppliers,
    supplierGroups,
    loading,
    error,

    // Computed
    supplierCount,
    activeSuppliers,
    totalDueAmount,
    totalSupplies,

    // Actions
    loadSupplierGroups,
    fetchSuppliersFinancialData,
    fetchSupplierFullFinancialDetails,
    createSupplier,

    updateSupplier,
    updateSupplierApi,
    updateSupplierContacts,
    deleteSupplier,
    deleteSupplierApi,
    getSupplierById,
    searchSuppliers,
    clearError
  }
})
