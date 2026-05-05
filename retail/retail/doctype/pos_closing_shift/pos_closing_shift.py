# Copyright (c) 2026, Ahmed Abu-khatwa and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt
from retail.retail.api.posapp import get_draft_invoices, get_sales_invoice_child_table
from frappe.utils import format_time, datetime, get_datetime
class POSClosingShift(Document):
    def validate(self):
        user = frappe.get_all(
            "POS Closing Shift",
            filters={
                "user": self.user,
                "docstatus": 1,
                "pos_opening_shift": self.pos_opening_shift,
                "name": ["!=", self.name],
            },
        )

        if user:
            frappe.throw(
                _(
                    "POS Closing Shift {} against {} between selected period".format(
                        frappe.bold("already exists"), frappe.bold(self.user)
                    )
                ),
                title=_("Invalid Period"),
            )

        if (
            frappe.db.get_value("POS Opening Shift", self.pos_opening_shift, "status")
            != "Open"
        ):
            frappe.throw(
                _("Selected POS Opening Shift should be open."),
                title=_("Invalid Opening Entry"),
            )
        if (
            frappe.db.get_value("POS Opening Shift", self.pos_opening_shift, "status")
            == "Open"
        ):
            if not frappe.get_value("POS Profile", self.pos_profile, "custom_allow_close_shift_with_draft_invoice"):
                if get_draft_invoices(self.pos_opening_shift):
                    frappe.throw(
                    _("You should Close your Draft invoice."),
                    title=_("Invoice Draft"),
                )
        self.update_payment_reconciliation()

    def update_payment_reconciliation(self):
        # update the difference values in Payment Reconciliation child table
        # get default precision for site
        precision = (
            frappe.get_cached_value("System Settings", None, "currency_precision") or 3
        )
        for d in self.payment_reconciliation:
            d.difference = +flt(d.closing_amount, precision) - flt(
                d.expected_amount, precision
            )

    def on_submit(self):
        opening_entry = frappe.get_doc("POS Opening Shift", self.pos_opening_shift)
        opening_entry.pos_closing_shift = self.name
        opening_entry.set_status()
        self.delete_draft_invoices()
        opening_entry.save()

    def delete_draft_invoices(self):
        if frappe.get_value("POS Profile", self.pos_profile, "posa_allow_delete"):
            data = frappe.db.sql(
                """
                select
                    name
                from
                    `tabSales Invoice`
                where
                    docstatus = 0 and posa_is_printed = 0 and posa_pos_opening_shift = %s
                """,
                (self.pos_opening_shift),
                as_dict=1,
            )

            for invoice in data:
                frappe.delete_doc("Sales Invoice", invoice.name, force=1)

    @frappe.whitelist()
    def get_payment_reconciliation_details(self):
        currency = frappe.get_cached_value("Company", self.company, "default_currency")
        print("\n\npayment_reconciliation is",self.payment_reconciliation)
        return frappe.render_template(
            "retail/retail/doctype/pos_closing_shift/closing_shift_details.html",
            {"data": self, "currency": currency},
        )


@frappe.whitelist()
def get_cashiers(doctype, txt, searchfield, start, page_len, filters):
    cashiers_list = frappe.get_all("POS Profile User", filters=filters, fields=["user"])
    return [c["user"] for c in cashiers_list]


@frappe.whitelist()
def get_pos_invoices(pos_opening_shift):
    submit_printed_invoices(pos_opening_shift)
    data = frappe.db.sql(
        """
	select
		name
	from
		`tabSales Invoice`
	where
		docstatus = 1 and posa_pos_opening_shift = %s
	""",
        (pos_opening_shift),
        as_dict=1,
    )

    data = [frappe.get_doc("Sales Invoice", d.name).as_dict() for d in data]

    return data

@frappe.whitelist()
def get_all_pos_invoices(**kwargs):
    filters = {"docstatus": 1, "is_pos": 1}
    if kwargs.get("pos_opening_shift"):
        filters["posa_pos_opening_shift"] = kwargs["pos_opening_shift"]

    invoices = frappe.get_all(
        "Sales Invoice",
        filters=filters,
        fields=["name", "owner","customer", "grand_total", "posting_date", "posting_time", "status", "posa_pos_opening_shift"],
        order_by="posting_date desc"
    )

    for inv in invoices:
        items = frappe.get_all(
            "Sales Invoice Item",
            filters={"parent": inv["name"]},
            fields=["*"]
        )
        inv["items_count"] = len(items)
        inv["items"] = items
        inv["total_qty"] = sum(i["qty"] for i in items)

    total = sum(i.get("grand_total", 0) for i in invoices)
    count = len(invoices)
    return {
        "count": count,
        "total": total,
        "invoices": invoices
    }

