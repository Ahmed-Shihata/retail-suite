import { call } from 'frappe-ui'

// ======================================================================
// Sales Cash Flow Report APIs
// ======================================================================
export const getCashFlowReport = async (filters) => {
  try {
    const res = await call('retail.retail.api.common.get_cash_flow_report',
      { filters: JSON.stringify(filters) },
    )
    return res.data.message || { operating: [], investing: [], financing: [] }
  } catch (err) {
    console.error('Error loading cash flow report:', err)
    return { operating: [], investing: [], financing: [] }
  }
}
// ======================================================================
// Sales Analytics Report APIs
// ======================================================================
export const getSalesAnalytics = async ({ fromDate, toDate, company = null }) => {
  try {
    const params = {
      from_date: fromDate,
      to_date: toDate,
    }
    if (company) params.company = company

    const response = await call(
      'retail.retail.api.common.get_sales_analytics',
        params
    )
    return { success: true, data: response }
  } catch (err) {
    console.error('Error loading sales analytics:', err)
    return {
      success: false,
      error: err?.response?.data?.exception || err?.message || 'Failed to load analytics',
    }
  }
}
// ======================================================================
// API Balance Sheet Report
// ======================================================================
export const getBalanceSheetReport = async (filters = {}) => {
  try {
    const response = await call('retail.retail.api.reports.get_balance_sheet_report', {
      params: {
            filters:JSON.stringify(filters)
        }
    })
    console.log("✅ API Balance Sheet Report", response)
    return response
  } catch (error) {
    console.error("❌ Error API Balance Sheet Report", error)
    throw error
  }
}

// ======================================================================
// API Accounts Receivable Report
// ======================================================================
export const getAccountsReceivableReport = async (filters = {}) => {
  try {
    const response = await call('retail.retail.api.reports.get_accounts_receivable_data',
    { filters:JSON.stringify(filters) }
    )
    console.log("✅ API Accounts Receivable Report ", response)
    return response
  } catch (error) {
    console.error("❌ Error API Accounts Receivable Report ", error)
    throw error
  }
}
// ======================================================================
// Api Export Accounts Receivable Report to CSV
// ======================================================================
export const exportAccountsReceivableReport = async () => {
  try {
    // Use POST request and get blob response for file download
    const response = await call(
      'retail.retail.api.reports.export_ar_report',
      {},
      {
        responseType: 'blob'
      }
    )

    console.log("✅ Api Export Accounts Receivable Report ", response)

    // Create a blob from the response
    const blob = new Blob([response.data], { type: 'text/csv' })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `accounts_receivable_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, message: 'Report exported successfully' }
  } catch (error) {
    console.error("❌ Error Api Export Accounts Receivable Report ", error)
    throw error
  }
}

// ======================================================================
// API Accounts Payable Report
// ======================================================================

export const getAccountsPayableReport = async (filters = {}) => {
  try {
    const response = await call('retail.retail.api.reports.get_accounts_payable_data',
          {filters:filters }
    )
    console.log("✅ API Accounts Payable Report", response)
    return response
  } catch (error) {
    console.error("❌ Error API Accounts Payable Report", error)
    throw error
  }
}

// ======================================================================
// Api Export Accounts Payable Report to CSV
// ======================================================================
export const exportAccountsPayableReport = async () => {
  try {
    // Use POST request and get blob response for file download
    const response = await call(
      'retail.retail.api.reports.export_ap_report',
      {},
      {
        responseType: 'blob'
      }
    )

    console.log("✅ Api Export Accounts Payable Report", response)

    // Create a blob from the response
    const blob = new Blob([response.data], { type: 'text/csv' })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `accounts_payable_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, message: 'Report exported successfully' }
  } catch (error) {
    console.error("❌ Error Api Export Accounts Payable Report", error)
    throw error
  }
}
