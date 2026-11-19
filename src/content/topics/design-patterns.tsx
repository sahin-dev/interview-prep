import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";

export default function DesignPatterns() {
  return (
    <>
      <Lead>
        Design patterns are named, reusable solutions to recurring design problems, popularized by the
        &ldquo;Gang of Four&rdquo; book. In interviews they give you vocabulary: saying &ldquo;the pricing rules are a
        Strategy, and the display boards are Observers of the parking lot&rdquo; communicates a lot of design in one
        sentence. Learn the problem each one solves, not just the class diagram.
      </Lead>

      <Table
        head={["Category", "Patterns", "Concern"]}
        rows={[
          ["Creational", "Singleton, Factory Method, Abstract Factory, Builder, Prototype", "How objects get created"],
          ["Structural", "Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight", "How objects are composed"],
          ["Behavioral", "Strategy, Observer, State, Command, Iterator, Template Method, Chain of Responsibility, Visitor", "How objects interact and share responsibility"],
        ]}
      />

      <H2>Singleton</H2>
      <P>
        <strong>Problem:</strong> exactly one instance should exist (config, connection pool, logger), with global access.
        <strong> Caveats:</strong> it&apos;s global state in disguise, so it hides dependencies and complicates testing.
        Prefer creating one instance at startup and injecting it.
      </P>
      <Code
        python={String.raw`
class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.settings = {}
        return cls._instance

assert Config() is Config()
# (In Python, a module-level object is already a singleton.)
`}
        java={String.raw`
public final class Config {
    private Config() {}
    // Initialization-on-demand holder: lazy and thread-safe without locks
    private static class Holder { static final Config INSTANCE = new Config(); }
    public static Config get() { return Holder.INSTANCE; }
}
// Or simply: enum Config { INSTANCE; }
`}
      />

      <H2>Factory</H2>
      <P>
        <strong>Problem:</strong> callers shouldn&apos;t know which concrete class to instantiate. A factory method
        centralizes creation, often chosen by a parameter or config.
      </P>
      <Code
        python={String.raw`
class Notifier:
    def send(self, to, msg): ...

class EmailNotifier(Notifier): ...
class SmsNotifier(Notifier): ...
class PushNotifier(Notifier): ...

NOTIFIERS = {"email": EmailNotifier, "sms": SmsNotifier, "push": PushNotifier}

def make_notifier(channel: str) -> Notifier:
    try:
        return NOTIFIERS[channel]()          # registry-based factory: open for extension
    except KeyError:
        raise ValueError(f"unknown channel {channel}")
`}
      />

      <H2>Builder</H2>
      <P>
        <strong>Problem:</strong> objects with many optional parameters (telescoping constructors). A builder sets
        fields step by step with readable names and validates before building an immutable object.
      </P>
      <Code
        java={String.raw`
public final class HttpRequest {
    private final String url, method; private final Map<String, String> headers; private final int timeoutMs;
    private HttpRequest(Builder b) { url = b.url; method = b.method; headers = Map.copyOf(b.headers); timeoutMs = b.timeoutMs; }

    public static class Builder {
        private final String url; private String method = "GET";
        private final Map<String, String> headers = new HashMap<>(); private int timeoutMs = 5000;
        public Builder(String url) { this.url = url; }
        public Builder method(String m) { this.method = m; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public Builder timeout(int ms) { this.timeoutMs = ms; return this; }
        public HttpRequest build() {
            if (timeoutMs <= 0) throw new IllegalStateException("timeout must be positive");
            return new HttpRequest(this);
        }
    }
}
// new HttpRequest.Builder("https://api").method("POST").header("Auth", "x").timeout(2000).build();
`}
      />

      <H2>Strategy</H2>
      <P>
        <strong>Problem:</strong> several interchangeable algorithms (pricing, routing, sorting, compression). Encapsulate
        each behind one interface and choose at runtime. This is the textbook fix for a big <code>if/else</code> on type.
      </P>
      <Code
        python={String.raw`
class PricingStrategy:
    def fee(self, hours): ...

class Hourly(PricingStrategy):
    def __init__(self, rate): self.rate = rate
    def fee(self, hours): return self.rate * hours

class FlatDaily(PricingStrategy):
    def fee(self, hours): return 20 * ((hours + 23) // 24)

class ParkingTicket:
    def __init__(self, strategy: PricingStrategy):
        self.strategy = strategy
    def charge(self, hours):
        return self.strategy.fee(hours)     # swap strategies without touching this class
`}
      />

      <H2>Observer (publish/subscribe)</H2>
      <P>
        <strong>Problem:</strong> when one object changes, many others must react, without the subject knowing their
        concrete types. Used in UI frameworks, event systems and model–view separation.
      </P>
      <Code
        python={String.raw`
class EventBus:
    def __init__(self):
        self.subscribers = {}                       # event -> list of callbacks

    def subscribe(self, event, fn):
        self.subscribers.setdefault(event, []).append(fn)

    def publish(self, event, payload):
        for fn in self.subscribers.get(event, []):
            fn(payload)

bus = EventBus()
bus.subscribe("spot_freed", lambda s: print("display board: free spot", s))
bus.subscribe("spot_freed", lambda s: print("waitlist: notify next driver"))
bus.publish("spot_freed", 42)
`}
      />

      <H2>Decorator</H2>
      <P>
        <strong>Problem:</strong> add responsibilities (logging, caching, retries, compression) to an object dynamically
        without subclassing every combination. A decorator implements the same interface and wraps another instance.
      </P>
      <Code
        python={String.raw`
class DataSource:
    def read(self): ...

class FileSource(DataSource):
    def __init__(self, path): self.path = path
    def read(self): return open(self.path, "rb").read()

class CachingSource(DataSource):
    def __init__(self, inner): self.inner, self.cache = inner, None
    def read(self):
        if self.cache is None:
            self.cache = self.inner.read()
        return self.cache

class LoggingSource(DataSource):
    def __init__(self, inner): self.inner = inner
    def read(self):
        print("reading…")
        return self.inner.read()

src = LoggingSource(CachingSource(FileSource("data.bin")))   # stack behaviors freely
`}
      />

      <H2>Adapter</H2>
      <P>
        <strong>Problem:</strong> an existing class has the wrong interface for your code (a third-party SDK, legacy
        system). An adapter translates calls, like a travel plug adapter.
      </P>
      <Code
        python={String.raw`
class LegacyXmlPayments:                 # can't change this
    def make_payment_xml(self, xml: str): ...

class PaymentGateway:                    # the interface our code expects
    def pay(self, amount, card): ...

class LegacyAdapter(PaymentGateway):
    def __init__(self, legacy): self.legacy = legacy
    def pay(self, amount, card):
        xml = f"<pay><amt>{amount}</amt><card>{card}</card></pay>"
        return self.legacy.make_payment_xml(xml)
`}
      />

      <H2>State</H2>
      <P>
        <strong>Problem:</strong> behavior depends on the current state, and conditionals on a status field spread
        everywhere (vending machines, orders, elevators, TCP connections). Each state becomes a class handling events
        and choosing the next state.
      </P>
      <Code
        python={String.raw`
class State:
    def insert_coin(self, m): print("ignored")
    def select(self, m, item): print("insert a coin first")

class Idle(State):
    def insert_coin(self, m):
        m.state = HasCoin()

class HasCoin(State):
    def insert_coin(self, m): print("already have a coin")
    def select(self, m, item):
        if m.stock.get(item, 0) == 0:
            print("sold out"); return
        m.stock[item] -= 1
        print("dispensing", item)
        m.state = Idle()

class VendingMachine:
    def __init__(self, stock):
        self.stock, self.state = stock, Idle()
    def insert_coin(self): self.state.insert_coin(self)
    def select(self, item): self.state.select(self, item)
`}
      />

      <H3>More patterns in one line each</H3>
      <Table
        head={["Pattern", "Use it when"]}
        rows={[
          ["Facade", "Give a simple API over a complex subsystem (a VideoConverter wrapping codecs, muxers, files)."],
          ["Proxy", "Control access to an object: lazy loading, remote calls (RPC stubs), access checks, caching."],
          ["Composite", "Treat individual objects and groups uniformly: files and folders, UI widget trees."],
          ["Command", "Turn a request into an object: undo/redo, queues of jobs, macro recording."],
          ["Iterator", "Traverse a collection without exposing its structure (Python generators, Java Iterator)."],
          ["Template Method", "A base class defines the algorithm skeleton; subclasses fill in steps."],
          ["Chain of Responsibility", "Pass a request through handlers until one handles it: middleware, logging levels, approval chains."],
          ["Abstract Factory", "Create families of related objects (Windows vs Mac widgets) that must match."],
          ["Flyweight", "Share immutable common state among many objects (glyphs in a text editor, map tiles)."],
          ["Prototype", "Create objects by cloning a configured instance."],
        ]}
      />

      <QA
        items={[
          { q: "What's the difference between Strategy and State?", level: "Medium", a: <p>Structurally similar (delegating to an interchangeable object). In Strategy the client chooses the algorithm and it rarely changes by itself; in State the object changes its own state object in response to events, and each state knows the transitions.</p> },
          { q: "Decorator vs inheritance for adding logging and caching?", level: "Medium", a: <p>Inheritance would need LoggingFileSource, CachingFileSource, LoggingCachingFileSource… for every combination and every base type. Decorators wrap any DataSource and stack in any order at runtime.</p> },
          { q: "Why is Singleton often called an anti-pattern?", level: "Medium", a: <p>It&apos;s hidden global state: dependencies aren&apos;t visible in constructors, tests interfere through shared state, and it&apos;s hard to replace with a fake. Thread-safe lazy initialization is also easy to get wrong. Prefer dependency injection of a single instance.</p> },
          { q: "Which pattern would you use for undo/redo in a text editor?", level: "Easy", a: <p>Command: each edit is an object with execute() and undo(); keep two stacks of commands for undo and redo. (Memento is the alternative: snapshot state.)</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Wrapping a third-party SDK so it fits your interface is…", options: ["Decorator", "Adapter", "Facade", "Proxy"], answer: 1, explain: "Adapter converts one interface into another." },
          { q: "UI components re-rendering when a model changes is…", options: ["Observer", "Builder", "Command", "Singleton"], answer: 0, explain: "Subscribers are notified of state changes." },
          { q: "Constructing an object with 10 optional parameters readably calls for…", options: ["Prototype", "Builder", "Factory", "Flyweight"], answer: 1, explain: "Named, chainable setters and validation in build()." },
        ]}
      />
      <Callout type="interview">
        Don&apos;t force patterns into a design. Introduce one when you hit the problem it solves, and name it so the
        interviewer can follow your reasoning.
      </Callout>
    </>
  );
}
