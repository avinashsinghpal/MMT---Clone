# MMT Clone — Student Prompts & Dependency Guide

> Tech Stack: React.js (Vite) · Node.js · Express.js · MongoDB Atlas

---

## Recommended Build Order

```
Student 4 → Student 5 → Student 1 → Student 2 → Student 3 + Student 6 (parallel) → Integration
```

Students **4 and 5 are fully independent** and should start first. Everyone else has some dependency on their work.

---

## Dependency Map

| Student | Role | Depends On |
|---------|------|------------|
| S1 | Frontend – Search Page | S5 (flights API shape) |
| S2 | Frontend – Flights List | S1 (router state with flights) |
| S3 | Frontend – Booking Page | S2 (selected flight), S4 (JWT token), S6 (booking API) |
| S4 | Backend – Auth APIs | Nobody — start immediately |
| S5 | Backend – Flights API | Nobody — start immediately |
| S6 | Backend – Booking API | S4 (authMiddleware) |

---

## Student 1 — Frontend: Search Page

**Files:** `src/pages/SearchPage.jsx` · `src/components/SearchForm.jsx` · `src/api/flights.js`

**Depends on:** Student 5 for `GET /flights` API response shape

### Prompt

```
I am Student 1 on an MMT Clone project. The full file structure is already created.

My files to build:
- src/pages/SearchPage.jsx
- src/components/SearchForm.jsx
- src/api/flights.js

Tech: React.js (Vite), axios

Task: Build the flight search homepage.

Requirements:
1. SearchForm.jsx — a form with 3 controlled inputs:
   - "From" city (text input)
   - "To" city (text input)
   - "Date" (date input)
   - A "Search Flights" button
   - Use useState for all 3 values

2. SearchPage.jsx — imports and renders SearchForm
   - On form submit, call the flights API
   - Use React Router's useNavigate to pass search results to /flights page via state
   - Show a loading state while fetching

3. src/api/flights.js — axios function:
   export async function searchFlights({ from, to, date }) {
     // GET request to http://localhost:5000/api/flights?from=...&to=...&date=...
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

**Depends on:** Student 2 (selected flight via router state) · Student 4 (JWT token in localStorage) · Student 6 (POST /bookings API)

### Prompt

```
I am Student 3 on an MMT Clone project. The full file structure is already created.

My files to build:
- src/pages/BookingPage.jsx
- src/components/BookingForm.jsx
- src/api/booking.js

Tech: React.js (Vite), axios, React Router

Task: Build the booking confirmation page.

Requirements:
1. BookingForm.jsx — a passenger details form:
   - Passenger name (text input)
   - Passenger age (number input)
   - Submit button labeled "Confirm Booking"
   - Use useState for form fields
   - Accepts onSubmit prop function

2. BookingPage.jsx:
   - Use useLocation() to read the selected flight passed by Student 2:
     const { flight } = useLocation().state || {}
   - Show selected flight details at top (airline, time, price)
   - Render BookingForm below
   - On form submit, call the booking API with:
     { flightId: flight.flightId, passengerName, passengerAge, userId: from localStorage }
   - On success, show "Booking Confirmed!" message

3. src/api/booking.js — axios function:
   export async function createBooking(data) {
     // POST to http://localhost:5000/api/bookings
     // Send JWT token in headers: Authorization: Bearer <token from localStorage>
   }

Dependency note:
- Student 6 is building POST /bookings. Until ready, mock the response: return { success: true }
- Student 4's login saves JWT to localStorage as "token". Read it with localStorage.getItem("token")

Use basic CSS. No UI libraries.
Show complete working code for all 3 files.
```

---

## Student 4 — Backend: Auth APIs

**Files:** `backend/routes/authRoutes.js` · `backend/controllers/authController.js` · `backend/models/User.js`

**Depends on:** Nobody — start immediately

> Student 3 and Student 6 both depend on your JWT token and authMiddleware. Prioritise finishing this early.

### Prompt

```
I am Student 4 on an MMT Clone project. The full file structure is already created.

