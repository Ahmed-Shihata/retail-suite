# app/suppliers/api.py
import frappe
from frappe import _
from frappe.utils import flt, getdate, today
from frappe.client import get_list, get_value
import json
from retail.retail.api.posapp import get_supplier_names
from frappe.contacts.doctype.contact.contact import (
	get_contacts_linked_from,
	get_contacts_linking_to,
)
from frappe.contacts.doctype.address.address import get_preferred_address
from erpnext.selling.doctype.customer.customer import make_contact
from retail.retail.api.contact import get_party_contact_info
from retail.retail.api.address import get_party_address_info


@frappe.whitelist(allow_guest=False)
def get_supplier_profile(supplier_name):
    """
    Get complete supplier profile
    """
    try:
        if not frappe.db.exists('Supplier', supplier_name):
            frappe.throw(_('Supplier {0} not found').format(supplier_name))

        supplier = frappe.get_doc('Supplier', supplier_name)

        contact_details = get_party_contact_info('Supplier', supplier_name)
        address_details = get_party_address_info('Supplier', supplier_name, preferred_key='is_shipping_address')

        financial_data = get_supplier_financial_summary(supplier_name)

        supplier_data= {
            "supplier_data": supplier.as_dict(),
            "contact_details": contact_details,
            "address_details": address_details,
            "debt": get_supplier_debt(supplier_name),
            "totalPurchases": get_supplier_total_purchases(supplier_name),
            "discount": get_supplier_discount(supplier_name),
            'due_amount': financial_data['due_amount'],
            'totalSupplies': financial_data['total_supplies'],
            # "paymentTerms": supplier.payment_terms or 30,

        }

        purchases = get_supplier_purchases(supplier_name)

            # 3. المعاملات المحاسبية
        transactions = get_supplier_transactions(supplier_name)

        # 4. المستندات
        documents = get_supplier_documents(supplier_name)

        # financial_data = get_supplier_financial_summary(supplier_name)


        return {
            "supplier": supplier_data,
            "purchases": purchases,
            "transactions": transactions,
            "documents": documents
        }

    except Exception as e:
        frappe.log_error(
            title='Error getting supplier profile',
            message=str(e)
        )
        frappe.throw(str(e))

@frappe.whitelist(allow_guest=False)
def get_suppliers_financial_data(pos_profile=None):
    """
    Get suppliers with financial data
    Used by: SuppliersList.vue
    """
    try:
        filters = {}
        pos_profile = frappe.parse_json(pos_profile)
        # Filter by disabled status
        filters['disabled'] = 0
        # If pos_profile is provided, filter by company
        if pos_profile:
            if pos_profile.company:
                filters['company'] = pos_profile.company

        if not frappe.db.exists("DocType", "Supplier Group"):
          frappe.throw("❌ Supplier Group Table provided in Database.")
        # Get all suppliers
        suppliers = get_supplier_names(frappe.as_json(pos_profile))
        # # Add financial data for each supplier
        result = []

        for supplier in suppliers:
            print("supplier['name'] ", supplier['name'])
            financial_data = get_supplier_financial_summary(supplier['name'])
            print("financial Data", financial_data)

            contact_details = get_party_contact_info('Supplier', supplier['name'])
            address_details = get_party_address_info('Supplier', supplier['name'], preferred_key='is_shipping_address')

            supplier_data = {
                'id': frappe.generate_hash()[:8],
                'name': supplier['supplier_name'] or supplier['name'],
                'contact_details': contact_details,
                'address_details': address_details,
                'status': 'active',
                'createdAt': str(supplier.get('createdAt', today()))[:10],
                'due_amount': financial_data['due_amount'],
                'totalSupplies': financial_data['total_supplies'],
                'note': supplier.get('custom_note', '')
            }
            result.append(supplier_data)

        return result

    except Exception as e:
        frappe.log_error(
            title='Error in get_suppliers_financial_data',
            message=str(e)
        )
        frappe.throw(_('Error fetching suppliers data'))


