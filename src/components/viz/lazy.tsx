"use client";
/**
 * Code-split entry points for every visualizer. Lessons import from here so each page
 * only downloads the visualizers it actually renders.
 */
import dynamic from "next/dynamic";

function Skeleton() {
  return (
    <div className="my-8 grid h-72 place-items-center rounded-2xl border border-border bg-surface text-[13px] text-subtle">
      Loading interactive visualizer…
    </div>
  );
}

export const BigOChart = dynamic(() => import("./BigOChart").then((m) => m.BigOChart), { loading: Skeleton });
export const SortingViz = dynamic(() => import("./SortingViz").then((m) => m.SortingViz), { loading: Skeleton });
export const BinarySearchViz = dynamic(() => import("./ArrayViz").then((m) => m.BinarySearchViz), { loading: Skeleton });
export const TwoPointersViz = dynamic(() => import("./ArrayViz").then((m) => m.TwoPointersViz), { loading: Skeleton });
export const SlidingWindowViz = dynamic(() => import("./ArrayViz").then((m) => m.SlidingWindowViz), { loading: Skeleton });
export const PrefixSumViz = dynamic(() => import("./ArrayViz").then((m) => m.PrefixSumViz), { loading: Skeleton });
export const ArrayResizeViz = dynamic(() => import("./LinearViz").then((m) => m.ArrayResizeViz), { loading: Skeleton });
export const LinkedListViz = dynamic(() => import("./LinearViz").then((m) => m.LinkedListViz), { loading: Skeleton });
export const StackQueueViz = dynamic(() => import("./LinearViz").then((m) => m.StackQueueViz), { loading: Skeleton });
export const BracketViz = dynamic(() => import("./LinearViz").then((m) => m.BracketViz), { loading: Skeleton });
export const HashTableViz = dynamic(() => import("./StructViz").then((m) => m.HashTableViz), { loading: Skeleton });
export const HeapViz = dynamic(() => import("./StructViz").then((m) => m.HeapViz), { loading: Skeleton });
export const LRUViz = dynamic(() => import("./StructViz").then((m) => m.LRUViz), { loading: Skeleton });
export const TreeTraversalViz = dynamic(() => import("./TreeViz").then((m) => m.TreeTraversalViz), { loading: Skeleton });
export const BSTViz = dynamic(() => import("./TreeViz").then((m) => m.BSTViz), { loading: Skeleton });
export const GraphAlgoViz = dynamic(() => import("./GraphViz").then((m) => m.GraphAlgoViz), { loading: Skeleton });
export const GridPathViz = dynamic(() => import("./GraphViz").then((m) => m.GridPathViz), { loading: Skeleton });
export const IslandsViz = dynamic(() => import("./GraphViz").then((m) => m.IslandsViz), { loading: Skeleton });
export const GraphBuilderViz = dynamic(() => import("./GraphViz").then((m) => m.GraphBuilderViz), { loading: Skeleton });
export const FibTreeViz = dynamic(() => import("./DPViz").then((m) => m.FibTreeViz), { loading: Skeleton });
export const CallStackViz = dynamic(() => import("./DPViz").then((m) => m.CallStackViz), { loading: Skeleton });
export const DPTableViz = dynamic(() => import("./DPViz").then((m) => m.DPTableViz), { loading: Skeleton });
export const NQueensViz = dynamic(() => import("./MiscViz").then((m) => m.NQueensViz), { loading: Skeleton });
export const SubsetsTreeViz = dynamic(() => import("./MiscViz").then((m) => m.SubsetsTreeViz), { loading: Skeleton });
export const IntervalsViz = dynamic(() => import("./MiscViz").then((m) => m.IntervalsViz), { loading: Skeleton });
export const SequenceDiagram = dynamic(() => import("./NetViz").then((m) => m.SequenceDiagram), { loading: Skeleton });
export const EncapsulationViz = dynamic(() => import("./NetViz").then((m) => m.EncapsulationViz), { loading: Skeleton });
export const SubnetCalculator = dynamic(() => import("./NetViz").then((m) => m.SubnetCalculator), { loading: Skeleton });
export const CongestionViz = dynamic(() => import("./NetViz").then((m) => m.CongestionViz), { loading: Skeleton });
export const LoadBalancerViz = dynamic(() => import("./NetViz").then((m) => m.LoadBalancerViz), { loading: Skeleton });
export const CPUSchedulerViz = dynamic(() => import("./OSViz").then((m) => m.CPUSchedulerViz), { loading: Skeleton });
export const PageReplacementViz = dynamic(() => import("./OSViz").then((m) => m.PageReplacementViz), { loading: Skeleton });
export const BankersViz = dynamic(() => import("./OSViz").then((m) => m.BankersViz), { loading: Skeleton });
export const RaceConditionViz = dynamic(() => import("./OSViz").then((m) => m.RaceConditionViz), { loading: Skeleton });
export const AddressTranslationViz = dynamic(() => import("./OSViz").then((m) => m.AddressTranslationViz), { loading: Skeleton });
export const ProcessStateViz = dynamic(() => import("./OSViz").then((m) => m.ProcessStateViz), { loading: Skeleton });
export const EventLoopViz = dynamic(() => import("./OSViz").then((m) => m.EventLoopViz), { loading: Skeleton });
export const ProducerConsumerViz = dynamic(() => import("./OSViz").then((m) => m.ProducerConsumerViz), { loading: Skeleton });
export const NumberConverter = dynamic(() => import("./ArchViz").then((m) => m.NumberConverter), { loading: Skeleton });
export const CacheSimViz = dynamic(() => import("./ArchViz").then((m) => m.CacheSimViz), { loading: Skeleton });
export const LatencyViz = dynamic(() => import("./ArchViz").then((m) => m.LatencyViz), { loading: Skeleton });
export const InstructionCycleViz = dynamic(() => import("./ArchViz").then((m) => m.InstructionCycleViz), { loading: Skeleton });
export const EncodingPlayground = dynamic(() => import("./CryptoViz").then((m) => m.EncodingPlayground), { loading: Skeleton });
export const HashPlayground = dynamic(() => import("./CryptoViz").then((m) => m.HashPlayground), { loading: Skeleton });
export const ECBDemo = dynamic(() => import("./CryptoViz").then((m) => m.ECBDemo), { loading: Skeleton });
export const RSAToy = dynamic(() => import("./CryptoViz").then((m) => m.RSAToy), { loading: Skeleton });
export const DiffieHellmanViz = dynamic(() => import("./CryptoViz").then((m) => m.DiffieHellmanViz), { loading: Skeleton });
export const PasswordHashViz = dynamic(() => import("./CryptoViz").then((m) => m.PasswordHashViz), { loading: Skeleton });
export const JWTDecoder = dynamic(() => import("./CryptoViz").then((m) => m.JWTDecoder), { loading: Skeleton });
export const InjectionViz = dynamic(() => import("./CryptoViz").then((m) => m.InjectionViz), { loading: Skeleton });
export const SieveViz = dynamic(() => import("./MathViz").then((m) => m.SieveViz), { loading: Skeleton });
export const EuclidViz = dynamic(() => import("./MathViz").then((m) => m.EuclidViz), { loading: Skeleton });
export const FastPowViz = dynamic(() => import("./MathViz").then((m) => m.FastPowViz), { loading: Skeleton });
export const PascalViz = dynamic(() => import("./MathViz").then((m) => m.PascalViz), { loading: Skeleton });
export const ProbabilityViz = dynamic(() => import("./MathViz").then((m) => m.ProbabilityViz), { loading: Skeleton });
export const DigitsViz = dynamic(() => import("./MathViz").then((m) => m.DigitsViz), { loading: Skeleton });
export const SQLPlayground = dynamic(() => import("./DBViz").then((m) => m.SQLPlayground), { loading: Skeleton });
export const IndexScanViz = dynamic(() => import("./DBViz").then((m) => m.IndexScanViz), { loading: Skeleton });
export const IsolationViz = dynamic(() => import("./DBViz").then((m) => m.IsolationViz), { loading: Skeleton });
export const ShardingViz = dynamic(() => import("./DBViz").then((m) => m.ShardingViz), { loading: Skeleton });
export const ConsistentHashViz = dynamic(() => import("./SysViz").then((m) => m.ConsistentHashViz), { loading: Skeleton });
export const RateLimiterViz = dynamic(() => import("./SysViz").then((m) => m.RateLimiterViz), { loading: Skeleton });
export const RaftViz = dynamic(() => import("./SysViz").then((m) => m.RaftViz), { loading: Skeleton });
export const BloomFilterViz = dynamic(() => import("./SysViz").then((m) => m.BloomFilterViz), { loading: Skeleton });
export const LSMViz = dynamic(() => import("./SysViz").then((m) => m.LSMViz), { loading: Skeleton });
export const PartitionViz = dynamic(() => import("./SysViz").then((m) => m.PartitionViz), { loading: Skeleton });
export const BitPlayground = dynamic(() => import("./DSAViz2").then((m) => m.BitPlayground), { loading: Skeleton });
export const UnionFindViz = dynamic(() => import("./DSAViz2").then((m) => m.UnionFindViz), { loading: Skeleton });
export const TrieViz = dynamic(() => import("./DSAViz2").then((m) => m.TrieViz), { loading: Skeleton });
export const MonotonicStackViz = dynamic(() => import("./DSAViz2").then((m) => m.MonotonicStackViz), { loading: Skeleton });
export const KMPViz = dynamic(() => import("./DSAViz2").then((m) => m.KMPViz), { loading: Skeleton });
export const SegmentTreeViz = dynamic(() => import("./DSAViz2").then((m) => m.SegmentTreeViz), { loading: Skeleton });
export const FenwickViz = dynamic(() => import("./DSAViz2").then((m) => m.FenwickViz), { loading: Skeleton });
export const MSTViz = dynamic(() => import("./DSAViz2").then((m) => m.MSTViz), { loading: Skeleton });
export const BellmanFordViz = dynamic(() => import("./DSAViz2").then((m) => m.BellmanFordViz), { loading: Skeleton });
export const FloydViz = dynamic(() => import("./DSAViz2").then((m) => m.FloydViz), { loading: Skeleton });
export const ArchDiagram = dynamic(() => import("./DesignViz").then((m) => m.ArchDiagram), { loading: Skeleton });
export const StarBuilder = dynamic(() => import("./DesignViz").then((m) => m.StarBuilder), { loading: Skeleton });
export const CipherPlayground = dynamic(() => import("./MiscViz2").then((m) => m.CipherPlayground), { loading: Skeleton });
export const BlockchainViz = dynamic(() => import("./MiscViz2").then((m) => m.BlockchainViz), { loading: Skeleton });
export const ConvexHullViz = dynamic(() => import("./MiscViz2").then((m) => m.ConvexHullViz), { loading: Skeleton });
export const NimViz = dynamic(() => import("./MiscViz2").then((m) => m.NimViz), { loading: Skeleton });
export const PipelineViz = dynamic(() => import("./MiscViz2").then((m) => m.PipelineViz), { loading: Skeleton });
export const EndianViz = dynamic(() => import("./MiscViz2").then((m) => m.EndianViz), { loading: Skeleton });
export const MESIViz = dynamic(() => import("./MiscViz2").then((m) => m.MESIViz), { loading: Skeleton });
export const StockStateViz = dynamic(() => import("./DSAViz2").then((m) => m.StockStateViz), { loading: Skeleton });
