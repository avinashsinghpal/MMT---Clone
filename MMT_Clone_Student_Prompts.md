# MMT Clone — Student Prompts & Dependency Guide (Clerk Auth)

> Tech Stack: React.js (Vite) · Node.js · Express.js · MongoDB Atlas · Clerk (Authentication)

---

## What Changed from JWT Version

- Student 4's entire job changes — no signup/login API to build.
  Instead, Student 4 sets up Clerk on the frontend and protects backend routes.
- Student 3 reads the Clerk session token instead of a localStorage JWT.
- Student 6 verifies the Clerk session token on the backend instead of using authMiddleware.
- Students 1, 2, and 5 are largely unchanged.

---

## Recommended Build Order

```
Student 4 (Clerk setup) → Student 5 → Student 1 → Student 2 → Student 3 + Student 6 (parallel) → Integration
```

---

## Dependency Map

| Student | Role | Depends On |
|---------|------|------------|
| S1 | Frontend – Search Page | S5 (flights API shape), S4 (Clerk installed & ClerkProvider wrapping app) |
| S2 | Frontend – Flights List | S1 (router state with flights) |
| S3 | Frontend – Booking Page | S2 (selected flight), S4 (Clerk useAuth hook), S6 (booking API) |
| S4 | Frontend+Backend – Clerk Setup | Nobody — start immediately |
| S5 | Backend – Flights API | Nobody — start immediately |
| S6 | Backend – Booking API | S4 (Clerk backend SDK to verify session token) |

---

## Student 1 — Frontend: Search Page

**Files:** `src/pages/SearchPage.jsx` · `src/components/SearchForm.jsx` · `src/api/flights.js`

**Depends on:** Student 4 (ClerkProvider must wrap the app before useAuth works) · Student 5 (GET /flights API shape)

### Prompt

```
I am Student 1 on an MMT Clone project. The full file structure is already created.
The project uses Clerk for authentication (already set up by Student 4).

My files to build:
- src/pages/SearchPage.jsx
- src/components/SearchForm.jsx
- src/api/flights.js

Tech: React.js (Vite), axios, Clerk

Task: Build the flight search homepage.

Requirements:
1. SearchForm.jsx — a form with 3 controlled inputs:
   - "From" city (text input)
   - "To" city (text input)
   - "Date" (date input)
   - A "Search Flights" button
   - Use useState for all 3 values

2. SearchPage.jsx — imports and renders SearchForm
   - Import useAuth from "@clerk/clerk-react"
   - If user is not signed in, show a message: "Please sign in to search flights"
     Use: const { isSignedIn } = useAuth()
   - On form submit, call the flights API
   - Use React Router's useNavigate to pass search results to /flights page via state
   - Show a loading state while fetching

3. src/api/flights.js — axios function:
   export async function searchFlights({ from, to, date }) {
     // GET request to http://localhost:5000/api/flights?from=...&to=...&date=...
     // This route is public — no auth token needed
   }

Dependency note: Student 5 is building GET /flights backend. Until that is ready,
use this mock response in flights.js:
   return { data: [{ airline: "IndiGo", price: 3500, time: "10:00 AM", flightId: "1" }] }

Use basic inline CSS or a simple .css file. No UI libraries.
Show complete working code for all 3 files.
```

---

## Student 2 — Frontend: Flights List Page

**Files:** `src/pages/FlightsPage.jsx` · `src/components/FlightCard.jsx`

**Depends on:** Student 1 (passes flight data via React Router state) · Student 5 (real flight object shape)

### Prompt

```
I am Student 2 on an MMT Clone project. The full file structure is already created.
The project uses Clerk for authentication (already set up by Student 4).

My files to build:
- src/pages/FlightsPage.jsx
- src/components/FlightCard.jsx

Tech: React.js (Vite), React Router

Task: Display a list of available flights after search.

Requirements:
1. FlightCard.jsx — a card component that receives a flight object as props:
   Props shape: { airline, price, time, flightId }
   - Show airline name, departure time, price (formatted as ₹)
   - A "Book Now" button
   - On "Book Now" click, call onBook(flight) prop function

2. FlightsPage.jsx:
   - Use useLocation() from React Router to read flights array passed by Student 1's SearchPage
   - If no flights found, show "No flights available" message
   - Map over flights array and render a FlightCard for each
   - "Book Now" click → navigate to /booking, passing selected flight via router state

Dependency note: Student 1 is passing flight data via React Router state as:
   navigate('/flights', { state: { flights: [...] } })
Read it with: const { flights } = useLocation().state || {}

Use this dummy flight shape if testing alone:
   [{ airline: "IndiGo", price: 3500, time: "10:00 AM", flightId: "101" }]

Use basic CSS. No UI libraries.
Show complete working code for both files.
```

---

## Student 3 — Frontend: Booking Page

