"""
Rootine Backend — Detailed Documentation PDF Generator
Generates a comprehensive, plain-language explanation of every file in the backend.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image,
    HRFlowable, PageBreak, Table, TableStyle, KeepTogether
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# ── Paths ────────────────────────────────────────────────────────────────────
BASE = r"E:\SCHOOL PURPOSE\APPSDEV\Rootine\backend\docs"
LOGO = os.path.join(BASE, "cpc-logo.png")
OUT  = os.path.join(BASE, "Rootine-Backend-Documentation.pdf")

# ── Colours ──────────────────────────────────────────────────────────────────
GREEN      = colors.HexColor("#10b981")
DARK       = colors.HexColor("#0f172a")
SLATE      = colors.HexColor("#334155")
LIGHT_BG   = colors.HexColor("#f0fdf4")
BORDER     = colors.HexColor("#bbf7d0")
YELLOW_BG  = colors.HexColor("#fefce8")
YELLOW_BD  = colors.HexColor("#fde68a")
BLUE_BG    = colors.HexColor("#eff6ff")
BLUE_BD    = colors.HexColor("#bfdbfe")
RED_BG     = colors.HexColor("#fef2f2")
RED_BD     = colors.HexColor("#fecaca")
WHITE      = colors.white

# ── Styles ───────────────────────────────────────────────────────────────────
SS = getSampleStyleSheet()

def s(name, **kw):
    return ParagraphStyle(name, parent=SS["Normal"], **kw)

COVER_TITLE  = s("CoverTitle",  fontSize=28, textColor=WHITE,      alignment=TA_CENTER, leading=36, fontName="Helvetica-Bold")
COVER_SUB    = s("CoverSub",    fontSize=13, textColor=WHITE,      alignment=TA_CENTER, leading=18)
COVER_MEMBER = s("CoverMember", fontSize=11, textColor=WHITE,      alignment=TA_CENTER, leading=16)
CHAPTER      = s("Chapter",     fontSize=18, textColor=GREEN,      leading=24, spaceBefore=20, spaceAfter=6,  fontName="Helvetica-Bold")
SECTION      = s("Section",     fontSize=13, textColor=DARK,       leading=18, spaceBefore=14, spaceAfter=4,  fontName="Helvetica-Bold")
SUBSECT      = s("SubSection",  fontSize=11, textColor=SLATE,      leading=16, spaceBefore=8,  spaceAfter=2,  fontName="Helvetica-Bold")
BODY         = s("Body",        fontSize=10, textColor=DARK,       leading=15, spaceBefore=4,  spaceAfter=4,  alignment=TA_JUSTIFY)
CALLOUT_G    = s("CalloutG",    fontSize=10, textColor=DARK,       leading=15, spaceBefore=2,  spaceAfter=2,  leftIndent=10, rightIndent=10, backColor=LIGHT_BG, borderPadding=8)
CALLOUT_Y    = s("CalloutY",    fontSize=10, textColor=DARK,       leading=15, spaceBefore=2,  spaceAfter=2,  leftIndent=10, rightIndent=10, backColor=YELLOW_BG, borderPadding=8)
CALLOUT_B    = s("CalloutB",    fontSize=10, textColor=DARK,       leading=15, spaceBefore=2,  spaceAfter=2,  leftIndent=10, rightIndent=10, backColor=BLUE_BG,  borderPadding=8)
CALLOUT_R    = s("CalloutR",    fontSize=10, textColor=DARK,       leading=15, spaceBefore=2,  spaceAfter=2,  leftIndent=10, rightIndent=10, backColor=RED_BG,   borderPadding=8)
CODE         = s("Code",        fontSize=8.5, fontName="Courier",  textColor=DARK, backColor=colors.HexColor("#f8fafc"), leading=13, leftIndent=12, rightIndent=12, borderPadding=6)

def P(text, style=BODY):       return Paragraph(text, style)
def SP(h=0.3):                  return Spacer(1, h * cm)
def HR():                       return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=6)
def PB():                       return PageBreak()

# ── Page Template ────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN = 2.2 * cm

def header_footer(canvas, doc):
    canvas.saveState()
    # Header bar
    canvas.setFillColor(GREEN)
    canvas.rect(0, PAGE_H - 1.1*cm, PAGE_W, 1.1*cm, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(WHITE)
    canvas.drawString(MARGIN, PAGE_H - 0.7*cm, "ROOTINE BACKEND — TECHNICAL DOCUMENTATION")
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.7*cm, "Cordova Public College")
    # Footer
    canvas.setFillColor(SLATE)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(MARGIN, 0.6*cm, "Rootine | Imperial, Kenneth R.  ·  Aying, Clifford S.")
    canvas.drawRightString(PAGE_W - MARGIN, 0.6*cm, f"Page {doc.page}")
    canvas.restoreState()

# ── Document ─────────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=2.8*cm, bottomMargin=1.8*cm,
)

story = []

# ════════════════════════════════════════════════════════════════════════════
# COVER PAGE
# ════════════════════════════════════════════════════════════════════════════
def cover_page():
    elems = []
    # Dark green background block via table trick
    cover_data = [[""]]
    cover_table = Table(cover_data, colWidths=[PAGE_W - 2*MARGIN], rowHeights=[26*cm])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), DARK),
        ("ROUNDEDCORNERS", [12]),
    ]))

    elems.append(SP(0.5))

    if os.path.exists(LOGO):
        img = Image(LOGO, width=4.5*cm, height=4.5*cm)
        img.hAlign = "CENTER"
        elems.append(img)
    elems.append(SP(0.4))
    elems.append(P("Cordova Public College", ParagraphStyle("cpc", fontSize=11, textColor=GREEN, alignment=TA_CENTER, fontName="Helvetica-Bold")))
    elems.append(SP(1.2))
    elems.append(P("ROOTINE", ParagraphStyle("rtitle", fontSize=40, textColor=WHITE, alignment=TA_CENTER, fontName="Helvetica-Bold", leading=48)))
    elems.append(P("Backend Technical Documentation", ParagraphStyle("rsub", fontSize=15, textColor=GREEN, alignment=TA_CENTER, leading=20)))
    elems.append(SP(0.6))
    elems.append(HR())
    elems.append(SP(0.4))
    elems.append(P("A complete, plain-language explanation of every file,<br/>every decision, and every layer of the Rootine API.",
                   ParagraphStyle("rdesc", fontSize=11, textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER, leading=16)))
    elems.append(SP(1.5))
    elems.append(P("Members", ParagraphStyle("mlabel", fontSize=9, textColor=colors.HexColor("#64748b"), alignment=TA_CENTER, fontName="Helvetica-Bold")))
    elems.append(SP(0.2))
    elems.append(P("Imperial, Kenneth R.", ParagraphStyle("mname", fontSize=13, textColor=WHITE, alignment=TA_CENTER, fontName="Helvetica-Bold")))
    elems.append(P("Aying, Clifford S.",   ParagraphStyle("mname2",fontSize=13, textColor=WHITE, alignment=TA_CENTER, fontName="Helvetica-Bold")))
    elems.append(SP(0.8))
    elems.append(P("Capstone Project · 2026", ParagraphStyle("yr", fontSize=10, textColor=colors.HexColor("#64748b"), alignment=TA_CENTER)))
    elems.append(PB())
    return elems

story += cover_page()

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 1 — WHAT IS ROOTINE?
# ════════════════════════════════════════════════════════════════════════════
story += [
    P("Chapter 1 — What is Rootine?", CHAPTER), HR(),
    P("""
    Imagine you want to drink 8 glasses of water every day, go to the gym 3 times a week,
    and read for 30 minutes each morning. You try to remember all of this in your head — and
    you forget. You try writing it on paper — the paper gets lost.
    """, BODY),
    P("""
    <b>Rootine solves this.</b> It is a habit-tracking app where users can list their habits,
    mark them done every day, and watch their progress grow over time. Think of it like a
    personal coach who keeps track of your routines — and reminds you when you forget.
    """, BODY),
    SP(0.3),
    P("What this document covers", SECTION),
    P("""
    This document explains the <b>backend</b> — the behind-the-scenes engine that powers Rootine.
    The backend is like the kitchen of a restaurant. The customer (the app on your phone) orders food,
    but all the cooking, storing, and preparing happens in the kitchen — out of sight, but absolutely essential.
    """, BODY),
    SP(0.3),
    P("The backend handles:", SUBSECT),
    P("• <b>Accounts</b> — signing up, logging in, verifying your email, resetting passwords", BODY),
    P("• <b>Tasks/Habits</b> — creating, editing, deleting, archiving, and reordering your habits", BODY),
    P("• <b>Completions</b> — recording when you finish a habit each day", BODY),
    P("• <b>Streaks</b> — calculating how many days in a row you've kept a habit", BODY),
    P("• <b>Reminders</b> — sending you emails so you don't forget your habits", BODY),
    P("• <b>Settings</b> — letting you update your name, email, phone, password, and timezone", BODY),
    PB(),
]

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 2 — HOW THE BACKEND IS ORGANIZED
# ════════════════════════════════════════════════════════════════════════════
story += [
    P("Chapter 2 — How the Backend is Organized", CHAPTER), HR(),
    P("""
    The backend follows a <b>layered architecture</b>. Think of it like a company with different departments —
    each department has one job and doesn't interfere with the others.
    """, BODY),
    SP(0.3),
]

arch_data = [
    ["Layer", "Department Analogy", "Job"],
    ["Routes",        "Reception desk",         "Decides which request goes where"],
    ["Controllers",   "Call center agents",     "Receives the request, sends it to the right service"],
    ["Services",      "The decision-makers",    "Business logic — figures out what to do"],
    ["Repositories",  "The file clerks",        "All database read/write operations"],
    ["DB Schema",     "The filing cabinet blueprint", "Defines how data is stored"],
    ["Middlewares",   "Security guards",        "Check identity and validate inputs before anything runs"],
    ["Utils",         "Toolbox",                "Shared helper tools used by many layers"],
]

arch_table = Table(arch_data, colWidths=[3.8*cm, 5.5*cm, 7.5*cm])
arch_table.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,0),  GREEN),
    ("TEXTCOLOR",    (0,0), (-1,0),  WHITE),
    ("FONTNAME",     (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",     (0,0), (-1,-1), 9),
    ("ROWBACKGROUNDS",(0,1),(-1,-1), [LIGHT_BG, WHITE]),
    ("GRID",         (0,0), (-1,-1), 0.4, BORDER),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ("PADDING",      (0,0), (-1,-1), 6),
]))
story += [arch_table, SP(0.5),
    P("""
    <b>Why organize it this way?</b> Because if something breaks, you know exactly where to look.
    If a reminder isn't being sent — check the services/reminder folder. If the database isn't saving
    data correctly — check the repositories. Each part is isolated <b>so that</b> one problem doesn't
    affect everything else.
    """, CALLOUT_G),
    PB(),
]

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 3 — FILE-BY-FILE EXPLANATION
# ════════════════════════════════════════════════════════════════════════════
story += [P("Chapter 3 — File-by-File Explanation", CHAPTER), HR()]

def file_block(filename, filepath, what, why, purpose, when, example=None, extra=None):
    """Render a detailed explanation block for one file."""
    items = []
    items.append(KeepTogether([
        P(filename, SECTION),
        P(f"<font color='#64748b' size='8'>{filepath}</font>", BODY),
        HR(),
        P(f"<b>📌 What is it?</b>", SUBSECT),
        P(what, BODY),
        SP(0.2),
        P(f"<b>❓ Why does it exist?</b>", SUBSECT),
        P(why, BODY),
        SP(0.2),
        P(f"<b>🎯 Purpose</b>", SUBSECT),
        P(purpose, CALLOUT_G),
        SP(0.2),
        P(f"<b>🕐 When does it run?</b>", SUBSECT),
        P(when, BODY),
    ]))
    if example:
        items.append(SP(0.2))
        items.append(P("<b>💡 Real-life example</b>", SUBSECT))
        items.append(P(example, CALLOUT_Y))
    if extra:
        items.append(SP(0.2))
        items.append(P(extra, CALLOUT_B))
    items.append(SP(0.5))
    return items

# ── server.ts ─────────────────────────────────────────────────────────────
story += file_block(
    "server.ts",
    "src/server.ts",
    "This is the <b>entry point</b> — the very first file that runs when you start the Rootine backend. It imports the configured app and tells it to start listening for incoming requests.",
    "Because something has to turn the engine on. If you build a car but never turn the key, it goes nowhere. <b>server.ts is the ignition.</b> Without it, the entire backend sits idle — no requests are accepted, no emails are sent, nothing works.",
    "Start the HTTP server on the configured port and launch the background reminder worker so email reminders begin running immediately.",
    "Every single time you run <code>npm run dev</code> or <code>node dist/server.mjs</code>. It runs once at startup and stays alive until the server is shut down.",
    example="Think of it like opening a store. server.ts is the manager who arrives first, unlocks the door (starts the server), and turns on the lights (starts the reminder worker) — <b>so that</b> everything is ready before the first customer walks in.",
)

# ── app.ts ────────────────────────────────────────────────────────────────
story += file_block(
    "app.ts",
    "src/app.ts",
    "This file sets up the Express application — all the security layers, parsing tools, and route connections. Think of it as the <b>building layout</b> of the entire backend.",
    "Because a server without security is like a bank with no locks. <b>If we skipped this file</b>, anyone could send unlimited requests, inject malicious data, or crash the server with a single huge message. Every protection we add here shields all routes at once.",
    "Configure the Express app with: rate limiting, CORS, security headers (Helmet), body size limit, cookie parsing, and all route registrations — <b>in order for</b> every request to pass through the right checks before reaching any controller.",
    "Once at startup (when server.ts imports app.ts). After that, the configuration stays loaded for the lifetime of the server.",
    example="Imagine airport security. Before you reach your gate (your controller), you go through: check-in (rate limiter), passport control (auth middleware), bag X-ray (body parser), customs (CORS). <b>app.ts is the airport layout that defines all those checkpoints.</b>",
    extra="<b>What if we removed rate limiting?</b> Then a hacker could try 10,000 passwords per minute on the login endpoint. With rate limiting: only 10 attempts per 15 minutes per IP — then the door locks automatically.",
)

story += [PB()]

# ── config/env.ts ─────────────────────────────────────────────────────────
story += file_block(
    "env.ts",
    "src/config/env.ts",
    "Loads all environment variables (from the <code>.env</code> file) into one clean object called <code>ENV</code>. Every other file gets its settings from this single source.",
    "Because hardcoding secrets (like passwords or database URLs) directly in source code is dangerous — if someone sees your code, they see your secrets. <b>env.ts keeps secrets separate from code</b>, and it throws an error immediately if a required secret is missing.",
    "Be the single source of truth for all configuration values — <b>so that</b> every file reads settings from one place and the app refuses to start if critical settings like <code>JWT_SECRET</code> or <code>DATABASE_URL</code> are missing.",
    "At server startup, before anything else runs. <b>If a required variable is missing, the app crashes immediately</b> with a clear message — better to know at startup than to crash mysteriously 10 minutes into serving users.",
    example="Think of it like a pilot's pre-flight checklist. Before the plane takes off, the pilot confirms fuel, engines, radio. <b>If the fuel gauge is missing, the plane doesn't take off.</b> env.ts is that checklist — it checks all critical settings before the server 'takes off'.",
)

# ── db/schema.ts ─────────────────────────────────────────────────────────
story += file_block(
    "db/schema.ts",
    "src/db/schema.ts",
    "Defines the exact structure of every table in the PostgreSQL database — users, tokens, tasks, and task_completions. This is the <b>blueprint of the data storage system</b>.",
    "Because a database without a clear structure is chaos. <b>What if</b> one part of the app saves a user's email as 'email' and another part looks for it as 'e_mail'? Nothing would match. schema.ts enforces one consistent structure <b>so that</b> every part of the app speaks the same language.",
    "Define all database tables, their columns, their types, their rules (required/optional, unique, default values), and their relationships — <b>in order for</b> Drizzle ORM to know exactly how to read and write data.",
    "Never runs directly at request time — it's a definition file. It's used by Drizzle when generating migrations and by repositories whenever they query the database.",
    example="Think of it like designing a form. Before printing 1,000 registration forms, you design the layout — Name (required), Email (unique, required), Phone (required). <b>schema.ts is that form design.</b> Once set, everyone fills in the same fields in the same format.",
    extra="<b>Tables defined:</b> users (accounts), tokens (refresh/verify/reset tokens), tasks (habits), task_completions (daily logs). Each table has auto-generated UUIDs as IDs — like automatically assigning a unique student ID to every new enrolment.",
)

story += [PB()]

# ── db/index.ts ───────────────────────────────────────────────────────────
story += file_block(
    "db/index.ts",
    "src/db/index.ts",
    "Creates and exports the single database connection instance (<code>db</code>) using Drizzle ORM and the DATABASE_URL from env.ts.",
    "Because we need exactly one connection to the database — not one per file, not one per request. <b>If every file opened its own connection</b>, we'd exhaust the database's connection limit in seconds. One shared connection pool handles everything efficiently.",
    "Open a connection to the PostgreSQL database once and share it across all repositories — <b>so that</b> the entire backend uses one managed pool of connections.",
    "Once at startup. Every repository imports <code>db</code> from this file whenever it needs to query or write data.",
    example="Like a shared office printer. Instead of everyone buying their own printer, one printer is set up in the office and everyone sends their jobs to it. <b>db/index.ts is that shared printer — one connection, many users.</b>",
)

# ── middlewares/auth-middleware.ts ────────────────────────────────────────
story += file_block(
    "auth-middleware.ts",
    "src/middlewares/auth-middleware.ts",
    "A security guard that checks every protected request for a valid JWT access token. If the token is missing, expired, or fake — the request is rejected before it reaches any controller.",
    "Because without this, <b>anyone</b> could access anyone's tasks by just calling the API directly. The auth middleware is what separates 'logged in' from 'anonymous'. Every protected route uses it.",
    "Verify the <code>Authorization: Bearer &lt;token&gt;</code> header on incoming requests, decode the user ID from the token, and attach it to the request — <b>so that</b> every controller downstream knows who made the request without asking again.",
    "On every request to a protected endpoint (tasks, user settings). It runs before the controller — like a checkpoint before the entrance.",
    example="Imagine a concert. You bought a ticket (logged in and got a token). At the gate, the staff scans it (auth-middleware). <b>If it's valid — you enter. If it's expired or fake — you're turned away.</b> The concert hall (controller) never sees people who didn't pass the gate.",
    extra="<b>What if the token is missing?</b> Returns 401 Unauthorized instantly — the controller never runs. <b>What if the token is expired?</b> Same result — 401. The user must refresh their token first.",
)

story += [PB()]

# ── middlewares/schema-middleware.ts ──────────────────────────────────────
story += file_block(
    "schema-middleware.ts",
    "src/middlewares/schema-middleware.ts",
    "A validation guard that checks the shape of incoming request data using Zod schemas. If the data doesn't match the expected format, it returns a 400 error with a specific explanation.",
    "Because controllers should never receive garbage data. <b>What if</b> someone sends a registration request with no email? Without this, the signup code would crash trying to process an empty field. <b>This middleware catches bad data before it ever reaches business logic.</b>",
    "Validate every request body against its Zod schema — <b>so that</b> controllers always receive clean, correct, typed data and never need to write their own validation checks.",
    "On every route that has validation — which is almost all of them. It runs after the auth check but before the controller.",
    example="Like a bank teller who checks your deposit form before processing it. If you left the amount blank, they hand it back: 'Please fill in the amount.' <b>They don't process an incomplete form.</b> schema-middleware does the same for API requests.",
)

# ── middlewares/error-middleware.ts ───────────────────────────────────────
story += file_block(
    "error-middleware.ts",
    "src/middlewares/error-middleware.ts",
    "The last safety net in the application. If any controller or service throws an unexpected error, this middleware catches it and returns a clean, consistent error response instead of crashing.",
    "Because without it, any unhandled database crash or code bug would leak raw error messages (with file paths, stack traces) to the client — which is both confusing and a security risk. <b>This keeps errors contained and controlled.</b>",
    "Catch any error that bubbles up from controllers or services and return a structured <code>{status: 'error', message: '...'}</code> response — <b>so that</b> the client always gets a predictable response, even when something unexpected goes wrong.",
    "Only when an error actually occurs — it's the last middleware in the chain. In development it also returns the full stack trace <b>so that</b> developers can debug easily.",
    example="Like a hospital's emergency department. Most people come in through the front door (normal routes), but if something goes wrong anywhere — an accident, a collapse — the ER catches it. <b>error-middleware is the ER of the backend.</b>",
)

story += [PB()]

# ── middlewares/async-handler.ts ──────────────────────────────────────────
story += file_block(
    "async-handler.ts",
    "src/middlewares/async-handler.ts",
    "A tiny wrapper that makes every async controller function automatically forward its errors to the error middleware. Without this, async errors would cause the server to hang or crash silently.",
    "Because Express (the framework we use) doesn't automatically catch errors from async functions. <b>If we didn't wrap our controllers</b>, a database timeout would cause the request to hang forever — the user would wait indefinitely with no response.",
    "Wrap every async controller <b>so that</b> if a database call or service throws any error, it's automatically caught and passed to the error middleware — without writing try/catch in every single controller.",
    "It wraps each controller at startup (when routes are defined). The actual catching happens at runtime, whenever an async error occurs.",
    example="Like a safety net under a tightrope walker. You don't use it until something goes wrong — but the moment the walker slips, the net catches them before they hit the ground. <b>async-handler is that net for every controller.</b>",
)

# ── schema/auth-schema.ts ─────────────────────────────────────────────────
story += file_block(
    "auth-schema.ts",
    "src/schema/auth-schema.ts",
    "Defines the validation rules for every authentication request: register, login, forgot-password, reset-password, verify-email, resend-verification, refresh-token, and logout.",
    "Because user input can never be trusted. <b>What if</b> someone tries to register with an empty password, or a fake email like 'abc'? auth-schema.ts catches those cases immediately — before any service or database is involved.",
    "Define exactly what valid input looks like for each auth endpoint — <b>so that</b> the validation middleware has clear rules to enforce and services always receive correct data.",
    "When a request arrives at any auth route. The schema-middleware applies these rules before the controller runs.",
    example="Like a visa application form. The form says: passport number must be exactly 9 characters, date of birth must be a real date, photo must be 2×2 inches. <b>If you submit it wrong, it's rejected at the counter — not after flying to the embassy.</b>",
    extra="<b>Password rule:</b> must have uppercase, lowercase, number, and special character. Why? Because 'password123' is one of the most commonly hacked passwords in the world. Enforcing complexity makes brute-force attacks much harder.",
)

story += [PB()]

# ── schema/task-schema.ts ─────────────────────────────────────────────────
story += file_block(
    "task-schema.ts",
    "src/schema/task-schema.ts",
    "Defines validation rules for task operations — creating, updating, reordering, completing, and uncompleting tasks. Includes rules for reminder settings and schedule configuration.",
    "Because tasks have many fields with specific rules. <b>What if</b> someone sets a reminder time as '25:99' or a days-of-week array with the value 9 (which isn't a real day)? task-schema.ts blocks these before they reach the database.",
    "Validate all task-related request bodies — <b>so that</b> only logically correct tasks are ever saved to the database.",
    "Every time a task is created, edited, completed, or reordered.",
    example="Like a gym registration form that checks: start date must be in the future, package must be one of Bronze/Silver/Gold, payment amount must match the package. Wrong input? Rejected before processing.",
)

# ── schema/user-settings-schema.ts ───────────────────────────────────────
story += file_block(
    "user-settings-schema.ts",
    "src/schema/user-settings-schema.ts",
    "Validation rules for user settings: updating profile fields, requesting an email change, verifying a new email, and changing a password.",
    "Because user settings are sensitive. <b>If</b> someone sends a new password without the required complexity, or an email in the wrong format, this schema catches it immediately.",
    "Enforce correct formats for all user-settings endpoints — <b>so that</b> profile updates, email changes, and password changes always contain valid, safe data.",
    "Every time a user tries to update their profile, change their email, or change their password.",
)

story += [PB()]

# ── services/auth/ ────────────────────────────────────────────────────────
story += [P("Authentication Services", CHAPTER), HR()]

story += file_block(
    "Sign-Up-Service.ts",
    "src/services/auth/Sign-Up-Service.ts",
    "Handles the full user registration process: check for duplicate email, hash the password, save the user, then send a verification email.",
    "Because registration is more than just saving data. <b>If we just saved the raw password</b>, a database breach would expose every user's password. Hashing means even we can't see it. <b>If we didn't check for duplicate emails</b>, two users could share one account.",
    "Safely create a new user account — <b>so that</b> passwords are never stored as plain text and every new user must verify their email before they can log in.",
    "When <code>POST /api/v1/auth/register</code> is called.",
    example="Like a new employee onboarding. HR (Sign-Up) checks: is this person already employed? No? Then creates their employee profile, assigns a secure ID badge (password hash), and sends them a welcome email with an activation link (verification email).",
    extra="<b>Then</b> the user receives a verification token in their email. <b>If they never verify</b> — they can't log in. This prevents fake accounts made with someone else's email.",
)

story += file_block(
    "Log-In-Service.ts",
    "src/services/auth/Log-In-Service.ts",
    "Handles login: find the user by email, compare the password hash, check email verification, then issue a JWT access token and a refresh token.",
    "Because logging in involves multiple security checks — not just 'does this email exist?' <b>If we skipped the emailVerified check</b>, unverified accounts could log in. <b>If we didn't hash-compare properly</b>, any password would work.",
    "Securely authenticate a user and issue tokens — <b>so that</b> only the real owner of a verified account can access protected endpoints.",
    "When <code>POST /api/v1/auth/login</code> is called.",
    example="Like a bank ATM. You insert your card (email), enter your PIN (password). The ATM compares your PIN to the encrypted one on file — not the raw PIN. <b>If they match AND your account is active (verified)</b> — you get access. The access token is like a daily temporary passcode.",
    extra="<b>Access token</b> lasts 10 minutes — short on purpose. <b>Refresh token</b> lasts 7 days. <b>Why two tokens?</b> The access token is used constantly (so it must be short for safety). The refresh token is stored safely and used only to get a new access token when it expires — like renewing a day pass without signing in again.",
)

story += [PB()]

story += file_block(
    "Email-Verification-Service.ts",
    "src/services/auth/Email-Verification-Service.ts",
    "Generates a secure verification token, stores a hashed version in the database, and emails the raw token to the user. Also handles verifying the token when the user submits it.",
    "Because we need to confirm the user actually owns the email they registered with. <b>What if</b> someone registers with your email? You'd receive the verification email, see it's not yours, and ignore it — so the account stays locked. This protects real owners.",
    "Prove ownership of an email address — <b>so that</b> only real people with access to the inbox can activate an account.",
    "When a user registers (auto-sent) or when they click 'resend verification'.",
    example="Like activating a new SIM card. The telecom sends an OTP to your registered number. <b>If you receive it, you own the number.</b> If someone registered your number without your permission — you receive the OTP, they don't, account stays inactive.",
    extra="<b>The token itself is never stored</b> — only its SHA-256 hash is saved. So even if someone accessed the database, they couldn't use the stored value as a token. <b>Because</b> SHA-256 is a one-way function — you can't reverse it.",
)

story += file_block(
    "Forgot-Password-Service.ts",
    "src/services/auth/Forgot-Password-Service.ts",
    "Handles the forgot-password flow: generate a secure reset token, hash and store it, and email it. Also handles the reset-password step that actually updates the password.",
    "Because people forget passwords. <b>If there was no reset flow</b>, a user who forgot their password would be permanently locked out. But the reset must be secure — <b>if</b> anyone could reset any password by just knowing the email, accounts could be hijacked.",
    "Allow legitimate users to regain account access — <b>so that</b> only someone with inbox access to the registered email can reset the password.",
    "When <code>POST /api/v1/auth/forgot-password</code> and then <code>POST /api/v1/auth/reset-password</code> are called.",
    example="Like a building with a locked door. You lost your key (forgot password). You call the landlord (forgot-password endpoint) — they send a one-time code to your registered contact. <b>You use that code to get a new key.</b> Someone who doesn't have access to your contact can't get the code.",
)

story += [PB()]

story += file_block(
    "Refresh-Token-Service.ts",
    "src/services/auth/Refresh-Token-Service.ts",
    "Handles two things: refreshing an access token using a refresh token, and logging out by revoking a refresh token.",
    "Because access tokens expire every 10 minutes. <b>If there was no refresh mechanism</b>, users would have to log in again every 10 minutes — terrible experience. Refresh tokens allow silent re-authentication in the background.",
    "Keep users logged in without re-entering their password — <b>so that</b> the short-lived access token can be replaced automatically before the user even notices it expired.",
    "When <code>POST /api/v1/auth/refresh-token</code> is called (usually automatically by the app). Also when <code>POST /api/v1/auth/logout</code> is called.",
    example="Like a parking ticket that's valid for 10 minutes, but you have a season pass (refresh token) in your pocket. When the ticket expires, you flash the season pass to get a new 10-minute ticket — <b>without going back to the booth to buy another one.</b>",
    extra="<b>Token rotation:</b> every time a refresh token is used, the old one is consumed and a brand new one is issued. <b>Then if</b> a hacker steals an old refresh token, it's already been consumed — it no longer works.",
)

# ── services/task/ ────────────────────────────────────────────────────────
story += [PB(), P("Task Services", CHAPTER), HR()]

story += file_block(
    "task-service.ts",
    "src/services/task/task-service.ts",
    "Contains all the business logic for managing habits/tasks: create, list (paginated), get one, update, soft-delete, archive, unarchive, reorder, and generate the today-dashboard and per-task statistics.",
    "Because tasks are the core of Rootine. This file is the brain behind everything task-related. <b>Without it</b>, there's no way to create habits, no dashboard, no stats — the app has nothing for the user to do.",
    "Translate requests into correct database actions and return meaningful results — <b>so that</b> the user's habits are managed correctly, today's tasks are filtered by their timezone, and streaks are calculated accurately.",
    "Every time a user interacts with their tasks — creating, editing, viewing, completing.",
    example="Like a task manager at a company. Every employee request ('I need a new laptop', 'Schedule a meeting') goes to the task manager, who decides what to do with it, coordinates the right departments, and comes back with a result.",
    extra="<b>Dashboard optimization:</b> The today-dashboard fetches today's completions in one fast query (status check), then fetches full history per task (streak calculation). <b>Because</b> showing wrong streak numbers would be misleading — users trust their streak counts.",
)

story += [PB()]

story += file_block(
    "task-completion-service.ts",
    "src/services/task/task-completion-service.ts",
    "Handles marking a task as complete or uncomplete for a given day. Supports multiple completions per day (e.g. drink 8 glasses of water — each glass is one completion).",
    "Because completing a task is not binary for all habits. <b>What if</b> your habit is '8 glasses of water daily'? You need to record each glass, not just 'done/not done'. This service handles those nuances.",
    "Record, update, or remove completions accurately — <b>so that</b> streaks, progress percentages, and statistics are always based on real data.",
    "When <code>POST /api/v1/tasks/:id/complete</code> or <code>DELETE /api/v1/tasks/:id/complete</code> is called.",
    example="Like a punch card at a coffee shop. Each visit, the staff punches one hole. The 10th punch gets you a free coffee. <b>Each 'complete' call punches one hole</b>. The system tracks the total count.",
)

# ── services/reminder/ ────────────────────────────────────────────────────
story += file_block(
    "reminder-worker.ts",
    "src/services/reminder/reminder-worker.ts",
    "A background process that runs every 60 seconds, checks all tasks with reminders enabled, and sends email reminders when it's time — respecting quiet hours, daily limits, and stopping once a task is completed.",
    "Because users forget their habits. <b>Without reminders</b>, Rootine is just a to-do list. With reminders, it's an active coach. <b>But if</b> reminders were sent without limits, it would become spam. So there are smart rules: quiet hours, max per day, and auto-stop on completion.",
    "Proactively remind users about incomplete habits — <b>so that</b> they stay on track without feeling overwhelmed by notifications.",
    "Automatically, every 60 seconds, in the background while the server is running. Also runs a daily token cleanup once per day.",
    example="Like a personal assistant who checks your calendar every hour. If you haven't marked a meeting as attended and it's between 7AM–10PM, they send you a nudge. <b>But if you've already attended, they stop nudging.</b> And they won't bother you at midnight.",
    extra="<b>Anti-spam rules:</b> (1) Quiet hours: no reminders from 10PM–7AM. (2) Max daily reminders: configurable, default 4. (3) Interval between reminders: configurable, default 1 hour. (4) Auto-stop: once the task is marked complete today, reminders stop until tomorrow.",
)

story += [PB()]

# ── services/user/ ────────────────────────────────────────────────────────
story += file_block(
    "user-settings-service.ts",
    "src/services/user/user-settings-service.ts",
    "Handles all user profile management: updating profile fields, requesting an email change (with verification), confirming a new email with a token, and changing the password (requires current password).",
    "Because users' lives change — they move cities, change phones, change passwords. <b>If there was no way to update these</b>, users would be stuck with whatever they entered at registration forever.",
    "Allow users to keep their profile accurate and secure — <b>so that</b> reminders go to the right email, the timezone is correct for streak calculations, and accounts remain secure.",
    "When any <code>/api/v1/users/me</code> endpoint is called.",
    example="Like updating your employee record at HR. You got married and changed your name, moved to a new city, and want a new work email. HR verifies your identity (current password), sends a confirmation to the new email, and only updates after you confirm.",
    extra="<b>Email change flow:</b> Step 1 — request change (token sent to NEW email). Step 2 — verify with token. <b>Why two steps?</b> Because if we updated the email immediately, someone who knows your password could lock you out of your account by changing your email to theirs.",
)

# ── repositories/ ─────────────────────────────────────────────────────────
story += [PB(), P("Repositories — The Database Layer", CHAPTER), HR(),
    P("""
    Repositories are the only files allowed to talk directly to the database.
    Think of them as <b>librarians</b> — if you want a book (data), you ask the librarian.
    You don't go into the back room yourself.
    <b>In order for</b> the rest of the app to stay clean and testable, only repositories touch the database.
    """, CALLOUT_G),
    SP(0.4),
]

repos = [
    ("user-repository.ts",          "src/repositories/user-repository.ts",          "Find users by email or ID, create accounts, update passwords, set email-verified status, and update timezone."),
    ("user-settings-repository.ts", "src/repositories/user-settings-repository.ts", "Update profile fields (name, phone, city, country), update email (and mark unverified), update password hash, check if an email is taken."),
    ("token-repository.ts",         "src/repositories/token-repository.ts",         "Create tokens, find by hash, mark consumed or revoked, revoke all active tokens for a user+type, and delete expired tokens."),
    ("task-repository.ts",          "src/repositories/task-repository.ts",          "Create tasks, find by ID+user, list with pagination, update, soft-delete, archive/unarchive, and batch-reorder positions."),
    ("task-completion-repository.ts","src/repositories/task-completion-repository.ts","Find completion by task+date, upsert (create or increment), delete, list by task, list by user+date, list all by user."),
]

for fname, fpath, desc in repos:
    story += [
        KeepTogether([
            P(fname, SECTION),
            P(f"<font color='#64748b' size='8'>{fpath}</font>", BODY),
            P(desc, CALLOUT_B),
            SP(0.3),
        ])
    ]

story += [PB()]

# ── utils/ ────────────────────────────────────────────────────────────────
story += [P("Utilities — The Toolbox", CHAPTER), HR()]

story += file_block(
    "mailer.ts",
    "src/utils/mailer.ts",
    "Configures the email transport (Nodemailer with Gmail SMTP or generic SMTP) and provides a single <code>sendEmail()</code> function used everywhere an email needs to be sent.",
    "Because emails are sent in 4 different places (verification, password reset, task reminders, email-change confirmation). <b>If each place set up its own email transport</b>, any change to SMTP settings would require updating 4 files. Centralizing it means one change, all fixed.",
    "Provide a single, reusable email-sending function — <b>so that</b> all emails share the same sender configuration and switching email providers only requires changing one file.",
    "Every time any email needs to be sent. If SMTP is not configured in .env, it prints the email to the console instead (useful for development).",
    example="Like a company's mail room. Every department (HR, Finance, Support) puts letters in the outbox. The mail room handles the actual sending. <b>Departments don't need their own postage meters.</b>",
)

story += file_block(
    "timezone.ts",
    "src/utils/timezone.ts",
    "Helper functions to get the current date, time, hour, and day-of-week in a specific timezone. Used for streak calculations and reminder scheduling.",
    "Because users live all around the world. <b>What if</b> a user in Manila has a habit that resets at midnight — but the server is in UTC? Without timezone conversion, their 'today' resets at 8AM Manila time (UTC+8 midnight), which is completely wrong.",
    "Provide accurate local time for each user — <b>so that</b> streaks, today's dashboard, and reminders all reflect the user's actual local clock.",
    "By the reminder worker (to check if it's quiet hours) and by task-service (to filter today's tasks and calculate streaks).",
    example="Like a world clock app. Your friend in New York asks 'what day is it?' — in Manila it's already Tuesday, but in New York it's still Monday. <b>timezone.ts makes sure each user's 'today' is calculated in their own local time.</b>",
)

story += file_block(
    "streak-calculator.ts",
    "src/utils/streak-calculator.ts",
    "Calculates current streak, best streak, total completions, and completion rate for a task — correctly handling all three frequency types: Daily, Specific Days, and Times Per Week.",
    "Because a streak is not just 'days in a row'. A habit scheduled for Mondays and Wednesdays only — missing Tuesday doesn't break the streak. <b>If we used a simple consecutive-day algorithm</b>, every non-scheduled day would look like a missed day and break the streak incorrectly.",
    "Calculate meaningful, accurate streak data — <b>so that</b> users see honest progress that accounts for their specific schedule.",
    "When the stats endpoint is called or the today-dashboard loads.",
    example="Like a school attendance record. A student has Monday-Wednesday-Friday classes. Missing Tuesday doesn't mean they were absent — Tuesday wasn't a school day. <b>streak-calculator knows each task's schedule and only counts the days that matter.</b>",
)

story += [PB()]

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 4 — SECURITY LAYERS
# ════════════════════════════════════════════════════════════════════════════
story += [
    P("Chapter 4 — Security Layers", CHAPTER), HR(),
    P("Every layer below is active on every request. Think of them as rings of a castle wall.", BODY),
    SP(0.3),
]

sec_data = [
    ["Layer", "What it does", "Real-life analogy"],
    ["Rate Limiting",       "Max 100 req/15 min global; max 10 on auth routes",   "Bouncer who lets only N people through per hour"],
    ["Helmet",              "Sets 15+ security HTTP headers automatically",        "A locked display case that prevents tampering"],
    ["CORS",                "Only allows requests from your configured frontend",  "Guest list — unlisted domains turned away"],
    ["HPP",                 "Blocks HTTP Parameter Pollution attacks",             "A form clerk who rejects duplicate fields"],
    ["Body Size Limit",     "Max 10 KB per request body",                         "Post office refusing oversized packages"],
    ["Auth Middleware",     "Validates JWT on every protected route",              "Concert gate scanner"],
    ["Zod Validation",      "Validates every input before it reaches services",   "Visa form checker"],
    ["bcrypt",              "Passwords hashed with cost factor 12",               "Safe that turns your PIN into an unreadable code"],
    ["Token Hashing",       "Refresh/verify tokens stored as SHA-256 hashes",     "Storing fingerprint instead of the key"],
    ["Email Verification",  "Accounts locked until email confirmed",              "Activating a SIM — you must confirm the OTP"],
    ["Refresh Rotation",    "Old refresh token consumed when new one issued",     "Season pass that renews itself each use"],
    ["Token Cleanup",       "Expired tokens deleted nightly",                     "Janitor clearing expired visitor badges"],
    ["asyncHandler",        "All async errors forwarded to error middleware",     "Safety net under tightrope walker"],
    ["Required ENV vars",   "App won't start if JWT_SECRET or DATABASE_URL missing", "Plane won't take off without fuel confirmed"],
]

sec_table = Table(sec_data, colWidths=[4.2*cm, 6.5*cm, 6.1*cm])
sec_table.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  GREEN),
    ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 8.5),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [LIGHT_BG, WHITE]),
    ("GRID",          (0,0), (-1,-1), 0.4, BORDER),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ("PADDING",       (0,0), (-1,-1), 5),
]))
story += [sec_table, PB()]

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 5 — API ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
story += [P("Chapter 5 — API Endpoints Reference", CHAPTER), HR(),
    P("All endpoints are prefixed with <b>/api/v1</b>. Protected routes (🔒) require <code>Authorization: Bearer &lt;token&gt;</code>.", BODY),
    SP(0.3),
]

ep_data = [
    ["Method", "Endpoint", "Auth", "What it does"],
    ["POST",   "/auth/register",           "—",  "Create new account"],
    ["POST",   "/auth/login",              "—",  "Login — returns token + refreshToken + expiresIn"],
    ["POST",   "/auth/logout",             "—",  "Revoke refresh token"],
    ["POST",   "/auth/verify-email",       "—",  "Confirm email with token from inbox"],
    ["POST",   "/auth/resend-verification","—",  "Re-send verification email"],
    ["POST",   "/auth/forgot-password",    "—",  "Send password reset token"],
    ["POST",   "/auth/reset-password",     "—",  "Reset password using token"],
    ["POST",   "/auth/refresh-token",      "—",  "Get new access token using refresh token"],
    ["GET",    "/auth/me",                 "🔒", "Get current user profile"],
    ["GET",    "/tasks",                   "🔒", "List tasks (paginated: ?page=1&limit=20)"],
    ["POST",   "/tasks",                   "🔒", "Create a new task/habit"],
    ["GET",    "/tasks/today",             "🔒", "Today's dashboard with progress %"],
    ["GET",    "/tasks/:id",               "🔒", "Get one task"],
    ["PATCH",  "/tasks/:id",               "🔒", "Update a task"],
    ["DELETE", "/tasks/:id",               "🔒", "Soft-delete a task"],
    ["PATCH",  "/tasks/:id/archive",       "🔒", "Archive a task"],
    ["PATCH",  "/tasks/:id/unarchive",     "🔒", "Restore from archive"],
    ["PUT",    "/tasks/reorder",           "🔒", "Reorder tasks by drag position"],
    ["POST",   "/tasks/:id/complete",      "🔒", "Mark task complete for today"],
    ["DELETE", "/tasks/:id/complete",      "🔒", "Undo today's completion"],
    ["GET",    "/tasks/:id/completions",   "🔒", "List all completions for a task"],
    ["GET",    "/tasks/:id/stats",         "🔒", "Streak & statistics for a task"],
    ["GET",    "/users/me",                "🔒", "Get full profile"],
    ["PATCH",  "/users/me",                "🔒", "Update profile (name, phone, city, country, timezone)"],
    ["PATCH",  "/users/me/email",          "🔒", "Request email change (sends token to new email)"],
    ["POST",   "/users/me/email/verify",   "🔒", "Confirm new email with token"],
    ["PATCH",  "/users/me/password",       "🔒", "Change password (current password required)"],
]

col_widths = [2*cm, 6*cm, 1.5*cm, 7.3*cm]
ep_table = Table(ep_data, colWidths=col_widths)
ep_table.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  DARK),
    ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 8.5),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [LIGHT_BG, WHITE]),
    ("GRID",          (0,0), (-1,-1), 0.4, BORDER),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ("PADDING",       (0,0), (-1,-1), 5),
]))
story += [ep_table, PB()]

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 6 — DATA FLOW (HOW A REQUEST TRAVELS)
# ════════════════════════════════════════════════════════════════════════════
story += [
    P("Chapter 6 — How a Request Travels", CHAPTER), HR(),
    P("Let's trace what happens when a user marks a task as complete. This shows how all the pieces work together.", BODY),
    SP(0.3),
]

flow = [
    ("1. User action",       "User taps 'Complete' in the app on their phone."),
    ("2. HTTP Request",      "App sends: POST /api/v1/tasks/abc-123/complete  with Bearer token in header."),
    ("3. Rate Limiter",      "Counts this IP's recent requests. Under 100/15min — allowed through."),
    ("4. Auth Middleware",   "Reads the token, verifies the JWT signature, extracts userId. Attaches to request."),
    ("5. Schema Middleware", "Validates the body (date, count, note, mood). All valid — continues."),
    ("6. Controller",        "completeTask() is called. Reads userId and taskId. Passes to service."),
    ("7. Service",           "completeTaskService() verifies the task belongs to this user. Calls repository."),
    ("8. Repository",        "taskCompletionRepository.recordCompletion() — inserts or updates the DB record."),
    ("9. Database",          "PostgreSQL saves the completion row. Returns the saved data."),
    ("10. Response",         "Result flows back up: Repository → Service → Controller → HTTP Response."),
    ("11. User sees",        "App receives {status: 'success', data: {completion: {...}}} — task marked ✅."),
]

for step, desc in flow:
    story.append(KeepTogether([
        Table(
            [[P(f"<b>{step}</b>", BODY), P(desc, BODY)]],
            colWidths=[4*cm, 12.8*cm],
            style=[
                ("BACKGROUND", (0,0), (0,0), GREEN),
                ("TEXTCOLOR",  (0,0), (0,0), WHITE),
                ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
                ("PADDING",    (0,0), (-1,-1), 6),
                ("GRID",       (0,0), (-1,-1), 0.3, BORDER),
            ]
        ),
        SP(0.1),
    ]))

story += [PB()]

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 7 — KEY DESIGN DECISIONS
# ════════════════════════════════════════════════════════════════════════════
story += [
    P("Chapter 7 — Key Design Decisions", CHAPTER), HR(),
    SP(0.2),
]

decisions = [
    ("Why soft-delete instead of hard-delete?",
     "When a user deletes a task, we set deletedAt = now() instead of removing the row. Because if we deleted the row, all past completions (linked to that task) would also disappear. The user would lose their history. Soft-delete preserves the data while hiding the task from the UI."),
    ("Why store tokens as SHA-256 hashes?",
     "If the database were ever breached, an attacker would find hashes — not the actual tokens. Because SHA-256 is one-way (you cannot reverse it), the attacker cannot use the hashes to log in. The real token only ever exists in the user's email or memory."),
    ("Why two tokens (access + refresh)?",
     "Access tokens are short-lived (10 min) so that if one is stolen, it expires quickly. But asking users to log in every 10 minutes is terrible UX. Refresh tokens (7 days) allow silent re-authentication. If a refresh token is stolen and rotated, the old one becomes invalid — the real user's next request will fail, alerting them to re-login."),
    ("Why separate repositories from services?",
     "Services contain 'what should happen'. Repositories contain 'how to ask the database'. If we switch from PostgreSQL to another database, we only rewrite repositories — services stay identical. This separation is called the Repository Pattern."),
    ("Why enforce email verification before login?",
     "Without verification, anyone could register with your email and potentially receive account-related communications or lock you out. Enforcing verification ensures only the real inbox owner can activate and use the account."),
    ("Why paginate the task list?",
     "What if a power user creates 500 tasks over 5 years? Returning all 500 in one response is slow, expensive, and wasteful. Pagination lets the frontend request only what it needs to display — 20 tasks at a time."),
]

for title, explanation in decisions:
    story += [
        KeepTogether([
            P(title, SUBSECT),
            P(explanation, CALLOUT_B),
            SP(0.3),
        ])
    ]

story += [PB()]

# ════════════════════════════════════════════════════════════════════════════
# CHAPTER 8 — SUMMARY TABLE
# ════════════════════════════════════════════════════════════════════════════
story += [
    P("Chapter 8 — Complete File Summary", CHAPTER), HR(), SP(0.2),
]

summary_data = [
    ["File", "Layer", "One-line purpose"],
    ["server.ts",                    "Entry",       "Starts the server and reminder worker"],
    ["app.ts",                       "Entry",       "Security, middleware, route registration"],
    ["config/env.ts",                "Config",      "Loads and validates environment variables"],
    ["db/schema.ts",                 "DB",          "Database table blueprints"],
    ["db/index.ts",                  "DB",          "Shared PostgreSQL connection pool"],
    ["middlewares/auth-middleware",  "Security",    "JWT token verification on protected routes"],
    ["middlewares/schema-middleware","Security",    "Zod request body validation"],
    ["middlewares/error-middleware", "Reliability", "Catches all unhandled errors"],
    ["middlewares/async-handler",    "Reliability", "Auto-forwards async errors to error handler"],
    ["schema/auth-schema",           "Validation",  "Auth endpoint input rules"],
    ["schema/task-schema",           "Validation",  "Task endpoint input rules"],
    ["schema/user-settings-schema",  "Validation",  "Settings endpoint input rules"],
    ["services/auth/Sign-Up",        "Service",     "New account creation + verification email"],
    ["services/auth/Log-In",         "Service",     "Authenticate + issue tokens"],
    ["services/auth/Email-Verify",   "Service",     "Send/verify email confirmation token"],
    ["services/auth/Forgot-Password","Service",     "Send/consume password reset token"],
    ["services/auth/Refresh-Token",  "Service",     "Token refresh + logout"],
    ["services/task/task-service",   "Service",     "All task CRUD, dashboard, stats"],
    ["services/task/completion-svc", "Service",     "Record/undo/list daily completions"],
    ["services/reminder/worker",     "Background",  "Smart email reminder engine"],
    ["services/user/settings-svc",   "Service",     "Profile, email, password management"],
    ["repositories/user-repo",       "DB Access",   "User account DB queries"],
    ["repositories/user-settings-repo","DB Access", "Profile update DB queries"],
    ["repositories/token-repo",      "DB Access",   "Token DB queries + expired cleanup"],
    ["repositories/task-repo",       "DB Access",   "Task DB queries with pagination"],
    ["repositories/completion-repo", "DB Access",   "Completion DB queries"],
    ["utils/mailer",                 "Util",        "Unified email sending"],
    ["utils/timezone",               "Util",        "User-local date/time helpers"],
    ["utils/streak-calculator",      "Util",        "Current/best streak calculations"],
    ["routes/auth-routes",           "Routes",      "Auth URL + method definitions"],
    ["routes/task-routes",           "Routes",      "Task URL + method definitions"],
    ["routes/user-routes",           "Routes",      "User settings URL + method definitions"],
]

s_col = [5.5*cm, 3*cm, 8.3*cm]
s_table = Table(summary_data, colWidths=s_col)
s_table.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  DARK),
    ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 8),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [LIGHT_BG, WHITE]),
    ("GRID",          (0,0), (-1,-1), 0.3, BORDER),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ("PADDING",       (0,0), (-1,-1), 4),
]))
story += [s_table, PB()]

# ════════════════════════════════════════════════════════════════════════════
# CLOSING PAGE
# ════════════════════════════════════════════════════════════════════════════
story += [
    SP(3),
    P("End of Documentation", ParagraphStyle("end", fontSize=22, textColor=GREEN, alignment=TA_CENTER, fontName="Helvetica-Bold")),
    SP(0.5),
    HR(),
    SP(0.5),
    P("Rootine Backend · Cordova Public College · Capstone Project 2026", ParagraphStyle("fin", fontSize=11, textColor=SLATE, alignment=TA_CENTER)),
    SP(0.3),
    P("Imperial, Kenneth R.  ·  Aying, Clifford S.", ParagraphStyle("fin2", fontSize=11, textColor=DARK, alignment=TA_CENTER, fontName="Helvetica-Bold")),
    SP(1.5),
    P("""
    This document was generated directly from the source code of the Rootine backend.
    Every explanation reflects the actual implementation — not a plan, but a description
    of what was built, why it was built that way, and how it all works together.
    """, ParagraphStyle("disc", fontSize=9, textColor=SLATE, alignment=TA_CENTER, leading=14)),
]

# ── Build ────────────────────────────────────────────────────────────────
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(f"PDF generated: {OUT}")

