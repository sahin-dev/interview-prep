import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Steps, Cards, Card } from "@/components/content";

export default function LLDCaseStudies() {
  return (
    <>
      <Lead>
        Low-level design (object-oriented design) rounds ask you to model a system as classes and code its core logic
        in 45 minutes: a parking lot, an elevator, a vending machine. They test whether you can turn requirements into
        clean entities, responsibilities and relationships, apply patterns where they help, and write correct,
        extensible code.
      </Lead>

      <H2>The approach</H2>
      <Steps>
        <div><strong>Clarify requirements</strong> and scope: actors, core use cases, constraints. Write them down.</div>
        <div><strong>Identify entities</strong>: nouns in the requirements become candidate classes; verbs become methods.</div>
        <div><strong>Define relationships</strong>: has-a / is-a, multiplicities, enums for fixed sets (VehicleType, Direction).</div>
        <div><strong>Assign responsibilities</strong>: who owns each piece of state and logic (keep classes cohesive).</div>
        <div><strong>Sketch the API</strong>: the public methods of the main classes.</div>
        <div><strong>Code the core flows</strong>, using patterns (Strategy, State, Observer, Factory) where variation exists.</div>
        <div><strong>Discuss extensions</strong>: concurrency, persistence, new types, and how the design accommodates them.</div>
      </Steps>

      {/* ------------------------------------------------------------ */}
      <H2>1. Parking lot</H2>
      <P><strong>Requirements:</strong> multiple floors; spot sizes small/compact/large; vehicles motorcycle/car/truck; issue a ticket on entry, compute a fee on exit; show free spots per floor; pluggable pricing.</P>
      <Table
        head={["Class", "Responsibility"]}
        rows={[
          ["ParkingLot", "Entry point: park(vehicle) → Ticket, leave(ticket) → fee. Owns floors."],
          ["Floor", "Holds spots; finds a free spot that fits a vehicle."],
          ["Spot", "Size, occupied vehicle; canFit(vehicle)."],
          ["Vehicle (abstract) → Motorcycle, Car, Truck", "Plate and required spot size."],
          ["Ticket", "id, vehicle, spot, entry time."],
          ["PricingStrategy (Strategy)", "fee(ticket, exit_time): hourly, flat, weekend rates."],
        ]}
      />
      <Code
        python={String.raw`
import itertools, math, threading, time
from enum import IntEnum

class Size(IntEnum):
    SMALL = 1
    COMPACT = 2
    LARGE = 3

class Vehicle:
    size: Size
    def __init__(self, plate): self.plate = plate

class Motorcycle(Vehicle): size = Size.SMALL
class Car(Vehicle):        size = Size.COMPACT
class Truck(Vehicle):      size = Size.LARGE

class Spot:
    def __init__(self, spot_id, size):
        self.id, self.size, self.vehicle = spot_id, size, None
    def can_fit(self, v): return self.vehicle is None and self.size >= v.size

class Floor:
    def __init__(self, n, spots): self.n, self.spots = n, spots
    def find_spot(self, v):
        # best fit: the smallest spot that fits, so large spots stay free for trucks
        fits = [s for s in self.spots if s.can_fit(v)]
        return min(fits, key=lambda s: s.size, default=None)
    def free_count(self): return sum(s.vehicle is None for s in self.spots)

class Ticket:
    _ids = itertools.count(1)
    def __init__(self, vehicle, spot):
        self.id, self.vehicle, self.spot, self.entry = next(Ticket._ids), vehicle, spot, time.time()

class HourlyPricing:
    RATE = {Size.SMALL: 1, Size.COMPACT: 2, Size.LARGE: 4}
    def fee(self, ticket, exit_time):
        hours = max(1, math.ceil((exit_time - ticket.entry) / 3600))
        return hours * self.RATE[ticket.vehicle.size]

class ParkingLot:
    def __init__(self, floors, pricing):
        self.floors, self.pricing = floors, pricing
        self.active = {}                       # ticket id -> ticket
        self.lock = threading.Lock()           # two cars must not get the same spot

    def park(self, v):
        with self.lock:
            for f in self.floors:
                spot = f.find_spot(v)
                if spot:
                    spot.vehicle = v
                    t = Ticket(v, spot)
                    self.active[t.id] = t
                    return t
        raise RuntimeError("lot full")

    def leave(self, ticket_id, now=None):
        with self.lock:
            t = self.active.pop(ticket_id)
            t.spot.vehicle = None
        return self.pricing.fee(t, now or time.time())
`}
      />
      <Callout type="tip">
        Extensions to mention: an Observer that updates display boards when spots change; per-floor locks or atomic
        compare-and-set on a spot for less contention; EV charging spots as a new Spot subtype; payment as a separate
        PaymentProcessor interface.
      </Callout>

      {/* ------------------------------------------------------------ */}
      <H2>2. Elevator system</H2>
      <P><strong>Requirements:</strong> N elevators, M floors; hall calls (up/down buttons) and car calls (floor buttons inside); efficient dispatch; doors and capacity; emergency stop.</P>
      <Cards>
        <Card title="Elevator">current floor, direction, state (IDLE, MOVING_UP, MOVING_DOWN, DOORS_OPEN, MAINTENANCE), sets of target floors above and below.</Card>
        <Card title="Scheduling (SCAN / LOOK)">Keep moving in the current direction serving every requested floor on the way; reverse only when no requests remain ahead, like a disk-arm scheduler.</Card>
        <Card title="Dispatcher (Strategy)">Assigns a hall call to the best elevator: idle and nearest, or already moving toward the floor in the same direction. Swappable for peak-hour strategies.</Card>
        <Card title="State pattern">Each state handles events (arrive, button press, door timer) and transitions, avoiding scattered if-status checks.</Card>
      </Cards>
      <Code
        python={String.raw`
import heapq

class Elevator:
    def __init__(self, eid):
        self.id, self.floor, self.direction = eid, 0, 0     # -1 down, 0 idle, +1 up
        self.up, self.down = [], []                         # min-heap of floors above, max-heap (negated) below

    def add_target(self, f):
        if f > self.floor: heapq.heappush(self.up, f)
        elif f < self.floor: heapq.heappush(self.down, -f)

    def step(self):
        """Advance one floor using the LOOK algorithm; returns True if the doors open."""
        if self.direction >= 0 and self.up:
            self.direction = 1
        elif self.down:
            self.direction = -1
        elif self.up:
            self.direction = 1
        else:
            self.direction = 0
            return False
        self.floor += self.direction
        heap, sign = (self.up, 1) if self.direction == 1 else (self.down, -1)
        if heap and sign * heap[0] == self.floor:
            while heap and sign * heap[0] == self.floor:
                heapq.heappop(heap)
            return True
        return False

    def cost(self, floor, direction):
        """Lower is better: distance, plus a penalty if moving away or in the other direction."""
        d = abs(self.floor - floor)
        if self.direction == 0: return d
        heading_to = (floor - self.floor) * self.direction >= 0
        PENALTY = 40                                        # roughly a full trip away and back
        return d if heading_to and direction == self.direction else d + PENALTY

class Dispatcher:
    def __init__(self, elevators): self.elevators = elevators
    def hall_call(self, floor, direction):
        best = min(self.elevators, key=lambda e: e.cost(floor, direction))
        best.add_target(floor)
        return best.id
`}
      />

      {/* ------------------------------------------------------------ */}
      <H2>3. Vending machine</H2>
      <P>
        A natural fit for the <strong>State</strong> pattern: Idle → HasMoney → Dispensing → Idle, plus SoldOut and
        Maintenance. Also: an Inventory (slot → product, count), a coin/payment component that returns change with a
        greedy (or DP for odd denominations) algorithm, and refunds on cancel.
      </P>
      <Code
        python={String.raw`
class VendingMachine:
    COINS = [25, 10, 5, 1]

    def __init__(self, inventory):            # {code: [name, price, count]}
        self.inv, self.balance, self.state = inventory, 0, "IDLE"

    def insert(self, cents):
        if self.state not in ("IDLE", "HAS_MONEY"):
            raise RuntimeError(f"cannot insert in state {self.state}")
        self.balance += cents
        self.state = "HAS_MONEY"

    def select(self, code):
        if self.state != "HAS_MONEY":
            raise RuntimeError("insert money first")
        name, price, count = self.inv[code]
        if count == 0:
            raise RuntimeError("sold out")
        if self.balance < price:
            raise RuntimeError(f"insert {price - self.balance} more")
        self.state = "DISPENSING"
        self.inv[code][2] -= 1
        change, self.balance = self._change(self.balance - price), 0
        self.state = "IDLE"
        return name, change

    def cancel(self):
        refund, self.balance, self.state = self._change(self.balance), 0, "IDLE"
        return refund

    def _change(self, amount):
        out = []
        for c in self.COINS:                  # greedy works for canonical coin systems
            k, amount = divmod(amount, c)
            out += [c] * k
        return out
`}
      />

      {/* ------------------------------------------------------------ */}
      <H2>4. Library management system</H2>
      <Table
        head={["Entity", "Key fields / methods"]}
        rows={[
          ["Book (catalog entry)", "ISBN, title, authors, subjects"],
          ["BookCopy (physical item)", "barcode, book, status (AVAILABLE, LOANED, RESERVED, LOST)"],
          ["Member", "id, active loans, reservations, fines; canBorrow() enforces limits"],
          ["Loan", "copy, member, issued date, due date, returned date"],
          ["Reservation", "book, member, created; a FIFO queue per book"],
          ["Catalog (search)", "byTitle / byAuthor / bySubject indexes"],
          ["FinePolicy (Strategy)", "fine(loan, returnDate)"],
          ["NotificationService (Observer)", "Due-date reminders, reservation available"],
        ]}
      />
      <P>
        The key modeling insight: separate the <strong>Book</strong> (the work) from <strong>BookCopy</strong> (each
        physical item). Checkout operates on copies; reservation queues are per book; returning a copy first checks the
        book&apos;s reservation queue before marking it available.
      </P>

      {/* ------------------------------------------------------------ */}
      <H2>5. Chess</H2>
      <Code
        python={String.raw`
class Piece:
    def __init__(self, white): self.white = white
    def moves(self, board, r, c):             # pseudo-legal moves; overridden per piece
        raise NotImplementedError

    def _slide(self, board, r, c, dirs):
        out = []
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            while 0 <= nr < 8 and 0 <= nc < 8:
                p = board.at(nr, nc)
                if p is None:
                    out.append((nr, nc))
                else:
                    if p.white != self.white:
                        out.append((nr, nc))  # capture
                    break
                nr, nc = nr + dr, nc + dc
        return out

class Rook(Piece):
    def moves(self, b, r, c): return self._slide(b, r, c, [(1, 0), (-1, 0), (0, 1), (0, -1)])

class Bishop(Piece):
    def moves(self, b, r, c): return self._slide(b, r, c, [(1, 1), (1, -1), (-1, 1), (-1, -1)])

class Queen(Piece):
    def moves(self, b, r, c):
        return self._slide(b, r, c, [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)])

class Knight(Piece):
    def moves(self, b, r, c):
        jumps = [(2, 1), (1, 2), (-1, 2), (-2, 1), (-2, -1), (-1, -2), (1, -2), (2, -1)]
        return [(r + dr, c + dc) for dr, dc in jumps
                if 0 <= r + dr < 8 and 0 <= c + dc < 8
                and (b.at(r + dr, c + dc) is None or b.at(r + dr, c + dc).white != self.white)]
`}
      />
      <P>
        Around this: <code>Board</code> (8×8 grid, <code>at</code>, <code>move</code>), <code>Game</code> (players, turn,
        move history as Command objects for undo, status), and a legality check that applies a move on a copy and rejects
        it if the mover&apos;s king is in check. Special moves (castling, en passant, promotion) are where extensibility
        is tested.
      </P>

      <H3>Common evaluation points</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Clear separation of responsibilities; no &ldquo;god class&rdquo; doing everything.</li>
        <li>Enums for fixed sets; interfaces where behavior varies.</li>
        <li>Thread safety for shared resources (spots, elevator requests, inventory).</li>
        <li>Correct core logic with edge cases (full lot, sold out, invalid move).</li>
        <li>Ability to extend: new vehicle type, new pricing, new piece rule, without rewriting.</li>
      </ul>

      <QA
        items={[
          { q: "How do you avoid two cars being assigned the same parking spot concurrently?", level: "Medium", a: <p>Make the find-and-claim step atomic: a lock around the allocation (simple), per-floor locks (less contention), or a compare-and-set on the spot&apos;s occupied flag and retry on failure. In a distributed version, use a conditional DB update (<code>UPDATE spot SET vehicle=? WHERE id=? AND vehicle IS NULL</code>).</p> },
          { q: "How would you add a new 'Electric car' that needs a charging spot?", level: "Easy", a: <p>Add an ElectricCar vehicle type and a ChargingSpot (subclass of Spot, or a spot feature flag) whose can_fit requires a charger; the allocation and pricing code don&apos;t change if they depend on can_fit and the PricingStrategy (Open/Closed).</p> },
          { q: "What design pattern fits elevator dispatching that changes during rush hour?", level: "Medium", a: <p>Strategy: the Dispatcher delegates to a DispatchStrategy (nearest car, zoning by floor ranges, destination dispatch). The building can switch strategies by time of day without changing elevator logic.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A vending machine whose behavior depends on Idle/HasMoney/SoldOut is best modeled with…", options: ["Singleton", "State", "Adapter", "Composite"], answer: 1, explain: "Each state handles events and transitions." },
          { q: "In a library system, why separate Book and BookCopy?", options: ["Performance", "A title can have many physical copies with independent status", "Inheritance requires it", "To use a Factory"], answer: 1, explain: "Loans and status belong to copies; metadata and reservations to the book." },
          { q: "Choosing the smallest spot that fits a vehicle is a…", options: ["Best-fit allocation strategy", "Random strategy", "LRU policy", "Builder"], answer: 0, explain: "It preserves large spots for large vehicles." },
        ]}
      />
    </>
  );
}
