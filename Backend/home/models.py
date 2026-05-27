from django.db import models
from django.core.exceptions import ValidationError


# Validate description (max 50 words)
def validate_50_words(value):
    words = value.split()

    if len(words) > 50:
        raise ValidationError(
            f"Description cannot exceed 50 words. "
            f"({len(words)} words entered)"
        )


# ---------------- BNS ----------------
class BNS(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="bns_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "BNS"
        verbose_name_plural = "BNS"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- BNSS ----------------
class BNSS(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="bnss_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "BNSS"
        verbose_name_plural = "BNSS"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- BSA ----------------
class BSA(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="bsa_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "BSA"
        verbose_name_plural = "BSA"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- IPC ----------------
class IPC(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="ipc_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "IPC"
        verbose_name_plural = "IPC"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- CrPC ----------------
class CrPC(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="crpc_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "CrPC"
        verbose_name_plural = "CrPC"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- CPC ----------------
class CPC(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="cpc_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "CPC"
        verbose_name_plural = "CPC"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- IEA ----------------
class IEA(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="iea_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "IEA"
        verbose_name_plural = "IEA"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- MVA ----------------
class MVA(models.Model):
    section_id = models.CharField(max_length=50, unique=True)

    section_title = models.CharField(max_length=300)

    description = models.TextField(
        validators=[validate_50_words],
        help_text="Maximum 50 words only"
    )

    pdf_file = models.FileField(
        upload_to="mva_pdfs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "MVA"
        verbose_name_plural = "MVA"

    def __str__(self):
        return f"{self.section_id} - {self.section_title} - {self.description[:50]}"


# ---------------- Other Models ----------------
class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/', null=True, blank=True)

    def __str__(self):
        return self.title


class Case(models.Model):
    caseHeading = models.CharField(max_length=255)
    applicableArticle = models.CharField(max_length=255)
    tags = models.TextField()
    query = models.TextField()
    status = models.CharField(max_length=50)
    description = models.TextField()

    def __str__(self):
        return self.caseHeading


class Query(models.Model):
    query = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        verbose_name = "Query"
        verbose_name_plural = "Queries"

    def __str__(self):
        return self.query[:50]