def get_supplier_financial_summary(supplier_name):
    """
    Calculate financial summary for a supplier
    Returns: { due_amount, total_supplies }
    """
    try:
        # Get outstanding amount from Purchase Invoices
        from frappe.utils import flt
        due_amount = frappe.db.get_value(
            'Purchase Invoice',
            {
                'supplier': supplier_name,
                'docstatus': 1,
                'outstanding_amount': ['>', 0]
            },
            'SUM(outstanding_amount) as total'
        )

        due_amount = flt(due_amount) if due_amount else 0

        # Get total supplies (total value of Purchase Orders / Invoices)
        total_supplies = frappe.db.get_value(
            'Purchase Invoice',
            {
                'supplier': supplier_name,
                'docstatus': 1
            },
            'SUM(grand_total) as total'
        )

        total_supplies = flt(total_supplies) if total_supplies else 0

        return {
            'due_amount': due_amount,
            'total_supplies': total_supplies
        }

    except Exception as e:
        frappe.log_error(
            title='Error calculating financial summary',
            message=str(e)
        )
        return {
            'due_amount': 0,
            'total_supplies': 0
        }


# Get Suppliers Groups for dropdown
@frappe.whitelist(allow_guest=False)
def get_supplier_groups():
    try:
        groups = frappe.get_all('Supplier Group', fields=['name'])
        return groups
    except Exception as e:
        frappe.log_error(
            title='Error fetching supplier groups',
            message=str(e)
        )
        frappe.throw(_('Error fetching supplier groups'))

# CRUD Operations for Supplier
@frappe.whitelist(allow_guest=False)
def create_supplier(
    supplier_name,
    supplier_group,
    supplier_type,
    mobile_no=None,
    email_id=None,
    address_line1=None,
    address_line2=None,
    city=None,
    state=None,
    pincode=None,
    country=None,
    custom_note=None
):
    """
    Create a new supplier
    """
    try:
        # Check if supplier already exists
        if frappe.db.exists('Supplier', supplier_name):
            frappe.throw(_('Supplier {0} already exists').format(supplier_name))

        # Create new supplier document
        supplier = frappe.new_doc('Supplier')
        supplier.supplier_name = supplier_name
        if supplier_group:
            supplier.supplier_group = supplier_group

        if supplier_type:
            supplier.supplier_type = supplier_type

        # Important: use core field names
        if mobile_no:
            supplier.mobile_no = mobile_no

        if email_id:
            supplier.email_id = email_id

    #
        if custom_note:
            supplier.custom_note = custom_note


        if address_line1:
            supplier.address_line1 = address_line1

        if address_line2:
            supplier.address_line2 = address_line2

        if city:
            supplier.city = city

        if state:
            supplier.state = state

        if pincode:
            supplier.pincode = pincode

        if country:
            supplier.country = country

        supplier.insert(ignore_permissions=True)
        frappe.db.commit()
        frappe.cache().delete_keys("*__get_supplier_names")
        return {
            'status': 'success',
            'status_code': 201,
            'message': _('Supplier  {0} created successfully').format(supplier.name),
            'supplier': supplier.name
        }

    except Exception as e:
        frappe.log_error(
            title='Error creating supplier',
            message=str(e)
        )
        return {
            "status": "error",
            "status_code": 500,
            "success": False,
            "message": str(e),
        }


@frappe.whitelist(allow_guest=False)
def update_supplier(supplier_name, **kwargs):
    """
    Update supplier details
    """
    try:
        if not frappe.db.exists('Supplier', supplier_name):
            frappe.throw(_('Supplier {0} not found').format(supplier_name))

        supplier = frappe.get_doc('Supplier', supplier_name)

        # Update allowed fields
        allowed_fields = [
            'supplier_name', 'supplier_group', 'supplier_type', 'custom_note',
        ]

        for field in allowed_fields:
            if field in kwargs and kwargs[field]:
                supplier.set(field, kwargs[field])

        supplier.save(ignore_permissions=True)
        frappe.db.commit()

        return {
            'status': 'success',
            'message': _('Supplier {0} updated successfully').format(supplier.name),
            'supplier': supplier.name
        }

    except Exception as e:
        frappe.log_error(
            title='Error updating supplier',
            message=str(e)
        )
        return {
            "status": "error",
            "status_code": 500,
            "success": False,
            "message": str(e),
        }

