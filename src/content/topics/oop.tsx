import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Code } from "@/components/content";

export default function OOP() {
  return (
    <>
      <Lead>
        Object-oriented programming organizes code around <strong>objects</strong> that bundle data with the behavior
        that operates on it. Low-level design (LLD) interviews (&ldquo;design a parking lot&rdquo;) and many coding
        rounds in Java, C++ or Python expect fluent use of the four pillars, plus the judgment to prefer composition over
        inheritance.
      </Lead>

      <H2>Classes and objects</H2>
      <P>
        A <strong>class</strong> is a blueprint; an <strong>object</strong> is an instance with its own state. Think of
        &ldquo;BankAccount&rdquo; as the class, and your account (balance 120) and mine (balance 3,000) as objects.
      </P>

      <H2>1. Encapsulation</H2>
      <P>
        Hide internal state and expose a small, safe interface. Callers can&apos;t put the object into an invalid state
        because they can only use methods that enforce the rules (invariants).
      </P>
      <Code
        python={String.raw`
class BankAccount:
    def __init__(self, owner):
        self.owner = owner
        self._balance = 0            # "private" by convention

    @property
    def balance(self):               # read-only from outside
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount > self._balance:
            raise ValueError("insufficient funds")   # invariant: balance >= 0
        self._balance -= amount
`}
        java={String.raw`
public class BankAccount {
    private final String owner;
    private long balanceCents;             // private: only methods below can change it

    public BankAccount(String owner) { this.owner = owner; }

    public long getBalance() { return balanceCents; }

    public void deposit(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("deposit must be positive");
        balanceCents += cents;
    }

    public void withdraw(long cents) {
        if (cents > balanceCents) throw new IllegalStateException("insufficient funds");
        balanceCents -= cents;
    }
}
`}
      />

      <H2>2. Abstraction</H2>
      <P>
        Expose <em>what</em> something does, hide <em>how</em>. A <code>PaymentProcessor</code> interface with{" "}
        <code>charge(amount)</code> lets checkout code ignore whether Stripe or PayPal is behind it. Abstraction is about
        designing the interface; encapsulation is about protecting the implementation.
      </P>
      <Code
        python={String.raw`
from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    @abstractmethod
    def charge(self, amount_cents: int, token: str) -> str: ...

class StripeProcessor(PaymentProcessor):
    def charge(self, amount_cents, token):
        # call Stripe's API…
        return "ch_123"

def checkout(cart, processor: PaymentProcessor):
    return processor.charge(cart.total(), cart.payment_token)   # doesn't know which provider
`}
        java={String.raw`
interface PaymentProcessor {
    String charge(long amountCents, String token);
}

class StripeProcessor implements PaymentProcessor {
    public String charge(long amountCents, String token) { /* call Stripe */ return "ch_123"; }
}

class Checkout {
    private final PaymentProcessor processor;           // depends on the abstraction
    Checkout(PaymentProcessor p) { this.processor = p; }
    String pay(Cart cart) { return processor.charge(cart.total(), cart.token()); }
}
`}
      />

      <H2>3. Inheritance</H2>
      <P>
        A subclass reuses and extends a base class: an &ldquo;is-a&rdquo; relationship (a <code>SavingsAccount</code> is a{" "}
        <code>BankAccount</code>). It enables code reuse and polymorphism, but couples the child tightly to the
        parent&apos;s implementation.
      </P>
      <Code
        python={String.raw`
class SavingsAccount(BankAccount):
    def __init__(self, owner, rate):
        super().__init__(owner)
        self.rate = rate

    def add_interest(self):
        self.deposit(int(self.balance * self.rate))

    def withdraw(self, amount):          # override: extra rule
        if amount > 1000:
            raise ValueError("savings withdrawals are limited")
        super().withdraw(amount)
`}
      />

      <H2>4. Polymorphism</H2>
      <P>
        &ldquo;Many forms&rdquo;: the same call does the right thing for each type. Code written against{" "}
        <code>Shape.area()</code> works for circles, squares, and shapes invented next year.
      </P>
      <Table
        head={["Kind", "Resolved", "Example"]}
        rows={[
          ["Subtype (runtime / dynamic dispatch)", "At runtime, by the object's actual class", "shape.area() calls Circle.area or Square.area"],
          ["Overloading (compile-time)", "At compile time, by argument types", "Java: print(int) vs print(String)"],
          ["Parametric (generics)", "Compile time", "List<T>, Map<K, V>"],
          ["Duck typing", "Runtime: anything with the right methods works", "Python: any object with read() can act as a file"],
        ]}
      />
      <Code
        python={String.raw`
import math

class Shape:
    def area(self): raise NotImplementedError

class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return math.pi * self.r ** 2

class Rect(Shape):
    def __init__(self, w, h): self.w, self.h = w, h
    def area(self): return self.w * self.h

shapes = [Circle(1), Rect(2, 3)]
total = sum(s.area() for s in shapes)    # no if/else on type
`}
      />

      <H2>Composition over inheritance</H2>
      <P>
        Composition builds behavior by <strong>holding</strong> other objects (&ldquo;has-a&rdquo;) instead of extending
        them. It&apos;s more flexible: you can swap parts at runtime, combine behaviors freely, and avoid fragile class
        hierarchies.
      </P>
      <Cards>
        <Card title="Inheritance trap">Bird → FlyingBird, SwimmingBird… what about a duck that flies and swims, or a penguin? Hierarchies explode with combinations.</Card>
        <Card title="Composition fix">A Bird has a list of abilities (FlyBehavior, SwimBehavior). Mix and match without new subclasses (the Strategy pattern).</Card>
        <Card title="Fragile base class">Changing a parent method silently breaks subclasses that relied on its internals.</Card>
        <Card title="When inheritance is right">A true, stable is-a relationship with shared behavior and the Liskov substitution principle holding: a framework's base Exception, an abstract template.</Card>
      </Cards>
      <Code
        python={String.raw`
class Engine:
    def start(self): return "vroom"

class ElectricMotor:
    def start(self): return "whirr"

class Car:
    def __init__(self, power_source):   # has-a: inject the part
        self.power = power_source

    def start(self):
        return self.power.start()

Car(Engine()).start()        # "vroom"
Car(ElectricMotor()).start() # "whirr": no subclass needed
`}
      />

      <H3>Other terms interviewers use</H3>
      <Table
        head={["Term", "Meaning"]}
        rows={[
          ["Interface vs abstract class", "An interface declares capabilities with no state (a class may implement many); an abstract class can share code and state but you extend only one (in Java)."],
          ["Cohesion", "How focused a class is on one responsibility; aim high."],
          ["Coupling", "How much classes depend on each other's details; aim low."],
          ["Association / aggregation / composition", "Uses / has (parts can live independently, e.g. Team–Player) / owns (parts die with the whole, e.g. House–Room)."],
          ["Static vs instance members", "Shared by the class vs belonging to each object."],
          ["Immutability", "Objects whose state never changes after construction: thread-safe and easy to reason about (String, value objects)."],
          ["equals / hashCode", "Must be consistent: equal objects need equal hash codes, or hash maps break."],
        ]}
      />

      <QA
        items={[
          { q: "What's the difference between encapsulation and abstraction?", level: "Easy", a: <p>Abstraction decides what to expose (a simple interface that models the concept); encapsulation hides and protects the data and implementation behind that interface. You abstract a car as &ldquo;start, steer, brake&rdquo; and encapsulate the engine internals.</p> },
          { q: "Why do many style guides say 'favor composition over inheritance'?", level: "Medium", a: <p>Inheritance couples subclasses to the parent&apos;s implementation, is fixed at compile time and leads to deep, combinatorial hierarchies. Composition keeps components independent, testable (inject a fake), swappable at runtime and combinable. Use inheritance only for genuine is-a relationships that satisfy Liskov.</p> },
          { q: "Is a Square a Rectangle in OOP?", level: "Medium", a: <p>Mathematically yes, but if Rectangle has independent setWidth/setHeight, a Square subclass must break that contract (setting the width changes the height), so code that works with rectangles breaks. That violates the Liskov substitution principle; model them as separate immutable shapes, or both implementing a Shape interface.</p> },
          { q: "When would you use an abstract class rather than an interface?", level: "Easy", a: <p>When subclasses share real implementation or state (a template method calling abstract hooks). Use an interface when unrelated classes should offer the same capability, or when a class needs several capabilities.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Calling shape.area() and getting the right result for each subclass is…", options: ["Encapsulation", "Polymorphism", "Abstraction", "Overloading"], answer: 1, explain: "Dynamic dispatch picks the implementation at runtime." },
          { q: "Making fields private and validating changes in methods is…", options: ["Inheritance", "Encapsulation", "Polymorphism", "Composition"], answer: 1, explain: "It protects invariants." },
          { q: "A Car that receives an Engine object in its constructor uses…", options: ["Inheritance", "Composition / dependency injection", "Overloading", "Multiple inheritance"], answer: 1, explain: "Has-a, with the part injected from outside." },
        ]}
      />
      <Callout type="interview">
        In LLD rounds, name the pillars only when they explain a decision: &ldquo;I&apos;ll make Vehicle an abstract class
        so ParkingSpot can accept any vehicle polymorphically, and inject the PricingStrategy instead of subclassing
        ParkingLot.&rdquo;
      </Callout>
    </>
  );
}
