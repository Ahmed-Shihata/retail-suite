import frappe
import csv
import os
from frappe import translate

@frappe.whitelist(allow_guest=True)
def get_translations(lang="en"):
    lang = lang.lower().strip()

    if lang == "en":
        return {}

    app_path = frappe.get_app_path("retail")
    csv_path = os.path.join(app_path, "translations-retail", f"{lang}.csv")

    if not os.path.exists(csv_path):
        return {}

    messages = {}
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 2 and row[0] and row[1]:
                messages[row[0]] = row[1]

    translations = translate.get_all_translations(lang)
    translations.update(messages)
    return translations


def _get_user_language():
	user_lang = frappe.db.get_value("User", frappe.session.user, "language")
	return (user_lang or "en").lower()

@frappe.whitelist()
def set_user_language(lang):

    if user == "Guest":
        frappe.throw("Authentication Required", frappe.AuthenticationError)

    lang = lang.lower()
    if lang == _get_user_language():
        return
    if lang in ("en", "ar"):
        try:
            frappe.db.set_value("User", frappe.session.user, "language", lang)
            frapp.db.commit()
            return {
                "success": True,
                "message": "Language set successfully to {}".format(lang)}
        except frappe.DuplicateEntryError:
            frappe.throw("Language already set to {}".format(lang))
    else:
        frappe.throw("Invalid language")
