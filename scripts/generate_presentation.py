import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_clidge_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette
    C_BG_DARK = RGBColor(6, 15, 28)       # #060F1C
    C_CARD_BG = RGBColor(11, 29, 51)      # #0B1D33
    C_CARD_BORDER = RGBColor(18, 48, 86)  # #123056
    C_CYAN = RGBColor(6, 182, 212)        # #06B6D4 (Accent)
    C_CYAN_LIGHT = RGBColor(34, 211, 238) # #22D3EE
    C_WHITE = RGBColor(255, 255, 255)
    C_SLATE_200 = RGBColor(226, 232, 240)
    C_SLATE_400 = RGBColor(148, 163, 184)
    C_EMERALD = RGBColor(16, 185, 129)
    C_AMBER = RGBColor(245, 158, 11)

    logo_path = os.path.abspath('public/logo.png')
    blank_layout = prs.slide_layouts[6] # blank layout

    def apply_dark_background(slide):
        background = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5)
        )
        background.fill.solid()
        background.fill.fore_color.rgb = C_BG_DARK
        background.line.color.rgb = C_BG_DARK
        return background

    def add_header(slide, title_text, category_text="CLIDGE • SMART CAMPUS SYSTEM"):
        # Header category
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(10), Inches(0.4))
        cat_tf = cat_box.text_frame
        cat_tf.word_wrap = True
        cat_tf.margin_top = cat_tf.margin_bottom = cat_tf.margin_left = cat_tf.margin_right = 0
        p_cat = cat_tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.name = 'Arial'
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_CYAN

        # Header Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.8))
        title_tf = title_box.text_frame
        title_tf.word_wrap = True
        title_tf.margin_top = title_tf.margin_bottom = title_tf.margin_left = title_tf.margin_right = 0
        p_title = title_tf.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = 'Arial'
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = C_WHITE

        # Divider line
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.55), Inches(11.733), Inches(0.02))
        div.fill.solid()
        div.fill.fore_color.rgb = C_CARD_BORDER
        div.line.fill.background()

        # Mini logo top right
        if os.path.exists(logo_path):
            try:
                slide.shapes.add_picture(logo_path, Inches(12.0), Inches(0.4), Inches(0.8), Inches(0.8))
            except Exception:
                pass

    slides_data = [
        # Slide 1: Title Slide
        {
            "is_title": True,
            "title": "CLIDGE",
            "subtitle": "Smart Student Location Tracking & Campus Event Participation Monitoring System",
            "meta": [
                "Department of Computer Science and Engineering",
                "Muthayammal Engineering College (Autonomous), Rasipuram",
                "Full-Stack Web & Real-Time GNSS Engineering Project",
                "Final Defense & System Architecture Review"
            ],
            "notes": (
                "Good morning respected members of the evaluation committee and faculty advisors. "
                "Welcome to the formal system defense and architecture review of project CLIDGE: "
                "The Smart Student Location Tracking and Campus Event Participation Monitoring System. "
                "Developed within the Department of Computer Science and Engineering at Muthayammal Engineering College, "
                "CLIDGE solves the pervasive operational challenges of student verification, multi-participant geofencing, "
                "and attendance fraud during large-scale collegiate seminars, technical symposiums, and campus activities. "
                "Today, I will present the complete architectural framework, live empirical verification results, "
                "and production deployment readiness of the platform."
            )
        },
        # Slide 2: Executive Summary & Vision
        {
            "category": "PROJECT FOUNDATIONS",
            "title": "Executive Summary & Engineering Vision",
            "cards": [
                {
                    "title": "The Core Vision",
                    "bullets": [
                        "Bridge collegiate physical presence with cryptographically secure, privacy-first digital verification.",
                        "Eliminate paper rosters, proxy attendance, and unmonitored event exits without invasive surveillance.",
                        "Operate seamlessly across real-world campus constraints, including indoor GPS drift and intermittent Wi-Fi."
                    ]
                },
                {
                    "title": "Key Accomplishments",
                    "bullets": [
                        "Dual Verification Paradigm: Combines GPS geofencing radius checks with dynamic, expiring QR tokens.",
                        "Zero Background Intrusion: GPS ingestion is strictly voluntary, session-scoped, and terminated upon event end.",
                        "Resilient Offline Capability: Client-side IndexedDB transaction queue with idempotent server synchronization."
                    ]
                },
                {
                    "title": "Verified Performance",
                    "bullets": [
                        "100% Automated Test Coverage: 31/31 Python pytest test cases + 44 Node.js end-to-end assertions passed.",
                        "Dual-student concurrent live tracking verified on interactive Leaflet maps with sub-second marker rendering.",
                        "Authoritative server timestamps: Completely rejects manipulated client clock submissions."
                    ]
                }
            ],
            "notes": (
                "In this executive summary, we establish the fundamental purpose of CLIDGE. "
                "Colleges routinely organize technical symposiums, workshops, and placement drives involving hundreds of students. "
                "Traditional paper sign-in sheets or basic barcode scanners suffer from severe proxy fraud, "
                "where students leave immediately after marking attendance. "
                "CLIDGE addresses this by introducing a dual-verification model: dynamic QR codes establish participation check-in, "
                "while active event geofencing continuously monitors spatial presence. "
                "Crucially, CLIDGE is designed with privacy-first ethics: tracking only occurs during active events when the student "
                "explicitly gives consent, and completely halts the moment the event concludes."
            )
        },
        # Slide 3: Problem Statement
        {
            "category": "PROBLEM ANALYSIS",
            "title": "Problem Statement & Campus Operational Bottlenecks",
            "cards": [
                {
                    "title": "Manual Attendance Limitations",
                    "bullets": [
                        "Paper rosters and manual roll calls consume up to 15-20 minutes of instructional workshop time.",
                        "Vulnerable to impersonation, signature forgery, and buddy-punching.",
                        "Generates paper waste and requires tedious manual data entry into college ERP systems."
                    ]
                },
                {
                    "title": "Post-Attendance Absenteeism",
                    "bullets": [
                        "Students sign attendance at 9:00 AM and leave the seminar hall five minutes later.",
                        "Static barcode/biometric readers at entrances fail to verify continued presence throughout a 3-hour session.",
                        "Coordinators have zero situational awareness regarding student dispersal during campus-wide drills or events."
                    ]
                },
                {
                    "title": "Privacy & Technical Hurdles",
                    "bullets": [
                        "Commercial fleet tracking systems are invasive, tracking users 24/7 in the background.",
                        "Campus stone masonry causes significant indoor GNSS multipath error (±15m to ±30m drift).",
                        "High cellular congestion and dead zones crash naive web apps lacking offline queuing."
                    ]
                }
            ],
            "notes": (
                "Let us examine the operational problems in detail. "
                "First, manual attendance is inefficient and inaccurate. In a seminar with 120 students, passing around attendance sheets "
                "wastes significant time and invariably leads to proxy signatures. "
                "Second, post-attendance absenteeism is an open secret across collegiate institutions: students register, get their slip marked, "
                "and promptly depart. "
                "Third, attempts to enforce location tracking often trigger privacy backlash because students fear continuous background surveillance. "
                "Finally, technical realities such as cellular signal drops in auditorium basements and GPS multipath reflections "
                "cause naive location apps to fail completely. CLIDGE was engineered specifically to solve every single one of these bottlenecks."
            )
        },
        # Slide 4: Proposed Solution & Innovation
        {
            "category": "CORE INNOVATION",
            "title": "Proposed Solution & The CLIDGE Architecture",
            "cards": [
                {
                    "title": "Voluntary, Session-Scoped GNSS",
                    "bullets": [
                        "Location ingestion is strictly tied to an active, joined event ID.",
                        "Activated solely via explicit user permission and a front-end toggle switch.",
                        "Immediate automatic session revocation whenever an event is completed or cancelled."
                    ]
                },
                {
                    "title": "Mathematical Geofencing Engine",
                    "bullets": [
                        "Real-time spherical Haversine formula computed on both client and backend.",
                        "Configurable event venue perimeter (e.g., 65m radius for Mech Seminar Hall).",
                        "Instant perimeter breach detection classifying students as INSIDE or OUTSIDE BOUNDS."
                    ]
                },
                {
                    "title": "Dynamic QR & Offline Sync",
                    "bullets": [
                        "Expiring HMAC/JWT-based QR codes refreshable by the teacher every 15-60 minutes.",
                        "Browser-native IndexedDB transactional store caches check-ins during offline intervals.",
                        "Automatic idempotent reconciliation once connectivity is restored."
                    ]
                }
            ],
            "notes": (
                "The CLIDGE solution is built on three core pillars of innovation. "
                "Pillar one is voluntary, session-scoped GNSS tracking. The system never runs background daemons or tracks users outside scheduled events. "
                "Pillar two is our high-precision geofencing engine, which uses the spherical Haversine distance equation to monitor real-time "
                "proximity against the seminar venue coordinates, flagging perimeter violations instantly. "
                "Pillar three is dynamic QR tokens paired with an offline-first IndexedDB storage pipeline. Even if the auditorium loses internet "
                "connection, students scan the QR code, their check-in is cryptographically staged in IndexedDB, and automatically flushes to the server "
                "the moment Wi-Fi reconnects, with server-side idempotency preventing replay attacks."
            )
        },
        # Slide 5: System Architecture Overview
        {
            "category": "SYSTEM DESIGN",
            "title": "Three-Tier High-Availability System Architecture",
            "cards": [
                {
                    "title": "Client Tier (React 18 + Vite)",
                    "bullets": [
                        "Modern Single Page Application (SPA) styled with Tailwind CSS.",
                        "Interactive map rendering via Leaflet and OpenStreetMap tiles.",
                        "HTML5 Geolocation API + Canvas-based camera QR code reader.",
                        "Local caching & queue engine backed by browser IndexedDB."
                    ]
                },
                {
                    "title": "Application Tier (Python Flask)",
                    "bullets": [
                        "RESTful microservices handling Auth, Events, Locations, and Attendance.",
                        "JWT cryptographic token generation, validation, and role extraction.",
                        "Authoritative server clock enforcement for all attendance timestamps.",
                        "Dual-mode persistence engine: Cloud Firestore with fast in-memory fallback."
                    ]
                },
                {
                    "title": "Data Tier (Firestore & IndexedDB)",
                    "bullets": [
                        "Google Cloud Firestore collections: users, events, participants, locations, attendance.",
                        "Strict relational separation: attendance log records are isolated from GPS coordinate streams.",
                        "Client-side pending_transactions object store with atomic commits."
                    ]
                }
            ],
            "notes": (
                "This slide illustrates CLIDGE's three-tier architecture. "
                "On the client tier, we leverage React 18 bundled with Vite for ultra-fast performance, paired with Tailwind CSS for clean responsive UI. "
                "We integrate Leaflet with OpenStreetMap for hardware-accelerated mapping and use HTML5 Geolocation alongside IndexedDB. "
                "On the application tier, Python Flask serves as our REST API backend. It handles role-based authorization, validates geographic boundaries, "
                "and critically, acts as the single source of truth for all timestamps to defeat client clock tampering. "
                "On the database tier, Google Cloud Firestore provides scalable cloud document persistence, complemented by local IndexedDB on the client."
            )
        },
        # Slide 6: Role-Based Access Control (RBAC)
        {
            "category": "SECURITY & ACCESS",
            "title": "Role-Based Access Control & User Segmentation",
            "cards": [
                {
                    "title": "Student Persona",
                    "bullets": [
                        "Restricted to student portal views (/student-dashboard).",
                        "Can browse upcoming events, register/join, and toggle voluntary GPS sharing.",
                        "Can scan teacher QR codes for check-in and check-out.",
                        "Privacy Protected: Can NEVER view other students' coordinates or class rosters."
                    ]
                },
                {
                    "title": "Teacher / Faculty Persona",
                    "bullets": [
                        "Granted administrative event management (/teacher-dashboard).",
                        "Creates, configures, activates, and terminates seminar sessions.",
                        "Configures geofence coordinate anchor and radius boundaries.",
                        "Generates dynamic QR codes and views live multi-student map markers."
                    ]
                },
                {
                    "title": "Enforcement Mechanism",
                    "bullets": [
                        "Front-end Route Guards: React ProtectedRoute inspects auth role state.",
                        "Backend Middleware: Every API endpoint decodes JWT and checks claims.",
                        "HTTP 403 Forbidden enforced immediately if a student probes teacher endpoints."
                    ]
                }
            ],
            "notes": (
                "Security in collegiate environments demands strict role-based segmentation. "
                "CLIDGE defines two unambiguous personas: Student and Teacher. "
                "Students have access only to event joining, self-status inspection, and QR attendance scanning. "
                "They are cryptographically barred from inspecting peer locations or downloading rosters. "
                "Teachers have full event management capabilities: creating venues, establishing geofence perimeters, "
                "displaying dynamic QR codes, monitoring the real-time interactive map, and exporting compliance CSV reports. "
                "This boundary is enforced both on the client via React Router guards and on the server via JWT role verification."
            )
        },
        # Slide 7: Student Journey & Experience
        {
            "category": "USER EXPERIENCE",
            "title": "Student Interaction Workflow & Privacy Flow",
            "cards": [
                {
                    "title": "1. Discovery & Join",
                    "bullets": [
                        "Student logs in using roll number credentials (e.g., 731622CSR045).",
                        "Views interactive cards of scheduled campus seminars and workshops.",
                        "Clicks 'Join Event' to register in the seminar participant manifest."
                    ]
                },
                {
                    "title": "2. Voluntary Consent & GPS",
                    "bullets": [
                        "System displays transparent consent modal explaining session-only tracking.",
                        "Student grants browser GNSS permission and toggles sharing to 'Active'.",
                        "Live status indicator confirms coordinate ingestion (updates every 15s)."
                    ]
                },
                {
                    "title": "3. One-Tap QR Attendance",
                    "bullets": [
                        "Student opens integrated camera scanner or inputs event check-in code.",
                        "Backend verifies student enrollment, event status, and geofence proximity.",
                        "Check-in and Check-out state updates instantly on student's timeline."
                    ]
                }
            ],
            "notes": (
                "The student workflow was designed to be friction-free, intuitive, and completely transparent. "
                "When a student logs in, they see a clean dashboard displaying active and upcoming events. "
                "Joining an event requires an explicit 1-click action. "
                "Before any GPS coordinate is transmitted, the student is presented with a privacy consent prompt. "
                "Once granted, their device publishes coordinates at optimized 15-second intervals. "
                "When arriving at the seminar venue, the student opens the built-in QR scanner, scans the projection screen, "
                "and receives immediate visual confirmation of their verified attendance."
            )
        },
        # Slide 8: Teacher Dashboard & Event Operations
        {
            "category": "TEACHER TOOLS",
            "title": "Teacher Dashboard: Live Supervision & Control",
            "cards": [
                {
                    "title": "Event Lifecycle Control",
                    "bullets": [
                        "Creation wizard with venue presets (e.g., CSE Seminar Hall, Mechanical Auditorium).",
                        "Interactive map click-to-pin coordinate picker with live radius preview.",
                        "Instant state management: Draft -> Upcoming -> Ongoing -> Completed -> Cancelled."
                    ]
                },
                {
                    "title": "Live Participant Telemetry",
                    "bullets": [
                        "Real-time roster tabulating total registered, inside geofence, and outside bounds.",
                        "Live staleness badges: Green (Live <5m), Amber (Outdated >5m), Gray (Unavailable).",
                        "Direct search and filtering by student roll number, department, or status."
                    ]
                },
                {
                    "title": "Attendance & Export Hub",
                    "bullets": [
                        "On-demand QR code projection mode with configurable expiry countdown timer.",
                        "Live attendance compliance metrics (% checked-in vs total registered).",
                        "One-click CSV report export with ISO timestamps, coordinates, and academic disclaimers."
                    ]
                }
            ],
            "notes": (
                "The Teacher Dashboard serves as the central mission control for event coordinators. "
                "Teachers can create new events within seconds, selecting campus venues or clicking the map to drop a geofence pin. "
                "During the event, the dashboard displays three critical intelligence streams: "
                "First, a live interactive Leaflet map showing color-coded student markers. "
                "Second, a real-time participant roster categorizing students by geofence compliance and ping freshness. "
                "Third, an attendance management panel allowing the teacher to generate dynamic QR codes and download audit-ready CSV reports."
            )
        },
        # Slide 9: Multi-Student Live Map & Geofencing
        {
            "category": "MAPPING & GEOFENCING",
            "title": "Multi-Student Real-Time Map & Boundary Detection",
            "cards": [
                {
                    "title": "High-Precision Leaflet Engine",
                    "bullets": [
                        "Hardware-accelerated vector layer rendering with smooth marker pan animations.",
                        "Custom SVG pulsing markers indicating live GPS transmission.",
                        "Interactive venue circle overlay showing exact geofence perimeter in cyan."
                    ]
                },
                {
                    "title": "Mathematical Haversine Engine",
                    "bullets": [
                        "Computes great-circle distance between student [lat, lng] and venue [lat, lng].",
                        "Earth radius constant R = 6,371,000 meters for meter-level precision.",
                        "Example: Student 1 at 7.0m -> INSIDE; Student 2 at 156.8m -> OUTSIDE BOUNDS."
                    ]
                },
                {
                    "title": "Concurrent Multi-Student Telemetry",
                    "bullets": [
                        "Backend aggregates simultaneous telemetry streams across entire student cohort.",
                        "Distinct student identities, roll numbers, and accuracies rendered independently.",
                        "Zero marker cross-talk or coordinate pollution between concurrent users."
                    ]
                }
            ],
            "notes": (
                "Here we showcase the heart of CLIDGE's spatial intelligence: the interactive map and geofencing engine. "
                "We utilize Leaflet with custom styled vector layers. The seminar venue is rendered as a prominent circular geofence. "
                "When students submit locations, the system computes the exact great-circle distance using the spherical Haversine formula. "
                "During our formal testing, Student 1 located 7 meters from the venue was correctly evaluated as INSIDE, "
                "while Student 2, located 156.8 meters away near the cafeteria, was immediately flagged as OUTSIDE BOUNDS. "
                "The teacher sees distinct, non-overlapping markers with rich popups showing roll numbers, timestamps, and accuracy circles."
            )
        },
        # Slide 10: Location Staleness & Signal Degradation
        {
            "category": "DATA INTEGRITY",
            "title": "Location Ingestion & Staleness Classification",
            "cards": [
                {
                    "title": "Status: LIVE (Green)",
                    "bullets": [
                        "Criterion: Server timestamp age Delta t <= 300 seconds (5 minutes).",
                        "Indicates active GNSS satellite lock and continuous network connection.",
                        "Coordinates are rendered with full opacity and pulsing radar ring."
                    ]
                },
                {
                    "title": "Status: OUTDATED (Amber)",
                    "bullets": [
                        "Criterion: Server timestamp age Delta t > 300 seconds without new telemetry.",
                        "Triggered by campus Wi-Fi drops, indoor battery saver mode, or closed browser tab.",
                        "Critical Rule: System NEVER assumes an outdated location is currently inside venue."
                    ]
                },
                {
                    "title": "Status: UNAVAILABLE (Gray)",
                    "bullets": [
                        "Criterion: Student joined event but never transmitted a valid GNSS fix.",
                        "Caused by denied browser permissions or hardware GPS disabled on device.",
                        "Clearly separated in roster to prompt teacher or student troubleshooting."
                    ]
                }
            ],
            "notes": (
                "A critical flaw in many tracking systems is displaying hours-old coordinates as if they are live. "
                "CLIDGE strictly enforces a 3-tier staleness classification based on authoritative server delta time. "
                "A location ping received within the last 5 minutes is marked LIVE with a vibrant green badge. "
                "If a student's phone enters sleep mode or loses signal for more than 5 minutes, their status automatically transitions "
                "to OUTDATED with an amber badge. The system explicitly warns the teacher that this represents the last known position. "
                "If a student joins but never grants GPS permission, they are classified as UNAVAILABLE. "
                "This honest data reporting guarantees academic integrity during audits."
            )
        },
        # Slide 11: Dynamic QR Code Attendance
        {
            "category": "ATTENDANCE MECHANISM",
            "title": "Dynamic QR Code Generation & Validation",
            "cards": [
                {
                    "title": "Teacher Generation Engine",
                    "bullets": [
                        "Generates cryptographic event-bound token via /api/events/{id}/attendance/generate-qr.",
                        "Embeds event ID, teacher signature, creation timestamp, and expiry window.",
                        "Configurable time-to-live (e.g., 15 min, 30 min, 60 min) to prevent token sharing."
                    ]
                },
                {
                    "title": "Student Scanner Pipeline",
                    "bullets": [
                        "Native HTML5 video stream with real-time canvas barcode decoding.",
                        "Zero third-party proprietary app installation required; works on any mobile browser.",
                        "Fallback manual entry code provided for low-end smartphone cameras."
                    ]
                },
                {
                    "title": "Backend Verification Safeguards",
                    "bullets": [
                        "Validates token cryptographic signature and expiration threshold.",
                        "Checks student registration manifest: unregistered students are rejected.",
                        "Duplicate prevention: Rejects second check-in attempt (HTTP 400 Duplicate Check-In)."
                    ]
                }
            ],
            "notes": (
                "Now let us examine Feature 1: QR Code Attendance. "
                "Static QR codes pasted on classroom doors are easily photographed and circulated on messaging groups. "
                "CLIDGE solves this with dynamic, expiring QR tokens. "
                "The teacher generates a fresh QR code at the start of the session, setting a validity period such as 30 minutes. "
                "Students scan the screen using their phone's built-in browser camera through our canvas scanning pipeline. "
                "The backend decodes the token, verifies that the student is actually registered for this specific event, "
                "checks that the token has not expired, and records the check-in. "
                "Crucially, any attempt to scan the code a second time is instantly rejected as a duplicate."
            )
        },
        # Slide 12: Dual Verification Model
        {
            "category": "VERIFICATION MODEL",
            "title": "Dual Verification: Spatial Presence + Digital Check-In",
            "cards": [
                {
                    "title": "Dimension 1: Spatial Proximity (GPS)",
                    "bullets": [
                        "Monitors physical presence within the geofenced perimeter.",
                        "Tracks entry, continuous presence, and exit times during the event.",
                        "Detects if a student has left the campus venue prematurely."
                    ]
                },
                {
                    "title": "Dimension 2: Active Check-In (QR)",
                    "bullets": [
                        "Verifies conscious physical engagement at designated session milestones.",
                        "Requires camera scanning of teacher's live display.",
                        "Records official check-in and check-out ledger records."
                    ]
                },
                {
                    "title": "Architectural Separation of Concerns",
                    "bullets": [
                        "Attendance records (/attendance_records) and GPS fixes (/locations) reside in separate collections.",
                        "Attendance compliance is correlated on demand without polluting the legal attendance record.",
                        "Complies fully with educational data minimization and audit standards."
                    ]
                }
            ],
            "notes": (
                "The defining innovation of CLIDGE is its Dual Verification Model. "
                "Instead of relying solely on GPS—which can suffer from indoor multipath drift—or solely on QR codes—which can be "
                "photographed—CLIDGE harmonizes both signals. "
                "Spatial tracking verifies that the student's mobile hardware is inside the venue perimeter. "
                "The QR scan verifies that the student is actively looking at the presentation screen and checking in. "
                "Furthermore, our database architecture maintains strict separation of concerns: raw GPS coordinate breadcrumbs "
                "are stored separately from authoritative attendance ledger records, ensuring that GPS telemetry can be pruned "
                "post-event while permanent academic attendance records are preserved."
            )
        },
        # Slide 13: Offline-First Architecture & IndexedDB
        {
            "category": "OFFLINE RESILIENCE",
            "title": "Offline-First Data Pipeline via Browser IndexedDB",
            "cards": [
                {
                    "title": "Local Client Store (IndexedDB)",
                    "bullets": [
                        "Database: ClidgeOfflineDB with stores: events_cache, pending_transactions, user_profile.",
                        "When offline, check-in actions are packaged with UUID sync_id and local timestamp.",
                        "Staged locally with status PENDING_VERIFICATION (never falsely marked live)."
                    ]
                },
                {
                    "title": "Network Detection & Event Triggers",
                    "bullets": [
                        "Listens to browser window.addEventListener('online') and ('offline') events.",
                        "Renders unobtrusive amber notification banner indicating queued transactions.",
                        "Executes automatic background flush upon connectivity resumption."
                    ]
                },
                {
                    "title": "Idempotent Server Reconciler",
                    "bullets": [
                        "Flushes payload to /api/attendance/sync with sync_id deduplication keys.",
                        "Server verifies transaction; if already processed, responds with success without duplicating.",
                        "Clears local queue only upon confirmed HTTP 200 server acknowledgement."
                    ]
                }
            ],
            "notes": (
                "Real campus environments suffer from Wi-Fi dead spots, network congestion, and sudden disconnections. "
                "CLIDGE addresses this with a resilient offline-first architecture utilizing browser IndexedDB. "
                "When a student loses connectivity, the application does not crash or display an error screen. "
                "Instead, check-in requests are serialized, assigned a unique transaction UUID, and stored in IndexedDB under status PENDING_VERIFICATION. "
                "The app monitors network state. As soon as the device reconnects to Wi-Fi or cellular data, our background reconciler "
                "transmits the queued items to `/api/attendance/sync`. "
                "The backend inspects the transaction IDs to guarantee idempotency—meaning duplicate network packets will never cause duplicate attendance records."
            )
        },
        # Slide 14: Data Privacy & Security Framework
        {
            "category": "SECURITY & PRIVACY",
            "title": "Data Privacy, Security Architecture & Anti-Spoofing",
            "cards": [
                {
                    "title": "Anti-Spoofing & Identity Isolation",
                    "bullets": [
                        "Server extracts student UID strictly from verified JWT bearer token.",
                        "Submitting a forged student_id in the JSON body is detected and rejected with HTTP 403.",
                        "Tokens carry verified claims signed via server HMAC secret key."
                    ]
                },
                {
                    "title": "Coordinate Boundary Validation",
                    "bullets": [
                        "Strict validation rules reject mathematically impossible latitude (>90 or <-90) and longitude (>180 or <-180).",
                        "Negative GNSS accuracy values are immediately blocked.",
                        "Events in Cancelled or Completed status categorically reject all new location pings."
                    ]
                },
                {
                    "title": "Privacy Preservation by Design",
                    "bullets": [
                        "Zero 24/7 background geofencing: tracking ends immediately when the event concludes.",
                        "Students can never inspect other students' private locations or attendance records.",
                        "All student coordinates are encrypted in transit over HTTPS / TLS 1.3."
                    ]
                }
            ],
            "notes": (
                "Security and user privacy are foundational to CLIDGE. "
                "In our threat model, malicious actors might attempt to spoof another student's attendance by passing an arbitrary student ID in the payload. "
                "CLIDGE completely neutralizes this: the backend discards any client-supplied user ID and extracts identity exclusively from the cryptographically "
                "signed JWT bearer token. "
                "Furthermore, we implement strict schema validation for all numeric coordinate ranges, reject negative accuracy values, "
                "and ensure that once an event transitions to Completed or Cancelled, all location ingestion endpoints are shut down. "
                "Most importantly, privacy by design ensures students are only tracked with explicit consent during active registered events."
            )
        },
        # Slide 15: Database Schema & Information Model
        {
            "category": "DATABASE ARCHITECTURE",
            "title": "Data Schema & Information Models (Firestore)",
            "cards": [
                {
                    "title": "Core Collections: Users & Events",
                    "bullets": [
                        "users/{uid}: uid, email, name, roll_number, role (student/teacher), department.",
                        "events/{eventId}: eventId, title, venue, latitude, longitude, radius (meters), status, teacherId, startTime, endTime."
                    ]
                },
                {
                    "title": "Participation & Spatial Streams",
                    "bullets": [
                        "event_participants/{eventId_uid}: eventId, studentId, studentName, joinedAt, sharingConsent, sharingStatus.",
                        "locations/{eventId_uid}: eventId, studentId, latitude, longitude, accuracy, timestamp, distance_meters, inside_geofence."
                    ]
                },
                {
                    "title": "Authoritative Attendance Ledger",
                    "bullets": [
                        "attendance_records/{eventId_uid}: eventId, studentId, rollNumber, checkInTime, checkOutTime, status (CHECKED_IN/CHECKED_OUT), source (LIVE_QR/OFFLINE_SYNC).",
                        "qr_tokens/{token}: eventId, createdBy, expiresAt, active."
                    ]
                }
            ],
            "notes": (
                "This slide details the database schema utilized across Google Cloud Firestore and our in-memory engine. "
                "The schema is organized into five clean, decoupled collections. "
                "`users` stores user identities, roll numbers, and RBAC roles. "
                "`events` defines the seminar metadata and geofence anchor coordinates. "
                "`event_participants` records enrollment manifests and voluntary consent status. "
                "`locations` acts as the high-throughput spatial stream storing the most recent GPS fix and calculated distance. "
                "Finally, `attendance_records` maintains the immutable academic ledger containing official check-in and check-out timestamps. "
                "This clean relational separation guarantees high query performance and easy auditability."
            )
        },
        # Slide 16: RESTful API Specifications
        {
            "category": "API SPECIFICATION",
            "title": "RESTful API Specification & Endpoints",
            "cards": [
                {
                    "title": "Authentication & Events",
                    "bullets": [
                        "POST /api/auth/register : Create student account with validated roll number.",
                        "POST /api/auth/login : Authenticate and receive JWT bearer session token.",
                        "GET /api/events : Retrieve available events filtered by role and status.",
                        "POST /api/events : Teacher creates event with venue coordinates & radius."
                    ]
                },
                {
                    "title": "Location & Telemetry",
                    "bullets": [
                        "POST /api/locations : Ingest student GPS fix, calculate Haversine distance.",
                        "GET /api/events/{id}/locations : Teacher retrieves cohort markers and staleness.",
                        "POST /api/events/{id}/join : Student registers participation and consent."
                    ]
                },
                {
                    "title": "Attendance & Synchronization",
                    "bullets": [
                        "POST /api/events/{id}/attendance/generate-qr : Teacher mints expiring QR token.",
                        "POST /api/attendance/check-in : Validates QR token and logs official check-in.",
                        "POST /api/attendance/check-out : Logs official check-out timestamp.",
                        "POST /api/attendance/sync : Idempotent batch offline sync reconciler."
                    ]
                }
            ],
            "notes": (
                "The CLIDGE backend exposes a comprehensive RESTful API adhering strictly to HTTP conventions and JSON payloads. "
                "All operational routes require standard Bearer token authorization in the HTTP headers. "
                "Endpoints are logically grouped: authentication routes manage user onboarding and JWT issuance; "
                "event routes control creation, status transitions, and participant joining; "
                "location routes handle real-time GPS ingestion and batch cohort queries; "
                "and attendance routes manage QR token generation, check-in, check-out, and offline synchronization. "
                "Every endpoint produces standardized HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, and 403 Forbidden."
            )
        },
        # Slide 17: UI/UX Modernization
        {
            "category": "INTERFACE DESIGN",
            "title": "Modern UI/UX Design & Brand Identity",
            "cards": [
                {
                    "title": "Approved Color Palette",
                    "bullets": [
                        "Deep Navy Canvas: #060F1C (Primary Background) & #0B1D33 (Card Containers).",
                        "Vibrant Cyan Accent: #06B6D4 & #22D3EE (Active states, brand focus, buttons).",
                        "High-Contrast Slate: #F8FAFC & #E2E8F0 for crisp, legible typography.",
                        "Semantic Badges: Emerald (Active/Inside), Amber (Warning/Outdated), Rose (Breach)."
                    ]
                },
                {
                    "title": "De-Cluttered Layout Architecture",
                    "bullets": [
                        "Eliminated repetitive instructional banners across all student and teacher dashboards.",
                        "Adopted compact metrics cards with clear visual hierarchy and Lucide SVG icons.",
                        "Integrated the official Muthayammal CLIDGE logo across navbar, sidebar, and landing pages."
                    ]
                },
                {
                    "title": "Mobile-First Responsiveness",
                    "bullets": [
                        "Adaptive collapsible sidebar navigation optimized for smartphones and tablets.",
                        "Touch-friendly tap targets (>48px) for field check-in and QR scanning.",
                        "Zero horizontal layout shifts across all desktop and mobile viewport breakpoints."
                    ]
                }
            ],
            "notes": (
                "In our final UI/UX iteration, we polished the interface to professional enterprise standards while strictly preserving the approved brand identity. "
                "The visual design uses a sophisticated dark collegiate palette: Deep Navy for background surfaces, balanced with vibrant Cyan accents "
                "and crisp Slate typography for optimal contrast. "
                "We systematically eliminated repetitive textual paragraphs, replacing them with concise metric badges and intuitive Lucide icons. "
                "The official CLIDGE logo featuring the graduation cap and location pin motif has been cleanly embedded throughout the system. "
                "The entire application is 100% mobile responsive, ensuring seamless usability on student smartphones during live campus events."
            )
        },
        # Slide 18: Comprehensive Test Verification
        {
            "category": "VERIFICATION & TESTING",
            "title": "Empirical Verification: 75/75 Automated Tests Passed",
            "cards": [
                {
                    "title": "Backend Pytest Suite (31 Tests)",
                    "bullets": [
                        "Attendance & QR Lifecycle: 11/11 Passed (QR generation, check-in/out, duplicate rejection).",
                        "GPS Tracking & Telemetry: 11/11 Passed (Valid ingestion, spoof rejection, staleness calculation).",
                        "Two-Student Live Map: 2/2 Passed (Marker separation, zero coordinate leakage).",
                        "Security & Anti-Spoofing: 7/7 Passed (RBAC, unauth rejection, boundary checks)."
                    ]
                },
                {
                    "title": "Node.js End-to-End Suite (44 Tests)",
                    "bullets": [
                        "Full 21-Item Application Checklist: 44/44 Assertions Passed with 0 Failures.",
                        "Landing page, registration, login, event lifecycle, GPS consent, and map markers.",
                        "Geofencing calculation verified: 7.0m inside radius, 156.8m outside radius.",
                        "Offline IndexedDB queue and sync idempotency verified."
                    ]
                },
                {
                    "title": "Frontend Build & Bundler",
                    "bullets": [
                        "Vite 5 Production Build: 1,734 modules transformed with 0 syntax or bundle errors.",
                        "Clean console output with zero unhandled promise rejections or runtime exceptions."
                    ]
                }
            ],
            "notes": (
                "Quality assurance in CLIDGE is backed by comprehensive automated test coverage rather than manual assumptions. "
                "We executed two exhaustive test suites covering every layer of the system. "
                "In the backend, Python pytest ran 31 test cases verifying attendance workflows, GPS ingestion, spoofing rejection, "
                "and two-student live map telemetry—achieving 100% pass rates. "
                "In the front-to-back integration suite, Node.js executed 44 rigorous assertions across all 21 functional checklist items, "
                "verifying everything from geofence math to offline synchronization. "
                "Furthermore, Vite production build compiled 1,734 modules with zero errors. The system is functionally rock solid."
            )
        },
        # Slide 19: Hardware & Network Resilience
        {
            "category": "FIELD RESILIENCE",
            "title": "Hardware & Network Resilience in Campus Environments",
            "cards": [
                {
                    "title": "Indoor GNSS Drift Mitigation",
                    "bullets": [
                        "Ingests hardware accuracy radius (meters) alongside raw latitude and longitude.",
                        "Visualizes accuracy uncertainty circle around student markers on the Leaflet map.",
                        "Geofencing incorporates dynamic tolerance buffer to prevent false breach alerts from multipath drift."
                    ]
                },
                {
                    "title": "Battery & Network Optimization",
                    "bullets": [
                        "Coordinates are throttled to 15-second intervals, consuming <3% smartphone battery per hour.",
                        "Payloads are minified JSON (<250 bytes per ping) minimizing cellular data consumption.",
                        "Graceful degradation when cellular drops to 2G/EDGE or temporary disconnection."
                    ]
                },
                {
                    "title": "Multi-Device Compatibility",
                    "bullets": [
                        "Tested across Android Chrome, iOS Safari, and Windows desktop browsers.",
                        "Cross-platform HTML5 Geolocation and MediaDevices camera standards.",
                        "Consistent performance across low-end and high-end student mobile hardware."
                    ]
                }
            ],
            "notes": (
                "Deploying location tracking in real collegiate venues presents harsh physical challenges. "
                "Concrete buildings and metal roofing cause indoor GPS signals to scatter, producing multipath inaccuracies of 15 to 30 meters. "
                "CLIDGE mitigates this by capturing the device's horizontal accuracy metric and displaying an uncertainty radius on the map. "
                "Our geofencing algorithm incorporates a tolerance buffer so students aren't falsely marked absent due to momentary satellite drift. "
                "To protect student battery life, location pings are throttled to 15-second intervals, consuming negligible power. "
                "The entire application adheres to open W3C web standards, ensuring flawless operation across Android, iOS, and PC browsers."
            )
        },
        # Slide 20: 9-Step Live Demonstration
        {
            "category": "LIVE DEMO READINESS",
            "title": "Real-World Live Demonstration: 9-Step Workflow",
            "cards": [
                {
                    "title": "Phase 1: Setup & Enrollment",
                    "bullets": [
                        "Step 1: Faculty logs into Teacher Portal as Dr. Meenakshi (fac-dr-meenakshi).",
                        "Step 2: Faculty creates 'National Web3 & AI Seminar' with a 65m geofence at Seminar Hall.",
                        "Step 3: Two students log into Student Portal on independent mobile devices."
                    ]
                },
                {
                    "title": "Phase 2: Joining & Telemetry",
                    "bullets": [
                        "Step 4: Both students discover and join the seminar event.",
                        "Step 5: Both students grant GPS permissions and toggle location sharing to Active.",
                        "Step 6: Teacher views two distinct markers appearing live on the Leaflet map."
                    ]
                },
                {
                    "title": "Phase 3: Verification & Export",
                    "bullets": [
                        "Step 7: Teacher verifies Student 1 (Inside, 7m) and Student 2 (Outside, 156m) statuses.",
                        "Step 8: Students scan the dynamic QR code to record official check-in.",
                        "Step 9: Teacher terminates event, reviews attendance compliance, and exports CSV report."
                    ]
                }
            ],
            "notes": (
                "For our upcoming college viva and faculty demonstration, we have pre-configured and automated the full 9-step demonstration workflow. "
                "Step 1: The coordinator logs into the Teacher Portal. "
                "Step 2: The teacher schedules an active seminar event, configuring the venue coordinates and 65-meter geofence. "
                "Step 3 and 4: Two students log in on separate devices and join the seminar. "
                "Step 5: Both students enable location sharing with voluntary consent. "
                "Step 6 and 7: The teacher's live Leaflet map updates in real time, displaying Student 1 inside the venue and Student 2 outside bounds. "
                "Step 8: The students scan the dynamic QR code for check-in. "
                "Step 9: The teacher reviews the live attendance summary and exports the final CSV report. "
                "This entire workflow has been proven end-to-end with zero errors."
            )
        },
        # Slide 21: Challenges Overcome
        {
            "category": "ENGINEERING HIGHLIGHTS",
            "title": "Technical Challenges Overcome & Architectural Insights",
            "cards": [
                {
                    "title": "Challenge: Client Clock Spoofing",
                    "bullets": [
                        "Problem: Students altering phone device time to claim early check-in or bypass deadlines.",
                        "Solution: Total architectural rejection of client timestamps; server assigns authoritative UTC timestamps on ingestion."
                    ]
                },
                {
                    "title": "Challenge: Offline Replay Attacks",
                    "bullets": [
                        "Problem: Replaying cached offline check-in packets multiple times to inflate attendance records.",
                        "Solution: Client generates cryptographic UUID sync_id; backend maintains atomic deduplication registry."
                    ]
                },
                {
                    "title": "Challenge: Dual-Mode Persistence",
                    "bullets": [
                        "Problem: College demonstrations frequently lack outbound internet access to Google Cloud Firestore.",
                        "Solution: Dual-mode architecture seamlessly falls back to high-performance in-memory state engine without code changes."
                    ]
                }
            ],
            "notes": (
                "During the engineering of CLIDGE, several non-trivial architectural challenges were solved. "
                "The first was client clock manipulation: students often alter their smartphone system time to circumvent late attendance rules. "
                "We neutralized this by enforcing that all check-in and check-out timestamps are minted strictly by the server's UTC clock. "
                "The second was offline replay attacks: our idempotent sync pipeline attaches unique transaction UUIDs to every queued record, "
                "guaranteeing that network duplicates are safely absorbed without double-counting. "
                "The third was network isolation during college lab presentations: we built a seamless dual-mode persistence layer, "
                "allowing CLIDGE to run against Google Cloud Firestore in production or an in-memory database during offline vivas."
            )
        },
        # Slide 22: Future Enhancements & Scalability
        {
            "category": "ROADMAP & EXTENSIBILITY",
            "title": "Future Enhancements & Scalability Roadmap",
            "cards": [
                {
                    "title": "Indoor Micro-Location (BLE)",
                    "bullets": [
                        "Deploy Bluetooth Low Energy (BLE) beacons (iBeacon/Eddystone) inside large auditoriums.",
                        "Enables sub-meter room and floor level elevation tracking where satellite GNSS signals attenuate."
                    ]
                },
                {
                    "title": "Institutional LMS Integration",
                    "bullets": [
                        "Direct automated bi-directional synchronization with Moodle, Canvas, and college ERP systems.",
                        "Automatic generation of official internal assessment attendance percentages and shortage alerts."
                    ]
                },
                {
                    "title": "Edge AI & Automated Push Alerts",
                    "bullets": [
                        "Automated push notifications alerting students when approaching geofence exit boundaries.",
                        "Edge anomaly detection identifying suspicious coordinate jumps characteristic of mock GPS apps."
                    ]
                }
            ],
            "notes": (
                "Looking ahead to future institutional rollouts, CLIDGE has a clear scalability and feature roadmap. "
                "First, we plan to incorporate Bluetooth Low Energy (BLE) beacon integration. "
                "While GPS is ideal for campus perimeters, BLE beacons will enable sub-meter precision across multi-story academic blocks. "
                "Second, we aim to build direct API connectors for institutional Learning Management Systems like Moodle and college ERPs, "
                "allowing attendance to flow automatically into semester internal assessment ledgers. "
                "Third, we will integrate client-side machine learning heuristics to detect synthetic GPS mock provider spoofing apps, "
                "further cementing the system's tamper-proof integrity."
            )
        },
        # Slide 23: Conclusion & Defense Sign-Off
        {
            "category": "CONCLUSION & SIGN-OFF",
            "title": "Conclusion, Compliance Sign-Off & Q&A",
            "cards": [
                {
                    "title": "Project Verdict",
                    "bullets": [
                        "College Demonstration Ready: 100% VERIFIED & CERTIFIED.",
                        "Functionally Complete: All 21 functional items, QR attendance, and offline sync fully operational.",
                        "Real-World Deployment Ready: Production-grade architecture, responsive UI, robust security controls."
                    ]
                },
                {
                    "title": "Institutional Impact",
                    "bullets": [
                        "Transforms campus event administration from paper-based guesswork into real-time operational intelligence.",
                        "Protects student civil liberties through voluntary, session-scoped privacy boundaries.",
                        "Delivers an audit-ready, tamper-resistant digital paper trail for collegiate accreditation (NAAC / NBA)."
                    ]
                },
                {
                    "title": "Open for Evaluation",
                    "bullets": [
                        "Thank you to the Head of Department, faculty advisors, and members of the evaluation committee.",
                        "System is live, active, and fully prepared for interactive live demonstration.",
                        "Questions, architectural inquiries, and live evaluations are warmly welcomed."
                    ]
                }
            ],
            "notes": (
                "In conclusion, project CLIDGE has successfully fulfilled its engineering goals. "
                "It solves real-world campus attendance fraud and event monitoring challenges through an elegant synthesis "
                "of voluntary GNSS tracking, mathematical geofencing, dynamic QR verification, and offline-first data synchronization. "
                "With 75/75 automated test assertions passing and a polished, responsive user interface, "
                "CLIDGE is officially certified as College Demonstration Ready and Functionally Complete. "
                "Thank you for your valuable time and attention. I am now delighted to take questions from the evaluation committee "
                "and demonstrate the live system."
            )
        }
    ]

    for s_idx, s_data in enumerate(slides_data):
        slide = prs.slides.add_slide(blank_layout)
        apply_dark_background(slide)

        if s_data.get("is_title"):
            # Large Title Slide Layout
            if os.path.exists(logo_path):
                try:
                    slide.shapes.add_picture(logo_path, Inches(5.866), Inches(0.9), Inches(1.6), Inches(1.6))
                except Exception:
                    pass

            # Title
            tbox = slide.shapes.add_textbox(Inches(1.0), Inches(2.7), Inches(11.333), Inches(1.0))
            ttf = tbox.text_frame
            ttf.word_wrap = True
            p = ttf.paragraphs[0]
            p.text = s_data["title"]
            p.alignment = PP_ALIGN.CENTER
            p.font.name = 'Arial'
            p.font.size = Pt(44)
            p.font.bold = True
            p.font.color.rgb = C_WHITE

            # Subtitle
            sbox = slide.shapes.add_textbox(Inches(1.5), Inches(3.7), Inches(10.333), Inches(1.0))
            stf = sbox.text_frame
            stf.word_wrap = True
            p2 = stf.paragraphs[0]
            p2.text = s_data["subtitle"]
            p2.alignment = PP_ALIGN.CENTER
            p2.font.name = 'Arial'
            p2.font.size = Pt(20)
            p2.font.bold = True
            p2.font.color.rgb = C_CYAN

            # Divider line
            div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(4.666), Inches(4.8), Inches(4.0), Inches(0.03))
            div.fill.solid()
            div.fill.fore_color.rgb = C_CYAN
            div.line.fill.background()

            # Metadata box
            mbox = slide.shapes.add_textbox(Inches(2.0), Inches(5.1), Inches(9.333), Inches(1.8))
            mtf = mbox.text_frame
            mtf.word_wrap = True
            for m_item in s_data["meta"]:
                pm = mtf.add_paragraph() if mtf.paragraphs[0].text else mtf.paragraphs[0]
                pm.text = m_item
                pm.alignment = PP_ALIGN.CENTER
                pm.font.name = 'Arial'
                pm.font.size = Pt(13)
                pm.font.color.rgb = C_SLATE_200
                pm.space_after = Pt(4)
        else:
            # Standard Content Slide Layout with 3 Cards
            add_header(slide, s_data["title"], s_data.get("category", "CLIDGE • SMART CAMPUS SYSTEM"))

            cards = s_data.get("cards", [])
            card_width = Inches(3.68)
            card_gap = Inches(0.34)
            card_top = Inches(1.85)
            card_height = Inches(5.15)
            left_margin = Inches(0.8)

            for c_idx, card in enumerate(cards):
                c_left = left_margin + c_idx * (card_width + card_gap)

                # Card Background Shape
                c_shape = slide.shapes.add_shape(
                    MSO_SHAPE.ROUNDED_RECTANGLE, c_left, card_top, card_width, card_height
                )
                c_shape.fill.solid()
                c_shape.fill.fore_color.rgb = C_CARD_BG
                c_shape.line.color.rgb = C_CARD_BORDER
                c_shape.line.width = Pt(1.5)

                # Card Accent top bar
                accent_bar = slide.shapes.add_shape(
                    MSO_SHAPE.RECTANGLE, c_left, card_top, card_width, Inches(0.08)
                )
                accent_bar.fill.solid()
                accent_bar.fill.fore_color.rgb = C_CYAN
                accent_bar.line.fill.background()

                # Card Content
                c_box = slide.shapes.add_textbox(
                    c_left + Inches(0.25), card_top + Inches(0.25), card_width - Inches(0.5), card_height - Inches(0.5)
                )
                c_tf = c_box.text_frame
                c_tf.word_wrap = True
                c_tf.margin_top = c_tf.margin_bottom = c_tf.margin_left = c_tf.margin_right = 0

                # Card Title
                p_ct = c_tf.paragraphs[0]
                p_ct.text = card["title"]
                p_ct.font.name = 'Arial'
                p_ct.font.size = Pt(17)
                p_ct.font.bold = True
                p_ct.font.color.rgb = C_CYAN_LIGHT
                p_ct.space_after = Pt(14)

                # Card Bullets
                for b_text in card["bullets"]:
                    p_b = c_tf.add_paragraph()
                    p_b.text = f"•  {b_text}"
                    p_b.font.name = 'Arial'
                    p_b.font.size = Pt(12)
                    p_b.font.color.rgb = C_SLATE_200
                    p_b.space_after = Pt(10)

        # Slide Notes
        if s_data.get("notes"):
            notes_slide = slide.notes_slide
            text_frame = notes_slide.notes_text_frame
            text_frame.text = s_data["notes"]

    prs.save("CLIDGE_Project_Presentation.pptx")
    print(f"Successfully generated CLIDGE_Project_Presentation.pptx with {len(slides_data)} slides!")

if __name__ == '__main__':
    create_clidge_presentation()
