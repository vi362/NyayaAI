from pathlib import Path
from django.http import JsonResponse
from django.shortcuts import render, HttpResponse
import os
from dotenv import load_dotenv
from django.http import JsonResponse, FileResponse

from .models import Query, BNS, BNSS, BSA, IPC, CrPC, MVA, CPC, IEA, Document, Case
from home.webscrap import WebScrapping
import json
import re
import csv
from django.views.decorators.csrf import csrf_exempt
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import string
from nltk.stem import PorterStemmer
from home.gemini import generate_legal_response
from decouple import config
#load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# Create your views here.
def home(request):
    return HttpResponse("Hello Developer...")

ACT_MODELS = {
    "bns": BNS,
    "bnss": BNSS,
    "bsa": BSA,
    "ipc": IPC,
    "crpc": CrPC,
    "iea": IEA,
    "cpc": CPC,
    "mva": MVA,
}

LEGAL_CATEGORIES = {

    # ==========================
    # CRIMES
    # ==========================
    "crime": [
        "murder", "kill", "homicide",
        "culpable homicide", "attempt to murder",
        "theft", "steal", "stolen",
        "robbery", "rob", "loot",
        "dacoity", "kidnap", "abduction",
        "rape", "sexual assault",
        "molestation", "harassment",
        "domestic violence",
        "dowry", "dowry death",
        "acid attack",
        "criminal intimidation",
        "threat", "blackmail",
        "cheating", "fraud", "forgery",
        "extortion", "bribery",
        "corruption", "assault",
        "hurt", "grievous hurt",
        "cybercrime", "cyber fraud",
        "hacking", "identity theft",
        "stalking", "cyber bullying",
        "money laundering",
        "terrorism", "smuggling",
        "drug trafficking",
        "human trafficking",
        "child abuse",
        "juvenile crime",
        "fake documents",
        "fake certificate",
        "property damage",
        "vandalism", "trespassing"
    ],

    # ==========================
    # CONSTITUTION
    # ==========================
    "constitution": [
        "constitution",
        "constitutional law",
        "constitution of india",
        "article",
        "constitutional article",
        "fundamental rights",
        "fundamental duties",
        "directive principles",
        "directive principles of state policy",
        "dpsp",
        "amendment",
        "constitutional amendment",
        "preamble",
        "citizenship",
        "union government",
        "state government",
        "federal structure",
        "emergency provisions",
        "president rule",
        "parliament",
        "lok sabha",
        "rajya sabha"
    ],

    # ==========================
    # FUNDAMENTAL RIGHTS
    # ==========================
    "fundamental_rights": [
        "right to equality",
        "right to freedom",
        "right against exploitation",
        "right to religion",
        "cultural rights",
        "educational rights",
        "constitutional remedies",
        "article 14",
        "article 15",
        "article 16",
        "article 17",
        "article 18",
        "article 19",
        "article 20",
        "article 21",
        "article 21a",
        "article 22",
        "article 23",
        "article 24",
        "article 25",
        "article 26",
        "article 27",
        "article 28",
        "article 29",
        "article 30",
        "article 32"
    ],

    # ==========================
    # FUNDAMENTAL DUTIES
    # ==========================
    "fundamental_duties": [
        "fundamental duties",
        "citizen duties",
        "article 51a",
        "national duty",
        "constitutional duty"
    ],

    # ==========================
    # JUDICIARY
    # ==========================
    "judiciary": [
        "judiciary",
        "court",
        "judge",
        "justice",
        "supreme court",
        "high court",
        "district court",
        "session court",
        "tribunal",
        "judgment",
        "appeal",
        "review petition",
        "curative petition",
        "bench",
        "writ petition",
        "pil",
        "public interest litigation",
        "case hearing",
        "judicial review"
    ],

    # ==========================
    # LEGAL PROCESS
    # ==========================
    "legal_process": [
        "fir",
        "police complaint",
        "complaint",
        "arrest",
        "warrant",
        "summons",
        "bail",
        "anticipatory bail",
        "custody",
        "charge sheet",
        "investigation",
        "evidence",
        "cross examination",
        "trial",
        "legal notice",
        "mediation",
        "arbitration",
        "settlement",
        "appeal process",
        "criminal case",
        "civil case"
    ],

    # ==========================
    # IPC / BNS / CRPC
    # ==========================
    "criminal_law": [
        "ipc",
        "indian penal code",
        "bns",
        "bharatiya nyaya sanhita",
        "crpc",
        "bharatiya nagarik suraksha sanhita",
        "criminal procedure",
        "punishment",
        "criminal offence",
        "criminal law"
    ],

    # ==========================
    # CIVIL LAW
    # ==========================
    "civil_law": [
        "civil dispute",
        "property dispute",
        "land dispute",
        "ownership",
        "partition suit",
        "agreement",
        "contract",
        "breach of contract",
        "compensation",
        "damages"
    ],

    # ==========================
    # PROPERTY LAW
    # ==========================
    "property_law": [
        "property",
        "land",
        "inheritance",
        "succession",
        "will",
        "gift deed",
        "sale deed",
        "encroachment",
        "tenant",
        "rent",
        "eviction",
        "landlord"
    ],

    # ==========================
    # FAMILY LAW
    # ==========================
    "family_law": [
        "marriage",
        "divorce",
        "maintenance",
        "alimony",
        "child custody",
        "domestic violence",
        "adoption",
        "guardianship",
        "muslim law",
        "hindu marriage act"
    ],

    # ==========================
    # WOMEN LAW
    # ==========================
    "women_rights": [
        "sexual harassment",
        "dowry",
        "domestic violence",
        "rape law",
        "workplace harassment",
        "maternity benefits",
        "women rights"
    ],

    # ==========================
    # CHILD LAW
    # ==========================
    "child_law": [
        "child labour",
        "juvenile justice",
        "minor rights",
        "child abuse",
        "pocso",
        "adoption"
    ],

    # ==========================
    # CYBER LAW
    # ==========================
    "cyber_law": [
        "cyber crime",
        "online fraud",
        "upi fraud",
        "bank fraud",
        "hacking",
        "phishing",
        "otp scam",
        "fake website",
        "cyber bullying",
        "identity theft"
    ],

    # ==========================
    # TRAFFIC LAW
    # ==========================
    "traffic_law": [
        "traffic rule",
        "challan",
        "helmet rule",
        "drunk driving",
        "license",
        "driving licence",
        "speeding",
        "road accident",
        "motor vehicle act"
    ],

    # ==========================
    # CONSUMER LAW
    # ==========================
    "consumer_law": [
        "consumer rights",
        "refund",
        "defective product",
        "consumer complaint",
        "consumer court",
        "online scam"
    ],

    # ==========================
    # LABOUR LAW
    # ==========================
    "labour_law": [
        "salary issue",
        "employment",
        "termination",
        "workplace rights",
        "employee rights",
        "minimum wage",
        "pf",
        "esi",
        "labour dispute"
    ],

    # ==========================
    # TAX LAW
    # ==========================
    "tax_law": [
        "income tax",
        "gst",
        "tax fraud",
        "tds",
        "tax return",
        "tax evasion"
    ],

    # ==========================
    # ENVIRONMENT LAW
    # ==========================
    "environment_law": [
        "pollution",
        "forest law",
        "environment protection",
        "wildlife protection",
        "environment act"
    ],

    # ==========================
    # HUMAN RIGHTS
    # ==========================
    "human_rights": [
        "human rights",
        "nhrc",
        "rights violation",
        "custodial torture",
        "freedom"
    ]
}