@frappe.whitelist()
def get_payments_entries(pos_opening_shift):
    return frappe.get_all(
        "Payment Entry",
        filters={
            "docstatus": 1,
            "reference_no": pos_opening_shift,
            "payment_type": "Receive",
        },
        fields=[
            "name",
            "mode_of_payment",
            "paid_amount",
            "reference_no",
            "posting_date",
            "party",
        ],
    )


@frappe.whitelist()
def make_closing_shift_from_opening(opening_shift):
    opening_shift = json.loads(opening_shift)
    print("\n" + "="*80)
    print("DEBUG: OPENING SHIFT DATA")
    print("="*80)
    print(f"Opening Shift Name: {opening_shift.get('name')}")
    print(f"closingBalance: {opening_shift.get('closingBalance')}")
    print(f"closing_details: {opening_shift.get('closing_details')}")
    print(f"balance_details: {opening_shift.get('balance_details')}")
    print("="*80)

    closing_balance = opening_shift.get("closingBalance")
    if closing_balance is None:
        closing_balance = 0
    try:
        closing_balance = flt(closing_balance)
    except:
        closing_balance = 0

    submit_printed_invoices(opening_shift.get("name"))

    closing_shift = frappe.new_doc("POS Closing Shift")
    closing_shift.pos_opening_shift = opening_shift.get("name")
    closing_shift.period_start_date = opening_shift.get("period_start_date")
    closing_shift.period_end_date = frappe.utils.get_datetime()
    closing_shift.pos_profile = opening_shift.get("pos_profile")
    closing_shift.user = opening_shift.get("user")
    closing_shift.company = opening_shift.get("company")
    closing_shift.grand_total = 0
    closing_shift.net_total = 0
    closing_shift.total_quantity = 0

    invoices = get_pos_invoices(opening_shift.get("name"))

    pos_transactions = []
    taxes = []
    payments = []
    pos_payments_table = []
    for detail in opening_shift.get("balance_details"):
        payments.append(
            frappe._dict(
                {
                    "mode_of_payment": detail.get("mode_of_payment"),
                    "opening_amount": detail.get("amount") or 0,
                    "expected_amount": 0,
                    "closing_amount": 0,
                }
            )
        )

    for inv in invoices:
        print(f"  - {inv.name}: {inv.grand_total}, payments: {len(inv.payments)}")
        pos_transactions.append(
            frappe._dict(
                {
                    "sales_invoice": inv.name,
                    "posting_date": inv.posting_date,
                    "grand_total": inv.grand_total,
                    "customer": inv.customer,
                }
            )
        )
        closing_shift.grand_total += flt(inv.grand_total)
        closing_shift.net_total += flt(inv.net_total)
        closing_shift.total_quantity += flt(inv.total_qty)

        for t in inv.taxes:
            existing_tax = [
                tx
                for tx in taxes
                if tx.account_head == t.account_head and tx.rate == t.rate
            ]
            if existing_tax:
                existing_tax[0].amount += flt(t.tax_amount)
            else:
                taxes.append(
                    frappe._dict(
                        {
                            "account_head": t.account_head,
                            "rate": t.rate,
                            "amount": t.tax_amount,
                        }
                    )
                )

        for p in inv.payments:
            existing_pay = [
                pay for pay in payments if pay.mode_of_payment == p.mode_of_payment
            ]
            if existing_pay:
                if not hasattr(existing_pay[0], 'expected_amount'):
                    existing_pay[0].expected_amount = 0
                existing_pay[0].expected_amount += flt(p.amount)
            else:
                payments.append(
                    frappe._dict(
                        {
                            "mode_of_payment": py.mode_of_payment,
                            "expected_amount": flt(py.paid_amount),

                        }
                    )
                )

    pos_payments = get_payments_entries(opening_shift.get("name"))

    for py in pos_payments:
        pos_payments_table.append(
            frappe._dict(
                {
                    "payment_entry": py.name,
                    "mode_of_payment": py.mode_of_payment,
                    "paid_amount": py.paid_amount,
                    "posting_date": py.posting_date,
                    "customer": py.party,
                }
            )
        )
        existing_pay = [
            pay for pay in payments if pay.mode_of_payment == py.mode_of_payment
        ]
        if existing_pay:
            existing_pay[0].expected_amount += flt(py.paid_amount)
        else:
            payments.append(
                frappe._dict(
                    {
                        "mode_of_payment": py.mode_of_payment,
                        "expected_amount": flt(py.paid_amount),
                    }
                )
            )
    print("\nDEBUG: Final payments list:")
    for pay in payments:
        expected = getattr(pay, 'expected_amount', 0)
        print(f"  {pay.mode_of_payment}: opening={pay.opening_amount}, expected={expected}, closing={pay.closing_amount}")
    print("="*80 + "\n")
    closing_shift.set("pos_transactions", pos_transactions)
    closing_shift.set("payment_reconciliation", payments)
    closing_shift.set("taxes", taxes)
    closing_shift.set("pos_payments", pos_payments_table)


    opening_shift_doc = frappe.get_doc("POS Opening Shift", opening_shift.get("name"))
    closing_shift.save()
    opening_shift_doc.db_set("status", "Closed")
    opening_shift_doc.db_set("pos_closing_shift", closing_shift.name)
    print('\n pos_closing_shift Name ====> ',closing_shift.as_dict())
    frappe.db.commit()
    return closing_shift


