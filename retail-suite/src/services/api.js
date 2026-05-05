// api.js File //

import { api, initializeClient } from './auth.js';


export const getPaymentModes = async () => {
  const res = await api.get('/api/method/frappe.client.get_list', {
    params: {
      doctype: 'Mode of Payment',
      fields: JSON.stringify(['name', 'type']),
      filters: JSON.stringify([['enabled', '=', 1]]),
      limit_page_length: 0
    }
  })
  return res.data?.message || []
}

export const getTerritoriesApi = async () => {
  const res = await api.get('/api/method/frappe.client.get_list', {
    params: {
      doctype: 'Territory',
      fields: JSON.stringify(['name']),
      limit_page_length: 100,
    }
  })
  return res.data?.message || []
}

export const getCountriesApi = async () => {
  const res = await api.get('/api/method/frappe.client.get_list', {
    params: {
      doctype: 'Country',
      fields: JSON.stringify(['name']),
      limit_page_length: 300,
    }
  })
  console.log("res data",res.data)
  return res.data?.message || []
}

/**
 * Get all notifications for current user
 * @param {string} user - Username/email
 * @returns {Promise<Array>} List of notifications
 */
export const getNotifications = async (user) => {
  try {
    const response = await api.get('/api/resource/Notification Log', {
      params: {
        fields: JSON.stringify([
          'name',
          'subject',
          'email_content',
          'creation',
          'read',
          'type',
          'document_type',
          'document_name'
        ]),
        filters: JSON.stringify({
          for_user: user
        }),
        order_by: 'creation desc',
        limit_page_length: 10
      }
    })
    return response.data.data || []
  } catch (err) {
    console.error('Error loading notifications:', err)
    return []
  }
}

// In @/services/api.js
export const updateNotificationStatus = async (notificationId, read) => {
  try {
    const response = await api.put(`/api/resource/Notification Log/${notificationId}`, {
      read: read ? 1 : 0
    })
    return response.data
  } catch (err) {
    console.error('Error updating notification:', err)
    throw err
  }
}

// In @/services/api.js
export const deleteNotificationAPI = async (notificationId) => {
  try {
    const response = await api.delete(`/api/resource/Notification Log/${notificationId}`)
    return response.data
  } catch (err) {
    console.error('Error deleting notification:', err)
    throw err
  }
}
/**
 * Get all messages/communications
 * @returns {Promise<Array>} List of messages
 */
export const getMessages = async () => {
  try {
    const response = await api.get('/api/resource/Communication', {
      params: {
        fields: JSON.stringify([
          'name',
          'subject',
          'content',
          'sender',
          'creation'
        ]),
        filters: JSON.stringify({
          communication_type: 'Chat'
        }),
        order_by: 'creation desc',
        limit_page_length: 10
      }
    })
    return response.data.data || []
  } catch (err) {
    console.error('Error loading messages:', err)
    return []
  }
}

/**
 * Get user roles
 * @param {string} user - Username/email
 * @returns {Promise<Array>} Array of role names
 */
// export const getUserRoles = async (user) => {
//   try {
//     const response = await api.get('/api/resource/Has Roles', {
//       params: {
//         fields: JSON.stringify(['role']),
//         filters: JSON.stringify({
//           parent: user
//         })
//       }
//     })

//     if (response.data.data && response.data.data.length > 0) {
//       return response.data.data.map(r => r.role)
//     }
//     return []
//   } catch (err) {
//     console.error('Error fetching user roles:', err)
//     return []
//   }
// }

/**
 * Get current logged-in user information
 * Fetches: user, email, full_name, user_image, roles
 * @returns {Promise<Object>} User info object
 */
export const getCurrentUserInfoApi = async () => {
  try {
    // Step 1: Get logged-in user
    const response = await api.get('/api/method/retail.retail.api.auth.get_logged_user')

    if (response.status !== 200) {
      throw new Error(`Error fetching current user: ${response.statusText}`)
    }
    const user = response.data.message
    if (user === 'Guest') {
      console.log("Logged-in user:", user)
      alert(`Logged-in user: ${user}`)
      return
    }
    // Step 2: Get user document details (email, full_name, user_image)
    const userDocResponse = await api.get(`/api/resource/User/${user}`)
    const userData = userDocResponse.data.data

    // Step 3: Get user roles
    const userRoles = await getUserRoles(user)

    return {
      user,
      email: userData.email || '',
      full_name: userData.full_name || user,
      user_image: userData.user_image || '',
      roles: userRoles || []
    }
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw error
  }
}

/**
 * Mark a single notification as read
 * @param {string} notificationId - Notification ID/name
 * @returns {Promise<boolean>} Success status
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.post('/api/method/frappe.client.set_value', {
      doctype: 'Notification Log',
      name: notificationId,
      fieldname: { read: 1 }
    })
    return response.status === 200
  } catch (err) {
    console.error('Error marking notification as read:', err)
    return false
  }
}

/**
 * Mark multiple notifications as read
 * @param {Array<string>} notificationIds - Array of notification IDs
 * @returns {Promise<boolean>} Success status
 */
export const markAllNotificationsAsRead = async (notificationIds) => {
  try {
    const promises = notificationIds.map(id =>
      api.post('/api/method/frappe.client.set_value', {
        doctype: 'Notification Log',
        name: id,
        fieldname: { read: 1 }
      })
    )
    await Promise.all(promises)
    return true
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
    return false
  }
}

/**
 * Get user info using frappe.session (if available)
 * Lightweight fallback method - no API call
 * @returns {Object|null} User info or null
 */
export const getUserInfoFromSession = () => {
  try {
    if (typeof frappe !== 'undefined' && frappe.session) {
      return {
        user: frappe.session.user,
        email: frappe.session.user_email || '',
        full_name: frappe.session.user_fullname || frappe.session.user,
        user_image: frappe.session.user_image || '',
        roles: frappe.session.roles || []
      }
    }
    return null
  } catch (err) {
    console.error('Error getting user from session:', err)
    return null
  }
}

/**
 * Load a custom API method from your app
 * @param {string} methodPath - API method path (e.g., 'your_app.api.method_name')
 * @param {Object} params - Optional parameters to pass
 * @returns {Promise<any>} API response message
 */
export const callCustomMethod = async (methodPath, params = {}) => {
  try {
    const response = await api.get(`/api/method/${methodPath}`, {
      params
    })
    return response.data.message
  } catch (err) {
    console.error(`Error calling method ${methodPath}:`, err)
    return null
  }
}

/**
 * Check user permissions for a doctype
 * @param {string} doctype - Doctype name
 * @param {string} permission - Permission type (read, write, create, delete, submit, amend, cancel)
 * @returns {Promise<boolean>} Has permission or not
 */
export const checkUserPermission = async (doctype, permission = 'read') => {
  try {
    const response = await api.post('/api/method/frappe.client.has_permission', {
      doctype,
      perm_type: permission
    })
    return response.data.message || false
  } catch (err) {
    console.error(`Error checking permission for ${doctype}:`, err)
    return false
  }
}
//======================================================
    export const getCompanies = async () => {
    try {
        const response = await api.get("/api/method/retail.retail.api.common.load_companies")
        return response.data.message
    } catch (err) {
        console.error("Error loading companies:", err)
        return []
    }
    }


export const getFiscalYears = async () => {
try {
    const response = await api.get("/api/method/retail.retail.api.common.load_fiscal_years")
    return response.data.message
} catch (err) {
    console.error("Error loading fiscal years:", err)
    return []
}
}

export const getClosingAccounts = async (company) => {
  try {
    const response = await api.get("/api/method/retail.retail.api.common.load_closing_accounts", {
      params: { company },
    })
    return response.data.message
  } catch (err) {
    console.error("Error loading closing accounts:", err)
    return []
  }
}


// API Get Equipmnet py Supplier
export const getUsers = async () => {
    try {

        const result = await api.get('/api/resource/User', {
            params: {
                fields: JSON.stringify(['name']),
            }
        })
        //    console.log('result API Get Users',result)
        return result

    } catch (e) {
        console.log('error API Get Users', e)
    }
}


export const getUserRoles = async (user) => {

    const res = await api.get(`/api/method/frappe.core.doctype.user.user.get_roles`, {
        params: { uid: user }
    });
    const roles = res.data?.message || [];
    console.log("🛡️ Roles:", roles);
    return roles;
}

export const get_opening_dialog_data = async () => {
    try {
        const response = await api.get('/api/method/retail.retail.api.posapp.get_opening_dialog_data');
        return response;
    }
    catch (error) {
        console.error('Error fetching opening dialog data:', error);
        throw error;
    }
}


export const getAllShifts = async (filters = {}) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.shifts.get_shifts', {
            params: {
                name: filters.name,
                status: filters.status || '',   // "Open" أو "Closed"
                order_by: 'creation desc'
            }
        });

        return response.data
    } catch (error) {
        console.error('Error fetching shifts:', error);
        throw error;
    }
}


export const make_closing_shift_from_opening_shift = async (opening_shift) => {
    try {
        const response = await api.post('/api/method/retail.retail.doctype.pos_closing_shift.pos_closing_shift.make_closing_shift_from_opening', {
            opening_shift: JSON.stringify(opening_shift)
        });
        console.log('Closing shift created:', response);
        return response.data.message; // Assuming the new closing shift details are in response.data.message
    } catch (error) {
        console.error('Error creating closing shift:', error);
        throw error;
    }
}

export const get_opening_shift = async (user) => {
    try {
        console.log('Getting api api:', api);
        const response = await api.get('/api/method/retail.retail.api.posapp.check_opening_shift', {
            params: {
                user: user
            }
        });
        console.log('Fetched opening shift response:', response);
        return response.data.message; // Assuming the result is in response.data.message
    } catch (error) {
        console.error('Error fetching opening shift:', error);
        throw error;
    }

}

export const open_shift = async (shiftData) => {
    try {

        const response = await api.post('/api/method/retail.retail.api.posapp.create_opening_voucher',
            {
                pos_profile: shiftData.pos_profile,
                company: shiftData.company,
                balance_details: shiftData.balance_details
            }
        );
        console.log('Shift opened successfully:', response);
        return response.data.message; // Assuming the new shift details are in response.data.message
    } catch (error) {
        console.error('Error opening shift:', error);
        throw error;
    }
}

// ✅ 2. استدعاء submit_closing_shift
export const submit_closing_shift = async (closingShift) => {
    try {

        const response = await api.post(
            '/api/method/retail.retail.doctype.pos_closing_shift.pos_closing_shift.submit_closing_shift',
            {
                closing_shift: closingShift // هنا برضو JSON.stringify
            }
        )
        console.log("submit_closing_shift response:", response.data)
        return response.data
    } catch (error) {
        console.error("Error submitting closing shift:", error)
        throw error
    }
}


export const get_shift_payment_summary = async (pos_opening_shift) => {
    try {

        const response = await api.post(
            '/api/method/retail.retail.doctype.pos_closing_shift.pos_closing_shift.get_shift_payment_summary',
            {
                opening_shift_name: pos_opening_shift // هنا برضو JSON.stringify
            }
        )
        console.log("get_shift_payment_summary response:", response.data)
        return response.data?.message
    } catch (error) {
        console.error("Error submitting closing shift:", error)
        throw error
    }
}
export async function get_shift_summary(pos_opening_shift) {
    try {
        const shiftParam =
            typeof pos_opening_shift === 'string'
                ? pos_opening_shift
                : pos_opening_shift.name; // 👈 هنا الحل

        const response = await api.get(
            '/api/method/retail.retail.doctype.pos_closing_shift.pos_closing_shift.get_shift_summary',
            {
                params: { pos_opening_shift_name: shiftParam }
            }
        );

        console.log('Shift summary fetched:', response);
        return response.data.message;
    } catch (error) {
        console.error('Error fetching shift summary:', error);
        throw error;
    }
}


// ✅ 3. استدعاء submit_invoice