def detect_legal_category(query):

    query_lower = query.lower()

    detected_categories = []

    for category, keywords in LEGAL_CATEGORIES.items():

        for keyword in keywords:

            if keyword.lower() in query_lower:

                detected_categories.append(
                    category
                )

                break

    return detected_categories


# Download required NLTK data
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize


@csrf_exempt
def encode(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    try:
        # Parse request
        data = json.loads(request.body)
        query = data.get("query", "").strip()

        if not query:
            return JsonResponse(
                {"error": "Query is required"},
                status=400
            )

        # Detect legal categories
        categories = detect_legal_category(query)
        print("Detected categories:", categories)

        # Crime dictionary
        crime_code_dic = {
            "murder": 0,
            "culpable homicide": 1,
            "decoity": 2,
            "kidnap": 3,
            "robberi": 4,
            "briberi": 5,
            "theft": 6,
            "alcohol": 7,
            "criminal intimidation": 8
        }

        acts = {
            "murder": ["300", "302"],
            "culpable homicide": ["299", "304"],
            "decoity": ["391", "395"],
            "kidnap": ["359", "363"],
            "robberi": ["390", "392"],
            "briberi": ["171B", "171E"],
            "theft": ["378", "379"],
            "alcohol": ["510"],
            "criminal intimidation": ["503", "506"],
        }

        # NLP processing
        tokens = word_tokenize(query)

        stop_words = set(stopwords.words("english"))

        filtered_tokens = [
            token.lower()
            for token in tokens
            if token.lower() not in stop_words
        ]

        refined_tokens = [
            token
            for token in filtered_tokens
            if token not in string.punctuation
        ]

        final_tokens = [
            token
            for token in refined_tokens
            if token.isalnum()
        ]

        # Stemming
        stemmer = PorterStemmer()

        stemmed_tokens = [
            stemmer.stem(token)
            for token in final_tokens
        ]

        # Lemmatization
        lemmatizer = WordNetLemmatizer()

        lemmatized_tokens = [
            lemmatizer.lemmatize(token)
            for token in stemmed_tokens
        ]

        # Token mapping
        for i in range(len(lemmatized_tokens)):
            if lemmatized_tokens[i] == "kill":
                lemmatized_tokens[i] = "murder"

            elif lemmatized_tokens[i] == "drunk":
                lemmatized_tokens[i] = "alcohol"

            elif lemmatized_tokens[i] == "bribe":
                lemmatized_tokens[i] = "briberi"

        # Generate crime code
        crime_code = ""
        detected_crimes = []

        for token in lemmatized_tokens:
            if token in crime_code_dic:
                crime_code += str(crime_code_dic[token])
                detected_crimes.append(token)

        print("Detected Crimes:", detected_crimes)
        print("Crime Code:", crime_code)

        # Decode legal details
        decoded_legal_data = decode(
            request=None,
            crime_code=crime_code
        )

        print(
            "Decoded Legal Data:",
            decoded_legal_data
        )

        # Find sections
        act_sections = []

        for code in crime_code:
            index = int(code)

            crime = list(
                crime_code_dic.keys()
            )[index]

            sections = acts.get(
                crime,
                []
            )

            act_sections.extend(sections)

        # Get section details
        legal_sections = {}

        for section_id in act_sections:
            ipc_record = IPC.objects.filter(
                section_id=section_id
            ).first()

            if ipc_record:
                legal_sections[
                    section_id
                ] = ipc_record.description

        # Category-based laws
        if "constitution" in categories:
            legal_sections["Constitution"] = (
                "Indian Constitution, Articles, Rights and Duties"
            )

        if "judiciary" in categories:
            legal_sections["Judiciary"] = (
                "Supreme Court, High Court, District Court and Judicial System"
            )

        if "legal_process" in categories:
            legal_sections["Legal Process"] = (
                "FIR, Bail, Arrest, Trial and Legal Procedures"
            )

        if "cyber_law" in categories:
            legal_sections["Cyber Law"] = (
                "Cyber Crime, Online Fraud, IT Act"
            )

        if "consumer_law" in categories:
            legal_sections["Consumer Rights"] = (
                "Consumer Protection Act and Complaint Process"
            )

        if "women_rights" in categories:
            legal_sections["Women Rights"] = (
                "Domestic Violence, Dowry and Women Protection Laws"
            )

        # Gemini context
        context = f'''
        User Query:
        {query}

        Detected Categories:
        {categories}

        Relevant Laws:
        {legal_sections}

        Decoded Legal Details:
        {decoded_legal_data}

        Explain clearly in simple legal language.

        Mention:
        1. Legal issue
        2. Relevant laws
        3. Punishment
        4. FIR process
        5. Rights
        6. Next legal steps
        '''

        ai_response = generate_legal_response(
            context,
            legal_sections
        )

        return JsonResponse({
            "response": ai_response,
            "acts": legal_sections,
            "categories": categories
        })

    except Exception as e:
        print("ENCODE ERROR:", str(e))

        return JsonResponse(
            {"error": str(e)},
            status=500
        )

@csrf_exempt
def decode(request, crime_code=None):

    try:

        # ==========================
        # Request Data
        # ==========================
        if request and request.method == "POST":
            data = json.loads(request.body)
            crime_code = data.get("crime_code", "")

            data = json.loads(
                request.body
            )

            crime_code = data.get(
                "crime_code",
                ""
            )

        if not crime_code:
            return {
                "error":
                "Crime code required"
            }

        # ==========================
        # Crime Mapping
        # ==========================
        crime_code_dic = {
            "murder": 0,
            "culpable homicide": 1,
            "decoity": 2,
            "kidnap": 3,
            "robberi": 4,
            "briberi": 5,
            "theft": 6,
            "alcohol": 7,
            "criminal intimidation": 8
        }

        acts = {

            "murder": {
                "sections":
                ["300", "302"],

                "punishment":
                "Death penalty or life imprisonment",

                "bailable":
                False,

                "court":
                "Sessions Court",

                "fir_required":
                True
            },

            "theft": {
                "sections":
                ["378", "379"],

                "punishment":
                "Up to 3 years imprisonment or fine",

                "bailable":
                True,

                "court":
                "Magistrate Court",

                "fir_required":
                True
            },

            "robberi": {
                "sections":
                ["390", "392"],

                "punishment":
                "Rigorous imprisonment",

                "bailable":
                False,

                "court":
                "Criminal Court",

                "fir_required":
                True
            },

            "kidnap": {
                "sections":
                ["359", "363"],

                "punishment":
                "Up to 7 years imprisonment",

                "bailable":
                False,

                "court":
                "Sessions Court",

                "fir_required":
                True
            },

            "criminal intimidation": {
                "sections":
                ["503", "506"],

                "punishment":
                "Imprisonment or fine",

                "bailable":
                True,

                "court":
                "Magistrate Court",

                "fir_required":
                True
            }
        }

        decoded_result = []

        for code in crime_code:

            index = int(code)

            crime = list(
                crime_code_dic.keys()
            )[index]

            crime_info = acts.get(
                crime,
                {}
            )

            section_details = []

            for section in crime_info.get(
                "sections",
                []
            ):

                ipc_record = (
                    IPC.objects.filter(
                        section_id=
                        section
                    ).first()
                )

                section_details.append({
                    "section":
                    section,

                    "description":
                    ipc_record.description
                    if ipc_record
                    else "No description found"
                })

            decoded_result.append({

                "crime":
                crime,

                "sections":
                section_details,

                "punishment":
                crime_info.get(
                    "punishment"
                ),

                "bailable":
                crime_info.get(
                    "bailable"
                ),

                "court":
                crime_info.get(
                    "court"
                ),

                "fir_required":
                crime_info.get(
                    "fir_required"
                )
            })

        # API response
        if request and request.method == "POST":
            return JsonResponse({
                "legal_details": decoded_result
            })

        # internal call
        return decoded_result

    except Exception as e:

        if request and request.method == "POST":
            return JsonResponse({
                "error": str(e)
            })

        return {
            "error": str(e)
        }

        
# Bare Acts
@csrf_exempt
def search_database(request):

    # ==========================
    # Browser Test
    # ==========================
    if request.method == "GET":
        return JsonResponse({
            "message":
            "Search API Working"
        })

    # ==========================
    # POST Request
    # ==========================
    if request.method == "POST":

        try:
            # Parse JSON
            data = json.loads(
                request.body
            )

            act = (
                data.get("act", "")
                .lower()
                .strip()
            )

            query = (
                data.get(
                    "query",
                    ""
                )
                .strip()
            )

            # ==========================
            # Validate Act
            # ==========================
            if not act:

                return JsonResponse(
                    {
                        "error":
                        "Please provide an act"
                    },
                    status=400
                )

            # ==========================
            # Get Model
            # ==========================
            model = (
                ACT_MODELS.get(
                    act
                )
            )

            if not model:

                return JsonResponse(
                    {
                        "error":
                        f"Invalid act '{act}'"
                    },
                    status=400
                )

            # ==========================
            # Return Full Act
            # ==========================
            if query == "":

                records = list(
                    model.objects.values()
                )

                return JsonResponse(
                    {
                        "response":
                        records,

                        "total":
                        len(records),

                        "act":
                        act.upper()
                    },
                    safe=False,
                    status=200
                )

            # ==========================
            # Exact Search
            # ==========================
            record = (
                model.objects.filter(
                    section_id=query
                ).first()

                or

                model.objects.filter(
                    section_title=
                    query
                ).first()
            )

            # ==========================
            # Smart Search
            # ==========================
            if not record:

                search_results = (
                    model.objects.filter(
                        section_title__icontains=
                        query
                    )[:10]
                )

                if search_results.exists():

                    response = []

                    for item in (
                        search_results
                    ):

                        response.append({

                            "section":
                            getattr(
                                item,
                                "section_id",
                                ""
                            ),

                            "title":
                            getattr(
                                item,
                                "section_title",
                                ""
                            ),

                            "description":
                            getattr(
                                item,
                                "description",
                                ""
                            )
                        })

                    return JsonResponse(
                        {
                            "matches":
                            response,

                            "total":
                            len(
                                response
                            )
                        },
                        status=200
                    )

                return JsonResponse(
                    {
                        "error":
                        "No matching record found."
                    },
                    status=404
                )

            # ==========================
            # Single Record Response
            # ==========================
            response = {

                "section":
                getattr(
                    record,
                    "section_id",
                    ""
                ),

                "title":
                getattr(
                    record,
                    "section_title",
                    ""
                ),

                "description":
                getattr(
                    record,
                    "description",
                    ""
                ),
            }

            return JsonResponse(
                {
                    "data":
                    response
                },
                status=200
            )

        except json.JSONDecodeError:

            return JsonResponse(
                {
                    "error":
                    "Invalid JSON format."
                },
                status=400
            )

        except Exception as e:

            print(
                "SEARCH ERROR:",
                str(e)
            )

            return JsonResponse(
                {
                    "error":
                    f"Internal server error: {str(e)}"
                },
                status=500
            )

    # ==========================
    # Invalid Method
    # ==========================
    return JsonResponse(
        {
            "error":
            "Invalid Request Method"
        },
        status=405
    )


def database(request):
    data_list = {}

    bns = BNS.objects.values()
    data_list['bns'] = list(bns)
    bnss = BNSS.objects.values()
    data_list['bnss'] = list(bnss)
    bsa = BSA.objects.values()
    data_list['bsa'] = list(bsa)
    ipc = IPC.objects.values()
    data_list['ipc'] = list(ipc)
    crpc = CrPC.objects.values()
    data_list['crpc'] = list(crpc)
    cpc = CPC.objects.values()
    data_list['cpc'] = list(cpc)
    mva = MVA.objects.values()
    data_list['mva'] = list(mva)
    iea = IEA.objects.values()
    data_list['iea'] = list(iea)

    return JsonResponse({"success": True,"data": data_list})


# PDFs
def save_pdf(request):
    """
    with open("", "rb") as pdf_file:
        binary_data = pdf_file.read()

    document = Document(act_name="",
                        description="",
                        pdf=binary_data)
    document.save()
    """
    return JsonResponse("saved", safe=False)


def pdf_list(request):
    documents = []

    for doc in Document.objects.all().order_by("id"):
        documents.append({
            "id": doc.id,
            "title": doc.title,
            "file": request.build_absolute_uri(doc.file.url)
            if doc.file else None
        })

    return JsonResponse({
        "success": True,
        "data": documents
    })

def download_pdf(request, pdf_id):
    try:
        # Fetch the PDF document by ID
        document = Document.objects.get(id=pdf_id)

        response = HttpResponse(document.pdf, content_type='application/pdf')

        # Add content-disposition header to indicate it's a file
        response['Content-Disposition'] = f'attachment; filename="{document.act_name}.pdf"'
        return response
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)


