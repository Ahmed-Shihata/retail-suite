import frappe


WORKFLOW_DATA = {
    "name": "Supermarket Sales Order",
    "document_type": "Sales Order",
    "workflow_state_field": "workflow_state",
    "is_active": 1,
    "override_status": 0,
    "send_email_alert": 0,
    "states": [
        {
            "state": "In Review",
            "doc_status": "0",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
        {
            "state": "Customer Cancelled",
            "doc_status": "0",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
        {
            "state": "Accepted",
            "doc_status": "1",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
        {
            "state": "Submitted",
            "doc_status": "1",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
        {
            "state": "In Shipment",
            "doc_status": "1",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
        {
            "state": "Cancelled After Approval",
            "doc_status": "2",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
        {
            "state": "Cancelled During Shipment",
            "doc_status": "2",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
        {
            "state": "Delivered",
            "doc_status": "1",
            "is_optional_state": 0,
            "avoid_status_override": 0,
            "allow_edit": "All",
            "send_email": 1,
        },
    ],
    "transitions": [
        {
            "state": "In Review",
            "action": "Cancel",
            "next_state": "Customer Cancelled",
            "allowed": "All",
            "allow_self_approval": 1,
        },
        {
            "state": "In Review",
            "action": "Accept",
            "next_state": "Accepted",
            "allowed": "All",
            "allow_self_approval": 1,
        },
        {
            "state": "Accepted",
            "action": "Cancel",
            "next_state": "Cancelled After Approval",
            "allowed": "All",
            "allow_self_approval": 1,
        },
        {
            "state": "Accepted",
            "action": "Start Shipment",
            "next_state": "In Shipment",
            "allowed": "All",
            "allow_self_approval": 1,
        },
        {
            "state": "In Shipment",
            "action": "Cancel",
            "next_state": "Cancelled During Shipment",
            "allowed": "All",
            "allow_self_approval": 1,
        },
        {
            "state": "In Shipment",
            "action": "Mark Delivered",
            "next_state": "Delivered",
            "allowed": "All",
            "allow_self_approval": 1,
        },
    ],
}


def _ensure_workflow_states_exist():
    """
    الـ Transitions بتستخدم state/next_state كـ Link fields تجاه
    doctype اسمه "Workflow State". لو الـ records دي مش موجودة،
    Frappe بيرمي LinkValidationError.
    الدالة دي بتتأكد إن كل state موجود في "Workflow State" قبل ما
    نبدأ نبني الـ Workflow.
    """
    for state_row in WORKFLOW_DATA["states"]:
        state_name = state_row["state"]
        if not frappe.db.exists("Workflow State", state_name):
            ws = frappe.new_doc("Workflow State")
            ws.workflow_state_name = state_name
            ws.insert(ignore_permissions=True)

    frappe.db.commit()


def create_sales_order_workflow():
    """
    يتم استدعاؤها تلقائيًا عند تثبيت الـ App (after_install).
    تقوم بإنشاء الـ Workflow إذا لم يكن موجودًا مسبقًا.
    """
    workflow_name = WORKFLOW_DATA["name"]

    if frappe.db.exists("Workflow", workflow_name):
        frappe.logger().info(
            f"Workflow '{workflow_name}' already exists. Skipping creation."
        )
        return

    try:
        # الخطوة 1: تأكد إن كل Workflow States موجودة أولًا
        # (Frappe بيتحقق منها كـ Link fields في الـ transitions)
        _ensure_workflow_states_exist()

        # الخطوة 2: ابني الـ Workflow document
        doc = frappe.new_doc("Workflow")
        doc.workflow_name = workflow_name
        doc.document_type = WORKFLOW_DATA["document_type"]
        doc.workflow_state_field = WORKFLOW_DATA["workflow_state_field"]
        doc.is_active = WORKFLOW_DATA["is_active"]
        doc.override_status = WORKFLOW_DATA["override_status"]
        doc.send_email_alert = WORKFLOW_DATA["send_email_alert"]

        # إضافة الـ States (الحالات)
        for state in WORKFLOW_DATA["states"]:
            doc.append("states", state)

        # إضافة الـ Transitions (الانتقالات)
        for transition in WORKFLOW_DATA["transitions"]:
            doc.append("transitions", transition)

        # ignore_links=True: يتجاوز الـ LinkValidationError
        # ignore_permissions=True: يشتغل بدون صلاحيات خاصة
        doc.flags.ignore_links = True
        doc.insert(ignore_permissions=True)
        frappe.db.commit()

        frappe.logger().info(f"Workflow '{workflow_name}' created successfully.")

    except Exception as e:
        frappe.logger().error(f"Failed to create Workflow '{workflow_name}': {str(e)}")
        raise


def delete_sales_order_workflow():
    """
    يتم استدعاؤها تلقائيًا عند إلغاء تثبيت الـ App (before_uninstall).
    تقوم بحذف الـ Workflow إذا كان موجودًا.
    """
    workflow_name = WORKFLOW_DATA["name"]

    if not frappe.db.exists("Workflow", workflow_name):
        frappe.logger().info(
            f"Workflow '{workflow_name}' not found. Nothing to delete."
        )
        return

    try:
        # ضروري نعمل deactivate الأول عشان نقدر نحذفه بأمان
        frappe.db.set_value("Workflow", workflow_name, "is_active", 0)

        frappe.delete_doc(
            "Workflow",
            workflow_name,
            ignore_permissions=True,
            force=True,
        )
        frappe.db.commit()

        frappe.logger().info(f"Workflow '{workflow_name}' deleted successfully.")

    except Exception as e:
        frappe.logger().error(f"Failed to delete Workflow '{workflow_name}': {str(e)}")
        raise