export const submitInvoice = async (invoice, data) => {
    try {
        const response = await api.post('/api/method/retail.retail.api.posapp.submit_invoice', {
            invoice: JSON.stringify(invoice),
            data: data
        });
        console.log('Invoice submitted successfully:', response.data.message);
        return response.data.message; // Assuming the submitted invoice details are in response.data.message
    } catch (error) {
        console.error('Error submitting invoice:', error);
        throw error;
    }
}


// Customers Invoice Related To The cetain POS Profile
export const getPosInvoices = async (filters = {}) => {
    try {
        const response = await api.get('/api/method/retail.retail.doctype.pos_closing_shift.pos_closing_shift.get_all_pos_invoices',
            { params: filters }
        );

        return response.data.message; // Assuming the invoices are in response.data.data
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
}

// Suppliers Invoice

export const getSuppliersBills = async (filters = {}) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.bills.get_all_bills_invoices',
            { params: filters }
        );

        return response.data.message; // Assuming the invoices are in response.data.data
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
}
export const getShiftStatistics = async () => {
    try {
        const response = await api.get('/api/method/retail.retail.api.shifts.get_shift_statistics');

        return response.data.message; // Assuming the statistics are in response.data.message

    } catch (error) {
        console.error('Error fetching shifts statistics:', error);
        throw error;
    }
}

export const getShiftDetails = async (shift_id) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.shifts.get_shift_details',
            {
                params: { shift_id }
            }
        );

        return response.data.message; // Assuming the statistics are in response.data.message

    } catch (error) {
        console.error('Error fetching shifts statistics:', error);
        throw error;
    }

}
// ====================================================================
// Sales Return
// ====================================================================
export const createSalesReturn = async (invoice_name, items, pos_profile_name) => {

    try {
        const response = await api.post('/api/method/retail.retail.api.invoice.create_sales_return',
            {
                invoice_name: invoice_name,
                items: items,
                pos_profile_name:pos_profile_name
            }
        )
        return response.data.message;

    } catch (error) {
        console.error('Error fetching shifts statistics:', error);
        throw error;
    }
}

export const getReturnableInvoices = async () => {
    // get_returnable_invoices
    try {
        const response = await api.get('/api/method/retail.retail.api.invoice.get_returnable_invoices_api')
        console.log("api getReturnableInvoices", response)
        return response.data.message;

    } catch (error) {
        console.error('Error fetching shifts statistics:', error);
        throw error;
    }
}

// ─── Get Items ────────────────────────────────────────────────────────────────
export const getItemsFromFrappeDB = async (
  currentPOSProfile,
  currentPriceList,
  currentCustomer,
  searchValue = '',
  selectedWarehouse = null
) => {
  try {
    console.log("getItemsFromFrappeDB WH",selectedWarehouse)
    const response = await api.post(
      '/api/method/retail.retail.api.posapp.get_items',
      {
        pos_profile: JSON.stringify(currentPOSProfile),
        price_list: currentPriceList,
        search_value: searchValue,
        item_group: '',
        customer: currentCustomer,
        warehouse: selectedWarehouse || '',  // لو null ما نبعتش
      }
    )
    return response.data.message || response.data
  } catch (error) {
    console.error('❌ getItemsFromFrappeDB:', error)
    return []
  }
}

// ─── Get Price Lists ──────────────────────────────────────────────────────────
export const getPriceLists = async () => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.common.get_price_lists'
    )
        console.log("/api/method/retail.retail.api.common.\get_price_lists", response)
    return response.data.message || []
  } catch (error) {
    console.error('❌ getPriceLists:', error)
    return []
  }
}


// ─── Get Warehouses ───────────────────────────────────────────────────────────

export const getWarehouses = async () => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.common.get_warehouses'
    )

    console.log("/api/method/retail.retail.api.common.get_warehouses", response.data.message)
    return response.data.message || []
  } catch (error) {
    console.error('❌ getWarehouses:', error)
    return []
  }
}
// POST Create Sample Items


export const createSampleItems = async (sample_products) => {
    try {
        const response = await api.post('/api/method/retail.retail.api.setting.create_all_sample_items',
            { sample_products: sample_products }
        )
        console.log("api createSampleItems", response)
        return response.data.message || response.data
    }
    catch (error) {

    }

}

export const deleteSampleItems = async () => {
    try {
        const response = await api.post(
            '/api/method/retail.retail.api.setting.delete_all_sample_items'
        )
        console.log("🗑️ deleteSampleItems:", response)
        return response.data.message || response.data
    } catch (error) {
        console.error("❌ deleteSampleItems error:", error)
    }
}



// ==========================================================
// Customer API
// ==========================================================
// *****************
//1  update Customers
// *****************
// export const createUpdateCustomerInFrappeDB = async (customerData) => {
//     try {
//         const payload = {
//             customer_name: customerData.customer_name || null,
//             company: customerData.company || '',
//             pos_profile_doc: JSON.stringify(customerData.pos_profile_doc || {}),
//             address: customerData.custom_city || null,
//             second_mobile: customerData.custom_second_mobile || null,
//             first_mobile: customerData.custom_first_mobile || null,
//             customer_id: customerData.customer_id || null,
//             email_id: customerData.email_id || null,
//             customer_group: customerData.customer_group || null,
//             territory: customerData.territory || null,
//             customer_type: customerData.customer_type || null,
//             gender: customerData.gender || null,
//             note: customerData.note || null,
//             method: customerData.method || 'create',
//         }
//         const response = await api.post('/api/method/retail.retail.api.posapp.create_customer', {
//             ...payload

//         })
//         // console.log("api createCustomerInFrappeDB", response)
//         return response.data.message || response.data
//     }
//     catch (error) {

//     }

// }
export const createUpdateCustomerInFrappeDB = async (args) => {
  const {
    method = 'create',
    customer_id,
    customer_name,
    pos_profile_doc,
    company,
    first_mobile,
    second_mobile,
    email_id,
    city,
    address_line1,
    address_line2,
    state,
    country,
    pincode,
    first_name,
    last_name,
    customer_group,
    territory,
    customer_type,
    gender,
    note,
  } = args
  console.log("Args C/U Customer",args)
  const res = await api.post('/api/method/retail.retail.api.posapp.create_customer', {
    method,
    customer_id    : customer_id   || '',
    customer_name,
    pos_profile_doc: typeof pos_profile_doc === 'string'
                      ? pos_profile_doc
                      : JSON.stringify(pos_profile_doc || {}),
    company        : company       || '',
    first_mobile   : first_mobile  || '',
    second_mobile  : second_mobile || '',
    email_id       : email_id      || '',
    city           : city          || '',
    address_line1  : address_line1 || '',
    address_line2  : address_line2 || '',
    state          : state         || '',
    country        : country       || 'Egypt',
    pincode        : pincode       || '',
    first_name     : first_name    || '',
    last_name      : last_name     || '',
    customer_group : customer_group || '',
    territory      : territory      || '',
    customer_type  : customer_type  || 'Individual',
    gender         : gender         || '',
    note           : note           || '',
  })

  return res.data?.message
}
// *****************
//2  Get Customers
// *****************
// retail.retail.api.posapp.get_customer_names

export const getCustomersFromFrappeDB = async (pos_profile) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.posapp.get_customer_names', {
            params: { pos_profile }
        })
        console.log("api getCustomersFromFrappeDB", response)
        return response.data.message || response.data
    }
    catch (error) {

    }

}
// *******************************
//3  Get Customers Financial Data
// *******************************
export const CustomersFinancialData = async (pos_profile) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.customer.get_customers_financial_data', {
            params: { pos_profile: JSON.stringify(pos_profile) }
        })
        console.log("api CustomersFinancialData", response.data.message)
        return response.data.message || response.data
    }
    catch (error) {
        console.error(error)
    }

}

// ***********************************
//4 Get One Customer Full Details
// ***********************************
export const fetchCustomerProfileApi = async (customer_name) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.customer.get_customer_profile', {
            params: { customer_name: customer_name }
        })
        console.log("api fetchCustomerProfileApi", response.data.message)
        return response.data.message || response.data
    }
    catch (error) {
        console.error(error)
    }

}

// ===========================================================================
// ===========================================================================


// *******************************
// 1 Get Suppliers Financial Data
// *******************************
export const SuppliersFinancialData = async (pos_profile) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.supplier.get_suppliers_financial_data', {
            params: { pos_profile: JSON.stringify(pos_profile) }
        })
        console.log("api SuppliersFinancialData", response.data.message)
        return response.data.message || response.data
    }
    catch (error) {
        console.error(error)
    }

}

// ***********************************
//  2 Get One Supplier Full Details
// ***********************************
export const SupplierFinancialDetails = async (supplier_name) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.supplier.get_supplier_profile', {
            params: { supplier_name: supplier_name }
        })
        console.log("api", response.data.message)
        return response.data.message || response.data
    }
    catch (error) {
        console.error(error)
    }

}
// ===========================================================================
// ===========================================================================
// Api Get Outstanding Invoices
//  "retail.retail.api.payment_entry.get_outstanding_invoices",
// customer: customer_name,
// company: company,
// currency: pos_profile.currency,
// pos_profile_name: pos_profile_search,
export const getOutstandingInvoices = async (company, currency, customer, pos_profile_name) => {
    try {
        const response = await api.get('/api/method/retail.retail.api.payment_entry.get_outstanding_invoices', {
            params: {
                company,
                currency,
                customer,
                pos_profile_name
            }
        })
        console.log("api getOutstandingInvoices", response)
        return response.data.message || response.data
    }
    catch (error) {

    }

}
// =========================================================
//  Api Create Supplier
// =========================================================