@frappe.whitelist(allow_guest=False)
def update_supplier_contacts(supplier_name, contacts_json):
    """
    Update supplier contact details
    supplier_name: name of the supplier to update contacts for
    param contacts_json: constains
    {"name": "contact_name", "mobile_no": "1234567890", "email_id": "contact@example.com"}

    """
    try:
        if not frappe.db.exists('Supplier', supplier_name):
            frappe.throw(_('Supplier {0} not found').format(supplier_name))

        contacts = frappe.parse_json(contacts_json)

        if contacts:
            if contacts.get('contact_name') and frappe.db.exists('Contact', contacts.get('contact_name')):
                # Update existing contact
                contact_doc = frappe.get_doc('Contact', contacts['contact_name'])
                contact_doc.db_set('first_name', contacts.get('first_name'))
                contact_doc.db_set('middle_name', contacts.get('middle_name'))
                contact_doc.db_set('last_name', contacts.get('last_name'))
                contact_doc.db_set('email_id', contacts.get('email_id'))
                contact_doc.db_set('mobile_no', contacts.get('mobile_no'))

            else:
                # make contact should take parms dict {}
                # "doctype": "Supplier",
                # "name": "Sawsan",
                # "supplier_name": "Sawsan",
                # "supplier_type": "Individual",
                # "email_id": "contact@example.com",
                # "mobile_no": "099466"

                # Create new contact and link to supplier
                new_contact = make_contact(frappe._dict(contacts), is_primary_contact= 1)

        frappe.db.commit()

        return {
            "status": "success",
            "message": _("Contact information updated successfully for supplier {0}").format(supplier_name)
        }
    except Exception as e:
        frappe.log_error(
            title='Error updating supplier contact info',
            message=str(e)
        )
        return {
            "status": "error",
            "status_code": 500,
            "success": False,
            "message": str(e),
        }

@frappe.whitelist(allow_guest=False)
def delete_supplier(supplier_name):
    """
    Delete a supplier
    """
    try:
        if not frappe.db.exists('Supplier', supplier_name):
            frappe.throw(_('Supplier {0} not found').format(supplier_name))

        # Check if supplier has any transactions
        invoice_count = frappe.db.count(
            'Purchase Invoice',
            {'supplier': supplier_name, 'docstatus': ['!=', 2]}
        )

        if invoice_count > 0:
            frappe.throw(
                _('Cannot delete supplier with existing transactions. Found {0} invoices').format(invoice_count)
            )

        frappe.delete_doc('Supplier', supplier_name, ignore_permissions=True)
        frappe.db.commit()

        return {
            'status': 'success',
            'message': _('Supplier deleted successfully')
        }

    except Exception as e:
        frappe.log_error(
            title='Error deleting supplier',
            message=str(e)
        )
        frappe.throw(str(e))


def get_supplier_purchases(supplier_name):
    """جلب فواتير الشراء من المورد"""
    invoices = frappe.get_list(
        "Purchase Invoice",
        filters={"supplier": supplier_name, "docstatus": 1},
        fields=["name", "posting_date", "total", "paid_amount", "outstanding_amount"]
    )

    purchases = []
    for idx, invoice in enumerate(invoices, start=1001):
        outstanding = invoice.outstanding_amount or 0
        paid = invoice.paid_amount or 0

        # حدد الحالة
        if outstanding == 0:
            status = "paid"
        elif paid > 0:
            status = "partial"
        else:
            status = "pending"

        purchases.append({
            "id": idx,
            "invoice_name": str(invoice.name),
            "date": str(invoice.posting_date),
            "amount": float(invoice.total),
            "paid": float(paid),
            "remaining": float(outstanding),
            "status": status
        })

    return purchases

