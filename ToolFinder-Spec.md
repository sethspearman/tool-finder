# Tool Finder

*Software Project Specification*

*Version 1.0 | March 2026*

---

# 1. Project Overview

Tool Finder is a tool inventory and location tracking application
designed to help users organize their physical tools across structured,
nested storage locations. Users can register tools, define where those
tools live, place tools into locations, and then quickly locate and
check out tools during everyday use.

The application is built around four distinct operational modes, three
of which are primarily one-time setup and ongoing maintenance
activities, and one of which is the core daily usage experience.

# 2. Goals & Non-Goals

## 2.1 Goals

-   Allow users to define arbitrarily deep, nested storage locations
    (e.g., Garage > Shelf 3 > Red Bin).

-   Allow users to register individual tools with descriptions,
    barcodes, and optional UPC codes.

-   Support placement of tools into locations via a simple two-scan
    workflow.

-   Enable fast, fuzzy-text search to find tools when the exact name is
    unknown.

-   Display the full nested location path of any tool so users can
    navigate directly to it.

-   Support a check-out / check-in workflow so tool location stays
    current.

-   Allow tools to be returned to any location, not just their original
    spot.

-   Generate and print QR code labels for locations directly from the
    app.

-   Support offline use of Library Mode, including check-out and
    check-in, with background sync when connectivity returns.

-   Support bulk tool import via CSV upload to speed up initial setup.

## 2.2 Non-Goals (v1)

-   Multi-user collaboration or role-based permissions.

-   Integration with third-party inventory systems or purchasing
    platforms.

-   Automated low-stock or missing-tool notifications.

-   Tool reservation or scheduling.

# 3. Application Modes

The application operates in four named modes. The first three are
setup/maintenance modes; the fourth is the primary daily-use mode.

## 3.1 Location Setup Mode

Location Setup Mode is used to define the physical storage hierarchy.
Locations are nested: any location can contain child locations to any
depth. Examples:

-   Garage

    -   North Wall Pegboard

    -   Metal Shelving Unit

    -   Shelf 1

    -   Shelf 2 > Red Bin

    -   Shelf 2 > Blue Bin