**Files:** `src/pages/BookingPage.jsx` · `src/components/BookingForm.jsx` · `src/api/booking.js`

**Depends on:** Student 2 (selected flight via router state) · Student 4 (Clerk useAuth hook to get session token) · Student 6 (POST /bookings API)

### Prompt

```
I am Student 3 on an MMT Clone project. The full file structure is already created.
The project uses Clerk for authentication (already set up by Student 4).

My files to build:
- src/pages/BookingPage.jsx
- src/components/BookingForm.jsx
- src/api/booking.js

Tech: React.js (Vite), axios, React Router, Clerk

Task: Build the booking confirmation page.

Requirements:
1. BookingForm.jsx — a passenger details form:
   - Passenger name (text input)
   - Passenger age (number input)
   - Submit button labeled "Confirm Booking"
   - Use useState for form fields
   - Accepts onSubmit prop function

2. BookingPage.jsx:
   - Import useAuth from "@clerk/clerk-react"
   - Use useLocation() to read the selected flight passed by Student 2:
     const { flight } = useLocation().state || {}
   - Show selected flight details at top (airline, time, price)
   - Render BookingForm below
   - On form submit:
     * Get the Clerk session token:
       const { getToken } = useAuth()
       const token = await getToken()
     * Call the booking API passing the token:
       await createBooking({ flightId: flight.flightId, passengerName, passengerAge }, token)
   - On success, show "Booking Confirmed!" message

3. src/api/booking.js — axios function:
   export async function createBooking(data, token) {
     return axios.post("http://localhost:5000/api/bookings", data, {
       headers: { Authorization: `Bearer ${token}` }
     })
   }

Dependency note:
- Student 6 is building POST /bookings. Until ready, mock the response: return { success: true }
- The token comes from Clerk's getToken() — no localStorage needed.

Use basic CSS. No UI libraries.
Show complete working code for all 3 files.
```

---

## Student 4 — Clerk Setup (Frontend + Backend)

**Files:** `src/main.jsx` · `src/pages/LoginPage.jsx` · `src/pages/SignupPage.jsx` · `backend/middleware/clerkMiddleware.js` · `src/App.jsx` (routes)

**Depends on:** Nobody — start immediately

> Everyone depends on you. Set up Clerk first so the rest of the team can use useAuth() and protected routes.

### Prompt

```
I am Student 4 on an MMT Clone project. The full file structure is already created.
We are using Clerk for authentication instead of building custom JWT auth.

My job is to set up Clerk across the full stack so all other students can use it.

My files to build:
- src/main.jsx (wrap app with ClerkProvider)
- src/pages/LoginPage.jsx
- src/pages/SignupPage.jsx
- src/App.jsx (define all routes with protected route logic)
- backend/middleware/clerkMiddleware.js

Tech: React.js (Vite), Clerk, Node.js, Express.js

FRONTEND SETUP:

1. Install Clerk:
   npm install @clerk/clerk-react

2. Get your Clerk Publishable Key from https://dashboard.clerk.com
   Add to frontend .env:
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx

3. src/main.jsx:
   - Wrap <App /> with <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>

4. src/pages/LoginPage.jsx:
   - Use Clerk's prebuilt component:
     import { SignIn } from "@clerk/clerk-react"
     export default function LoginPage() { return <SignIn /> }

5. src/pages/SignupPage.jsx:
   - Use Clerk's prebuilt component:
     import { SignUp } from "@clerk/clerk-react"
     export default function SignupPage() { return <SignUp /> }

6. src/App.jsx — set up React Router routes:
   Routes needed:
   - / → SearchPage (protected — only signed-in users)
   - /flights → FlightsPage (protected)
   - /booking → BookingPage (protected)
   - /login → LoginPage (public)
   - /signup → SignupPage (public)

   For protected routes, use Clerk's <SignedIn> and <SignedOut>:
   import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react"

   Wrap each protected route like this:
   <SignedIn><SearchPage /></SignedIn>
   <SignedOut><RedirectToSignIn /></SignedOut>

   Also add a Navbar with:
   - <UserButton /> from Clerk (shows avatar + sign out)
   - <SignedOut> show Sign In link

BACKEND SETUP:

7. Install Clerk backend SDK:
   npm install @clerk/express

8. Add to backend .env:
   CLERK_SECRET_KEY=sk_test_xxxxxxxx
   (Get this from Clerk dashboard → API Keys)

9. backend/middleware/clerkMiddleware.js:
   import { clerkMiddleware, getAuth } from "@clerk/express"

   export const requireAuth = (req, res, next) => {
     const { userId } = getAuth(req)
     if (!userId) return res.status(401).json({ error: "Unauthorized" })
     req.userId = userId
     next()
   }

   export { clerkMiddleware }

10. In backend/server.js, add at the top (before all routes):
    import { clerkMiddleware } from "./middleware/clerkMiddleware.js"
    app.use(clerkMiddleware())

Show complete working code for all files.
```

