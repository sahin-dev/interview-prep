import {
  Compass, Braces, Boxes, Workflow, Grid3x3, TreePine, Share2, Type, Sigma, Lock, Globe,
  Terminal, Cpu, Database, Server, Shapes, Users, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  compass: Compass, braces: Braces, boxes: Boxes, workflow: Workflow, grid: Grid3x3, tree: TreePine,
  share: Share2, type: Type, sigma: Sigma, lock: Lock, globe: Globe, terminal: Terminal, cpu: Cpu,
  database: Database, server: Server, shapes: Shapes, users: Users,
};

export function SectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name] ?? Compass;
  return <Icon className={className} aria-hidden />;
}
