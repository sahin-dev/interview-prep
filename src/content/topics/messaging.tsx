import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Code } from "@/components/content";
import { PartitionViz, ProducerConsumerViz } from "@/components/viz/lazy";

export default function Messaging() {
  return (
    <>
      <Lead>
        Message queues and pub/sub systems let services communicate <strong>asynchronously</strong>: a producer drops a
        message and moves on; consumers process it when they can. This decouples services, absorbs traffic spikes,
        enables retries and lets one event trigger many independent reactions. Kafka, RabbitMQ, SQS, Pub/Sub and Redis
        Streams are the usual names.
      </Lead>

      <H2>Why asynchronous messaging?</H2>
      <Cards>
        <Card title="Decoupling">The order service doesn't need to know that email, analytics and fraud detection exist; they subscribe to "OrderPlaced".</Card>
        <Card title="Load leveling">A burst of 50k uploads/minute waits in the queue while a fixed pool of workers drains it at a steady rate.</Card>
        <Card title="Resilience">If the email service is down, messages wait instead of failing the checkout.</Card>
        <Card title="Fast responses">Return 202 Accepted immediately; slow work (video encoding) happens in the background.</Card>
      </Cards>
      <ProducerConsumerViz />

      <H2>Queue vs pub/sub vs log</H2>
      <Table
        head={["Model", "Delivery", "After consumption", "Examples"]}
        rows={[
          ["Work queue (point-to-point)", "Each message goes to ONE of the competing consumers", "Deleted when acknowledged", "SQS, RabbitMQ queues, Celery"],
          ["Pub/sub (topic fan-out)", "Each message goes to EVERY subscription", "Deleted per subscription after ack", "SNS, Google Pub/Sub, RabbitMQ fanout exchange"],
          ["Distributed log", "Consumers read at their own offset; many groups can read the same data", "Retained for a period (days) regardless of reads; can replay", "Kafka, Kinesis, Pulsar, Redis Streams"],
        ]}
      />

      <H2>Kafka in five ideas</H2>
      <PartitionViz />
      <Table
        head={["Concept", "Meaning"]}
        rows={[
          ["Topic", "A named stream of records, e.g. orders"],
          ["Partition", "A topic is split into ordered, append-only logs. Order is guaranteed only within a partition. Partitions are the unit of parallelism and are replicated across brokers."],
          ["Key", "Records with the same key go to the same partition (hash(key) mod P), so all events for one user or order stay in order"],
          ["Offset", "A record's position in its partition. Consumers commit the offset they've processed; replay = rewind the offset"],
          ["Consumer group", "Consumers sharing a group id split the partitions between them; each partition has exactly one consumer in the group. Different groups each get all the data."],
        ]}
      />
      <Callout type="warning">
        You can&apos;t have more active consumers in a group than partitions. Choose the partition count for your
        future peak parallelism; increasing it later changes the key → partition mapping and breaks per-key ordering for
        a while.
      </Callout>

      <H2>Delivery guarantees</H2>
      <Table
        head={["Guarantee", "How it happens", "Risk"]}
        rows={[
          ["At-most-once", "Commit the offset / ack BEFORE processing", "A crash mid-processing loses the message"],
          ["At-least-once", "Ack AFTER processing; redeliver if no ack (the default)", "A crash after processing but before the ack means a duplicate"],
          ["Exactly-once (effectively)", "At-least-once delivery + idempotent processing, or transactional writes (Kafka transactions: consume-process-produce atomically)", "Only within the system's boundaries; external side effects still need idempotency"],
        ]}
      />
      <P>
        In practice: <strong>assume at-least-once and make consumers idempotent</strong>. Give every message a unique ID,
        and record processed IDs (or use upserts / conditional writes) so a redelivery has no extra effect.
      </P>
      <Code
        python={String.raw`
def handle(msg, db):
    # Idempotent consumer: processing the same message twice has no extra effect.
    with db.transaction():
        if db.exists("processed", msg.id):
            return                                  # duplicate delivery: ignore
        db.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (msg.amount, msg.account))
        db.insert("processed", {"id": msg.id})      # same transaction as the side effect
    # acknowledge / commit the offset only after the transaction commits
`}
      />

      <H2>Operational patterns</H2>
      <Cards>
        <Card title="Retries with backoff">Transient failure → retry after 1 s, 2 s, 4 s… with jitter. Don't retry forever.</Card>
        <Card title="Dead-letter queue (DLQ)">After N failed attempts, move the message aside so a "poison pill" doesn't block the queue. Alert and inspect.</Card>
        <Card title="Visibility timeout">SQS hides a received message for a while; if the consumer doesn't delete it in time, it reappears for another consumer.</Card>
        <Card title="Back-pressure">When consumers fall behind, queue depth (consumer lag) grows. Autoscale consumers on lag, or slow producers down.</Card>
        <Card title="Ordering">Global order kills parallelism. Order per key (partition by user_id / order_id) is almost always enough.</Card>
        <Card title="Transactional outbox">Write the business row and an "outbox" event row in the same DB transaction; a relay publishes outbox rows to the broker. Avoids the "DB committed but publish failed" inconsistency.</Card>
      </Cards>

      <H3>Kafka vs RabbitMQ vs SQS</H3>
      <Table
        head={["", "Kafka", "RabbitMQ", "SQS"]}
        rows={[
          ["Model", "Partitioned, replicated log", "Broker with exchanges and queues", "Managed queue"],
          ["Throughput", "Very high (millions/s per cluster)", "High (tens of thousands/s per node)", "Practically unlimited (standard queues)"],
          ["Replay", "Yes, by offset, within retention", "No (once acked, gone)", "No"],
          ["Ordering", "Per partition", "Per queue (with one consumer)", "FIFO queues only (with lower throughput)"],
          ["Routing", "By key to partition", "Flexible: direct, topic, fanout, headers", "Simple; combine with SNS for fan-out"],
          ["Best for", "Event streaming, logs, CDC, analytics pipelines", "Task queues, complex routing, RPC-style messaging", "Simple decoupling on AWS with zero ops"],
        ]}
      />

      <QA
        items={[
          { q: "How do you guarantee that all events for one order are processed in order with Kafka?", level: "Medium", a: <p>Use the order ID as the message key so they all land in the same partition, which one consumer in the group reads sequentially. Also make sure the producer doesn&apos;t reorder retries (enable idempotent producer / limit in-flight requests).</p> },
          { q: "A consumer processes a payment, then crashes before committing its offset. What happens and how do you prevent double charging?", level: "Medium", a: <p>The message is redelivered (at-least-once). Prevent double charges by making the handler idempotent: store the message/payment ID with a unique constraint in the same transaction as the charge, or pass an idempotency key to the payment provider.</p> },
          { q: "When would you NOT use a queue?", level: "Easy", a: <p>When the caller needs the result immediately (reading a profile), when the work is quick and reliable, or when the added latency, operational cost and eventual consistency aren&apos;t worth it. Synchronous calls are simpler to reason about and debug.</p> },
          { q: "What is consumer lag and why monitor it?", level: "Easy", a: <p>Lag is the difference between the newest offset in a partition and the consumer group&apos;s committed offset: how far behind processing is. Growing lag means consumers can&apos;t keep up; alert on it and autoscale consumers (up to the partition count).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In Kafka, what limits the parallelism of one consumer group?", options: ["Number of brokers", "Number of partitions", "Message size", "Replication factor"], answer: 1, explain: "Each partition is consumed by at most one consumer in a group." },
          { q: "The realistic default delivery guarantee you should design for is…", options: ["At-most-once", "At-least-once with idempotent consumers", "Exactly-once everywhere for free", "Best effort"], answer: 1, explain: "Redeliveries happen; idempotency makes them harmless." },
          { q: "Where do messages go after repeatedly failing processing?", options: ["They are retried forever", "A dead-letter queue", "Back to the producer", "They are silently dropped"], answer: 1, explain: "A DLQ isolates poison messages so the rest keep flowing." },
        ]}
      />
    </>
  );
}
