# api/contact.py
import frappe
from frappe.contacts.doctype.contact.contact import (
    get_contacts_linked_from,
    get_contacts_linking_to,
)
def get_party_contact_info(doctype, party_name):
    """
    Get contact info linked to a party (Customer / Supplier / etc.)
    """

    if not doctype or not party_name:
        return {}

    contact_details = {}

    contacts = get_contacts_linking_to(doctype, party_name, fields=["*"])

    if contacts:
        contact_details = contacts

    return contact_details




def _contact_dict(doc) -> dict:
    """كونتكت كامل مع إيميلاته وأرقامه وعنوانه المرتبط"""
    email_ids = frappe.get_all(
        "Contact Email",
        filters={"parenttype": "Contact", "parent": doc.name},
        fields=["email_id", "is_primary"],
        order_by="is_primary DESC",
    )
    phone_nos = frappe.get_all(
        "Contact Phone",
        filters={"parenttype": "Contact", "parent": doc.name},
        fields=["phone", "is_primary_phone", "is_primary_mobile_no"],
        order_by="is_primary_phone DESC, is_primary_mobile_no DESC",
    )
    linked_address = None
    if doc.address and frappe.has_permission("Address", "read"):
        try:
            linked_address = _address_dict(frappe.get_doc("Address", doc.address))
        except Exception:
            pass

    return {
        "name"               : doc.name,
        "first_name"         : doc.first_name,
        "last_name"          : doc.last_name,
        "full_name"          : doc.full_name,
        "designation"        : doc.designation,
        "is_primary_contact" : doc.is_primary_contact,
        "address"            : doc.address,        # frappe name of Address
        "email_ids"          : email_ids,
        "phone_nos"          : phone_nos,
        "linked_address"     : linked_address,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── CONTACT endpoints ────────────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def create_contact(customer, first_name, last_name=None, designation=None,
                   is_primary=0, email_ids=None, phone_nos=None, address_name=None):
    """
    أنشئ Contact جديد وربطه بـ Customer.
    email_ids  : [{ email_id, is_primary }]
    phone_nos  : [{ phone, is_primary_mobile_no, is_primary_phone }]
    address_name: اسم Address doc لربطه بالكونتكت
    """
    if isinstance(email_ids,  str): email_ids  = frappe.parse_json(email_ids)
    if isinstance(phone_nos,  str): phone_nos  = frappe.parse_json(phone_nos)

    doc = frappe.new_doc("Contact")
    doc.first_name          = first_name
    doc.last_name           = last_name or ""
    doc.designation         = designation or ""
    doc.is_primary_contact  = int(is_primary or 0)

    # ربط بـ Customer
    doc.append("links", {
        "link_doctype": "Customer",
        "link_name"   : customer,
    })

    # إيميلات
    for e in (email_ids or []):
        if e.get("email_id"):
            doc.append("email_ids", {
                "email_id"  : e["email_id"],
                "is_primary": int(e.get("is_primary", 0)),
            })

    # أرقام
    for p in (phone_nos or []):
        if p.get("phone"):
            doc.append("phone_nos", {
                "phone"               : p["phone"],
                "is_primary_phone"    : int(p.get("is_primary_phone", 0)),
                "is_primary_mobile_no": int(p.get("is_primary_mobile_no", 0)),
            })

    # عنوان مرتبط
    if address_name:
        doc.address = address_name

    doc.insert(ignore_permissions=False)
    frappe.db.commit()

    return _contact_dict(doc)


@frappe.whitelist(allow_guest=False)
def update_contact(contact_name, first_name=None, last_name=None, designation=None,
                   is_primary=0, email_ids=None, phone_nos=None, address_name=None):
    """
    عدّل Contact موجود.
    يحذف الإيميلات والأرقام القديمة ويضيف الجديدة.
    """
    if isinstance(email_ids, str): email_ids = frappe.parse_json(email_ids)
    if isinstance(phone_nos, str): phone_nos = frappe.parse_json(phone_nos)

    doc = frappe.get_doc("Contact", contact_name)

    if first_name   is not None: doc.first_name         = first_name
    if last_name    is not None: doc.last_name          = last_name
    if designation  is not None: doc.designation        = designation
    doc.is_primary_contact = int(is_primary or 0)

    # عنوان مرتبط
    if address_name is not None:
        doc.address = address_name or None

    # أعد بناء إيميلات
    if email_ids is not None:
        doc.email_ids = []
        for e in email_ids:
            if e.get("email_id"):
                doc.append("email_ids", {
                    "email_id"  : e["email_id"],
                    "is_primary": int(e.get("is_primary", 0)),
                })

    # أعد بناء أرقام
    if phone_nos is not None:
        doc.phone_nos = []
        for p in phone_nos:
            if p.get("phone"):
                doc.append("phone_nos", {
                    "phone"               : p["phone"],
                    "is_primary_phone"    : int(p.get("is_primary_phone", 0)),
                    "is_primary_mobile_no": int(p.get("is_primary_mobile_no", 0)),
                })

    doc.save(ignore_permissions=False)
    frappe.db.commit()

    return _contact_dict(doc)


@frappe.whitelist(allow_guest=False)
def delete_contact(contact_name):
    """
    احذف Contact — بس لو مربوط بـ Customer الـ logged-in فقط.
    """
    # تحقق إن الكونتكت مرتبط بـ customer الحالي
    customer = frappe.db.get_value(
        "Dynamic Link",
        {"parenttype": "Contact", "parent": contact_name, "link_doctype": "Customer"},
        "link_name",
    )
    if not customer:
        frappe.throw(_("Contact not linked to any customer"))

    frappe.delete_doc("Contact", contact_name, ignore_permissions=False)
    frappe.db.commit()
    return {"deleted": contact_name}


@frappe.whitelist(allow_guest=False)
def link_address_to_contact(contact_name, address_name):
    """اربط عنوان بـ Contact"""
    doc = frappe.get_doc("Contact", contact_name)
    doc.address = address_name or None
    doc.save(ignore_permissions=False)
    frappe.db.commit()

    linked_address = None
    if address_name:
        try:
            linked_address = _address_dict(frappe.get_doc("Address", address_name))
        except Exception:
            pass

    return {"contact": contact_name, "linked_address": linked_address}
