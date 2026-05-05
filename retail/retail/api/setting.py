import frappe
    

@frappe.whitelist()
def create_Sample_items(item_data):
    """
    Create an Item in ERPNext using provided item data.
    Args:
        item_data (dict): Dictionary containing item fields like:
            {
                "item_code": "TEST-ITEM-001",
                "item_name": "Test Item",
                "item_group": "Products",
                "stock_uom": "Nos",
                "standard_rate": 50
            }
    Returns:
        str: Name of the created item
    """

    # Validate input
    if not isinstance(item_data, dict):
        frappe.throw("item_data must be a dictionary")

    item_code = item_data.get("item_code")
    if not item_code:
        frappe.throw("Missing required field: item_code")

    # Ensure required item group exists
    if item_data.get("item_group"):
        ensure_item_group(item_data["item_group"])

    # Check if item already exists
    if frappe.db.exists("Item", item_code):
        frappe.msgprint(f"⚠️ Item <b>{item_code}</b> already exists.")
        return item_code

    # Create new item
    item = frappe.get_doc({
        "doctype": "Item",
        **item_data
    })

    item.insert(ignore_permissions=True)
    frappe.db.commit()

    frappe.msgprint(f"Sample Item created: {item.name}")
    return item.name

@frappe.whitelist()
def create_all_sample_items(sample_products):
    """Loop through sample_products list and create each item."""

    if not isinstance(sample_products, list):
        frappe.throw("sample_products must be a list of dictionaries")

    created, failed = [], []
    for product in sample_products:
        try:
            name = create_Sample_items(product)
            created.append(name)
        except Exception as e:
            frappe.log_error(message=str(e), title=f"Error creating {product.get('item_code')}")
            frappe.msgprint(f"❌ Failed to create {product.get('item_name')}: {e}")
            failed.append(product.get("item_code"))
    return {
        "created": created,
        "failed": failed
    }

        
def ensure_item_group(group_name: str):
    """Ensure a specific Item Group exists; if not, create it"""
    if not frappe.db.exists("Item Group", group_name):
        item_group = frappe.get_doc({
            "doctype": "Item Group",
            "item_group_name": group_name,
            "parent_item_group": "All Item Groups",
            "is_group": 0
        })
        item_group.insert(ignore_permissions=True)
        frappe.db.commit()
        frappe.msgprint(f"🆕 Created missing Item Group: {group_name}")


@frappe.whitelist()
def delete_all_sample_items():
    """Delete all items created as sample data (SAMPLE-ITEM-###)"""
    try:
        # حدد العناصر اللي كودها يبدأ بـ SAMPLE-
        items = frappe.get_all("Item", filters=[["item_code", "like", "SAMPLE-ITEM-%"]], pluck="name")

        if not items:
            return {"status": "empty", "message": "⚠️ No sample items found to delete."}

        deleted_count = 0
        for name in items:
            try:
                frappe.delete_doc("Item", name, ignore_permissions=True)
                deleted_count += 1
            except Exception as e:
                frappe.log_error(f"Failed to delete {name}: {str(e)}", "Delete Sample Items")

        frappe.db.commit()

        return {
            "status": "success",
            "deleted_count": deleted_count,
            "message": f"🗑️ Deleted {deleted_count} sample items successfully."
        }

    except Exception as e:
        frappe.log_error(str(e), "delete_all_sample_items Error")
        frappe.throw(f"Error deleting sample items: {e}")
