import frappe
from frappe.utils import nowdate
def test_discount_calculation():
    # items = [frappe.get_doc("Item", "SAMPLE-ITEM-001")]
    items = [{
    "item_code": "STO-ITEM-2025-00006"
}]
    customer = 'Ahmed Reda (01010871072)'
    pos_profile = frappe.get_doc("POS Profile", "فرع المهندسيين")
    company = pos_profile.company
    price_list = pos_profile.selling_price_list
    currency = pos_profile.currency
    customer_group = frappe.db.get_value("Customer", customer, "customer_group")
    from frappe.utils import nowdate
    transaction_date = nowdate()
    # apply_pricing_rules_for_pos(items, customer, customer_group, company, price_list, currency, today)
    items_data = [frappe.get_doc("Item", "SAMPLE-ITEM-001")]

    prepared_items = []
    for item in items_data:
        prepared_items.append({
            "item_code": item.name,
            "item_group": item.item_group,
            "brand": item.brand,
            "qty": 1,
            "rate": item.standard_rate or 0,
            "warehouse": "فرع المهندسيين - P"
        })

    pricing_result = apply_pricing_rules_for_pos(
        prepared_items,
        customer="Ahmed Saif",
        customer_group=frappe.db.get_value("Customer", "Ahmed Saif", "customer_group"),
        company=company,
        price_list=price_list,
        currency=currency,
        transaction_date=transaction_date
    )

    print(pricing_result)


def apply_pricing_rules_for_pos(items, customer, customer_group, company, price_list, currency,
                                 transaction_date):
    """
    تطبيق قواعد التسعير على المنتج في نقطة البيع
    """
    from erpnext.accounts.doctype.pricing_rule.pricing_rule import apply_pricing_rule

    args = {
            "items": items,
            "customer": customer,
            "customer_group": customer_group,
            "territory": frappe.db.get_value("Customer", customer, "territory"),
            "supplier": None,
            "supplier_group": None,
            "campaign": None,
            "sales_partner": None,
            "doctype": "Sales Invoice",
            "transaction_type": "selling",
            "price_list": price_list,
            "company": company,
            "currency": currency,
            "conversion_rate": 1,
            "transaction_date": transaction_date,
            "plc_conversion_rate": 1,
            "ignore_pricing_rule": 0,
        }
    try:
        pricing_rule_details = apply_pricing_rule(args, doc=None)
        print("Pricing Rule Details:", pricing_rule_details)

        return pricing_rule_details

    except Exception as e:
        frappe.log_error(f"Error applying pricing rule: {str(e)}")

    return

# def apply_pricing_rules_for_pos(items, customer, customer_group, company, price_list, currency,
#                                  transaction_date):
#     """
#     Apply pricing rules to items in POS using Sales Invoice simulation
#     Returns a list of pricing rule details per item
#     """
#     pricing_rule_details = []

#     try:
#         # إنشاء Sales Invoice وهمي لتطبيق قواعد التسعير
#         from frappe.model.document import get_mapped_doc

#         doc = frappe.new_doc("Sales Invoice")
#         doc.customer = customer
#         doc.company = company
#         doc.selling_price_list = price_list
#         doc.currency = currency
#         doc.transaction_date = transaction_date
#         doc.posting_date = transaction_date

#         # إضافة المنتجات
#         for item in items:
#             doc.append("items", {
#                 "item_code": item.get("item_code"),
#                 "item_name": item.get("item_code"),
#                 "qty": item.get("qty", 1),
#                 "rate": item.get("rate", 0),
#                 "warehouse": item.get("warehouse"),
#                 "uom": item.get("stock_uom"),
#             })

#         # تطبيق قواعد التسعير
#         doc.run_method("apply_pricing_rule")

#         # استخراج نتائج قواعد التسعير
#         for doc_item in doc.items:
#             item_pricing = {
#                 "item_code": doc_item.item_code,
#                 "discount_percentage": doc_item.discount_percentage or 0,
#                 "discount_amount": doc_item.discount_amount or 0,
#                 "pricing_rules": doc_item.pricing_rules if hasattr(doc_item, 'pricing_rules') else None,
#                 "has_pricing_rule": 1 if (doc_item.discount_percentage or doc_item.discount_amount) else 0,
#             }
#             pricing_rule_details.append(item_pricing)

#     except Exception as e:
#         import traceback
#         error_msg = f"Error in apply_pricing_rules_for_pos: {str(e)}\n{traceback.format_exc()}"
#         print(error_msg)
#         frappe.log_error(
#             message=error_msg,
#             title="POS Pricing Rule Main Error"
#         )

#         # إرجاع قيم افتراضية في حالة الخطأ
#         for item in items:
#             pricing_rule_details.append({
#                 "item_code": item.get("item_code"),
#                 "discount_percentage": 0,
#                 "discount_amount": 0,
#                 "pricing_rules": None,
#                 "has_pricing_rule": 0,
#             })

#     return pricing_rule_details