export const createSupplierApi = async (supplierData) => {
    try {
        const response = await api.post('/api/method/retail.retail.api.supplier.create_supplier', {
            supplier_name: supplierData.supplier_name || null,
            supplier_group: supplierData.supplier_group || null,
            supplier_type: supplierData.supplier_type || null,
            mobile_no: supplierData.mobile_no || null,
            email_id: supplierData.email_id || null,
            address_line1: supplierData.address_line1 || '',
            address_line2: supplierData.address_line2 || '',
            city: supplierData.city || '',
            state: supplierData.state || '',
            country: supplierData.country || '',
            pin_code: supplierData.pin_code || '',
            status: 0,
            custom_note: supplierData.custom_note || null,
        })
        console.log("api createSupplier", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ createSupplier error:", error)
    }

}

// =========================================================
//  Api Update Supplier
// =========================================================

export const updateSupplierApi = async (supplierName, supplierData) => {
    try {
        console.log("Updating supplier with data:", supplierData, "and name:", supplierName)
        const response = await api.post('/api/method/retail.retail.api.supplier.update_supplier', {
            supplier_name: supplierName || null,
            data: JSON.stringify(supplierData)
        })
        console.log("api updateSupplier", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ updateSupplier error:", error)
    }

}

// =========================================================
//  Api Update Supplier constacts
// =========================================================
export const updateSupplierContactsApi = async (supplier_name, contacts) => {
    try {
      console.log("Updating Contacts :", contacts, "and name:", supplier_name)
        const response = await api.post('/api/method/retail.retail.api.supplier.update_supplier_contacts', {
            supplier_name: supplier_name,
            contacts_json: JSON.stringify(contacts)
        })
        console.log("api updateSupplierContactsApi", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ updateSupplierContactsApi error:", error)
    }

}

// =========================================================
//  Api Delete Supplier
// =========================================================

export const deleteSupplierApi = async (supplier_name) => {
    try {
        const response = await api.post('/api/method/retail.retail.api.supplier.delete_supplier', {
            supplier_name: supplier_name
        })
        console.log("api deleteSupplier", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ deleteSupplier error:", error)
    }

}
// =========================================================
//  Api Get Suppliers Groups
// =========================================================
export const getSupplierGroups = async () => {
    try {
        const response = await api.get('/api/method/retail.retail.api.supplier.get_supplier_groups')
        console.log("api getSupplierGroups", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ getSupplierGroups error:", error)
    }

}




// =========================================================
//  Api Create Payment Entry
// =========================================================

export const createPaymentEntry = async (paymentData) => {
    try {
        const response = await api.post('/api/method/retail.retail.api.payment_entry.process_pos_payment', {
            payment_data: JSON.stringify(paymentData)
        })
        console.log("api createPaymentEntry", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ createPaymentEntry error:", error)
    }

}


// Api retail.retail.api.payment_entry.get_unallocated_payments

export const get_unallocated_payments = async (customer, company, currency, mode_of_payment = null) => {
    try {
        console.log("api get_unallocated_payments customer", customer)
        console.log("api get_unallocated_payments company", company)
        console.log("api get_unallocated_payments currency", currency)
        console.log("api get_unallocated_payments mode_of_payment", mode_of_payment)
        const params = { customer, company, currency }
        if (mode_of_payment) params.mode_of_payment = mode_of_payment
        const response = await api.get('/api/method/retail.retail.api.payment_entry.get_unallocated_payments', {
            params
        })
        console.log("api get_unallocated_payments", response.data.message)
        return response.data.message
    }
    catch (error) {
        console.error("❌ get_unallocated_payments error:", error)
    }

}

// Api  method: "retail.retail.api.payment_entry.process_pos_payment",
//   //   args: { payload },

export const processPayment = async (payload) => {
    try {
        console.log("PPPP", payload)
        const response = await api.post('/api/method/retail.retail.api.payment_entry.process_pos_payment', {
            payload: JSON.stringify(payload)
        }
        )
        console.log("api Process payments", response.data.message)
        return response.data.message
    }
    catch (error) {
        console.error("❌ Process Payment error:", error)
    }
}

// Get Availabe POS Profile
// "retail.retail.api.payment_entry.get_available_pos_profiles",

export const get_available_pos_profiles = async (company, currency) => {

    try {
        const response = await api.get('/api/method/retail.retail.api.payment_entry.get_available_pos_profiles', {
            params: {
                company,
                currency
            }
        }
        )
        console.log("api Availabe POS Profile", response)
        console.log("api Availabe POS Profile", response.data.message)
        return response.data.message
    }
    catch (error) {
        console.error("❌ Process Payment error:", error)
    }
}
// ======================================================================
// Barcodes APIs
// ======================================================================
// Get Barcodes From Frappe DB
// retail.retail.api.inventory.get_all_barcodes
export const getBarcodesFromFrappeDB = async () => {
    try {
        const response = await api.get('/api/method/retail.retail.api.inventory.get_all_barcodes')
        console.log("api getBarcodesFromFrappeDB", response.data.message)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ getBarcodesFromFrappeDB error:", error)
    }
}

export const handleGenerateBarcodeFrappe = async (data) => {

    try {
        const response = await api.post('/api/resource/Barcode Item', {
            barcode: data.barcodeValue,
            barcode_type: data.type,
            parent: data.product_id,
            parenttype: 'Item',
            parentfield: 'barcodes',
        })
        console.log("api handleGenerateBarcode", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ handleGenerateBarcode error:", error)
    }
}
export const getBarcodeTypes = async () => {
    try {
        const response = await api.get(
            '/api/method/retail.retail.api.inventory.get_barcode_types'
        )
        return {
            status: 'success',
            data: response.data.message?.data || []
        }
    } catch (error) {
        console.error('Error fetching barcode types:', error)
        return { status: 'error', data: [] }
    }
}

export const updateItemBarcode = async (itemCode, oldBarcode, barcodeData) => {
    try {
        const response = await api.post(
            '/api/method/retail.retail.api.inventory.update_item_barcode',
            {
                item_code:    itemCode,
                old_barcode:  oldBarcode,
                barcode_data: JSON.stringify(barcodeData),
            }
        )

        // Frappe wraps the return value in response.data.message
        const result = response.data?.message

        return {
            status:  result?.status  ?? 'error',
            message: result?.message ?? 'Unknown error',
            data:    result?.data    ?? null,
        }
    } catch (error) {
        console.error('Error updating barcode:', error)
        return {
            status:  'error',
            message: error?.response?.data?.message || error.message || 'Request failed',
            data:    null,
        }
    }
}

export const generateBarcodePreview = async (data) => {
    try {
    const response = await api.post('/api/method/retail.retail.api.inventory.generate_barcode_img', {
        barcode_value: data.value,
        barcode_type: data.type,
    })

    console.log("api generateBarcodePreview", response)
    return response.data.message || response.data
    }catch (error) {
        console.error("❌ generateBarcodePreview error:", error)
    }
}

export const addItemBarcode = async (barcode_data)=>{
     try {
    const response = await api.post('/api/method/retail.retail.api.inventory.add_item_barcode', {
      barcode_data:barcode_data
    })


    return response.data.message || response.data
    }catch (error) {
        console.error("❌ generateBarcodePreview error:", error)
    }
}
// Delete Barcode
// retail.retail.api.inventory.delete_barcode
export const handleDeleteBarcodeFrappe = async (item_code, barcode) => {
    try {
        const response = await api.delete('/api/method/retail.retail.api.inventory.delete_item_barcode',{
             data: {
                item_code: item_code,
                barcode: barcode
            }
        })
        console.log("api handleDeleteBarcodeFrappe", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ handleDeleteBarcodeFrappe error:", error)
    }
}


export const handleUpdateBarcodeFrappe = async (barcodeName, newBarcodeValue) => {
    try {
        const response = await api.put(`/api/resource/Barcode Item/${barcodeName}`, {
            barcode: newBarcodeValue
        })
        console.log("api handleUpdateBarcodeFrappe", response)
        return response.data.message || response.data
    }
    catch (error) {
        console.error("❌ handleUpdateBarcodeFrappe error:", error)
    }
}

// ======================================================================
// End Barcodes APIs
// ======================================================================

// ======================================================================
// Income Statement Report APIs
// File: /api/method/retail.retail.api.reports.{method}
// ======================================================================

/**
 * Get Income Statement Report - Yearly
 * @param {string} company - Company name (optional)
 * @returns {Promise<Object>} Report data with income, expenses, net profit
 */
export const getIncomeStatementYearly = async (company = null) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_income_statement_yearly', {
      params: {
        company: company || 'pos'
      }
    })
    console.log("✅ getIncomeStatementYearly", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getIncomeStatementYearly error:", error)
    throw error
  }
}

/**
 * Get Income Statement Report - Monthly
 * @param {string} company - Company name (optional)
 * @returns {Promise<Object>} Report data with monthly breakdown
 */
export const getIncomeStatementMonthly = async (company = null) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_income_statement_monthly', {
      params: {
        company: company || 'pos'
      }
    })
    console.log("✅ getIncomeStatementMonthly", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getIncomeStatementMonthly error:", error)
    throw error
  }
}

/**
 * Get Income Statement Report - Custom Date Range
 * @param {Object} params - Filter parameters
 * @param {string} params.company - Company name
 * @param {string} params.from_date - Start date (YYYY-MM-DD)
 * @param {string} params.to_date - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Report data for specified date range
 */
export const getIncomeStatementByPeriod = async (params) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_income_statement_by_period', {
      params: {
        company: params.company || 'pos',
        from_date: params.from_date,
        to_date: params.to_date
      }
    })
    console.log("✅ getIncomeStatementByPeriod", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getIncomeStatementByPeriod error:", error)
    throw error
  }
}

/**
 * Get Income Statement Report - Generic Method
 * @param {Object} filters - Filter object
 * @param {string} filters.company - Company name
 * @param {string} filters.filter_based_on - "Fiscal Year" or "Date Range"
 * @param {string} filters.periodicity - "Monthly" or "Yearly"
 * @param {string} filters.from_date - Start date (optional, for Date Range)
 * @param {string} filters.to_date - End date (optional, for Date Range)
 * @returns {Promise<Object>} Complete report data
 */
export const getIncomeStatementReport = async (filters) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_income_statement_report', {
      params: filters
    })
    console.log("✅ getIncomeStatementReport", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getIncomeStatementReport error:", error)
    throw error
  }
}

// ======================================================================
// Expenses Report APIs
// ======================================================================

/**
 * Get Expenses Report
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Expenses breakdown report
 */
export const getExpensesReport = async (filters = {}) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_expenses_report', {
      params: {
        company: filters.company || 'pos',
        from_date: filters.from_date,
        to_date: filters.to_date,
        ...filters
      }
    })
    console.log("✅ getExpensesReport", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getExpensesReport error:", error)
    throw error
  }
}

// ======================================================================
// Cash Flow Report APIs
// ======================================================================

/**
 * Get Cash Flow Statement Report
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Cash flow analysis
 */
    // export const getCashFlowReport = async (filters = {}) => {
    // try {
    //     const response = await api.get('/api/method/retail.retail.api.reports.get_cash_flow_report', {
    //     params: {
    //         filters:JSON.stringify(filters)
    //     }
    //     })
    //     console.log("✅ getCashFlowReport", response)
    //     console.log("✅ getCashFlowReport filters", filters)
    //     return response.data.message
    // } catch (error) {
    //     console.error("❌ getCashFlowReport error:", error)
    //     throw error
    // }
    // }
// ======================================================================
// BeginningCash Balance APIs
// ======================================================================
export const getBeginningCashBalance = async (filters = {}) => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.reports.get_beginning_cash_balance',
      {
        params: {
          ...filters
        }
      }
    )

    console.log('✅ getBeginningCashBalance', response)
    return response.data.message
  } catch (error) {
    console.error('❌ getBeginningCashBalance error:', error)
    throw error
  }
}


// ======================================================================
// Balance Sheet Report APIs
// ======================================================================

/**
 * Get Balance Sheet Report
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Assets, liabilities, and equity
 */
export const getBalanceSheetReport = async (filters = {}) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_balance_sheet_report', {
      params: {
            filters:JSON.stringify(filters)
        }
    })
    console.log("✅ getBalanceSheetReport", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getBalanceSheetReport error:", error)
    throw error
  }
}

// ======================================================================
// Accounts Receivable Report APIs
// ======================================================================

/**
 * Get Accounts Receivable Report
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Customer invoices and collections
 */
export const getAccountsReceivableReport = async (filters = {}) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_accounts_receivable_data', {
     params: {
            filters:JSON.stringify(filters)
        }
    })
    console.log("✅ getAccountsReceivableReport", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getAccountsReceivableReport error:", error)
    throw error
  }
}
export const exportAccountsReceivableReport = async () => {
  try {
    // Use POST request and get blob response for file download
    const response = await api.post(
      '/api/method/retail.retail.api.reports.export_ar_report',
      {},
      {
        responseType: 'blob'
      }
    )

    console.log("✅ exportAccountsReceivableReport", response)

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
    console.error("❌ exportAccountsReceivableReport error:", error)
    throw error
  }
}

// ======================================================================
// Accounts Payable Report APIs
// ======================================================================

/**
 * Get Accounts Payable Report
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Supplier bills and payments
 */
export const getAccountsPayableReport = async (filters = {}) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_accounts_payable_data', {
     params: {
            filters:JSON.stringify(filters)
        }
    })
    console.log("✅ getAccountsPayableReport", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getAccountsPayableReport error:", error)
    throw error
  }
}

/**
 * Export Accounts Payable Report to CSV
 * @returns {Promise<Object>} Export status
 */
export const exportAccountsPayableReport = async () => {
  try {
    // Use POST request and get blob response for file download
    const response = await api.post(
      '/api/method/retail.retail.api.reports.export_ap_report',
      {},
      {
        responseType: 'blob'
      }
    )

    console.log("✅ exportAccountsPayableReport", response)

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
    console.error("❌ exportAccountsPayableReport error:", error)
    throw error
  }
}
// ======================================================================
// Sales Analytics Report APIs
// ======================================================================

/**
 * Get Sales Analytics Report
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Sales metrics and analytics
 */
