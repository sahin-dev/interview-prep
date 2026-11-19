import { H2, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";

export default function Solid() {
  return (
    <>
      <Lead>
        SOLID is five design principles for object-oriented code that is easy to change, test and extend. They&apos;re not
        laws. They are names for smells that interviewers (and code reviewers) look for. For each principle: the smell,
        the fix, and a small example.
      </Lead>

      <Table
        head={["Letter", "Principle", "One-liner"]}
        rows={[
          ["S", "Single Responsibility", "A class should have one reason to change."],
          ["O", "Open/Closed", "Open for extension, closed for modification."],
          ["L", "Liskov Substitution", "Subtypes must be usable anywhere their base type is expected."],
          ["I", "Interface Segregation", "Many small, specific interfaces beat one fat interface."],
          ["D", "Dependency Inversion", "Depend on abstractions, not on concrete implementations."],
        ]}
      />

      <H2>S: Single Responsibility Principle</H2>
      <P>
        <strong>Smell:</strong> a class that changes for unrelated reasons (business rules, formatting, persistence).
        <strong> Fix:</strong> split by reason to change.
      </P>
      <Code
        python={String.raw`
# Before: one class, three reasons to change
class Invoice:
    def total(self): ...
    def to_pdf(self): ...           # presentation changes
    def save(self, db): ...         # storage changes

# After
class Invoice:
    def total(self): ...

class InvoicePdfRenderer:
    def render(self, invoice): ...

class InvoiceRepository:
    def save(self, invoice): ...
`}
      />

      <H2>O: Open/Closed Principle</H2>
      <P>
        <strong>Smell:</strong> adding a new variant means editing a growing <code>if/elif</code> or <code>switch</code> in
        existing, tested code. <strong>Fix:</strong> polymorphism, so new behavior is a new class.
      </P>
      <Code
        python={String.raw`
# Before: every new discount edits this function
def price(order, kind):
    if kind == "student": return order.total * 0.8
    elif kind == "black_friday": return order.total * 0.5
    return order.total

# After: add a class, touch nothing else
class Discount:
    def apply(self, total): return total

class StudentDiscount(Discount):
    def apply(self, total): return total * 0.8

class BlackFriday(Discount):
    def apply(self, total): return total * 0.5

def price(order, discount: Discount):
    return discount.apply(order.total)
`}
      />

      <H2>L: Liskov Substitution Principle</H2>
      <P>
        <strong>Smell:</strong> a subclass that throws &ldquo;not supported&rdquo;, ignores parent behavior, or needs{" "}
        <code>isinstance</code> checks in callers. Subtypes must keep the parent&apos;s promises: accept at least the
        same inputs, return results the caller expects, preserve invariants.
      </P>
      <Code
        python={String.raw`
# Violation: not every bird can fly
class Bird:
    def fly(self): ...

class Penguin(Bird):
    def fly(self):
        raise NotImplementedError     # callers of Bird.fly() now crash

# Fix: model capabilities separately
class Bird: ...
class FlyingBird(Bird):
    def fly(self): ...
class Sparrow(FlyingBird): ...
class Penguin(Bird):
    def swim(self): ...
`}
      />
      <Callout type="note">
        The classic example is Square extends Rectangle: setting a square&apos;s width also changes its height, which
        breaks code that expects to set them independently.
      </Callout>

      <H2>I: Interface Segregation Principle</H2>
      <P>
        <strong>Smell:</strong> implementers forced to stub out methods they don&apos;t need. <strong>Fix:</strong> split
        into role interfaces; a class implements only what it supports.
      </P>
      <Code
        java={String.raw`
// Before: a basic printer must "implement" scan and fax
interface Machine { void print(Doc d); void scan(Doc d); void fax(Doc d); }

// After: small role interfaces
interface Printer { void print(Doc d); }
interface Scanner { void scan(Doc d); }
interface Fax     { void fax(Doc d); }

class BasicPrinter implements Printer { public void print(Doc d) { /* … */ } }
class OfficeMachine implements Printer, Scanner, Fax { /* all three */ }
`}
      />

      <H2>D: Dependency Inversion Principle</H2>
      <P>
        <strong>Smell:</strong> high-level business logic directly constructs low-level details (<code>new
        MySQLDatabase()</code>), so it can&apos;t be tested or switched. <strong>Fix:</strong> both depend on an
        abstraction, and the concrete implementation is injected (dependency injection).
      </P>
      <Code
        python={String.raw`
class NotificationSender:              # abstraction owned by the high-level module
    def send(self, user, msg): ...

class EmailSender(NotificationSender):
    def send(self, user, msg): ...     # SMTP details

class FakeSender(NotificationSender):  # for tests
    def __init__(self): self.sent = []
    def send(self, user, msg): self.sent.append((user, msg))

class OrderService:
    def __init__(self, sender: NotificationSender):   # injected, not constructed
        self.sender = sender

    def place(self, order):
        ...
        self.sender.send(order.user, "Order confirmed")

svc = OrderService(FakeSender())       # unit test without SMTP
`}
      />

      <H2>Beyond SOLID</H2>
      <Table
        head={["Principle", "Meaning"]}
        rows={[
          ["DRY", "Don't Repeat Yourself: one source of truth for each piece of knowledge (but don't merge code that only looks alike)."],
          ["KISS", "Keep it simple: the simplest design that meets the requirements."],
          ["YAGNI", "You Aren't Gonna Need It: don't build extension points for imagined futures."],
          ["Law of Demeter", "Talk to your friends, not strangers: avoid a.getB().getC().doX() chains."],
          ["Tell, don't ask", "Ask an object to do the work rather than pulling its data out and deciding for it."],
          ["Composition over inheritance", "Assemble behavior from parts."],
        ]}
      />

      <QA
        items={[
          { q: "Give a real example of the Open/Closed principle you've seen.", level: "Medium", a: <p>Plugin and middleware systems: Express/Django middleware, Java&apos;s Comparator, a payment module where each provider implements a PaymentGateway interface. New providers are new classes registered in a map; the checkout flow is never edited.</p> },
          { q: "How does Dependency Inversion help testing?", level: "Easy", a: <p>Because the class depends on an interface that&apos;s passed in, tests can inject fakes or mocks (in-memory repository, fake clock, fake email sender) and run fast and deterministically without databases or networks.</p> },
          { q: "Can you over-apply SOLID?", level: "Medium", a: <p>Yes: an interface for every class, factories for everything and dozens of one-method classes make simple code hard to follow. Apply the principles where change is likely or already hurting, and keep YAGNI and KISS in mind.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A subclass overrides a method to throw UnsupportedOperationException. Which principle is likely violated?", options: ["SRP", "OCP", "LSP", "DIP"], answer: 2, explain: "It can't be substituted for its parent." },
          { q: "Injecting a Repository interface into a service follows…", options: ["Interface segregation", "Dependency inversion", "Single responsibility", "Liskov"], answer: 1, explain: "The service depends on an abstraction, not a concrete DB class." },
          { q: "A growing switch on 'type' that must be edited for every new type violates…", options: ["Open/closed", "Liskov", "DRY", "Demeter"], answer: 0, explain: "Replace it with polymorphism so new types are additions, not modifications." },
        ]}
      />
    </>
  );
}