Location Data Model

  ------------------ ----------------------------------------------------
  **Field**          Description

  **Location ID**    Unique identifier encoded in a physical QR code
                     label.

  **Name / Label**   Short human-readable name (e.g., \'Red Bin\',
                     \'Shelf 3\').

  **Description**    Optional longer text describing the location\'s
                     contents or purpose.

  **Photo**          Optional photo to help visually identify the
                     location.

  **Parent           Reference to the containing location, or null if
  Location**         this is a root.
  ------------------ ----------------------------------------------------

QR Label Generation

The app will generate printable QR code labels for each registered
location. Users no longer need to source pre-printed labels separately.
The workflow is:

-   User creates a location record in the app (name, description,
    optional photo).

-   The app generates a unique QR code for that location and offers a
    print view.

-   The print view renders labels at a standard size (e.g., 2x2 inch)
    suitable for laser or inkjet printing, optionally showing the
    location name below the QR code for human readability.

-   Multiple labels can be batched and printed on a single sheet.

-   User cuts and affixes labels to physical locations, then uses them
    during scan-based setup.

Setup Workflow

Once labels are affixed, the user runs the scan-based setup to establish
the hierarchy. In the app:

-   The user enters Location Setup Mode and scans from the outermost
    location inward.

-   Each scan adds or confirms a level in the hierarchy.

-   After scanning the final (innermost) location, the user confirms
    name, description, and optional photo.

-   The app resolves the full path automatically from the scan sequence.

Example: Scanning \[Garage QR\] then \[Shelf QR\] then \[Red Bin QR\]
establishes Garage > Shelf > Red Bin as a three-level path, linking
each child to its parent.

## 3.2 Tool Setup Mode

Tool Setup Mode is used to register individual tools in the system.

Tool Data Model

  ------------------ ----------------------------------------------------
  **Field**          Description

  **Tool ID**        Unique identifier encoded in a physical barcode or
                     QR label affixed to the tool.

  **Display Name**   Human-readable name (e.g., \'3/8 Drive Ratchet\',
                     \'Cordless Drill\').

  **Description**    Free-text description; used for fuzzy search (see
                     Section 4).

  **Handwritten ID** Optional short alphanumeric code written directly on
                     the tool for quick visual reference.

  **UPC Code**       Optional UPC barcode value if the tool has original
                     retail packaging.

  **Photo**          Optional photo of the tool.

  **Current          Set via Tool Placement Mode; null until placed.
  Location**         
  ------------------ ----------------------------------------------------

Setup Workflow

-   User scans the tool\'s barcode/QR label (or manually enters an ID).

-   User fills in name, description, optional handwritten ID, optional
    UPC.

-   Tool is saved and available for placement.

Note: Tool Setup Mode only registers the tool. Placement into a location
is done separately in Tool Placement Mode.

## 3.3 Tool Placement Mode

Tool Placement Mode brings together registered tools and registered
locations. It is designed as a rapid, repetitive scan-scan-next workflow
to physically sort tools into their storage spots.

Placement Workflow

-   User enters Tool Placement Mode.

-   User scans a tool barcode.

-   User scans the final (deepest) destination location QR code.

-   The app records the tool-to-location association and displays a
    confirmation.

-   User immediately scans the next tool, continuing until all tools are
    placed.

Only the final/innermost location needs to be scanned. The full nested
path is resolved automatically from the location hierarchy.

Notes

-   A tool can be placed in any registered location, including root
    locations if needed.

-   Re-scanning a tool that is already placed will update its location
    (moves the tool).

-   No confirmation prompt is required between scans to keep the
    workflow fast; undo of the last placement should be available.

## 3.4 Library Mode

Library Mode is the primary everyday-use interface. Users find tools,
navigate to them, check them out, and check them back in.

Finding a Tool

-   The user searches by name or description using a text search field.

-   Search uses fuzzy matching so partial, misspelled, or approximate
    descriptions still return relevant results. (This is sometimes
    called fuzzy search or approximate string matching. Yes, the term
    \'fuzzy logic\' is often used colloquially to describe this.)

-   Results display the tool name and its full nested location path
    (e.g., Garage > Metal Shelving > Shelf 2 > Red Bin).

Checking Out a Tool

-   User taps on a result to see full tool details and its current
    location.

-   User navigates to the location using the displayed path.

-   User scans the tool barcode to check it out.

-   The app marks the tool as \'checked out\' (location becomes \'with
    user / unknown\').

Checking In a Tool

-   When returning a tool, the user opens the check-in flow.

-   User scans the tool barcode.

-   User scans the destination location QR code (does not need to be the
    original location).

-   The app updates the tool\'s location to the scanned destination.

This two-scan check-in keeps tool location data accurate even when tools
are reorganized over time.

# 4. Search & Fuzzy Matching

Tool search is a core feature that must handle imprecise user input
gracefully. Users frequently will not remember the exact name of a tool
(e.g., searching for \'ratchet wrench\' or \'3/8 socket driver\' when
the tool is registered as \'3/8 Drive Ratchet\').

Recommended approach: PostgreSQL\'s built-in full-text search
(tsvector/tsquery) via EF Core, supplemented client-side by Fuse.js for
offline scenarios. The search should:

-   Match against the tool name and description fields.

-   Tolerate minor spelling variations and word-order differences.

-   Rank results by relevance, with closer matches appearing first.

-   Return results progressively as the user types (real-time search).

# 5. Platform & Technology

## 5.1 Scanning Considerations

QR code and barcode scanning is central to the app. This has meaningful
implications for the platform choice:

  ------------------ ----------------------------------------------------
  **Platform**       Scanning Support

  **Native Mobile    Full access to device camera via native APIs. Best
  App                scanning performance and reliability. Recommended
  (iOS/Android)**    for production.

  **Progressive Web  Modern browsers support camera access via the
  App (PWA)**        WebRTC/getUserMedia API and QR libraries (e.g.,
                     ZXing, html5-qrcode). Scanning works but may be
                     slightly slower or less reliable than native. A PWA
                     can be installed to the home screen and behaves
                     near-natively on modern iOS and Android.

  **Web App (browser Same camera access as PWA. Works well on mobile
  only)**            browsers. Less convenient on desktop unless a USB
                     barcode scanner is used (most present as keyboard
                     input, which is easy to support).
  ------------------ ----------------------------------------------------

Recommendation for v1: Build as a Progressive Web App (PWA) using a
responsive web framework. This allows a single codebase to work on
mobile and desktop browsers, avoids app store distribution, and provides
acceptable scanning via the browser camera API. If scanning reliability
proves insufficient, the front end can be wrapped into a native shell
(e.g., Capacitor or React Native Web) with minimal backend changes.

## 5.2 Offline Support

Library Mode must function without internet connectivity. This is a core
requirement for garage or workshop environments where Wi-Fi may be
unreliable.

-   The PWA service worker will cache the app shell, the full tool list,
    and the full location tree on first load.

-   Check-out and check-in actions performed offline are queued locally
    in IndexedDB.

-   When connectivity is restored, the app silently syncs the queued
    actions to the backend.

-   Conflicts (e.g., the same tool checked out on two devices) are
    resolved with a last-write-wins policy and flagged to the user.

-   Search works fully offline against the cached tool data.

-   Setup modes (Location Setup, Tool Setup, Tool Placement) require
    connectivity, as they write new records that other sessions need to
    see.

## 5.3 Technology Stack

  ------------------ ----------------------------------------------------
  **Layer**          Technology

  **Backend**        .NET (ASP.NET Core Web API). Exposes RESTful
                     endpoints for all entities and operations.

  **Database**       PostgreSQL. EF Core with Npgsql provider for ORM and
                     migrations. Supports remote querying via tools like
                     DBeaver.

  **Frontend**       React 18 + Vite + shadcn/ui + Tailwind CSS.
                     shadcn/ui provides high-quality pre-built components
                     (tables, dialogs, forms, search) well-suited to this
                     data-heavy app. Installable as a PWA.

  **QR Scanning**    html5-qrcode or ZXing JS library for browser-based
                     scanning.

  **QR Generation**  qrcode.js or similar library to generate QR codes
                     client-side; rendered to canvas for print layout.

  **Offline / Sync** Service Worker + IndexedDB (via Workbox or custom).
                     Background sync API for queued writes.

  **Search**         Server-side: PostgreSQL full-text search via EF
                     Core. Offline: Fuse.js against cached tool data.

  **CSV Import**     Papa Parse (JS) for client-side CSV parsing before
                     submitting to the bulk import API endpoint.

  **Hosting (v1)**   Single-host deployment (e.g., local machine, NAS, or
                     small cloud VM). PostgreSQL can run locally or on
                     any accessible server.
  ------------------ ----------------------------------------------------

# 6. Data Model Summary

  ----------------- ---------------------- ----------------------------------------
  **Entity**        **Key Fields**         **Notes**

  **Location**      Id, QrCode, Name,      Self-referential FK enables unlimited
                    Description, PhotoUrl, nesting depth.
                    ParentLocationId       

  **Tool**          Id, BarcodeId,         CurrentLocationId is nullable (null =
                    DisplayName,           checked out or unplaced).
                    Description,           
                    HandwrittenId,         
                    UpcCode, PhotoUrl,     
                    CurrentLocationId,     
                    IsCheckedOut           

  **CheckoutLog**   Id, ToolId,            Audit trail of check-out/in events.
                    CheckedOutAt,          
                    CheckedInAt,           
                    ReturnedToLocationId   
  ----------------- ---------------------- ----------------------------------------

# 7. API Endpoints (High-Level)

The .NET backend will expose RESTful endpoints organized around the four
primary resources:

  ------------------ ----------------------------------------------------
  **Resource**       Endpoints

  **Locations**      GET /locations (tree), POST /locations, GET
                     /locations/{id}, PUT /locations/{id}, DELETE
                     /locations/{id}

  **Tools**          GET /tools, POST /tools, GET /tools/{id}, PUT
                     /tools/{id}, DELETE /tools/{id}, GET
                     /tools/search?q={query}

  **Placements**     POST /tools/{id}/place (body: locationId)

  **Checkout**       POST /tools/{id}/checkout, POST /tools/{id}/checkin
                     (body: locationId)

  **QR Lookup**      GET /locations/by-qr/{qrCode}, GET
                     /tools/by-barcode/{barcode}

  **QR Labels**      GET /locations/{id}/qr-label (returns SVG/PNG), GET
                     /locations/qr-sheet?ids=1,2,3 (returns printable PDF
                     sheet)

  **Bulk Import**    POST /tools/import (multipart CSV upload; returns
                     summary of created/skipped/errored rows)

  **Sync**           POST /sync/flush (accepts array of offline-queued
                     actions; returns results per action)
  ------------------ ----------------------------------------------------

# 8. UX & Interface Notes

-   The app must be fully usable on a phone in one hand while the other
    hand holds a tool or scanner.

-   Scan feedback should be immediate: visual flash and/or haptic
    response on successful scan.

-   The full nested location path should always be displayed as a
    breadcrumb (e.g., Garage > Shelf > Red Bin) not just an ID.

-   Library Mode search should be the home/default screen.

-   Mode switching should be accessible but not accidentally triggered
    during a scanning workflow.

-   Photos of tools and locations are optional but should be prominently
    displayed when present.

-   An \'undo last placement\' or \'undo last scan\' action should be
    available in both Placement and Library modes.

-   A persistent offline/online status indicator should be visible so
    users know when they are working offline and how many actions are
    queued for sync.

-   The QR label print view should be accessible from each location\'s
    detail screen and from a batch \'Print Labels\' list view. Labels
    should show both the QR code and the location name in human-readable
    text.

-   The CSV import screen should show a preview of parsed rows before
    committing, and report a clear per-row success/error summary after
    import.

# 9. Open Questions & Future Considerations

  ------------------ ----------------------------------------------------
  **Topic**          Notes

  **CSV Import       Define the expected column names for the CSV import
  Format**           (e.g., Name, Description, HandwrittenId, UpcCode).
                     Should the template be downloadable from the app?
                     How should the app handle duplicate tool barcodes in
                     the import file?

  **Offline Conflict Last-write-wins is proposed for v1. If a more
  Policy**           nuanced policy is needed later (e.g., flagging
                     conflicts for manual resolution), the sync endpoint
                     design should accommodate it.

  **Label Paper      Confirm target label sheet format (e.g., Avery 5160
  Size**             address labels, or custom cut sheet). This affects
                     the print layout logic in the QR sheet endpoint.

  **Multiple Users** v1 is single-user. If shared use is needed later,
                     user accounts and tool ownership become relevant.

  **Tool             Tags or categories could improve search and browsing
  Categories**       but are not in scope for v1.

  **Mobile Wrapper** If PWA scanning proves unreliable, Capacitor (Ionic)
                     can wrap the web frontend in a native shell with
                     access to native camera APIs, with minimal code
                     changes.
  ------------------ ----------------------------------------------------

# 10. Glossary

  ------------------ ----------------------------------------------------
  **Term**           Definition

  **Location**       A named physical place where tools can be stored.
                     Locations are nested hierarchically.

  **QR Code**        A machine-readable square barcode printed and
                     affixed to each physical location.

  **Tool Barcode**   A machine-readable barcode or QR label affixed
                     directly to a tool.

  **Placement**      The act of associating a tool with a specific
                     location in the system.

  **Check Out**      Marking a tool as removed from its location and in
                     active use.

  **Check In**       Returning a tool and recording its new location.

  **Fuzzy Search**   A search technique that returns results for
                     approximate or partial matches, tolerating spelling
                     variations and word-order differences.

  **PWA**            Progressive Web App - a web application that can be
                     installed to a device home screen and use device
                     hardware (camera, etc.) via browser APIs.

  **Full Location    The complete breadcrumb trail from root to leaf
  Path**             location, e.g., Garage > Shelf > Red Bin.

  **Offline Queue**  A local store of check-out/in actions captured while
                     the device has no network, to be synced when
                     connectivity returns.

  **CSV Import**     A bulk upload of tool records via a comma-separated
                     values file, used to quickly populate the tool
                     inventory during initial setup.

  **QR Label Sheet** A printable page of QR code labels generated by the
                     app, one per registered location, ready to be
                     affixed to physical storage spots.
  ------------------ ----------------------------------------------------

*--- End of Specification ---*
