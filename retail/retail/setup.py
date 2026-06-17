import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields


def setup():
	make_custom_fields()

def uninstall():
	custom_fields = get_custom_fields()
	delete_custom_fields(custom_fields)

def make_custom_fields(update=True):
	custom_fields = get_custom_fields()
	create_custom_fields(custom_fields,update=update)

def delete_custom_fields(custom_fields: dict):
	"""
	:param custom_fields: a dict like `{'Pos Profile': [{fieldname: '', ...}]}`
	"""
	for doctype, fields in custom_fields.items():
		frappe.db.delete(
			"Custom Field",
			{
				"fieldname": ("in", [field["fieldname"] for field in fields]),
				"dt": doctype,
			},
		)

		frappe.clear_cache(doctype=doctype)

def get_custom_fields():
	return {
		"POS Profile": frappe.get_all(
		"Custom Field",
		filters={"dt": "POS Profile"},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Sales Invoice": frappe.get_all(
		"Custom Field",
		filters={"dt": "Sales Invoice", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Sales Order": frappe.get_all(
		"Custom Field",
		filters={"dt": "Sales Order", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Customer": frappe.get_all(
		"Custom Field",
		filters={"dt": "Customer", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Address": frappe.get_all(
		"Custom Field",
		filters={"dt": "Address", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Company": frappe.get_all(
		"Custom Field",
		filters={"dt": "Company", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Batch": frappe.get_all(
		"Custom Field",
		filters={"dt": "Batch", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Item Barcode": frappe.get_all(
		"Custom Field",
		filters={"dt": "Item Barcode", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Sales Invoice Item": frappe.get_all(
		"Custom Field",
		filters={"dt": "Sales Invoice Item", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
		"Sales Order Item": frappe.get_all(
		"Custom Field",
		filters={"dt": "Sales Order Item", "fieldname": ["like", "posa_%"]},
		fields=["fieldname", "label", "fieldtype", "insert_after", "options", "depends_on", "reqd", "hidden", "default", "description"],
	),
	}


all_fields = frappe.get_all(
    "Custom Field",
    filters={"dt": "POS Profile"},
    pluck="name"
)

pos_fields = frappe.get_all(
    "Custom Field",
    filters={
        "dt": "POS Profile",
        "fieldname": ["like", "pos_%"]
    },
    pluck="name"
)

custom_fields = frappe.get_all(
    "Custom Field",
    filters={
        "dt": "POS Profile",
        "fieldname": ["like", "custom_%"]
    },
    pluck="name"
)

others = list(set(all_fields) - set(pos_fields) - set(custom_fields))
