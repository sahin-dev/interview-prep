"use client";
import type { ReactNode } from "react";
import { BigOChart } from "./lazy";
import { SortingViz } from "./lazy";
import { BinarySearchViz, TwoPointersViz, SlidingWindowViz, PrefixSumViz } from "./lazy";
import { ArrayResizeViz, LinkedListViz, StackQueueViz, BracketViz } from "./lazy";
import { HashTableViz, HeapViz, LRUViz } from "./lazy";
import { TreeTraversalViz, BSTViz } from "./lazy";
import { GraphAlgoViz, GridPathViz, IslandsViz, GraphBuilderViz } from "./lazy";
import { FibTreeViz, CallStackViz, DPTableViz } from "./lazy";
import { NQueensViz, SubsetsTreeViz, IntervalsViz } from "./lazy";
import { AddressTranslationViz, BankersViz, CPUSchedulerViz, CacheSimViz, CongestionViz, DiffieHellmanViz, ECBDemo, EncapsulationViz, EventLoopViz, HashPlayground, IndexScanViz, InstructionCycleViz, IsolationViz, JWTDecoder, LoadBalancerViz, NumberConverter, PageReplacementViz, PascalViz, ProbabilityViz, RSAToy, RaceConditionViz, SQLPlayground, ShardingViz, SieveViz, SubnetCalculator } from "./lazy";

const MAP: Record<string, () => ReactNode> = {
  "big-o-chart": () => <BigOChart />,
  sorting: () => <SortingViz />,
  "binary-search": () => <BinarySearchViz />,
  "two-pointers": () => <TwoPointersViz />,
  "sliding-window": () => <SlidingWindowViz />,
  "prefix-sums": () => <PrefixSumViz />,
  "array-resize": () => <ArrayResizeViz />,
  "linked-list": () => <LinkedListViz />,
  "stack-queue": () => <StackQueueViz />,
  brackets: () => <BracketViz />,
  "hash-table": () => <HashTableViz />,
  heap: () => <HeapViz />,
  lru: () => <LRUViz />,
  "tree-traversal": () => <TreeTraversalViz />,
  bst: () => <BSTViz />,
  "graph-algos": () => <GraphAlgoViz algos={["bfs", "dfs", "dijkstra", "topo", "cycle"]} />,
  "grid-path": () => <GridPathViz />,
  islands: () => <IslandsViz />,
  "graph-builder": () => <GraphBuilderViz />,
  "fib-tree": () => <FibTreeViz />,
  "call-stack": () => <CallStackViz />,
  "dp-table": () => <DPTableViz kinds={["stairs", "robber", "coins", "paths", "minpath", "knapsack", "lcs", "edit"]} />,
  "n-queens": () => <NQueensViz />,
  "subsets-tree": () => <SubsetsTreeViz />,
  intervals: () => <IntervalsViz />,
  "cpu-scheduler": () => <CPUSchedulerViz />,
  "page-replacement": () => <PageReplacementViz />,
  "bankers": () => <BankersViz />,
  "race-condition": () => <RaceConditionViz />,
  "address-translation": () => <AddressTranslationViz />,
  "event-loop": () => <EventLoopViz />,
  "subnet": () => <SubnetCalculator />,
  "encapsulation": () => <EncapsulationViz />,
  "congestion": () => <CongestionViz />,
  "load-balancer": () => <LoadBalancerViz />,
  "number-converter": () => <NumberConverter />,
  "cache-sim": () => <CacheSimViz />,
  "cpu-cycle": () => <InstructionCycleViz />,
  "sql": () => <SQLPlayground />,
  "index-scan": () => <IndexScanViz />,
  "isolation": () => <IsolationViz />,
  "sharding": () => <ShardingViz />,
  "hash-playground": () => <HashPlayground />,
  "ecb": () => <ECBDemo />,
  "rsa": () => <RSAToy />,
  "diffie-hellman": () => <DiffieHellmanViz />,
  "jwt": () => <JWTDecoder />,
  "sieve": () => <SieveViz />,
  "probability": () => <ProbabilityViz />,
  "pascal": () => <PascalViz />,
};

export function VizById({ id }: { id: string }) {
  const render = MAP[id];
  return render ? <>{render()}</> : <p className="text-muted">Visualizer not found.</p>;
}
