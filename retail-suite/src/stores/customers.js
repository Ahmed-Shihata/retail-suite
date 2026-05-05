import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CustomersFinancialData, fetchCustomerProfileApi } from '@/services/api'
export const useCustomersStore = defineStore('customers', () => {
    // State
    const customers = ref([])
    const transactions = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Actions
    const fetchCustomers = async () => {
        loading.value = true
        try {
            // Replace with actual API call
            const response = await fetch('/api/customers')
            customers.value = await response.json()
            error.value = null
        } catch (err) {
            error.value = err.message
            console.error('Error fetching customers:', err)
        } finally {
            loading.value = false
        }
    }
    const fetchCustomersFinancialData = async (pos_profile) => {
        loading.value = true
        try {
            // Replace with actual API call
            const response = await CustomersFinancialData(pos_profile)

            error.value = null
            return response
        } catch (err) {
            error.value = err.message
            console.error('Error fetching customers:', err)
        } finally {
            loading.value = false
        }
    }
    const fetchCustomerProfile = async(customer_name) =>{
         loading.value = true
        try {
            // Replace with actual API call
            const response = await fetchCustomerProfileApi(customer_name)
            error.value = null
            return response
        } catch (err) {
            error.value = err.message
            console.error('Error fetching customers:', err)
        } finally {
            loading.value = false
        }
    }
    const createCustomer = async (customerData) => {
        loading.value = true
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            })

            if (!response.ok) throw new Error('Failed to create customer')

            const newCustomer = await response.json()
            customers.value.push(newCustomer)
            return newCustomer
        } catch (err) {
            error.value = err.message
            console.error('Error creating customer:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateCustomer = async (id, customerData) => {
        loading.value = true
        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            })

            if (!response.ok) throw new Error('Failed to update customer')

            const updated = await response.json()
            const index = customers.value.findIndex(c => c.id === id)
            if (index >= 0) {
                customers.value[index] = updated
            }
            return updated
        } catch (err) {
            error.value = err.message
            console.error('Error updating customer:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteCustomer = async (id) => {
        loading.value = true
        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete customer')

            customers.value = customers.value.filter(c => c.id !== id)
        } catch (err) {
            error.value = err.message
            console.error('Error deleting customer:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const getCustomer = async (id) => {
        try {
            const response = await fetch(`/api/customers/${id}`)
            if (!response.ok) throw new Error('Customer not found')
            return await response.json()
        } catch (err) {
            error.value = err.message
            console.error('Error fetching customer:', err)
            throw err
        }
    }

    const getCustomerTransactions = async (customerId, fromDate, toDate) => {
        try {
            const params = new URLSearchParams({
                customerId,
                fromDate,
                toDate
            })

            const response = await fetch(`/api/customers/${customerId}/transactions?${params}`)
            if (!response.ok) throw new Error('Failed to fetch transactions')

            return await response.json()
        } catch (err) {
            error.value = err.message
            console.error('Error fetching transactions:', err)
            throw err
        }
    }

    const getCustomerPurchases = async (customerId) => {
        try {
            const response = await fetch(`/api/customers/${customerId}/purchases`)
            if (!response.ok) throw new Error('Failed to fetch purchases')
            return await response.json()
        } catch (err) {
            error.value = err.message
            console.error('Error fetching purchases:', err)
            throw err
        }
    }

    const updateCustomerDebt = async (customerId, debtAmount) => {
        try {
            const response = await fetch(`/api/customers/${customerId}/debt`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ debt: debtAmount })
            })

            if (!response.ok) throw new Error('Failed to update debt')
            return await response.json()
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const searchCustomers = (query) => {
        if (!query) return customers.value

        const lowerQuery = query.toLowerCase()
        return customers.value.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.phone.includes(query) ||
            c.email.toLowerCase().includes(lowerQuery)
        )
    }

    // Getters
    const totalCustomers = computed(() => customers.value.length)

    const activeCustomers = computed(() =>
        customers.value.filter(c => c.status === 'active').length
    )

    const totalDebt = computed(() =>
        customers.value.reduce((sum, c) => sum + (c.debt || 0), 0)
    )

    const totalCreditUsed = computed(() =>
        customers.value.reduce((sum, c) => sum + (c.creditUsed || 0), 0)
    )

    const customersByStatus = computed(() => {
        return {
            active: customers.value.filter(c => c.status === 'active').length,
            inactive: customers.value.filter(c => c.status === 'inactive').length,
            blocked: customers.value.filter(c => c.status === 'blocked').length
        }
    })

    const getCustomerById = (id) => {
        return customers.value.find(c => c.id === id)
    }

    return {
        // State
        customers,
        transactions,
        loading,
        error,

        // Actions
        fetchCustomers,
        fetchCustomersFinancialData,
        fetchCustomerProfile,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer,
        getCustomerTransactions,
        getCustomerPurchases,
        updateCustomerDebt,
        searchCustomers,
        getCustomerById,

        // Getters
        totalCustomers,
        activeCustomers,
        totalDebt,
        totalCreditUsed,
        customersByStatus
    }
})