---

## Student 5 — Backend: Flights API

**Files:** `backend/routes/flightRoutes.js` · `backend/controllers/flightController.js` · `backend/models/Flight.js`

**Depends on:** Nobody — start immediately

> Students 1 and 2 depend on your API response shape. This is a public route — no Clerk auth needed.

### Prompt

```
I am Student 5 on an MMT Clone project. The full file structure is already created.
The project uses Clerk for authentication, but the flights API is a public route (no auth needed).

My files to build:
- backend/routes/flightRoutes.js
- backend/controllers/flightController.js
- backend/models/Flight.js

Tech: Node.js, Express.js, MongoDB (Mongoose)

Task: Build the flights search API.

Requirements:
1. models/Flight.js — Mongoose schema:
   { airline: String, from: String, to: String, date: String, time: String, price: Number }

2. flightController.js:
   - getFlights(req, res):
     * Read query params: from, to, date from req.query
     * Filter Flight collection in MongoDB matching all 3 fields (case-insensitive)
     * Return matching flights as JSON array

   - seedFlights (optional helper to add dummy data):
     * Add 5-6 hardcoded sample flights to the DB for testing

3. flightRoutes.js:
   - GET /api/flights → flightController.getFlights (NO auth middleware — public route)
   - Mount in server.js as: app.use('/api/flights', flightRoutes)

IMPORTANT — Response shape (Students 1 and 2 depend on this):
Each flight object must include: { _id, airline, from, to, date, time, price }
Rename _id to flightId in the response so frontend can use it directly.

Seed at least these sample flights for testing:
  { airline: "IndiGo", from: "Mumbai", to: "Delhi", date: "2025-06-01", time: "10:00 AM", price: 3500 }
  { airline: "Air India", from: "Mumbai", to: "Delhi", date: "2025-06-01", time: "02:00 PM", price: 4200 }

Show complete working code for all 3 files.
```

---

## Student 6 — Backend: Booking API

**Files:** `backend/routes/bookingRoutes.js` · `backend/controllers/bookingController.js` · `backend/models/Booking.js`

**Depends on:** Student 4 (clerkMiddleware + requireAuth from clerkMiddleware.js) · Student 5 (flightId reference)

### Prompt

```
I am Student 6 on an MMT Clone project. The full file structure is already created.
The project uses Clerk for authentication. The booking route must be protected using Clerk.

My files to build:
- backend/routes/bookingRoutes.js
- backend/controllers/bookingController.js
- backend/models/Booking.js

Tech: Node.js, Express.js, MongoDB (Mongoose), Clerk backend SDK

Task: Build the flight booking API.

Requirements:
1. models/Booking.js — Mongoose schema:
   {
     clerkUserId: { type: String, required: true },
     flightId: { type: String },
     passengerName: String,
     passengerAge: Number,
     bookedAt: { type: Date, default: Date.now }
   }
   Note: We store clerkUserId (a string like "user_2abc...") instead of a MongoDB ObjectId
   because Clerk manages users — there is no User collection in our DB.

2. bookingController.js:
   - createBooking(req, res):
     * Receive { flightId, passengerName, passengerAge } from req.body
     * Get clerkUserId from req.userId (set by Student 4's requireAuth middleware)
     * Save new Booking document to MongoDB
     * Return { message: "Booking confirmed", booking }

3. bookingRoutes.js:
   - Import requireAuth from "../middleware/clerkMiddleware.js"
   - POST /api/bookings → requireAuth → bookingController.createBooking
   - Mount in server.js as: app.use('/api/bookings', bookingRoutes)

Dependency note:
- Student 4 is building backend/middleware/clerkMiddleware.js
  It exports requireAuth which sets req.userId = clerkUserId
  Until Student 4 finishes, use this temporary mock:
    const requireAuth = (req, res, next) => { req.userId = "user_mock123"; next(); }

Show complete working code for all 3 files.
```

---

## Final Integration Checklist

Once all parts are built, do this together as a team:

- [ ] S4: Confirm ClerkProvider is wrapping the app and SignIn/SignUp pages load correctly
- [ ] S4: Confirm clerkMiddleware() is applied in server.js before all routes
- [ ] S5: Confirm GET /api/flights?from=Mumbai&to=Delhi&date=2025-06-01 returns flight array
- [ ] S1: Swap mock in flights.js with real axios call to S5's API
- [ ] S1: Confirm unauthenticated users are redirected to /login
- [ ] S2: Confirm flight cards render with real data from S1
- [ ] S6: Confirm POST /api/bookings returns 401 without a Clerk token
- [ ] S3: Get Clerk token via getToken() and confirm booking saves to MongoDB
- [ ] All: Test full flow — Sign Up → Sign In → Search → Flights → Book → Confirmed

---

*Generated for MMT Clone · Group of 6 · Skill Turtle · Clerk Auth Edition*