def get_supplier_transactions(supplier_name):
    """جلب المعاملات المحاسبية للمورد"""
    gl_entries = frappe.get_list(
        "GL Entry",
        filters={
            "party": supplier_name,
            "party_type": "Supplier"
        },
        fields=["posting_date", "remarks", "debit", "credit", "voucher_no", "voucher_type"],
        order_by="posting_date asc"
    )

    transactions = []
    balance = 0

    for entry in gl_entries:
        debit = entry.debit or 0
        credit = entry.credit or 0

        # للمورد: الزيادة = credit (عليك فلوس)
        #         النقص   = debit  (دفعت فلوس)
        balance = balance + credit - debit

        transactions.append({
            "date": str(entry.posting_date),
            "description": entry.remarks or "عملية",
            "debit": float(debit),
            "credit": float(credit),
            "balance": float(balance)
        })

    return transactions


def get_supplier_documents(supplier_name):
    # جلب من File Attachments
    files = frappe.get_list(
        "File",
        filters={"attached_to_doctype": "Customer", "attached_to_name": supplier_name},
        fields=["name", "file_name", "file_type", "creation"]
    )
    documents = []
    for idx, file in enumerate(files, start=1):
        documents.append({
            "id": idx,
            "name": file.file_name.split('/')[-1],  # اسم الملف فقط
            "type": file.file_type or "unknown",
            "uploadedAt": str(file.creation)
        })

    return documents

def get_supplier_debt(supplier_name):
    """حساب المديونيه المتبقية"""
    due_amount = frappe.db.get_value(
            'Purchase Invoice',
            {
                'supplier': supplier_name,
                'docstatus': 1,
                'outstanding_amount': ['>', 0]
            },
            'SUM(outstanding_amount) as total'
        )
    due_amount = flt(due_amount) if due_amount else 0

    return due_amount

def get_supplier_total_purchases(supplier_name):
    """حساب إجمالي المشتريات"""
    total = frappe.db.get_value(
        "Purchase Invoice",
        filters={"supplier": supplier_name, "docstatus": 1},
        fieldname="sum(total)"
    ) or 0
    return float(total)

def get_supplier_discount(supplier_name):
    """
    إرجاع نسبة الخصم للمورد بناءً على Pricing Rule (Supplier أو Supplier Group)
    """
    supplier = frappe.get_doc("Supplier", supplier_name)

    # 1️⃣ حاول تجيب Pricing Rule على المورد مباشرة
    discount = frappe.db.get_value(
        "Pricing Rule",
        {
            "selling": 0,
            "buying":1,
            "disable": 0,
            "supplier": supplier.name
        },
        "discount_percentage"
    )

    if discount:
        return discount

    # 2️⃣ لو مفيش → Pricing Rule على Supplier Group
    discount = frappe.db.get_value(
        "Pricing Rule",
        {
            "buying":1,
            "selling": 0,          # 0 = شراء
            "disable": 0,
            "supplier_group": supplier.supplier_group
        },
        "discount_percentage"
    )

    # 3️⃣ لو مفيش → صفر
    return discount or 0

@frappe.whitelist(allow_guest=False)
def get_suppliers_statistics(pos_profile=None):
    """
    Get suppliers statistics dashboard
    """
    try:
        filters = {'disabled': 0}

        if pos_profile:
            if pos_profile.company:
                filters['company'] = pos_profile.company

        total_suppliers = frappe.db.count('Supplier', filters=filters)

        # Get total outstanding
        total_outstanding = frappe.db.get_value(
            'Purchase Invoice',
            {'docstatus': 1},
            'SUM(outstanding_amount) as total'
        )
        total_outstanding = flt(total_outstanding[0]) if total_outstanding and total_outstanding[0] else 0

        # Get total supplies
        total_supplies_value = frappe.db.get_value(
            'Purchase Invoice',
            {'docstatus': 1},
            'SUM(grand_total) as total'
        )
        total_supplies_value = flt(total_supplies_value[0]) if total_supplies_value and total_supplies_value[0] else 0

        return {
            'status': 'success',
            'data': {
                'total_suppliers': total_suppliers,
                'total_outstanding': total_outstanding,
                'total_supplies_value': total_supplies_value,
                'average_payment': total_outstanding / total_suppliers if total_suppliers > 0 else 0
            }
        }

    except Exception as e:
        frappe.log_error(
            title='Error getting statistics',
            message=str(e)
        )
        frappe.throw(str(e))
