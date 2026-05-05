import frappe
from frappe import _


@frappe.whitelist()
def get_price_lists():
    return frappe.get_all(
        "Price List",
        filters={"selling": 1, "enabled": 1},
        fields=["name"],
        order_by="name asc"
    )

@frappe.whitelist()
def get_warehouses():
    return frappe.get_all(
        "Warehouse",
        filters={"is_group": 0, "disabled": 0},
        fields=["name"],
        order_by="name asc"
    )

@frappe.whitelist()
def get_default_company():
    """Return the default company for the current user"""
    company = frappe.defaults.get_user_default("Company")
    if not company:
        company = frappe.db.get_single_value("Global Defaults", "default_company")
    return company


@frappe.whitelist()
def get_beginning_cash_balance(filters):
    """
    Return cash & bank balance at the beginning of the selected period
    """
    import json
    if isinstance(filters, str):
        filters = json.loads(filters)

    filters = frappe._dict(filters)

    # Determine the start date
    if filters.filter_based_on == "Fiscal Year":
        from_date = frappe.db.get_value(
            "Fiscal Year", filters.from_fiscal_year, "year_start_date"
        )
    else:
        from_date = filters.from_date

    if not from_date:
        return {"beginning_balance": 0}

    # Get all cash/bank accounts for the company
    cash_bank_accounts = frappe.get_all(
        "Account",
        filters={
            "company": filters.company,
            "account_type": ["in", ["Cash", "Bank"]],
            "is_group": 0,
        },
        pluck="name",
    )

    if not cash_bank_accounts:
        return {"beginning_balance": 0}

    # Sum all GL entries BEFORE the from_date for these accounts
    result = frappe.db.sql("""
        SELECT
            SUM(debit - credit) as balance
        FROM `tabGL Entry`
        WHERE
            account IN %(accounts)s
            AND posting_date < %(from_date)s
            AND is_cancelled = 0
            {company_filter}
    """.format(
        company_filter="AND company = %(company)s" if filters.company else ""
    ), {
        "accounts": cash_bank_accounts,
        "from_date": from_date,
        "company": filters.company,
    })

    beginning_balance = result[0][0] or 0 if result else 0
    return {"beginning_balance": beginning_balance}


@frappe.whitelist()
def get_cash_flow_report(filters):
    """
    Return cash flow statement split into:
    - operating activities
    - investing activities
    - financing activities
    """
    import json
    if isinstance(filters, str):
        filters = json.loads(filters)

    filters = frappe._dict(filters)

    # Determine date range
    if filters.filter_based_on == "Fiscal Year":
        from_date, to_date = frappe.db.get_value(
            "Fiscal Year",
            filters.from_fiscal_year,
            ["year_start_date", "year_end_date"],
        )
        # If to_fiscal_year is different, get its end date
        if filters.to_fiscal_year and filters.to_fiscal_year != filters.from_fiscal_year:
            to_date = frappe.db.get_value(
                "Fiscal Year", filters.to_fiscal_year, "year_end_date"
            )
    else:
        from_date = filters.from_date
        to_date   = filters.to_date

    if not from_date or not to_date:
        return {"operating": [], "investing": [], "financing": []}

    company_filter = "AND gle.company = %(company)s" if filters.company else ""

    # ── Helper: get net movement per account root / type ────────────
    def get_account_movements(account_types):
        rows = frappe.db.sql("""
            SELECT
                acc.name            AS account,
                acc.account_name,
                acc.account_type,
                acc.root_type,
                SUM(gle.debit - gle.credit) AS net_amount
            FROM `tabGL Entry` gle
            JOIN `tabAccount` acc ON acc.name = gle.account
            WHERE
                gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
                AND gle.is_cancelled = 0
                AND acc.account_type IN %(account_types)s
                AND acc.is_group = 0
                {company_filter}
            GROUP BY acc.name, acc.account_name, acc.account_type, acc.root_type
            HAVING SUM(gle.debit - gle.credit) != 0
            ORDER BY acc.account_type, acc.account_name
        """.format(company_filter=company_filter), {
            "from_date": from_date,
            "to_date": to_date,
            "account_types": account_types,
            "company": filters.company,
        }, as_dict=1)
        return rows

    # ── 1. Operating Activities ──────────────────────────────────────
    # Income/Expense accounts + Receivable/Payable movements
    operating_raw = frappe.db.sql("""
        SELECT
            acc.account_name        AS name,
            acc.root_type,
            acc.account_type,
            SUM(gle.debit - gle.credit) AS net_amount
        FROM `tabGL Entry` gle
        JOIN `tabAccount` acc ON acc.name = gle.account
        WHERE
            gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
            AND gle.is_cancelled = 0
            AND acc.root_type IN ('Income', 'Expense')
            AND acc.is_group = 0
            {company_filter}
        GROUP BY acc.name, acc.account_name, acc.root_type, acc.account_type
        HAVING SUM(gle.debit - gle.credit) != 0
        ORDER BY acc.root_type, acc.account_name
    """.format(company_filter=company_filter), {
        "from_date": from_date,
        "to_date": to_date,
        "company": filters.company,
    }, as_dict=1)

    # Working capital changes (receivable / payable)
    working_capital_raw = get_account_movements(
        ("Receivable", "Payable", "Stock", "Tax")
    )

    operating = []
    for row in operating_raw:
        # Income: credit is positive cash → negate net_amount
        # Expense: debit is cash outflow → negate
        amount = -(row.net_amount or 0) if row.root_type == "Income" else -(row.net_amount or 0)
        if row.root_type == "Income":
            amount = abs(row.net_amount or 0)
        else:
            amount = -(abs(row.net_amount or 0))

        operating.append({
            "name": row.name,
            "description": row.account_type,
            "amount": amount,
        })

    for row in working_capital_raw:
        operating.append({
            "name": row.account_name,
            "description": f"Working Capital — {row.account_type}",
            "amount": -(row.net_amount or 0),
        })

    # ── 2. Investing Activities ──────────────────────────────────────
    investing_raw = get_account_movements(
        ("Fixed Asset", "Investments", "Capital Work in Progress")
    )

    investing = [
        {
            "name": row.account_name,
            "description": row.account_type,
            "amount": -(row.net_amount or 0),
        }
        for row in investing_raw
    ]

    # ── 3. Financing Activities ──────────────────────────────────────
    financing_raw = get_account_movements(
        ("Equity", "Loans (Liabilities)", "Bank Overdraft")
    )

    financing = [
        {
            "name": row.account_name,
            "description": row.account_type,
            "amount": -(row.net_amount or 0),
        }
        for row in financing_raw
    ]

    return {
        "operating": operating,
        "investing": investing,
        "financing": financing,
        "from_date": str(from_date),
        "to_date":   str(to_date),
    }
