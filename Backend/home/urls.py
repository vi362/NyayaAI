from django.urls import path
from . import views

urlpatterns = [
    # Home
    path("", views.home, name="home"),

    # AI
    path("encode/", views.encode, name="encode"),
    path("decode/", views.decode, name="decode"),

    # Bare Acts
    path("search/", views.search_database, name="search"),
    path("database/", views.database, name="database"),

    # PDFs
    path("pdfs/", views.pdf_list, name="pdf_list"),
    path("save_pdf/", views.save_pdf, name="save_pdf"),
    path(
        "pdfs/<int:pdf_id>/download/",
        views.download_pdf,
        name="download_pdf"
    ),

    # Cases
    path("case_save/", views.case_save, name="case_save"),
    path("case_list/", views.case_list, name="case_list"),
    path(
        "case_update/<int:case_id>/",
        views.case_update,
        name="case_update"
    ),
]