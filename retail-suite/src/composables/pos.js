import { call } from 'frappe-ui'
import { api } from '@/services/auth.js'
// ============================================================
// Get Items
// ============================================================
export const itemList = async()=>{
 try {

    const items = await call('frappe.client.get_list', {

        doctype:'Item',
        fields: ["*"],
        limit: 0,
    })
    console.log('first item fields:', Object.keys(items[0] || {}))
    console.log("Get items API",items)
    return items || []
  } catch (err) {
    console.error("Get items:", err)
    throw err
  }

}

// ============================================================
// Get Items
// ============================================================
export const getItemsFromFrappeDB = async (
  currentPOSProfile,
  currentPriceList,
  currentCustomer,
  searchValue = '',
  selectedWarehouse = null
) => {
  try {
    const response = await call('retail.retail.api.posapp.get_items',{
                    pos_profile: JSON.stringify(currentPOSProfile),
                    price_list: currentPriceList,
                    search_value: searchValue,
                    item_group: '',
                    customer: currentCustomer,
                    warehouse: selectedWarehouse || '',
                })


    const items = response?.message || response || []
    console.log("response items",items)

    return items
  } catch (error) {
    console.error('❌ getItemsFromFrappeDB:', error)
    return []
  }
}

/* ==========================================================================
  Get - Item Group  Statistics
========================================================================== */
export const getItemGroup = async () => {
  try {
    const res = await call(
      'retail.retail.api.posapp.get_items_groups'
    )

    return {
      status: 'success',
      data: res.message || {},
      message: 'Groups fetched successfully'
    }
  } catch (error) {
    console.error('Error fetching Groups:', error)
    throw error
  }
}

// ====================================================================
// Api Create Sales Order
// ====================================================================
export const createSalesOrder = async (customer, transactionData) => {
  try {
    const response = await call('retail.retail.api.posapp.create_order', {
            customer: customer,
            items_json: JSON.stringify(transactionData.items),
            total: transactionData.summary.total,
            shipping_address: transactionData.mode.shipping_address,
            delivery_date: transactionData.mode.delivery_date,
            delivery_slot: transactionData.mode.delivery_slot,
            notes: transactionData.mode.notes || null
    });

    return response;
  } catch (error) {
    console.error('Error creating sales order:', error);
    throw error;
  }
};

// ====================================================================
//  Api Create Sales Return
// ====================================================================
export const createSalesReturn = async (invoice_name, items, pos_profile_name) => {

    try {
        const response = await call('retail.retail.api.invoice.create_sales_return',
            {
                invoice_name: invoice_name,
                items: items,
                pos_profile_name:pos_profile_name
            }
        )
        return response;

    } catch (error) {
        console.error('Error fetching shifts statistics:', error);
        throw error;
    }
}
