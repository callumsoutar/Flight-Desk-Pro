module.exports = {

"[project]/.next-internal/server/app/(auth)/bookings/check-in/[id]/page/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/(auth)/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(auth)/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/punycode [external] (punycode, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[project]/src/lib/supabaseServerClient.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "createClient": (()=>createClient)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://koviyikwttwsogmbseab.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvdml5aWt3dHR3c29nbWJzZWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNDQzNzIsImV4cCI6MjA2MTYyMDM3Mn0.lpVUpWReagnMKi-pt_AgCH4X-7ct2nR9S7BRJS7pAW0"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing user sessions.
                }
            }
        }
    });
}
}}),
"[project]/src/app/(auth)/bookings/view/[id]/data.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "getBookingById": (()=>getBookingById),
    "getBookingByIdDetailed": (()=>getBookingByIdDetailed)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseServerClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabaseServerClient.ts [app-rsc] (ecmascript)");
;
async function getBookingById(id) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseServerClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Fetch booking by id (no joins)
    const { data: booking, error: bookingError } = await supabase.from('bookings').select('id, organization_id, aircraft_id, user_id, instructor_id, start_time, end_time, status, purpose, remarks, hobbs_start, hobbs_end, tach_start, tach_end, created_at, updated_at, flight_type_id, lesson_id, booking_type, briefing_completed, instructor_comment').eq('id', id).single();
    if (bookingError) {
        console.error('[DEBUG booking fetch] Error:', JSON.stringify(bookingError, null, 2));
        return null;
    }
    console.log('[DEBUG booking fetch] Data:', JSON.stringify(booking, null, 2));
    // 2. Fetch aircraft by aircraft_id
    let aircraft = undefined;
    if (booking && booking.aircraft_id) {
        const { data: aircraftData, error: aircraftError } = await supabase.from('aircraft').select('id, registration, type, model').eq('id', booking.aircraft_id).single();
        if (aircraftError) {
            console.error('[DEBUG aircraft fetch] Error:', JSON.stringify(aircraftError, null, 2));
        } else {
            console.log('[DEBUG aircraft fetch] Data:', JSON.stringify(aircraftData, null, 2));
        }
        aircraft = aircraftData || undefined;
    }
    // 3. Fetch member user
    let member = undefined;
    if (booking && booking.user_id) {
        const { data: memberData, error: memberError } = await supabase.from('users').select('id, first_name, last_name, email, profile_image_url').eq('id', booking.user_id).single();
        if (memberError) {
            console.error('[DEBUG member fetch] Error:', JSON.stringify(memberError, null, 2));
        } else {
            console.log('[DEBUG member fetch] Data:', JSON.stringify(memberData, null, 2));
        }
        member = memberData || undefined;
    }
    // 4. Fetch instructor user
    let instructor = undefined;
    if (booking && booking.instructor_id) {
        const { data: instructorData, error: instructorError } = await supabase.from('users').select('id, first_name, last_name, email, profile_image_url').eq('id', booking.instructor_id).single();
        if (instructorError) {
            console.error('[DEBUG instructor fetch] Error:', JSON.stringify(instructorError, null, 2));
        } else {
            console.log('[DEBUG instructor fetch] Data:', JSON.stringify(instructorData, null, 2));
        }
        instructor = instructorData || undefined;
    }
    // 5. Fetch flight type by flight_type_id
    let flight_type = undefined;
    if (booking && booking.flight_type_id) {
        const { data: flightTypeData, error: flightTypeError } = await supabase.from('flight_types').select('id, name').eq('id', booking.flight_type_id).single();
        if (flightTypeError) {
            console.error('[DEBUG flight_type fetch] Error:', JSON.stringify(flightTypeError, null, 2));
        } else {
            console.log('[DEBUG flight_type fetch] Data:', JSON.stringify(flightTypeData, null, 2));
        }
        flight_type = flightTypeData || undefined;
    }
    // 6. Fetch lesson by lesson_id
    let lesson = undefined;
    if (booking && booking.lesson_id) {
        const { data: lessonData, error: lessonError } = await supabase.from('lessons').select('id, name, description').eq('id', booking.lesson_id).single();
        if (lessonError) {
            console.error('[DEBUG lesson fetch] Error:', JSON.stringify(lessonError, null, 2));
        } else {
            console.log('[DEBUG lesson fetch] Data:', JSON.stringify(lessonData, null, 2));
        }
        lesson = lessonData || undefined;
    }
    // 7. Fetch booking_details by booking_id
    let bookingDetails = undefined;
    if (booking && booking.id) {
        const { data: detailsData, error: detailsError } = await supabase.from('booking_details').select('*').eq('booking_id', booking.id).maybeSingle();
        if (detailsError) {
            console.error('[DEBUG booking_details fetch] Error:', JSON.stringify(detailsError, null, 2));
        } else {
            console.log('[DEBUG booking_details fetch] Data:', JSON.stringify(detailsData, null, 2));
        }
        bookingDetails = detailsData || undefined;
    }
    return {
        ...booking,
        aircraft,
        member,
        instructor,
        flight_type,
        lesson,
        bookingDetails
    };
}
async function getBookingByIdDetailed(id) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseServerClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Fetch booking with no joins to avoid ambiguity
    const { data, error } = await supabase.from('bookings').select(`
      id, organization_id, aircraft_id, user_id, instructor_id, start_time, end_time, status, purpose, remarks, hobbs_start, hobbs_end, tach_start, tach_end, created_at, updated_at, flight_type_id, lesson_id, booking_type, briefing_completed, instructor_comment
    `).eq('id', id).single();
    if (error) {
        console.error('[getBookingById] Supabase error:', JSON.stringify(error, null, 2));
        console.error('[getBookingById] Query params:', {
            id
        });
        return null;
    }
    if (!data) {
        console.warn('[getBookingById] No data returned for booking id:', id);
        return null;
    }
    console.debug('[getBookingById] Raw data:', JSON.stringify(data, null, 2));
    // Map fields to expected keys
    const d = data;
    const mapped = {
        id: d['id'],
        organization_id: d['organization_id'],
        aircraft_id: d['aircraft_id'],
        user_id: d['user_id'],
        instructor_id: d['instructor_id'],
        start_time: d['start_time'],
        end_time: d['end_time'],
        status: d['status'],
        purpose: d['purpose'],
        remarks: d['remarks'],
        hobbs_start: d['hobbs_start'],
        hobbs_end: d['hobbs_end'],
        tach_start: d['tach_start'],
        tach_end: d['tach_end'],
        created_at: d['created_at'],
        updated_at: d['updated_at'],
        flight_type_id: d['flight_type_id'],
        lesson_id: d['lesson_id'],
        booking_type: d['booking_type'],
        briefing_completed: d['briefing_completed'],
        instructor_comment: d['instructor_comment'],
        aircraft: undefined,
        flight_type: undefined,
        lesson: undefined,
        debriefs: []
    };
    // 2. Fetch aircraft by aircraft_id
    let aircraft = undefined;
    if (mapped.aircraft_id) {
        const { data: aircraftData, error: aircraftError } = await supabase.from('aircraft').select('id, registration, type, model').eq('id', mapped.aircraft_id).single();
        if (aircraftError) {
            console.error('[getBookingById] Error fetching aircraft:', JSON.stringify(aircraftError, null, 2));
        }
        aircraft = aircraftData || undefined;
    }
    // 3. Fetch member and instructor users by their IDs
    let member = undefined;
    let instructor = undefined;
    if (mapped.user_id) {
        const { data: memberData, error: memberError } = await supabase.from('users').select('id, first_name, last_name, email, profile_image_url').eq('id', mapped.user_id).single();
        if (memberError) {
            console.error('[getBookingById] Error fetching member user:', JSON.stringify(memberError, null, 2));
        }
        member = memberData || undefined;
    }
    if (mapped.instructor_id) {
        const { data: instructorData, error: instructorError } = await supabase.from('users').select('id, first_name, last_name, email, profile_image_url').eq('id', mapped.instructor_id).single();
        if (instructorError) {
            console.error('[getBookingById] Error fetching instructor user:', JSON.stringify(instructorError, null, 2));
        }
        instructor = instructorData || undefined;
    }
    // Build the Booking object explicitly
    const booking = {
        ...mapped,
        aircraft: aircraft ? {
            ...aircraft,
            current_tach: 0,
            current_hobbs: 0
        } : undefined,
        member,
        instructor
    };
    return booking;
}
}}),
"[project]/src/components/bookings/client-booking-check-in-view.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ClientBookingCheckInView": (()=>ClientBookingCheckInView)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const ClientBookingCheckInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ClientBookingCheckInView() from the server but ClientBookingCheckInView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/bookings/client-booking-check-in-view.tsx <module evaluation>", "ClientBookingCheckInView");
}}),
"[project]/src/components/bookings/client-booking-check-in-view.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ClientBookingCheckInView": (()=>ClientBookingCheckInView)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const ClientBookingCheckInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ClientBookingCheckInView() from the server but ClientBookingCheckInView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/bookings/client-booking-check-in-view.tsx", "ClientBookingCheckInView");
}}),
"[project]/src/components/bookings/client-booking-check-in-view.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$bookings$2f$client$2d$booking$2d$check$2d$in$2d$view$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/bookings/client-booking-check-in-view.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$bookings$2f$client$2d$booking$2d$check$2d$in$2d$view$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/components/bookings/client-booking-check-in-view.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$bookings$2f$client$2d$booking$2d$check$2d$in$2d$view$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/(auth)/bookings/check-in/[id]/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BookingCheckInPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$bookings$2f$view$2f5b$id$5d2f$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/bookings/view/[id]/data.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$bookings$2f$client$2d$booking$2d$check$2d$in$2d$view$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/bookings/client-booking-check-in-view.tsx [app-rsc] (ecmascript)");
;
;
;
;
async function BookingCheckInPage(context) {
    const { id } = await context.params;
    const booking = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$bookings$2f$view$2f5b$id$5d2f$data$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBookingById"])(id);
    if (!booking) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$bookings$2f$client$2d$booking$2d$check$2d$in$2d$view$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ClientBookingCheckInView"], {
        booking: booking
    }, void 0, false, {
        fileName: "[project]/src/app/(auth)/bookings/check-in/[id]/page.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/app/(auth)/bookings/check-in/[id]/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(auth)/bookings/check-in/[id]/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__958d4838._.js.map