# Cases
@csrf_exempt
def case_save(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            case = Case.objects.create(
                caseHeading=data.get('caseHeading'),
                applicableArticle=data.get('applicableArticle'),  # Convert list to JSON
                tags=data.get('tags'),  # Convert list to JSON
                query=data.get('query'),
                status=data.get('status'),
                description=data.get('description')
            )
            return JsonResponse({"message": "Case saved successfully!", "case": {
                "id": case.id,
                "caseHeading": case.caseHeading,
                "applicableArticle": case.applicableArticle,
                "tags": case.tags,
                "query": case.query,
                "status": case.status,
                "description": case.description,
            }}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

def case_list(request):
    try:
        cases = Case.objects.all()
        cases_list = [
            {
                "id": case.id,
                "caseHeading": case.caseHeading,
                "applicableArticle": case.applicableArticle,
                "tags": case.tags,
                "query": case.query,
                "status": case.status,
                "description": case.description,
            }
            for case in cases
        ]
        return JsonResponse({"cases": cases_list}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def case_update(request, case_id):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed"},
            status=405
        )

    try:
        case = Case.objects.get(id=case_id)

        data = json.loads(request.body)

        # Update only changed fields
        case.caseHeading = data.get(
            "caseHeading",
            case.caseHeading
        )

        case.applicableArticle = data.get(
            "applicableArticle",
            case.applicableArticle
        )

        case.tags = data.get(
            "tags",
            case.tags
        )

        case.query = data.get(
            "query",
            case.query
        )

        case.status = data.get(
            "status",
            case.status
        )

        case.description = data.get(
            "description",
            case.description
        )

        case.save()

        return JsonResponse({
            "id": case.id,
            "caseHeading": case.caseHeading,
            "applicableArticle":
                case.applicableArticle,
            "tags": case.tags,
            "query": case.query,
            "status": case.status,
            "description":
                case.description,
            "message":
                "Case updated successfully!"
        }, status=200)

    except Case.DoesNotExist:
        return JsonResponse(
            {"error": "Case not found"},
            status=404
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=400
        )


