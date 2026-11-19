import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Formula } from "@/components/content";
import { ConvexHullViz } from "@/components/viz/lazy";

export default function Geometry() {
  return (
    <>
      <Lead>
        Computational geometry in interviews boils down to one primitive, the <strong>cross product</strong>, plus
        careful handling of edge cases (collinear points, vertical lines, precision). From it you get orientation
        tests, segment intersection, polygon area, convex hulls and point-in-polygon. It shows up in maps, games,
        graphics, robotics and computer vision.
      </Lead>

      <H2>Vectors and the cross product</H2>
      <Formula>cross(a, b) = aₓ·b_y − a_y·bₓ        dot(a, b) = aₓ·bₓ + a_y·b_y</Formula>
      <Table
        head={["Value of cross(B − A, C − A)", "Meaning"]}
        rows={[
          ["> 0", "A → B → C turns counter-clockwise (C is left of AB)"],
          ["< 0", "Clockwise (C is right of AB)"],
          ["= 0", "Collinear"],
          ["|cross| / 2", "Area of triangle ABC"],
        ]}
      />
      <P>
        The dot product gives angles (positive = acute, zero = perpendicular) and projections. With integer coordinates,
        both are exact: avoid floating point, slopes and division whenever you can.
      </P>
      <Code
        python={String.raw`
def cross(o, a, b):
    """Cross product of OA and OB: > 0 counter-clockwise, < 0 clockwise, 0 collinear."""
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def polygon_area(pts):                         # shoelace formula; pts in order
    s = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2

def on_segment(p, a, b):
    return cross(a, b, p) == 0 and min(a[0], b[0]) <= p[0] <= max(a[0], b[0]) \
        and min(a[1], b[1]) <= p[1] <= max(a[1], b[1])

def segments_intersect(p1, p2, p3, p4):
    d1, d2 = cross(p3, p4, p1), cross(p3, p4, p2)
    d3, d4 = cross(p1, p2, p3), cross(p1, p2, p4)
    if ((d1 > 0) != (d2 > 0)) and d1 and d2 and ((d3 > 0) != (d4 > 0)) and d3 and d4:
        return True                            # proper crossing
    return on_segment(p1, p3, p4) or on_segment(p2, p3, p4) \
        or on_segment(p3, p1, p2) or on_segment(p4, p1, p2)   # touching / collinear overlap
`}
      />

      <H2>Convex hull</H2>
      <ConvexHullViz />
      <P>
        The convex hull is the smallest convex polygon containing all points (a rubber band around nails). Andrew&apos;s
        monotone chain sorts points by x, then builds the lower and upper hulls with a stack, popping the last point
        whenever it would make a clockwise (or straight) turn. O(n log n).
      </P>
      <Code
        python={String.raw`
def convex_hull(points):
    pts = sorted(set(map(tuple, points)))
    if len(pts) <= 2:
        return pts
    def half(seq):
        h = []
        for p in seq:
            while len(h) >= 2 and cross(h[-2], h[-1], p) <= 0:   # use < 0 to keep collinear points
                h.pop()
            h.append(p)
        return h
    lower, upper = half(pts), half(reversed(pts))
    return lower[:-1] + upper[:-1]            # counter-clockwise, no duplicates
`}
        java={String.raw`
long cross(long[] o, long[] a, long[] b) { return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]); }

List<long[]> convexHull(long[][] p) {
    Arrays.sort(p, (a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
    int n = p.length, k = 0;
    long[][] h = new long[2 * n][];
    for (int i = 0; i < n; i++) {                            // lower hull
        while (k >= 2 && cross(h[k-2], h[k-1], p[i]) <= 0) k--;
        h[k++] = p[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {            // upper hull
        while (k >= t && cross(h[k-2], h[k-1], p[i]) <= 0) k--;
        h[k++] = p[i];
    }
    return new ArrayList<>(Arrays.asList(h).subList(0, Math.max(1, k - 1)));
}
`}
      />

      <H2>Point in polygon</H2>
      <P>
        Ray casting: shoot a ray to the right from the point and count how many polygon edges it crosses. Odd means
        inside. For convex polygons, an O(log n) binary search over the fan of triangles is possible.
      </P>
      <Code
        python={String.raw`
def point_in_polygon(pt, poly):
    x, y = pt
    inside = False
    n = len(poly)
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
        if (y1 > y) != (y2 > y):                               # edge straddles the horizontal line
            x_cross = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < x_cross:
                inside = not inside
    return inside
`}
      />

      <H3>Other everyday geometry</H3>
      <Table
        head={["Problem", "Technique"]}
        rows={[
          ["Max points on a line", "For each point, count normalized slopes (dy/g, dx/g with sign fixed) in a hash map"],
          ["Rectangle overlap / area", "Overlap width = max(0, min(right) − max(left)); same for height"],
          ["K closest points to origin", "Compare squared distances (no sqrt) with a heap or quickselect"],
          ["Is a polygon convex?", "All consecutive cross products have the same sign"],
          ["Closest pair of points", "Divide and conquer, O(n log n)"],
          ["Sweep line", "Sort events by x and maintain an active set: rectangle union area, segment intersections"],
          ["Haversine distance", "Great-circle distance on Earth for lat/lng (ride sharing, maps)"],
        ]}
      />
      <Callout type="warning" title="Precision">
        Prefer integer arithmetic (cross products, squared distances). If you must use floats, compare with an epsilon (
        |a − b| &lt; 1e−9) and never use floating slopes as hash keys; use reduced integer fractions instead.
      </Callout>

      <QA
        items={[
          { q: "How do you check if three points are collinear without division?", level: "Easy", a: <p>cross(A, B, C) == 0: (B − A) × (C − A) equals zero exactly when the triangle has zero area.</p> },
          { q: "Max Points on a Line: how do you key slopes safely?", level: "Medium", a: <p>For each anchor point, compute dx, dy to every other point, divide both by gcd(|dx|, |dy|), and normalize the sign (e.g. make dx positive, or dy positive when dx = 0). Use the (dx, dy) pair as the key; count duplicates of the anchor separately.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "cross(A, B, C) > 0 means…", options: ["Clockwise turn", "Counter-clockwise turn", "Collinear", "A is the origin"], answer: 1, explain: "C is to the left of the directed line AB." },
          { q: "The shoelace formula computes…", options: ["Perimeter", "Polygon area", "Convex hull", "Centroid only"], answer: 1, explain: "Half the absolute sum of cross products of consecutive vertices." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Rectangle Overlap", level: "Easy", lc: "rectangle-overlap", pattern: "Interval overlap per axis", idea: "Positive overlap in both x and y.", complexity: "O(1)" },
          { title: "Valid Boomerang", level: "Easy", lc: "valid-boomerang", pattern: "Cross product", idea: "Non-zero cross product.", complexity: "O(1)" },
          { title: "K Closest Points to Origin", level: "Medium", lc: "k-closest-points-to-origin", pattern: "Squared distance + heap", idea: "No sqrt needed.", complexity: "O(n log k)" },
          { title: "Rectangle Area", level: "Medium", lc: "rectangle-area", pattern: "Inclusion–exclusion", idea: "Sum of areas − overlap.", complexity: "O(1)" },
          { title: "Max Points on a Line", level: "Hard", lc: "max-points-on-a-line", pattern: "Normalized slope map", idea: "gcd-reduced (dx, dy).", complexity: "O(n²)" },
          { title: "Erect the Fence", level: "Hard", lc: "erect-the-fence", pattern: "Convex hull (keep collinear)", idea: "Monotone chain with < 0 popping.", complexity: "O(n log n)" },
          { title: "Rectangle Area II", level: "Hard", lc: "rectangle-area-ii", pattern: "Sweep line", idea: "Events by x, covered y-length.", complexity: "O(n² log n)" },
        ]}
      />
    </>
  );
}
