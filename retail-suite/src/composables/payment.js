import { call } from 'frappe-ui'

// ===========================================================================
// Api Get Payment Modes
// ===========================================================================

export const getPaymentModes = async () => {
  const res = await call('frappe.client.get_list', {
    doctype: 'Mode of Payment',
    fields: JSON.stringify(['name', 'type']),
    filters: JSON.stringify([['enabled', '=', 1]]),
    limit_page_length: 0
  })
  return res || []
}

// ===========================================================================
// Api Get Outstanding Invoices
// ===========================================================================
export const getOutstandingInvoices = async (
  company,
  currency,
  customer,
  pos_profile_name
) => {
  try {

    const response = await call(
      'retail.retail.api.payment_entry.get_outstanding_invoices',
      {
        company,
        currency,
        customer,
        pos_profile_name
      }
    )

    console.log("📄 Raw response:", response)

    const invoices = response?.message || response || []

    console.log("📄 Parsed invoices:", invoices)

    return invoices

  } catch (error) {

    console.error('❌ Api Get Outstanding Invoices:', error)

    return []
  }
}



// ===========================================================================
// Api Get Unallocated Payments
// ===========================================================================
export const get_unallocated_payments = async (customer, company, currency, mode_of_payment = null) => {
    try {

        const params = { customer, company, currency }
        if (mode_of_payment) params.mode_of_payment = mode_of_payment

        const response = await call('retail.retail.api.payment_entry.get_unallocated_payments', {
            params
        })

        console.log("Raw response: ", response)

        const payments = response?.message || response || []

        console.log("📄 Parsed payments:", payments)
        return payments
    }
    catch (error) {
        console.error("❌ Api Get Unallocated Payments error:", error)
    }

}


// ===========================================================================
// Api Post Process Pos Payment
// ===========================================================================
export const processPayment = async (payload) => {
    try {

        const response = await call('retail.retail.api.payment_entry.process_pos_payment', {
            payload: JSON.stringify(payload)
        }
        )
        console.log("Raw response: ", response)

        const process = response?.message || response || []

        console.log("📄 Parsed process:", process)
        return process
    }
    catch (error) {
        console.error("❌ Process Payment error:", error)
    }
}