@frappe.whitelist()
def load_companies():
    """
    Return list of companies accessible by current user
    """
    companies = frappe.get_list(
        "Company",
        fields=["name", "default_currency"],
        order_by="name"
    )
    return companies

@frappe.whitelist()
def load_fiscal_years():
    """
    Return list of fiscal years available in the system
    """
    fiscal_years = frappe.get_list(
        "Fiscal Year",
        fields=["name", "year_start_date", "year_end_date"],
        order_by="year_start_date desc"
    )
    return fiscal_years

@frappe.whitelist()
def load_closing_accounts(company):
    """
    Return closing accounts (Liability/Equity, not group, not frozen) for given company
    """
    accounts = frappe.get_list(
        "Account",
        filters=[
            ["company", "=", company],
            ["is_group", "=", "0"],
            ["freeze_account", "=", "No"],
            ["root_type", "in", ["Liability", "Equity"]],
        ],
        fields=["name", "account_name", "root_type", "account_currency"],
        order_by="root_type, account_name",
    )
    return accounts


@frappe.whitelist()
def get_sales_analytics(from_date, to_date, company=None):
    """
    Returns all data needed for the Sales Analytics dashboard:
    - key metrics (total sales, invoice count, avg invoice, growth rate)
    - daily sales
    - top products
    - sales by item group (category)
    - payment methods breakdown
    - customer stats
    """
    filters = {"docstatus": 1, "posting_date": ("between", [from_date, to_date])}
    if company:
        filters["company"] = company

    # ── 1. Key Metrics ──────────────────────────────────────────────
    invoices = frappe.get_all(
        "Sales Invoice",
        filters=filters,
        fields=["name", "base_net_total", "customer", "posting_date"],
    )

    total_sales = sum(inv.base_net_total or 0 for inv in invoices)
    invoice_count = len(invoices)
    avg_invoice = total_sales / invoice_count if invoice_count else 0

    # Growth: compare same period length before from_date
    from frappe.utils import date_diff, add_days
    period_days = date_diff(to_date, from_date)
    prev_from = add_days(from_date, -(period_days + 1))
    prev_to   = add_days(from_date, -1)

    prev_filters = {"docstatus": 1, "posting_date": ("between", [prev_from, prev_to])}
    if company:
        prev_filters["company"] = company

    prev_total = frappe.db.get_value(
        "Sales Invoice", prev_filters, "sum(base_net_total)"
    ) or 0

    growth_rate = 0
    if prev_total:
        growth_rate = round(((total_sales - prev_total) / prev_total) * 100, 1)

    # ── 2. Daily Sales ───────────────────────────────────────────────
    daily_raw = frappe.db.sql("""
        SELECT
            posting_date,
            SUM(base_net_total) as total
        FROM `tabSales Invoice`
        WHERE
            docstatus = 1
            AND posting_date BETWEEN %(from_date)s AND %(to_date)s
            {company_filter}
        GROUP BY posting_date
        ORDER BY posting_date
    """.format(
        company_filter="AND company = %(company)s" if company else ""
    ), {"from_date": from_date, "to_date": to_date, "company": company}, as_dict=1)

    daily_sales = [
        {
            "date": str(row.posting_date),
            "day": frappe.utils.getdate(row.posting_date).strftime("%a"),
            "value": row.total or 0,
        }
        for row in daily_raw
    ]

    # ── 3. Top Products ──────────────────────────────────────────────
    top_products_raw = frappe.db.sql("""
        SELECT
            sii.item_code,
            sii.item_name,
            SUM(sii.qty) as total_qty,
            SUM(sii.base_net_amount) as total_amount
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON si.name = sii.parent
        WHERE
            si.docstatus = 1
            AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
            {company_filter}
        GROUP BY sii.item_code, sii.item_name
        ORDER BY total_qty DESC
        LIMIT 8
    """.format(
        company_filter="AND si.company = %(company)s" if company else ""
    ), {"from_date": from_date, "to_date": to_date, "company": company}, as_dict=1)

    max_qty = top_products_raw[0].total_qty if top_products_raw else 1
    top_products = [
        {
            "item_code": row.item_code,
            "item_name": row.item_name,
            "quantity": row.total_qty or 0,
            "amount": row.total_amount or 0,
            "percentage": round((row.total_qty / max_qty) * 100) if max_qty else 0,
        }
        for row in top_products_raw
    ]

    # ── 4. Sales by Category (Item Group) ───────────────────────────
    categories_raw = frappe.db.sql("""
        SELECT
            sii.item_group,
            SUM(sii.base_net_amount) as total_amount
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON si.name = sii.parent
        WHERE
            si.docstatus = 1
            AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
            {company_filter}
        GROUP BY sii.item_group
        ORDER BY total_amount DESC
    """.format(
        company_filter="AND si.company = %(company)s" if company else ""
    ), {"from_date": from_date, "to_date": to_date, "company": company}, as_dict=1)

    sales_by_category = [
        {"name": row.item_group or "Uncategorized", "amount": row.total_amount or 0}
        for row in categories_raw
    ]

    # ── 5. Payment Methods ───────────────────────────────────────────
    payment_raw = frappe.db.sql("""
        SELECT
            sip.mode_of_payment,
            SUM(sip.amount) as total_amount
        FROM `tabSales Invoice Payment` sip
        JOIN `tabSales Invoice` si ON si.name = sip.parent
        WHERE
            si.docstatus = 1
            AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
            {company_filter}
        GROUP BY sip.mode_of_payment
        ORDER BY total_amount DESC
    """.format(
        company_filter="AND si.company = %(company)s" if company else ""
    ), {"from_date": from_date, "to_date": to_date, "company": company}, as_dict=1)

    payment_methods = [
        {"name": row.mode_of_payment, "amount": row.total_amount or 0}
        for row in payment_raw
    ]

    # ── 6. Customer Stats ────────────────────────────────────────────
    unique_customers = list({inv.customer for inv in invoices if inv.customer})
    total_customers = len(unique_customers)

    # New customers: first invoice ever is within the date range
    new_customers = frappe.db.sql("""
        SELECT COUNT(DISTINCT customer) as cnt
        FROM `tabSales Invoice`
        WHERE docstatus = 1
          AND customer IN (
              SELECT customer FROM `tabSales Invoice`
              WHERE docstatus = 1
              GROUP BY customer
              HAVING MIN(posting_date) BETWEEN %(from_date)s AND %(to_date)s
          )
          {company_filter}
    """.format(
        company_filter="AND company = %(company)s" if company else ""
    ), {"from_date": from_date, "to_date": to_date, "company": company})[0][0] or 0

    # Loyal: customers with more than 1 invoice in period
    loyal_customers = frappe.db.sql("""
        SELECT COUNT(*) as cnt FROM (
            SELECT customer
            FROM `tabSales Invoice`
            WHERE docstatus = 1
              AND posting_date BETWEEN %(from_date)s AND %(to_date)s
              {company_filter}
            GROUP BY customer
            HAVING COUNT(*) > 1
        ) t
    """.format(
        company_filter="AND company = %(company)s" if company else ""
    ), {"from_date": from_date, "to_date": to_date, "company": company})[0][0] or 0

    avg_order = total_sales / total_customers if total_customers else 0

    return {
        "metrics": {
            "total_sales": total_sales,
            "invoice_count": invoice_count,
            "avg_invoice": avg_invoice,
            "growth_rate": growth_rate,
            "prev_total": prev_total,
        },
        "daily_sales": daily_sales,
        "top_products": top_products,
        "sales_by_category": sales_by_category,
        "payment_methods": payment_methods,
        "customer_stats": {
            "total": total_customers,
            "new_this_period": int(new_customers),
            "loyal": int(loyal_customers),
            "avg_order": avg_order,
        },
    }
