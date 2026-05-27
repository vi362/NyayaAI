from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Query,
    BNS,
    BNSS,
    BSA,
    IPC,
    CrPC,
    MVA,
    CPC,
    IEA,
    Document,
    Case
)


# ======================================
# Common Admin for Legal Sections
# ======================================
class LegalSectionAdmin(admin.ModelAdmin):
    list_display = (
        "section_id",
        "section_title",
        "short_description",
        "view_pdf",
        "created_at",
    )

    search_fields = (
        "section_id",
        "section_title",
        "description",
    )

    list_filter = ("created_at",)

    ordering = ("section_id",)

    list_per_page = 20

    readonly_fields = ("created_at",)

    fields = (
        "section_id",
        "section_title",
        "description",
        "pdf_file",
        "created_at",
    )

    # Short description preview
    def short_description(self, obj):
        if obj.description:
            return (
                obj.description[:50] + "..."
                if len(obj.description) > 50
                else obj.description
            )
        return "-"

    short_description.short_description = "Description"

    # View PDF button
    def view_pdf(self, obj):
        if obj.pdf_file:
            return format_html(
                '<a href="{}" target="_blank" '
                'style="color: green; font-weight: bold;">'
                '📄 View PDF</a>',
                obj.pdf_file.url
            )
        return "No PDF"

    view_pdf.short_description = "PDF"


# ======================================
# Register Legal Models
# ======================================
admin.site.register(BNS, LegalSectionAdmin)
admin.site.register(BNSS, LegalSectionAdmin)
admin.site.register(BSA, LegalSectionAdmin)
admin.site.register(IPC, LegalSectionAdmin)
admin.site.register(CrPC, LegalSectionAdmin)
admin.site.register(MVA, LegalSectionAdmin)
admin.site.register(CPC, LegalSectionAdmin)
admin.site.register(IEA, LegalSectionAdmin)


# ======================================
# Document Admin
# ======================================
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "view_file")

    search_fields = ("title",)

    def view_file(self, obj):
        if obj.file:
            return format_html(
                '<a href="{}" target="_blank">📂 Open</a>',
                obj.file.url
            )
        return "No File"

    view_file.short_description = "File"


# ======================================
# Case Admin
# ======================================
@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = (
        "caseHeading",
        "applicableArticle",
        "status",
        "short_query",
    )

    search_fields = (
        "caseHeading",
        "applicableArticle",
        "query",
        "description",
    )

    list_filter = ("status",)

    ordering = ("caseHeading",)

    list_per_page = 20

    def short_query(self, obj):
        return (
            obj.query[:50] + "..."
            if len(obj.query) > 50
            else obj.query
        )

    short_query.short_description = "Query"


# ======================================
# Query Admin
# ======================================
@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = (
        "short_query",
        "short_response",
        "created_at",
    )

    search_fields = (
        "query",
        "response",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = ("-created_at",)

    list_filter = ("created_at",)

    def short_query(self, obj):
        return (
            obj.query[:50] + "..."
            if len(obj.query) > 50
            else obj.query
        )

    short_query.short_description = "Query"

    def short_response(self, obj):
        return (
            obj.response[:50] + "..."
            if len(obj.response) > 50
            else obj.response
        )

    short_response.short_description = "Response"


# ======================================
# Admin Site Customization
# ======================================
admin.site.site_header = "Nyaya AI Admin"
admin.site.site_title = "Nyaya AI Portal"
admin.site.index_title = "Welcome to Nyaya AI Dashboard"