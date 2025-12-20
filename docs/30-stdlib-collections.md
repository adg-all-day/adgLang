# Standard Library: Collections

The adgLang standard library includes a set of common data structures for working with collections of data.

## Array<T>

This is a dynamic array that grows automatically.

```adgLang
import [Array] from "std/array.adg";

local arr: Array<int> = Array<int>.new(10);
arr.push(1);
arr.push(2);
local val: int = arr.get(0);
arr.destroy();
```

## Map<K, V>

A key-value store (associative array). Right now it is implemented as a list of pairs, so lookup is `O(n)`.

```adgLang
import [Map] from "std/map.adg";

local m: Map<string, int> = Map<string, int>.new(16);
m.set("age", 30);
if (m.has("age")) {
    local age: int = m.get("age").unwrap();
}
m.destroy();
```

## Set<T>

A collection that keeps only unique values.

```adgLang
import [Set] from "std/set.adg";

local s: Set<int> = Set<int>.new(16);
s.add(10);
s.add(20);
if (s.has(10)) {
    # ...
}
s.destroy();
```

## Stack<T>

A Last-In-First-Out (LIFO) data structure.

```adgLang
import [Stack] from "std/stack.adg";

local s: Stack<int> = Stack<int>.new(10);
s.push(1);
s.push(2);
local top: int = s.pop().unwrap(); # 2
s.destroy();
```

## Queue<T>

A First-In-First-Out (FIFO) data structure. It uses a circular buffer for efficiency.

```adgLang
import [Queue] from "std/queue.adg";

local q: Queue<int> = Queue<int>.new(10);
q.enqueue(1);
q.enqueue(2);
local first: int = q.dequeue().unwrap(); # 1
q.destroy();
```

## LinkedList<T>

A doubly linked list.

```adgLang
import [LinkedList] from "std/linked_list.adg";

local list: LinkedList<int> = LinkedList<int>.new();
list.pushBack(10);
list.pushFront(5);
local val: int = list.popBack().unwrap(); # 10
list.destroy();
```

## PriorityQueue<T>

A Min-Heap where the smallest element comes out first.

```adgLang
import [PriorityQueue] from "std/priority_queue.adg";

local pq: PriorityQueue<int> = PriorityQueue<int>.new(10);
pq.push(30);
pq.push(10);
pq.push(20);
local min: int = pq.pop().unwrap(); # 10
pq.destroy();
```