@frappe.whitelist()
def submit_closing_shift(closing_shift):
    closing_shift = json.loads(closing_shift)
    closing_shift_doc = frappe.get_doc(closing_shift)
    closing_shift_doc.flags.ignore_permissions = True
    closing_shift_doc.save()
    closing_shift_doc.submit()
    return closing_shift_doc.name


def submit_printed_invoices(pos_opening_shift):
    invoices_list = frappe.get_all(
        "Sales Invoice",
        filters={
            "posa_pos_opening_shift": pos_opening_shift,
            "docstatus": 0,
            "posa_is_printed": 1,
        },
    )
    for invoice in invoices_list:
        invoice_doc = frappe.get_doc("Sales Invoice", invoice.name)
        invoice_doc.submit()

@frappe.whitelist()
def get_shift_summary(pos_opening_shift_name):

    if isinstance(pos_opening_shift_name, str):
            try:
                parsed = json.loads(pos_opening_shift_name)
                if isinstance(parsed, dict) and parsed.get("name"):
                    pos_opening_shift_name = parsed.get("name")
            except Exception:
                pass

    pos_opening_shift = frappe.get_doc("POS Opening Shift", pos_opening_shift_name).as_dict()
    submit_printed_invoices(pos_opening_shift.get("name"))

    invoices = get_pos_invoices(pos_opening_shift.get("name"))
    pos_payments = get_payments_entries(pos_opening_shift.get("name"))

    taxes = []
    payments = []
    pos_transactions = []
    pos_payments_table = []

    # balance_details ممكن تكون None لو الشيفت لسه مفتوح جديد
    for detail in (pos_opening_shift.get("balance_details") or []):
        payments.append(
            frappe._dict({
                "mode_of_payment": detail.get("mode_of_payment"),
                "opening_amount": detail.get("amount") or 0,
                "expected_amount": detail.get("amount") or 0,
                "closing_amount": 0,
            })
        )

    total_sales = 0
    total_qty = 0
    net_total = 0

    for d in invoices:
        total_sales += flt(d.grand_total)
        total_qty += flt(d.total_qty)
        net_total += flt(d.net_total)

        invoice_doc = frappe.get_doc("Sales Invoice", d.name)
        invoice_qty = sum(flt(it.qty) for it in (invoice_doc.items or []))
        # "posting_date": get_datetime(d.posting_date).strftime("%Y-%m-%d %H:%M:%S"),
        pos_transactions.append(frappe._dict({
            "sales_invoice": d.name,
            "posting_time": format_time(d.posting_time, "hh:mm a"),
            "posting_date": d.posting_date,
            "grand_total": d.grand_total,
            "customer": d.customer,
            "total_qty": invoice_qty,
            "Cashier": d.owner,
            "status": d.status
        }))

        # 🔸 الضرائب
        for t in d.taxes:
            existing_tax = [tx for tx in taxes if tx.account_head == t.account_head and tx.rate == t.rate]
            if existing_tax:
                existing_tax[0].amount += flt(t.tax_amount)
            else:
                taxes.append(frappe._dict({
                    "account_head": t.account_head,
                    "rate": t.rate,
                    "amount": t.tax_amount,
                }))

        # 🔸 المدفوعات (Sales Invoice Payments)
        for p in d.payments:
            existing_pay = [pay for pay in payments if pay.mode_of_payment == p.mode_of_payment]
            if existing_pay:
                existing_pay[0].expected_amount += flt(p.amount)
            else:
                payments.append(frappe._dict({
                    "mode_of_payment": p.mode_of_payment,
                    "opening_amount": 0,
                    "expected_amount": p.amount,
                }))

    # 🔹 مدفوعات Payment Entry
    for py in pos_payments:
        pos_payments_table.append(frappe._dict({
            "payment_entry": py.name,
            "mode_of_payment": py.mode_of_payment,
            "paid_amount": py.paid_amount,
            "posting_date": py.posting_date,
            "customer": py.party,
        }))

        existing_pay = [pay for pay in payments if pay.mode_of_payment == py.mode_of_payment]
        if existing_pay:
            existing_pay[0].expected_amount += flt(py.paid_amount)
        else:
            payments.append(frappe._dict({
                "mode_of_payment": py.mode_of_payment,
                "opening_amount": 0,
                "expected_amount": py.paid_amount,
            }))

    # ✅ النتيجة النهائية
    return {
        "total_sales": total_sales,
        "net_total": net_total,
        "total_quantity": total_qty,
        "transactions": pos_transactions,
        "taxes": taxes,
        "payments": payments,
        "pos_payments": pos_payments_table
    }