export const getSalesAnalyticsReport = async (filters = {}) => {
  try {
    const response = await api.get('/api/method/retail.retail.api.reports.get_sales_analytics_report', {
      params: {
        company: filters.company || 'pos',
        from_date: filters.from_date,
        to_date: filters.to_date,
        ...filters
      }
    })
    console.log("✅ getSalesAnalyticsReport", response)
    return response.data.message
  } catch (error) {
    console.error("❌ getSalesAnalyticsReport error:", error)
    throw error
  }
}

// ======================================================================
// End Reports APIs
// ======================================================================

// ======================================================================
// Usage Examples
// ======================================================================
/*

// Example 1: Get yearly income statement
const incomeData = await getIncomeStatementYearly()
console.log(incomeData.summary) // { total_income, total_expenses, net_profit }

// Example 2: Get monthly income statement
const monthlyData = await getIncomeStatementMonthly()

// Example 3: Get custom date range
const customData = await getIncomeStatementByPeriod({
  company: 'pos',
  from_date: '2025-01-01',
  to_date: '2025-01-31'
})

// Example 4: Get expenses report
const expensesData = await getExpensesReport({
  from_date: '2025-01-01',
  to_date: '2025-01-31'
})

// Example 5: Get balance sheet as of specific date
const balanceData = await getBalanceSheetReport({
  date: '2025-01-31'
})

// Example 6: Get accounts receivable
const arData = await getAccountsReceivableReport({
  as_on_date: '2025-01-31'
})

// Example 7: Get sales analytics
const salesData = await getSalesAnalyticsReport({
  from_date: '2025-01-01',
  to_date: '2025-01-31'
})

*/

// ======================================================================
// CashFlow Report APIs
// ======================================================================


/* =========================================
   1. api.js - API Staff - Create Employee
========================================= */

