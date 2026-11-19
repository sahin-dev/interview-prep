import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { MonotonicStackViz } from "@/components/viz/lazy";

export default function MonotonicStack() {
  return (
    <>
      <Lead>
        A <strong>monotonic stack</strong> keeps its elements in increasing or decreasing order by popping everything
        that would break the order before each push. Every element is pushed and popped at most once, so problems
        that look like O(n²) (&ldquo;for each element, find the next larger one&rdquo;) become O(n). Its cousin, the{" "}
        <strong>monotonic deque</strong>, answers sliding-window maximums in O(n).
      </Lead>

      <H2>When to reach for it</H2>
      <Table
        head={["Signal in the problem", "Stack type"]}
        rows={[
          ["Next / previous greater element", "Decreasing stack (pop smaller ones)"],
          ["Next / previous smaller element", "Increasing stack (pop larger ones)"],
          ["How many days until a warmer temperature", "Decreasing stack of indices"],
          ["Largest rectangle, area bounded by the smallest bar", "Increasing stack"],
          ["Remove k digits to make the smallest number", "Increasing stack, greedy"],
          ["Maximum / minimum of every window of size k", "Monotonic deque"],
        ]}
      />

      <H2>Next greater element</H2>
      <MonotonicStackViz />
      <P>
        Indices wait on the stack until a bigger value arrives. When it does, it is the answer for every smaller waiting
        index it pops. What stays on the stack is always decreasing.
      </P>
      <Code
        python={String.raw`
def next_greater(nums):
    res = [-1] * len(nums)
    stack = []                                  # indices with decreasing values
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        stack.append(i)
    return res

def daily_temperatures(t):
    res, stack = [0] * len(t), []
    for i, x in enumerate(t):
        while stack and t[stack[-1]] < x:
            j = stack.pop()
            res[j] = i - j                      # distance instead of value
        stack.append(i)
    return res

def next_greater_circular(nums):                # loop twice to wrap around
    n, res, stack = len(nums), [-1] * len(nums), []
    for i in range(2 * n):
        x = nums[i % n]
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        if i < n:
            stack.append(i)
    return res
`}
        java={String.raw`
int[] nextGreater(int[] nums) {
    int n = nums.length;
    int[] res = new int[n];
    Arrays.fill(res, -1);
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) res[stack.pop()] = nums[i];
        stack.push(i);
    }
    return res;
}
`}
      />
      <Callout type="key" title="Why O(n)?">
        The while loop looks nested, but each index is pushed once and popped at most once over the whole run: at most 2n
        stack operations in total (amortized analysis).
      </Callout>

      <H2>Largest rectangle in a histogram</H2>
      <P>
        For each bar, the widest rectangle using it as the shortest bar extends to the previous and next smaller bars.
        An increasing stack finds both: when a shorter bar arrives, each popped bar&apos;s right boundary is the current
        index and its left boundary is the new top of the stack.
      </P>
      <Code
        python={String.raw`
def largest_rectangle(heights):
    stack, best = [], 0                         # indices with increasing heights
    for i, h in enumerate(heights + [0]):       # sentinel 0 flushes the stack at the end
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1   # previous smaller bar
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best

def maximal_rectangle(matrix):                  # binary matrix → histogram per row
    if not matrix: return 0
    heights, best = [0] * len(matrix[0]), 0
    for row in matrix:
        for j, v in enumerate(row):
            heights[j] = heights[j] + 1 if v == "1" else 0
        best = max(best, largest_rectangle(heights))
    return best
`}
      />

      <H2>Trapping rain water (stack version)</H2>
      <Code
        python={String.raw`
def trap(height):
    stack, water = [], 0
    for i, h in enumerate(height):
        while stack and height[stack[-1]] < h:
            bottom = stack.pop()
            if not stack:
                break                           # no left wall
            left = stack[-1]
            width = i - left - 1
            water += width * (min(height[left], h) - height[bottom])
        stack.append(i)
    return water
`}
      />
      <P>(The two-pointer version uses O(1) space; the stack version fills water layer by layer.)</P>

      <H2>Monotonic deque: sliding window maximum</H2>
      <P>
        Keep indices in a deque with decreasing values. Before pushing i, pop smaller values from the back (they can
        never be a maximum again while i is in the window). Pop the front if it has left the window. The front is
        always the window maximum.
      </P>
      <Code
        python={String.raw`
from collections import deque

def max_sliding_window(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()                        # out of the window
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out
`}
      />

      <H3>Greedy with an increasing stack: remove k digits</H3>
      <Code
        python={String.raw`
def remove_k_digits(num, k):
    stack = []
    for d in num:
        while k and stack and stack[-1] > d:    # a smaller digit earlier is always better
            stack.pop()
            k -= 1
        stack.append(d)
    stack = stack[:len(stack) - k] if k else stack
    return "".join(stack).lstrip("0") or "0"
`}
      />

      <H3>Sum of subarray minimums (contribution technique)</H3>
      <P>
        For each element, count the subarrays in which it is the minimum: (distance to previous smaller) × (distance to
        next smaller-or-equal). Multiply by the value and sum. Two monotonic passes give O(n). Using strict on one side
        and non-strict on the other avoids double counting equal values.
      </P>

      <QA
        items={[
          { q: "Should the stack hold values or indices?", level: "Easy", a: <p>Usually indices: you can always look up the value, and you often need distances (days until warmer, rectangle width).</p> },
          { q: "How do you decide between an increasing and a decreasing stack?", level: "Medium", a: <p>Think about what should pop an element: if you&apos;re looking for the next greater element, a greater arrival pops smaller elements, so the stack stays decreasing. For next smaller, it stays increasing.</p> },
          { q: "What changes for 'previous greater' instead of 'next greater'?", level: "Medium", a: <p>After popping smaller elements, the top of the stack (if any) is the previous greater element of the current index. Record it before pushing. Or scan right to left with the next-greater logic.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Total stack operations for next-greater over n elements?", options: ["O(n²)", "O(n log n)", "At most 2n: O(n)", "O(1)"], answer: 2, explain: "Each index is pushed once and popped at most once." },
          { q: "Sliding window maximum uses a deque whose values are…", options: ["Increasing", "Decreasing from front to back", "Random", "Sorted by index only"], answer: 1, explain: "The front is the current maximum." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["daily-temperatures", "next-greater-element", "largest-rectangle"]} />
      <Problems
        items={[
          { title: "Next Greater Element I", level: "Easy", lc: "next-greater-element-i", pattern: "Decreasing stack + map", idea: "Compute next greater for nums2, map value → answer.", complexity: "O(n + m)" },
          { title: "Daily Temperatures", level: "Medium", lc: "daily-temperatures", pattern: "Decreasing stack", idea: "Pop cooler days when a warmer day arrives; store distances.", complexity: "O(n)" },
          { title: "Next Greater Element II", level: "Medium", lc: "next-greater-element-ii", pattern: "Circular: iterate 2n", idea: "Only push during the first pass.", complexity: "O(n)" },
          { title: "Online Stock Span", level: "Medium", lc: "online-stock-span", pattern: "Stack of (price, span)", idea: "Pop smaller-or-equal prices and add their spans.", complexity: "O(1) amortized" },
          { title: "Remove K Digits", level: "Medium", lc: "remove-k-digits", pattern: "Increasing stack greedy", idea: "Pop larger previous digits while k > 0.", complexity: "O(n)" },
          { title: "Sum of Subarray Minimums", level: "Medium", lc: "sum-of-subarray-minimums", pattern: "Contribution", idea: "left distance × right distance × value.", complexity: "O(n)" },
          { title: "132 Pattern", level: "Medium", lc: "132-pattern", pattern: "Decreasing stack from the right", idea: "Track the best 'middle-low' value popped so far.", complexity: "O(n)" },
          { title: "Largest Rectangle in Histogram", level: "Hard", lc: "largest-rectangle-in-histogram", pattern: "Increasing stack", idea: "Pop taller bars; width = i − new top − 1.", complexity: "O(n)" },
          { title: "Maximal Rectangle", level: "Hard", lc: "maximal-rectangle", pattern: "Histogram per row", idea: "Accumulate heights row by row; run the histogram algorithm.", complexity: "O(R·C)" },
          { title: "Trapping Rain Water", level: "Hard", lc: "trapping-rain-water", pattern: "Stack or two pointers", idea: "Fill bounded layers when a taller bar arrives.", complexity: "O(n)" },
          { title: "Sliding Window Maximum", level: "Hard", lc: "sliding-window-maximum", pattern: "Monotonic deque", idea: "Front holds the max; drop expired and smaller indices.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