My files to build:
- backend/routes/authRoutes.js
- backend/controllers/authController.js
- backend/models/User.js

Tech: Node.js, Express.js, MongoDB (Mongoose), bcryptjs, jsonwebtoken

Task: Build signup and login APIs.

Requirements:
1. models/User.js — Mongoose schema:
   { name: String, email: String (unique), password: String (hashed) }

2. authController.js:
   - signup(req, res):
     * Receive { name, email, password }
     * Hash password using bcryptjs
     * Save new User to MongoDB
     * Return success message

   - login(req, res):
     * Receive { email, password }
     * Find user by email
     * Compare password with bcrypt
     * If valid, sign a JWT with { userId: user._id } and JWT_SECRET from .env
     * Return { token } in response

3. authRoutes.js:
   - POST /api/auth/signup → authController.signup
   - POST /api/auth/login  → authController.login
   - Mount in server.js as: app.use('/api/auth', authRoutes)

Also create middleware/authMiddleware.js:
   - Reads Authorization header: "Bearer <token>"
   - Verifies token using JWT_SECRET
   - Sets req.user = { userId } and calls next()
   - Returns 401 if token missing or invalid

The .env already has: PORT, MONGO_URI, JWT_SECRET

Install needed: npm install bcryptjs jsonwebtoken
Show complete working code for all files including authMiddleware.js.
```

---

## Student 5 — Backend: Flights API

**Files:** `backend/routes/flightRoutes.js` · `backend/controllers/flightController.js` · `backend/models/Flight.js`

**Depends on:** Nobody — start immediately

> Students 1 and 2 depend on your API response shape. Define it clearly and share with the team early.

### Prompt

```
I am Student 5 on an MMT Clone project. The full file structure is already created.

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
   - GET /api/flights → flightController.getFlights
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

**Depends on:** Student 4 (authMiddleware for JWT verification) · Student 5 (flightId reference from Flight model)

### Prompt

```
I am Student 6 on an MMT Clone project. The full file structure is already created.

My files to build:
- backend/routes/bookingRoutes.js
- backend/controllers/bookingController.js
- backend/models/Booking.js

Tech: Node.js, Express.js, MongoDB (Mongoose)

Task: Build the flight booking API.

Requirements:
1. models/Booking.js — Mongoose schema:
   {
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     flightId: { type: String },
     passengerName: String,
     passengerAge: Number,
     bookedAt: { type: Date, default: Date.now }
   }

2. bookingController.js:
   - createBooking(req, res):
     * Receive { flightId, passengerName, passengerAge } from req.body
     * Get userId from req.user.userId (set by authMiddleware after JWT verification)
     * Save new Booking document to MongoDB
     * Return { message: "Booking confirmed", booking }

3. bookingRoutes.js:
   - POST /api/bookings → authMiddleware → bookingController.createBooking
   - Route must be protected (JWT required)
   - Mount in server.js as: app.use('/api/bookings', bookingRoutes)

Dependency note:
- Student 4 is building middleware/authMiddleware.js. It verifies the JWT and sets req.user = { userId }.
  Import it as: const authMiddleware = require('../middleware/authMiddleware')
  Until Student 4 finishes, use this temporary mock middleware:
    const authMiddleware = (req, res, next) => { req.user = { userId: "mockUserId123" }; next(); }

Show complete working code for all 3 files.
```

---

## Final Integration Checklist

Once all parts are built, do this together as a team:

- [ ] S4: Confirm `POST /api/auth/signup` and `POST /api/auth/login` work in Postman
- [ ] S5: Confirm `GET /api/flights?from=Mumbai&to=Delhi&date=2025-06-01` returns flight array
- [ ] S1: Swap mock in `flights.js` with real axios call to S5's API
- [ ] S2: Confirm flight cards render with real data from S1
- [ ] S6: Confirm `POST /api/bookings` works with a real JWT from S4's login
- [ ] S3: Swap mock in `booking.js` with real axios call to S6's API
- [ ] All: Test full flow — Signup → Login → Search → Flights → Book → Confirmed

---

*Generated for MMT Clone · Group of 6 · Skill Turtle*