export const createEmployee = async (employeeData) => {
  try {
    const response = await api.post(
      '/api/method/retail.retail.api.staff.create_employee',
      employeeData
    )

    // Return the entire message object (which contains status and message)
    return response.data.message
  } catch (err) {
    console.error('Error Create Employee:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

/* =========================================
   2. api.js - API Staff - Get Employees
========================================= */
export const getEmployeesApi = async (company, department) => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.staff.get_employees',
      {
        params: {
          // Add any required parameters here
          company,
          department,
        }
      }
    )

    // Return the entire message object (which contains status and message)
    return response.data
  } catch (err) {
    console.error('Error Get Employees:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

/* =========================================
   3. api.js - API Staff - Delete Employee
========================================= */


export const deleteEmployeeApi = async (employeeName) => {
  try {
    // const response = await api.post('/api/method/retail.retail.api.staff.delete_employee', {employee_name:employeeName})
    const response = await api.delete(
    `/api/method/retail.retail.api.staff.delete_employee?employee_name=${employeeName}`
  );

    // Return the entire message object (which contains status and message)
    return response.data.message
  } catch (err) {
    console.error('Error Delete Employee:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}
/* =========================================
   4. api.js - API Staff - Get One Employee Details
========================================= */
export const getEmployeeApi = async (employeeName) => {
  try {
    const response = await api.get(
      `/api/method/retail.retail.api.staff.get_one_employee_details?employee_name=${encodeURIComponent(employeeName)}`
    )

    // Log the full response to see what we're getting
    console.log('Raw response:', response)
    console.log('Response data:', response.data)

    // Frappe wraps the actual response in response.data.message
    const data = response.data.message

    if (typeof data === 'string') {
      // If it's a string, try to parse it
      const parsed = JSON.parse(data)
      return parsed
    }

    // Otherwise return as is
    return data
  } catch (err) {
    console.error('Error Get One Employee Details:', err)
    console.error('Error response:', err?.response?.data)
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

/* =========================================
   5. api.js - API Staff - Get Salary History
========================================= */
export const getSalaryHistory = async (employeeName) => {
  try {
    const response = await api.get(
      `/api/method/retail.retail.api.staff.get_salary_history?employee_name=${encodeURIComponent(employeeName)}`
    )
    return response.data.message
  } catch (err) {
    console.error('Error getting salary history:', err)
    return {
      status: 'error',
      message: err?.message || 'Unknown error',
      data: []
    }
  }
}

// api.js
export const getAttendanceStats = async (employeeName, options = {}) => {
  // options يمكن أن يكون:
  // { month: 'YYYY-MM' } - للشهر المحدد
  // { from_date: 'YYYY-MM-DD', to_date: 'YYYY-MM-DD' } - للتاريخين المحددين
  // {} - للشهر الحالي (default)

  try {
    let url = `/api/method/retail.retail.api.staff.get_attendance_stats?employee_name=${encodeURIComponent(employeeName)}`

    // إذا تم تحديد شهر
    if (options.month) {
      url += `&month=${options.month}`
    }

    // إذا تم تحديد تاريخين
    if (options.from_date && options.to_date) {
      url += `&from_date=${options.from_date}&to_date=${options.to_date}`
    }

    const response = await api.get(url)
    console.log('Attendance Stats Response api js:', response)
    return response.data.message
  } catch (err) {
    console.error('Error getting attendance stats:', err)
    return {
      status: 'error',
      message: err?.message || 'Unknown error',
      data: {}
    }
  }
}

export const getPerformance = async (employeeName) => {
  try {
    const response = await api.get(
      `/api/method/retail.retail.api.staff.get_performance?employee_name=${encodeURIComponent(employeeName)}`
    )
    return response.data.message
  } catch (err) {
    console.error('Error getting performance:', err)
    return {
      status: 'error',
      message: err?.message || 'Unknown error',
      data: {}
    }
  }
}
/* =========================================
   1. api.js - API Staff - Create Department
========================================= */
export const createDepartmentApi = async (departmentData) => {
  try {
    const response = await api.post(
      '/api/method/retail.retail.api.staff.create_department',
      departmentData
    )

    // Return the entire message object (which contains status and message)
    return response.data.message
  } catch (err) {
    console.error('Error Create Department:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}
/* =========================================
// 2. api.js - API Staff - Get Departments
========================================= */
export const getDepartmentsApi = async (company) => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.staff.get_departments',
      {
        params: { company }
      }
    )

    // Return the entire message object (which contains status and message)
    return response.data
  } catch (err) {
    console.error('Error Get Departments:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}


/* =========================================
   3. api.js - API Staff - Delete Department
========================================= */
export const deleteDepartmentApi = async (departmentName) => {
  try {
    const response = await api.delete(
      '/api/method/retail.retail.api.staff.delete_department',
      {
        data: { department_name: departmentName }
      }
    )

    // Return the entire message object (which contains status and message)
    return response.data.message
  } catch (err) {
    console.error('Error Delete Department:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

/* =========================================
// 1. api.js - API Staff  - Get Desgnations
========================================= */
export const getDesignationsApi = async () => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.staff.get_designations'
    )

    // Return the entire message object (which contains status and message)
    return response.data
  } catch (err) {
    console.error('Error Get Designations:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

/* =========================================
2- api.js - API Staff  - Create Desgnation
========================================= */
export const createDesignationApi = async (designationData) => {
  try {
    const response = await api.post(
      '/api/method/retail.retail.api.staff.create_designation',
      designationData
    )

    // Return the entire message object (which contains status and message)
    return response.data.message
  } catch (err) {
    console.error('Error Create Designation:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

/* =========================================
3- api.js - API Staff  - Delete Desgnation
========================================= */
export const deleteDesignationApi = async (designationName) => {

  try {
    const response = await api.delete(
      '/api/method/retail.retail.api.staff.delete_designation',
      {
        data: { designation_name: designationName }
      }
    )

    // Return the entire message object (which contains status and message)
    return response.data.message
  } catch (err) {
    console.error('Error Delete Designation:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

/* =========================================
4- api.js - API Staff  - Get Roles
========================================= */

export const getRolesApi = async () => {
  try {
        const response = await api.get(
      '/api/method/retail.retail.api.staff.get_roles'
    )

        // Return the entire message object (which contains status and message)
        return response.data
    } catch (err) {
        console.error('Error Get Roles:', err)
        // Return error in consistent format
        return {
            status: 'error',
            message: err?.response?.data?.message || err.message || 'Unknown error occurred'
        }
    }
}

// ==========================================================
// Delete Role API
// ==========================================================
export const deleteRoleApi = async (roleName) => {
    try {
        const response = await api.delete(
      '/api/method/retail.retail.api.staff.delete_role',
      {
        data: { role_name: roleName }
      }
    )

        // Return the entire message object (which contains status and message)
        return response.data.message
    } catch (err) {
        console.error('Error Delete Role:', err)
        // Return error in consistent format
        return {
            status: 'error',
            message: err?.response?.data?.message || err.message || 'Unknown error occurred'
        }
    }
}

// ==========================================================
// Create Role API
// ==========================================================
export const createRoleApi = async (roleData) => {
    try {
        const response = await api.post(
      '/api/method/retail.retail.api.staff.create_role',
      roleData
    )

        // Return the entire message object (which contains status and message)
        return response.data.message
    } catch (err) {
        console.error('Error Create Role:', err)
        // Return error in consistent format
        return {
            status: 'error',
            message: err?.response?.data?.message || err.message || 'Unknown error occurred'
        }
    }
}
// ===========================================================================
// End Staff APIs attendance, departments, designations, roles
// ===========================================================================

export const createAttendanceRecord = async (attendanceData) => {
    try {
        const response = await api.post(
      '/api/method/retail.retail.api.attendance.create_attendance',
          {
            ...attendanceData
          }
    )

        // Return the entire message object (which contains status and message)
        return response.data.message
    } catch (err) {
        console.error('Error Create Attendance Record:', err)
        // Return error in consistent format
        return {
            status: 'error',
            message: err?.response?.data?.message || err.message || 'Unknown error occurred'
        }
    }
}
// ===========================================================================
// Edit APIs attendance, departments, designations, roles
// ===========================================================================

export const EditAttendanceRecord = async (attendanceData) => {
    try {
        const response = await api.post(
      '/api/method/retail.retail.api.attendance.edit_attendance',
          {
            attendance_data: attendanceData
          }
    )

        // Return the entire message object (which contains status and message)
        return response.data.message
    } catch (err) {
        console.error('Error Create Attendance Record:', err)
        // Return error in consistent format
        return {
            status: 'error',
            message: err?.response?.data?.message || err.message || 'Unknown error occurred'
        }
    }
}



// ==========================================================================
// Delete Single Attendance Record
// ==========================================================================
export const deleteAttendanceApi = async (attendanceId) => {
  try {
    console.log('Deleting attendance record:', attendanceId)

    const res = await api.post(
      '/api/method/retail.retail.api.attendance.cancel_and_delete_attendance',
       { name: attendanceId }
    )

    console.log('Delete Response:', res)

    return {
      status: res.status === 200 ? 'success' : 'error',
      data: res.data,
      message: 'Attendance record deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting attendance record:', error)
    throw error
  }
}
// ==========================================================================
// Delete Multiple Attendance Records (Cancel + Delete)
// ==========================================================================
export const deleteMultipleAttendanceApi = async (attendanceIds) => {
  try {
    console.log('Deleting multiple attendance records:', attendanceIds)

    const response = await api.post(
      '/api/method/retail.retail.api.attendance.bulk_cancel_and_delete_attendance',
      {
        attendance_ids: attendanceIds
      }
    )

    // frappe يرجّع البيانات داخل message
    return response.data.message

  } catch (error) {
    console.error('Error deleting multiple attendance records:', error)

    return {
      status: 'error',
      deleted: [],
      failed: [],
      message:
        error?.response?.data?.message ||
        error.message ||
        'Failed to delete attendance records'
    }
  }
}

// ==========================================================================
// Delete Attendance by Date Range (Admin function)
// ==========================================================================
export const deleteAttendanceByDateRangeApi = async (startDate, endDate) => {
  try {
    console.log(`Deleting attendance records between ${startDate} and ${endDate}`)

    const res = await api.delete('/api/resource/Attendance', {
      params: {
        filters: JSON.stringify([
          ['Attendance', 'attendance_date', '>=', startDate],
          ['and'],
          ['Attendance', 'attendance_date', '<=', endDate]
        ])
      }
    })

    return {
      status: res.status === 200 ? 'success' : 'error',
      data: res.data,
      message: 'Attendance records deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting attendance by date range:', error)
    throw error
  }
}

// ==========================================================================
// Delete Attendance by Employee
// ==========================================================================
export const deleteAttendanceByEmployeeApi = async (employeeId, startDate = null, endDate = null) => {
  try {
    console.log(`Deleting attendance records for employee: ${employeeId}`)

    let filters = [['Attendance', 'employee', '=', employeeId]]

    if (startDate && endDate) {
      filters.push(['and'])
      filters.push(['Attendance', 'attendance_date', '>=', startDate])
      filters.push(['and'])
      filters.push(['Attendance', 'attendance_date', '<=', endDate])
    }

    const res = await api.delete('/api/resource/Attendance', {
      params: {
        filters: JSON.stringify(filters)
      }
    })

    return {
      status: res.status === 200 ? 'success' : 'error',
      data: res.data,
      message: 'Employee attendance records deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting employee attendance:', error)
    throw error
  }
}

// ==========================================================================
// Get Api  employees Attendance APIs
// ==========================================================================

export const getAttendenceApi = async (filters = {}) => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.attendance.get_employee_attendance_history',
      {
        params: {
          filters: JSON.stringify(filters)
        }
      }
    )

    // Return the entire message object (which contains status and message)

    return response.data
  } catch (err) {
    console.error('Error Get Attendance Records:', err)
    // Return error in consistent format
    return {
      status: 'error',
      message: err?.response?.data?.message || err.message || 'Unknown error occurred'
    }
  }
}

// ==========================================================================
// Get Checkins
// ==========================================================================
export const getEmployeeCheckinsApi = async (employee_name, attendance_date) => {
  try {
    const res = await api.get('/api/method/retail.retail.api.attendance.get_checkins_for_attendance', {
      params: {
        employee: employee_name,
        attendance_date: attendance_date
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching checkins:', error);
    throw error;
  }
};

// ==========================================================================
// Create Employee Checkin
// ==========================================================================
export const getCheckinsApi = async (filters) => {
  try {
    const response = await api.get(
      '/api/method/retail.retail.api.attendance.get_checkins',
      {
        params: {
          filters: JSON.stringify(filters)
        }
      }
    )
    return response.data;
  } catch (error) {
    console.error('Error fetch checkins:', error);
    throw error;
  }
};


// ==========================================================================
// Create Employee Checkin
// ==========================================================================
export const createCheckinApi = async (data) => {
  try {
    const res = await api.post('/api/resource/Employee Checkin', {
      employee: data.employee,
      log_type: data.logType,
      time: data.time,
      skip_auto_attendance: data.skip_auto_attendance
    });
    return res.data;
  } catch (error) {
    console.error('Error creating checkin:', error);
    throw error;
  }
};

// ==========================================================================
// Update Checkin
// ==========================================================================
export const updateCheckinApi = async (checkinName, data) => {
  try {
    const res = await api.put(`/api/resource/Employee Checkin/${checkinName}`, {
      employee: data.employee,
      log_type: data.logType,
      time: data.time,
      skip_auto_attendance: data.skip_auto_attendance
    });
    return res.data.data;
  } catch (error) {
    console.error('Error updating checkin:', error);
    throw error;
  }
};

// ==========================================================================
// Delete Checkin
// ==========================================================================
export const deleteCheckinApi = async (checkinName) => {
  try {
    const res = await api.delete(`/api/resource/Employee Checkin/${checkinName}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting checkin:', error);
    throw error;
  }
};

// ==========================================================================
// Mark Attendance from Checkins
// ==========================================================================
export const markAttendanceFromCheckinsApi = async (employee, attendance_date, status, checkinLogs) => {
  try {
    const res = await api.post('/api/method/your_app.api.attendance.mark_attendance_and_link_log', {
      logs: checkinLogs,
      attendance_status: status,
      attendance_date: attendance_date,
      employee: employee
    });
    return res.data.message;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

// ==========================================================================
// Get Employee Attendance Summary
// ==========================================================================
export const getAttendanceSummaryApi = async (employee, month, year) => {
  try {
    const res = await api.get('/api/method/your_app.api.attendance.get_monthly_attendance_summary', {
      params: {
        employee: employee,
        month: month,
        year: year
      }
    });
    return res.data.message || res.data;
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    throw error;
  }
};

// ==========================================================================
// Get Employee Attendance History
// ==========================================================================
export const getAttendanceHistoryApi = async (employee, from_date, to_date, limit = 30) => {
  try {
    const res = await api.get('/api/method/your_app.api.attendance.get_employee_attendance_history', {
      params: {
        employee: employee,
        from_date: from_date,
        to_date: to_date,
        limit: limit
      }
    });
    return res.data.message || res.data;
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    throw error;
  }
};

// ==========================================================================
// Get All Checkins (للصفحة الرئيسية)
// ==========================================================================
export const getAllCheckinsApi = async (filters = {}) => {
  try {
    const res = await api.get('/api/resource/Employee Checkin', {
      params: {
        fields: '["name", "employee", "employee_name", "log_type", "time", "attendance", "skip_auto_attendance"]',
        filters: JSON.stringify(filters),
        limit_page_length: 500
      }
    });
    return res.data.data;
  } catch (error) {
    console.error('Error fetching all checkins:', error);
    throw error;
  }
};

// ==========================================================================
// Bulk Mark Attendance
// ==========================================================================
export const bulkMarkAttendanceApi = async (data) => {
  try {
    const res = await api.post('/api/method/your_app.api.attendance.bulk_mark_attendance', data);
    return res.data.message;
  } catch (error) {
    console.error('Error bulk marking attendance:', error);
    throw error;
  }
};

// ==========================================================================
// Check if Attendance Exists
// ==========================================================================
export const checkAttendanceExistsApi = async (employee, attendance_date) => {
  try {
    const res = await api.get('/api/method/your_app.api.attendance.check_attendance_exists', {
      params: {
        employee: employee,
        attendance_date: attendance_date
      }
    });
    return res.data.message || res.data;
  } catch (error) {
    console.error('Error checking attendance:', error);
    throw error;
  }
};

// ==========================================================================
// Search Employee @
// ==========================================================================
export const searchEmployeesApi = async (query) => {
  try {
    const res = await api.get('/api/method/retail.retail.api.staff.search_employees', {
      params: {
        query: JSON.stringify(query),
      }
    });
    return res.data.message || res.data;
  } catch (error) {
    console.error('Error Search Employee:', error);
    throw error;
  }
};
// ==========================================================================
// Api Fetch Shifts
// ==========================================================================
export const fetchShiftsApi = async (company) => {
  try {
    const res = await api.get('/api/method/retail.retail.api.shifts.get_shifts', {
      params: {
        company: JSON.stringify(company),
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error Search Employee:', error);
    throw error;
  }
};


// ==========================================================================
// API Holiday
// ==========================================================================
export const loadHolidayListsApi = async () => {
  try {
    const response = await api.get('/api/resource/Holiday List',{

      params: {
        fields: '["*"]',
        limit_page_length: 500
      }
    })
    console.log("load Holiday Lists => 1",response)
   return response
  } catch (err) {
    console.error('Error loading holiday lists:', err)
  }
}
// ==========================================================================
// Create a new shift
// ==========================================================================
export const createShiftApi = async (data) => {
  try {
    const payload = {
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      enable_auto_attendance: data.enable_auto_attendance || false,
      process_attendance_after: data.process_attendance_after || null,
      holiday_list: data.holiday_list || null,
      disabled: data.disabled || false
    }

    const res = await api.post('/api/resource/Shift Type', payload)

    return {
      status: res.status,
      data: res.data,
      message: 'تم إنشاء الوردية بنجاح'
    }
  } catch (error) {
    console.error('Error creating shift:', error)
    throw error
  }
}

// ==========================================================================
// Update an existing shift
// ==========================================================================
export const updateShiftApi = async (data) => {
  try {
    const payload = {
      start_time: data.start_time,
      end_time: data.end_time,
      enable_auto_attendance: data.enable_auto_attendance || false,
      process_attendance_after: data.process_attendance_after || null,
      holiday_list: data.holiday_list || null,
      last_sync_of_checkin: data.last_sync_of_checkin || null
    }

    const res = await api.put(
      `/api/resource/Shift Type/${encodeURIComponent(data.name)}`,
      payload
    )

    return {
      status: res.status,
      data: res.data,
      message: 'تم تحديث الوردية بنجاح'
    }
  } catch (error) {
    console.error('Error updating shift:', error)
    throw error
  }
}

// ==========================================================================
// Delete a shift
// ==========================================================================
export const deleteShiftApi = async (shiftName) => {
  try {
    const res = await api.delete(
      `/api/resource/Shift Type/${encodeURIComponent(shiftName)}`
    )

    console.log('Response Api', res)

    return {
      status: 'success',
      data: res.data,
      message: 'تم حذف الوردية بنجاح'
    }

  } catch (error) {
    console.log('Error deleting shift:', error)

    // استخراج رسالة Frappe الحقيقية
    const frappeMessage =
      error?.response?.data?.exception ||
      error?.response?.data?.message ||
      error?.response?.data?._server_messages

    let message = 'فشل حذف الوردية'

    // لو فيه server messages
    if (Array.isArray(frappeMessage)) {
      try {
        message = JSON.parse(frappeMessage[0]).message
      } catch {
        message = frappeMessage[0]
      }
    } else if (typeof frappeMessage === 'string') {
      message = frappeMessage
    }

    return {
      status: 'error',
      data: null,
      message
    }
  }
}

// ==========================================================================
// Process auto attendance for a shift
// ==========================================================================
export const processAutoAttendanceApi = async (shiftName) => {
  try {
    const res = await api.post(
      `/api/method/retail.retail.api.shifts.process_auto_attendance_api`,
      {
        shift_name: shiftName
      }
    )

    return {
      status: res.status,
      data: res.data,
      message: 'تم معالجة الحضور بنجاح'
    }
  } catch (error) {
    console.error('Error processing auto attendance:', error)
    throw error
  }
}

// ==========================================================================
// Get all shift assignments with employee details
// ==========================================================================
export const fetchShiftAssignmentsApi = async (company = null) => {
  try {
    let filters = []

    if (company) {
      filters.push(['company', '=', company])
    }

    const res = await api.get('/api/resource/Shift Assignment', {
      params: {
        fields: JSON.stringify([
          'name',
          'employee',
          'employee_name',
          'shift_type',
          'status',
          'company',
          'department',
          'start_date',
          'end_date'
        ]),
        filters: JSON.stringify(filters),
        limit_page_length: 500
      }
    })

    // Transform response to match UI expectations
    const transformedData = res.data.data.map(assignment => ({
      id: assignment.name,
      employeeId: assignment.employee,
      employeeName: assignment.employee_name,
      shiftType: assignment.shift_type,
      status: assignment.status || 'مجدولة',
      company: assignment.company,
      department: assignment.department,
      startDate: assignment.start_date,
      endDate: assignment.end_date,
      date: assignment.start_date, // For compatibility
      // Default times based on shift type
      startTime: getShiftStartTime(assignment.shift_type),
      endTime: getShiftEndTime(assignment.shift_type),
      hours: calculateShiftHours(assignment.shift_type)
    }))

    return {
      status: 200,
      data: transformedData,
      message: 'تم تحميل الورديات بنجاح'
    }
  } catch (error) {
    console.error('Error fetching shift assignments:', error)
    throw error
  }
}

// ==========================================================================
// Create new shift assignment
// ==========================================================================
export const createShiftAssignmentApi = async (data) => {
  try {
    const payload = {
      doctype: 'Shift Assignment',
      employee: data.employee,
      shift_type: data.shiftType,
      start_date: data.startDate,
      end_date: data.endDate || null,
      company: data.company,
      status: data.status || 'Active'
    }
    console.log("payload",payload)
    const res = await api.post('/api/resource/Shift Assignment', payload)
    console.log("res aoi",res)
    return {
      status: res.status,
      data: res.data,
      message: 'تم إنشاء تعيين الوردية بنجاح'
    }
  } catch (error) {
    console.error('Error creating shift assignment:', error)
    throw error
  }
}

// ==========================================================================
// Update shift assignment
// ==========================================================================
export const updateShiftAssignmentApi = async (data) => {
  try {
    const payload = {
      shift_type: data.shiftType,
      end_date: data.endDate || null,
      status: data.status || 'Active'
    }

    const res = await api.put(
      `/api/resource/Shift Assignment/${encodeURIComponent(data.id)}`,
      payload
    )

    return {
      status: res.status,
      data: res.data,
      message: 'تم تحديث تعيين الوردية بنجاح'
    }
  } catch (error) {
    console.error('Error updating shift assignment:', error)
    throw error
  }
}

// ==========================================================================
// Delete shift assignment
// ==========================================================================
export const deleteShiftAssignmentApi = async (assignmentId) => {
  try {

    const res = await api.post(
    '/api/method/retail.retail.api.shifts.cancel_and_delete_shift_assignment',
    { name: assignmentId }
  )

  return {
    status: res.data.message.status,
    message: res.data.message.message
  }

  } catch (error) {
    console.error('Error deleting shift assignment:', error)
    throw error
  }
}

// ==========================================================================
// Get shift details (start/end times)
// ==========================================================================
export const getShiftDetailsApi = async (shiftTypeName) => {
  try {
    const res = await api.get(
      `/api/resource/Shift Type/${encodeURIComponent(shiftTypeName)}`
    )

    return {
      status: res.status,
      data: res.data.data,
      message: 'تم تحميل بيانات الوردية بنجاح'
    }
  } catch (error) {
    console.error('Error fetching shift details:', error)
    throw error
  }
}

// ==========================================================================
// Helper functions for shift times
// ==========================================================================
function getShiftStartTime(shiftType) {
  const shiftTimes = {
    'صباحي': '06:00',
    'مسائي': '14:00',
    'ليلي': '22:00',
    'Morning': '06:00',
    'Evening': '14:00',
    'Night': '22:00'
  }
  return shiftTimes[shiftType] || '08:00'
}

function getShiftEndTime(shiftType) {
  const shiftTimes = {
    'صباحي': '14:00',
    'مسائي': '22:00',
    'ليلي': '06:00',
    'Morning': '14:00',
    'Evening': '22:00',
    'Night': '06:00'
  }
  return shiftTimes[shiftType] || '16:00'
}

function calculateShiftHours(shiftType) {
  const startTime = getShiftStartTime(shiftType)
  const endTime = getShiftEndTime(shiftType)

  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)

  let diff = (end - start) / (1000 * 60 * 60)
  if (diff < 0) diff += 24

  return parseFloat(diff.toFixed(2))
}



/* ==========================================================================
   Create - Add Leave Request with Mandatory Fields
========================================================================== */
export const createLeaveRequest = async (leaveData) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.leaves.create_leave_request',
      {
        employee: leaveData.employeeId,
        employee_name: leaveData.employeeName,
        leave_type: leaveData.leaveType,
        company: leaveData.company,
        from_date: leaveData.fromDate,
        to_date: leaveData.toDate,
        number_of_days: leaveData.numberOfDays,
        reason: leaveData.reason || '',
        leave_approver: leaveData.leaveApproverId,
        leave_approver_name: leaveData.leaveApprover,
        status: leaveData.status || 'Pending'
      }
    )

    return {
      status: 'success',
      data: res.data.message.data || res.data.message,
      message: res.data.message.message || 'Leave request created successfully'
    }
  } catch (error) {
    console.error('Error creating leave request:', error)
    throw error
  }
}

/* ==========================================================================
   Update - Edit Leave Request with Mandatory Fields
========================================================================== */
export const updateLeaveRequest = async (leaveData) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.leaves.update_leave_request',
      {
        name: leaveData.id,
        employee: leaveData.employeeId,
        employee_name: leaveData.employeeName,
        leave_type: leaveData.leaveType,
        company: leaveData.company,
        from_date: leaveData.fromDate,
        to_date: leaveData.toDate,
        number_of_days: leaveData.numberOfDays,
        reason: leaveData.reason || '',
        leave_approver: leaveData.leaveApproverId,
        leave_approver_name: leaveData.leaveApprover,
        status: leaveData.status
      }
    )

    return {
      status: 'success',
      data: res.data.message.data || res.data.message,
      message: res.data.message.message || 'Leave request updated successfully'
    }
  } catch (error) {
    console.error('Error updating leave request:', error)
    throw error
  }
}

/* ==========================================================================
   Read - Get All Leave Requests
========================================================================== */
export const getLeaveRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams()

    if (filters.employee) params.append('employee', filters.employee)
    if (filters.status) params.append('status', filters.status)
    if (filters.leave_type) params.append('leave_type', filters.leave_type)
    if (filters.company) params.append('company', filters.company)
    if (filters.from_date) params.append('from_date', filters.from_date)
    if (filters.to_date) params.append('to_date', filters.to_date)
    if (filters.leave_approver) params.append('leave_approver', filters.leave_approver)

    const queryString = params.toString()
    const url = queryString
      ? `/api/method/retail.retail.api.leaves.get_leave_requests?${queryString}`
      : '/api/method/retail.retail.api.leaves.get_leave_requests'

    const res = await api.get(url)

    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || [],
      message: 'Leave requests fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    throw error
  }
}

/* ==========================================================================
   Delete - Single Leave Request
========================================================================== */
export const deleteLeaveRequest = async (leaveId) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.leaves.delete_leave_request',
      { name: leaveId }
    )

    return {
      status: res.data.message.status || 'success',
      message: res.data.message.message || 'Leave request deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting leave request:', error)
    throw error
  }
}

/* ==========================================================================
   Approve - Leave Request
========================================================================== */
export const approveLeaveRequest = async (leaveId) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.leaves.approve_leave_request',
      { name: leaveId }
    )

    return {
      status: res.data.message.status || 'success',
      message: res.data.message.message || 'Leave request approved successfully'
    }
  } catch (error) {
    console.error('Error approving leave request:', error)
    throw error
  }
}

/* ==========================================================================
   Reject - Leave Request
========================================================================== */
export const rejectLeaveRequest = async (leaveId) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.leaves.reject_leave_request',
      { name: leaveId }
    )

    return {
      status: res.data.message.status || 'success',
      message: res.data.message.message || 'Leave request rejected successfully'
    }
  } catch (error) {
    console.error('Error rejecting leave request:', error)
    throw error
  }
}

/* ==========================================================================
   Cancel - Leave Request
========================================================================== */
export const cancelLeaveRequest = async (leaveId) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.leaves.cancel_leave_request',
      { name: leaveId }
    )

    return {
      status: res.data.message.status || 'success',
      message: res.data.message.message || 'Leave request cancelled successfully'
    }
  } catch (error) {
    console.error('Error cancelling leave request:', error)
    throw error
  }
}

/* ==========================================================================
   Get - Leave Balance by Employee
========================================================================== */
export const getLeaveBalance = async (employeeId) => {
  try {
    const res = await api.get(
      `/api/method/retail.retail.api.leaves.get_leave_balance?employee=${employeeId}`
    )

    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || {},
      message: 'Leave balance fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching leave balance:', error)
    throw error
  }
}

/* ==========================================================================
   Get - Leave Statistics
========================================================================== */
export const getLeaveStatistics = async (filters = {}) => {
  try {
    const params = new URLSearchParams()

    if (filters.employee) params.append('employee', filters.employee)
    if (filters.company) params.append('company', filters.company)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)

    const queryString = params.toString()
    const url = queryString
      ? `/api/method/retail.retail.api.leaves.get_leave_statistics?${queryString}`
      : '/api/method/retail.retail.api.leaves.get_leave_statistics'

    const res = await api.get(url)

    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || {},
      message: 'Leave statistics fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching leave statistics:', error)
    throw error
  }
}
/* ==========================================================================
   Web site api - Get - Item Group  Statistics
========================================================================== */
export const getItemGroup = async () => {
  try {
    const res = await api.get(
      '/api/method/retail.retail.api.posapp.get_items_groups'
    )

    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || {},
      message: 'Groups fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching Groups:', error)
    throw error
  }
}


/* ==========================================================================
   Customer API - Check if phone exists
========================================================================== */


export const checkCustomerExists = async (phone) => {
  try {
    const res = await api.get(
      '/api/method/retail.retail.api.customer.check_customer_exists',
      {
        params: { phone }
      }
    )

    return {
      status: 'success',
      data: res.data.message || {},
      message: 'Customer check success'
    }
  } catch (error) {
    console.error('Error checking customer:', error)
    throw error
  }
}


/* ==========================================================================
   Customer API - Register customer
========================================================================== */
export const registerCustomer = async ({ phone, full_name, password }) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.customer.register_customer',
      {
        phone,
        full_name,
        password
      }
    )
    console.log('res Register Api',res)
    return res.data.message
  } catch (error) {
    console.error('Error registering customer:', error)
    throw error
  }
}



// 1. Update customer profile (الباك إند موجود بالفعل)
export const updateCustomerProfileApi = async ({ full_name, email }) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.customer.update_customer_profile',
      { full_name, email }
    )
    return res.data.message
  } catch (err) {
    console.error('updateCustomerProfileApi:', err)
    throw err
  }
}

// 2. Change password (Frappe built-in)
export const changePasswordApi = async ({ old_password, new_password }) => {
  try {
    const res = await api.post(
      '/api/method/frappe.client.set_value',
      {
        doctype: 'User',
        name: frappe?.session?.user,  // أو ارسلها من الفرونت إند
        fieldname: 'new_password',
        value: new_password
      }
    )
    return res.data.message
  } catch (err) {
    console.error('changePasswordApi:', err)
    throw err
  }
}

// 3.
export const changeUserPasswordApi = async ({ old_password, new_password, user }) => {
  try {
    const res = await api.post(
      '/api/method/frappe.client.set_value',
      {
        doctype: 'User',
        name: user,
        fieldname: 'new_password',
        value: new_password
      }
    )
    return res.data.message
  } catch (err) {
    console.error('changePasswordApi:', err)
    throw err
  }
}



/* ==========================================================================
   Products API - Get Products for Customer Website
========================================================================== */

export const getItemsFromWebsite = async (priceList, customer) => {
  try {
    const res = await api.get('/api/method/retail.retail.api.posapp.get_website_items', {
      params: {
        price_list: priceList,
        customer: customer
      }
    })
    console.log("resssssssssssssssssssss",res)
    return res.data.message || []
  } catch (err) {
    console.error("getItemsFromWebsite:", err)
    throw err
  }
}


export const getItems = async()=>{
 try {
       const filters = [
        ]

        const fields = [
          "*"
        ]
    const res = await api.get('/api/resource/Item', {
      params: {
        filters: JSON.stringify(filters),
        fields: JSON.stringify(fields)
      }
    })

    console.log("Get items API",res)
    return res.data.data || []
  } catch (err) {
    console.error("Get items:", err)
    throw err
  }

}
// ====================================================================
// Api Create Sales Order
// ====================================================================
export const createSalesOrder = async (customer, transactionData) => {
  try {
    const response = await api.post('/api/method/retail.retail.api.posapp.create_order', {
      customer: customer,
      items_json: JSON.stringify(transactionData.items),
      total: transactionData.summary.total,
      shipping_address: transactionData.mode.shipping_address,
      delivery_date: transactionData.mode.delivery_date,
      delivery_slot: transactionData.mode.delivery_slot,
      notes: transactionData.mode.notes || null
    });

    return response.data.message;
  } catch (error) {
    console.error('Error creating sales order:', error);
    throw error;
  }
};
// ====================================================================
// Api GET Sales Orders for Customer
// ====================================================================

export const getCustomerOrders = async (customer) => {
  try {
    const res = await api.get('/api/method/retail.retail.api.posapp.get_customer_orders', {
      params: { customer }
    });

    // نرجع orders لو status success
    if (res.data.message?.status === 'success') {
      return res.data.message.orders || [];
    } else {
      console.error('getCustomerOrders failed:', res.data.message);
      return [];
    }
  } catch (err) {
    console.error('getCustomerOrders error:', err);
    throw err;
  }
};


export const cancelOrderApi = async (orderName) => {
  try {
    const response = await api.post('/api/method/retail.retail.api.posapp.cancel_order',

        {order_name: orderName}
    )

   return response.data?.message

  } catch (error) {
    console.error('API cancelOrder error:', error)
    throw error
  }
}



export const updateOrderAddressApi = async (orderName, addressName) => {
  try {
    const { data } = await api.post(
      '/api/method/retail.retail.api.posapp.update_order_address',
      {
        order_name: orderName,
        shipping_address: addressName
      }
    )

    return data.message   // 🔥 نرجع message مباشرة
  } catch (error) {
    console.error('API updateOrderAddress error:', error)
    throw error
  }
}


  export const getOrderDetailsApi = async (orderId) => {
   const res = await api.get(
        '/api/method/retail.retail.api.posapp.get_order_details',
        {
          params: { order_id: orderId } // لازم نفس اسم البراميتر في بايثون
        }
      )
    return res.data?.message
  }



export const getCustomerProfileApi = async()=>{
    try{
        const res = await api.get('/api/method/retail.retail.api.customer.get_customer_info')
        return res.data.message || {}

    }catch(error){
        console.error('Error CustomerProfile Api:', error)
          throw error
    }
}




const BASE = 'retail.retail.api'
// ─── Profile ─────────────────────────────────────────────────────────────────
export const getPartyProfileApi = async (doctype, name) => {
  const res = await api.get(
    '/api/method' + BASE + '.posapp.get_party_profile',
    {
      params: {
        doctype: doctype, // نفس اسم البراميتر في بايثون
        name: name
      }
    }
  )

  return res.data?.message
}



/* ==========================================================================
   Address API - Create Address
========================================================================== */

// ─── Addresses ───────────────────────────────────────────────────────────────
// - getCustomerAddressesApi
// - create
// - delete

export const getCustomerAddressesApi = async (customer) => {
  const res = await api.get('/api/method/' + BASE + '.address.get_customer_addresses', {
    params: { customer }
  })
  return res.data?.message ?? []
}
export const createAddressApi = async ({
  customer, title, line1, line2, city, state, country, pincode,
  is_primary_address, is_shipping_address
}) => {
  const res = await api.post('/api/method/' + BASE + '.address.create_address', {
    customer, title, line1, line2: line2 || '',
    city, state: state || '', country: country || '',
    pincode: pincode || '',
    is_primary_address : is_primary_address  ? 1 : 0,
    is_shipping_address: is_shipping_address ? 1 : 0,
  })
  return res.data?.message
}




export const updateAddressApi = async (address_name, fields) => {
  const res = await api.post('/api/method/' + BASE + '.address.update_address', {
    address_name,
    ...fields,
  })
  return res.data?.message
}

export const deleteAddressApi = async (address_name) => {
  const res = await api.post('/api/method/' + BASE + '.address.delete_address', {
    address_name
  })
  return res.data?.message
}




// ─── Contacts ─────────────────────────────────────────────────────────────────

export const createContactApi = async ({
  customer, first_name, last_name, designation,
  is_primary, email_ids, phone_nos, address_name
}) => {
  const res = await api.post('/api/method/' + BASE + '.contact.create_contact', {
    customer, first_name,
    last_name   : last_name    || '',
    designation : designation  || '',
    is_primary  : is_primary   ? 1 : 0,
    email_ids   : JSON.stringify(email_ids  || []),
    phone_nos   : JSON.stringify(phone_nos  || []),
    address_name: address_name || '',
  })
  return res.data?.message
}

export const updateContactApi = async (contact_name, {
  first_name, last_name, designation,
  is_primary, email_ids, phone_nos, address_name
}) => {
  const res = await api.post('/api/method/' + BASE + '.contact.update_contact', {
    contact_name, first_name,
    last_name   : last_name    ?? '',
    designation : designation  ?? '',
    is_primary  : is_primary   ? 1 : 0,
    email_ids   : JSON.stringify(email_ids || []),
    phone_nos   : JSON.stringify(phone_nos || []),
    address_name: address_name ?? '',
  })
  return res.data?.message
}

export const deleteContactApi = async (contact_name) => {
  const res = await api.post('/api/method/' + BASE + '.contact.delete_contact', {
    contact_name
  })
  return res.data?.message
}

export const linkAddressToContactApi = async (contact_name, address_name) => {
  const res = await api.post('/api/method/' + BASE + '.contact.link_address_to_contact', {
    contact_name,
    address_name: address_name || '',
  })
  return res.data?.message
}



// ============================================================
// ② FRONTEND api.js — أضف الفنكشن دي
// ============================================================


export const generateBarcodeValue = async (barcodeType) => {
    try {
        const response = await api.post(
            '/api/method/retail.retail.api.inventory.generate_barcode_value',
            { barcode_type: barcodeType }
        )
        return {
            status: 'success',
            value:  response.data.message?.value || ''
        }
    } catch (error) {
        console.error('generateBarcodeValue error:', error)
        return { status: 'error', value: '' }
    }
}

  export const getInventoryBalance = async () => {
    try {
      const res = await api.get(
        '/api/method/retail.retail.api.inventory.get_inventory_balance'
      )
      return {
        status:  'success',
        data:    res.data.message?.data || [],
        message: res.data.message?.message || 'Fetched successfully',
      }
    } catch (error) {
      console.error('Error fetching inventory balance:', error)
      return { status: 'error', data: [], message: String(error) }
    }
  }



// ------------------------------------------------------------------------
// services/api/loyalty.js
// ------------------------------------------------------------------------
const BASE_LOYALTY = "/api/method/retail.retail.api.loyalty"

/**
 * Get loyalty summary for current customer
 * Returns: total_points, points_value, current_tier, next_tier, tier_progress, tiers[]
 */
export const getLoyaltySummary = async () => {
  try {
    const res = await api.get(`${BASE_LOYALTY}.get_loyalty_summary`)
    return {
      status: "success",
      data: res.data.message || {},
    }
  } catch (error) {
    console.error("Error fetching loyalty summary:", error)
    return { status: "error", data: {}, message: String(error) }
  }
}

/**
 * Get points transaction history
 * @param {number} limit - number of records (default 20)
 * @param {number} offset - pagination offset
 */
export const getPointsHistory = async (limit = 20, offset = 0) => {
  try {
    const res = await api.get(`${BASE_LOYALTY}.get_points_history`, {
      params: { limit, offset },
    })
    return {
      status: "success",
      data: res.data.message?.history || [],
      total: res.data.message?.total || 0,
    }
  } catch (error) {
    console.error("Error fetching points history:", error)
    return { status: "error", data: [], total: 0, message: String(error) }
  }
}

/**
 * Get available rewards from loyalty program
 */
export const getAvailableRewards = async () => {
  try {
    const res = await api.get(`${BASE_LOYALTY}.get_available_rewards`)
    return {
      status: "success",
      data: res.data.message || [],
    }
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return { status: "error", data: [], message: String(error) }
  }
}

/**
 * Redeem a reward
 * @param {string} rewardId - the reward row name from Loyalty Reward child table
 */
export const redeemReward = async (rewardId) => {
  try {
    const res = await api.post(`${BASE_LOYALTY}.redeem_reward`, {
      reward_id: rewardId,
    })
    return {
      status: "success",
      data: res.data.message || {},
    }
  } catch (error) {
    const msg =
      error?.response?.data?._server_messages
        ? JSON.parse(error.response.data._server_messages)[0]
        : String(error)
    console.error("Error redeeming reward:", error)
    return { status: "error", data: {}, message: msg }
  }
}

/**
 * Get referral code for current customer
 */
export const getReferralCode = async () => {
  try {
    const res = await api.get(`${BASE_LOYALTY}.get_referral_code`)
    return {
      status: "success",
      data: res.data.message || {},
    }
  } catch (error) {
    console.error("Error fetching referral code:", error)
    return { status: "error", data: {}, message: String(error) }
  }
}



// services/api.js - Purchase Receipt APIs

const BASE_PURCHASE_RECEIPTS = '/api/method/retail.retail.api.purchase_receipt'

// ✅ Get all receipts
export const getPurchaseReceipts = async () => {
  try {
    const res = await api.get(`${BASE_PURCHASE_RECEIPTS}.get_purchase_receipts`)
    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || [],
      message: 'Receipts fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching purchase receipts:', error)
    throw error
  }
}

// ✅ Get single receipt
export const getPurchaseReceipt = async (name) => {
  try {
    const res = await api.get(`${BASE_PURCHASE_RECEIPTS}.get_purchase_receipt`, {
      params: { name }
    })
    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || {},
      message: 'Receipt fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching purchase receipt:', error)
    throw error
  }
}

// ✅ Create receipt
export const createPurchaseReceipt = async (receiptData) => {
  try {
    const res = await api.post(`${BASE_PURCHASE_RECEIPTS}.create_purchase_receipt`, {
      data: JSON.stringify(receiptData)
    })
    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || {},
      message: 'Receipt created successfully'
    }
  } catch (error) {
    console.error('Error creating purchase receipt:', error)
    throw error
  }
}

// ✅ Update receipt
export const updatePurchaseReceipt = async (name, receiptData) => {
  try {
    const res = await api.post(`${BASE_PURCHASE_RECEIPTS}.update_purchase_receipt`, {
      name,
      data: JSON.stringify(receiptData)
    })
    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || {},
      message: 'Receipt updated successfully'
    }
  } catch (error) {
    console.error('Error updating purchase receipt:', error)
    throw error
  }
}

// ✅ Delete receipt
export const deletePurchaseReceipt = async (name) => {
  try {
    const res = await api.post(`${BASE_PURCHASE_RECEIPTS}.delete_purchase_receipt`, { name })
    return {
      status: 'success',
      message: res.data.message?.message || 'Receipt deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting purchase receipt:', error)
    throw error
  }
}

// ✅ Submit receipt (Draft → To Bill)
export const submitPurchaseReceipt = async (name) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.purchase_receipt.submit_purchase_receipt',
      { name }
    )
    return {
      status: 'success',
      data: res.data.message?.data || {},
      message: res.data.message?.message || 'Receipt submitted successfully'
    }
  } catch (error) {
    console.error('Error submitting receipt:', error)
    throw error
  }
}

// ✅ Cancel receipt
export const cancelPurchaseReceipt = async (name) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.purchase_receipt.cancel_purchase_receipt',
      { name }
    )
    return {
      status: 'success',
      message: res.data.message?.message || 'Receipt cancelled successfully'
    }
  } catch (error) {
    console.error('Error cancelling receipt:', error)
    throw error
  }
}

// ✅ Get all suppliers
export const getSuppliers = async () => {
  try {
    const res = await api.get(
      '/api/method/retail.retail.api.purchase_receipt.get_suppliers'
    )
    return {
      status: 'success',
      data: res.data?.message?.data || [],
      message: 'Suppliers fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    throw error
  }
}


// ✅ Create Purchase Invoice from Receipt
// export const createPurchaseInvoiceFromReceipt = async (receiptName) => {
//   try {
//     const res = await api.post(
//       '/api/method/retail.retail.api.purchase_receipt.create_purchase_invoice_from_receipt',
//       { receipt_name: receiptName }
//     )
//     return {
//       status: 'success',
//       data: res.data.message?.data || {},
//       message: res.data.message?.message || 'Invoice created successfully'
//     }
//   } catch (error) {
//     console.error('Error creating purchase invoice:', error)
//     throw error
//   }
// }



// In api.js — createPurchaseInvoiceFromReceipt should accept extra data:
// ✅ Fixed — added await, aligned with Python response shape { status, data, message }
export const createPurchaseInvoiceFromReceipt = async (receiptName, payload = {}) => {
  try {
    const res = await api.post(
      '/api/method/retail.retail.api.purchase_receipt.create_purchase_invoice_from_receipt',
      {
        receipt_name:      receiptName,
        items:             payload.items ? JSON.stringify(payload.items) : undefined,
        posting_date:      payload.posting_date      || undefined,
        posting_time:      payload.posting_time      || undefined,
        set_posting_time:  payload.set_posting_time  || 0,
        remarks:           payload.remarks           || undefined,
      }
    )

    const result = res.data?.message   // Frappe wraps @whitelist return in .message

    if (result?.status === 'error') {
      throw new Error(result.message || 'Failed to create invoice')
    }

    return {
      status:  result?.status  || 'success',
      data:    result?.data    || {},
      message: result?.message || 'Invoice created successfully',
    }

  } catch (error) {
    console.error('Error creating purchase invoice:', error)
    throw error
  }
}

// ✅ Get invoices linked to receipt
export const getPurchaseInvoiceForReceipt = async (receiptName) => {
  try {
    const res = await api.get(
      '/api/method/retail.retail.api.purchase_receipt.get_purchase_invoice_for_receipt',
      { params: { receipt_name: receiptName } }
    )
    return {
      status: 'success',
      data: res.data.message?.data || []
    }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    throw error
  }
}



const USER_BASE = '/api/method/retail.retail.api.user_management'

// ✅ Get current user info
export const getCurrentUserInfo = async () => {
  try {
    const res = await api.get(`${USER_BASE}.get_current_user_info`)
    return {
      status: 'success',
      data: res.data.message?.data || res.data.message || {}
    }
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw error
  }
}

// ✅ Get all users
export const getAllUsers = async () => {
  try {
    const res = await api.get(`${USER_BASE}.get_all_users`)
    return {
      status: 'success',
      data: res.data.message?.data || []
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// ✅ Create user
export const createUser = async (userData) => {
  try {
    const res = await api.post(`${USER_BASE}.create_user`, {
      data: JSON.stringify(userData)
    })
    return {
      status: 'success',
      data: res.data.message?.data || {},
      message: res.data.message?.message || 'User created'
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// ✅ Update user
export const updateUser = async (name, userData) => {
  try {
    const res = await api.post(`${USER_BASE}.update_user`, {
      name,
      data: JSON.stringify(userData)
    })
    return {
      status: 'success',
      data: res.data.message?.data || {},
      message: res.data.message?.message || 'User updated'
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// ✅ Delete (disable) user
export const deleteUser = async (name) => {
  try {
    const res = await api.post(`${USER_BASE}.delete_user`, { name })
    return {
      status: 'success',
      message: res.data.message?.message || 'User disabled'
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// ✅ Get available roles
export const getAvailableRoles = async () => {
  try {
    const res = await api.get(`${USER_BASE}.get_available_roles`)
    return {
      status: 'success',
      data: res.data.message?.data || []
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
    throw error
  }
}


// ═══════════════════════════════════════════════════════
//  ITEM PRICE  —  api.js additions
// ═══════════════════════════════════════════════════════

const PRICE_LIST_BASE = '/api/method/retail.retail.api'

// ──────────────────────────────────────────────────────
//  PRICE LISTS
// ──────────────────────────────────────────────────────

/** Get ALL price lists (buying + selling) */
export const getAllPriceLists = () =>
  api.get(`${PRICE_LIST_BASE}.item_price.get_all_price_lists`)

/** Get the POS default price list */
export const getPOSPriceList = () =>
  api.get(`${PRICE_LIST_BASE}.item_price.get_pos_price_list`)


// ──────────────────────────────────────────────────────
//  ITEM PRICES  (Item Price doctype)
// ──────────────────────────────────────────────────────

/**
 * Get item prices
 * @param {Object} filters  - { price_list, item_code, currency }
 */
export const getItemPrices = (filters = {}) =>
  api.get(`${PRICE_LIST_BASE}.item_price.get_item_prices`, { params: filters })

/**
 * Get price for a SINGLE item in a specific price list
 */
export const getItemPrice = (item_code, price_list) =>
  api.get(`${PRICE_LIST_BASE}.item_price.get_item_price`, {
    params: { item_code, price_list }
  })

/**
 * Create a new Item Price record
 * @param {Object} data - { item_code, price_list, price_list_rate, currency, uom, valid_from, valid_upto }
 */
export const createItemPrice = (data) =>
  api.post(`${PRICE_LIST_BASE}.item_price.create_item_price`, data)

/**
 * Update an existing Item Price record
 * @param {string} name - e.g. "IP-00001"
 * @param {Object} data - { price_list_rate, currency, uom, valid_from, valid_upto }
 */
export const updateItemPrice = (name, data) =>
  api.put(`${PRICE_LIST_BASE}.item_price.update_item_price`, { name, ...data })

/**
 * Delete an Item Price record
 */
export const deleteItemPrice = (name) =>
  api.delete(`${PRICE_LIST_BASE}.item_price.delete_item_price`, { params: { name } })



// ═══════════════════════════════════════════════════════
//  BARCODE SCAN API  —  أضف ده في api.js
// ═══════════════════════════════════════════════════════

const BARCODE_SCAN_BASE = '/api/method/retail.retail.api.barcode_scan'

/**
 * Decode barcode from base64 image
 * @param {string} imageData - base64 image (data URL or raw base64)
 * @returns {{ success, barcode, format, method } | { success, error }}
 */
export const decodeBarcodeFromImage = async (imageData) => {
  try {
    const res = await api.post(`${BARCODE_SCAN_BASE}.decode_barcode`, {
      image_data: imageData,
      enhance: true,
    })
    return res.data.message
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.message || err?.message || 'Failed to decode barcode',
    }
  }
}

/**
 * Check if barcode detection libraries are installed on server
 * @returns {{ pyzbar, opencv, pillow, ready }}
 */
export const checkBarcodeServerDeps = async () => {
  try {
    const res = await api.get(`${BARCODE_SCAN_BASE}.check_dependencies`)
    return res.data.message
  } catch {
    return { pyzbar: false, opencv: false, pillow: false, ready: false }
  }
}

// =============== Barcode Scanner ===============
// Import in  Page MobileScan.vue

const Mobile_SCAN_BASE = '/api/method/retail.retail.api.mobile_scan'

export const ScanBarcodeApi = async (sessionId, barcode) => {
  try {

    const api = await initializeClient({ allowGuest: true })

    const res = await api.post(
      `${Mobile_SCAN_BASE}.receive_barcode`,
      {
        session_id: sessionId,
        barcode
      }
    )

    console.log("📦 RAW RESPONSE:", res)

    return res?.data ?? {}

  } catch (err) {
    console.error('❌ ScanBarcodeApi error:', err)

    return {
      found: false,
      error: err?.message
    }
  }
}

// ============ Period Closing Voucher ============

const CLOSING_PERIOD_BASE = '/api/resource/Period Closing Voucher'
const CLOSING_PERIOD_METHOD = '/api/method/erpnext.accounts.doctype.period_closing_voucher.period_closing_voucher'

/**
 * Get all Period Closing Vouchers (all docstatus)
 */
export const fetchClosingPeriods = async () => {
  try {
    const res = await api.get(CLOSING_PERIOD_BASE, {
      params: {
        fields: JSON.stringify([
          'name',
          'transaction_date',
          'fiscal_year',
          'period_start_date',
          'period_end_date',
          'company',
          'closing_account_head',
          'gle_processing_status',
          'remarks',
          'docstatus',
        ]),
        order_by: 'period_end_date desc',
        limit: 200,
      },
    })
    return { success: true, data: res.data.data }
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.exc || err?.message || 'Failed to fetch closing periods',
    }
  }
}

/**
 * Create new Period Closing Voucher (draft)
 */
export const createClosingPeriod = async (payload) => {
  try {
    const res = await api.post(CLOSING_PERIOD_BASE, {
      transaction_date: payload.transaction_date,
      fiscal_year: payload.fiscal_year,
      period_start_date: payload.period_start_date,
      period_end_date: payload.period_end_date,
      company: payload.company,
      closing_account_head: payload.closing_account_head,
      remarks: payload.remarks || '',
      docstatus: 0,
    })
    return { success: true, data: res.data.data }
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.exc || err?.message || 'Failed to create closing period',
    }
  }
}

/**
 * Submit Period Closing Voucher
 */
export const submitClosingPeriod = async (name) => {
  try {
    const res = await api.put(`${CLOSING_PERIOD_BASE}/${name}`, { docstatus: 1 })
    return { success: true, data: res.data.data }
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.exc || err?.message || 'Failed to submit closing period',
    }
  }
}

/**
 * Get suggested period start/end date from ERPNext
 */
export const getPeriodStartEndDate = async (fiscalYear, company) => {
  try {
    const res = await api.get(`${CLOSING_PERIOD_METHOD}.get_period_start_end_date`, {
      params: { fiscal_year: fiscalYear, company },
    })
    return { success: true, data: res.data.message }
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.exc || err?.message || 'Failed to get period dates',
    }
  }
}

/**
 * Cancel Period Closing Voucher
 */
export const cancelClosingPeriod = async (name) => {
  try {
    const res = await api.post(
      '/api/method/frappe.client.cancel',
      {
        doctype: 'Period Closing Voucher',
        name: name,
      }
    )
    return { success: true, data: res.data.message }
  } catch (err) {
    return {
      success: false,
      error: err?.response?.data?.exception || err?.response?.data?.exc || err?.message || 'Failed to cancel',
    }
  }
}

const onFiscalYearChange = async () => {
  if (!formData.value.fiscal_year || !formData.value.company) return
  try {
    const res = await api.get(
      '/api/method/erpnext.accounts.doctype.period_closing_voucher.period_closing_voucher.get_period_start_end_date',
      { params: { fiscal_year: formData.value.fiscal_year, company: formData.value.company } }
    )
    const msg = res.data.message
    if (msg) {
      formData.value.period_start_date = msg[0] || ''
      formData.value.period_end_date   = msg[1] || ''
    }
  } catch (err) {
    toast.error('Could not fetch period dates')
  }
}

export const getSalesAnalytics = async ({ fromDate, toDate, company = null }) => {
  try {
    const params = {
      from_date: fromDate,
      to_date: toDate,
    }
    if (company) params.company = company

    const response = await api.get(
      '/api/method/retail.retail.api.common.get_sales_analytics',
      { params }
    )
    return { success: true, data: response.data.message }
  } catch (err) {
    console.error('Error loading sales analytics:', err)
    return {
      success: false,
      error: err?.response?.data?.exception || err?.message || 'Failed to load analytics',
    }
  }
}


export const getDefaultCompany = async () => {
  try {
    const res = await api.get('/api/method/retail.retail.api.common.get_default_company')
    return res.data.message || ''
  } catch (err) {
    console.error('Error loading default company:', err)
    return ''
  }
}



export const getCashFlowReport = async (filters) => {
  try {
    const res = await api.get('/api/method/retail.retail.api.common.get_cash_flow_report', {
      params: { filters: JSON.stringify(filters) },
    })
    return res.data.message || { operating: [], investing: [], financing: [] }
  } catch (err) {
    console.error('Error loading cash flow report:', err)
    return { operating: [], investing: [], financing: [] }
  }
}
