// Merge Sort step generator
// Each step has: { array, phase, left, mid, right, comparing, merging, sorted, currentLine, depth }
// phase: 'split' | 'merge' | 'place' | 'done'

export function generateMergeSortSteps(inputArray) {
  const arr   = [...inputArray]
  const steps = []
  const n     = arr.length

  function addStep(phase, left, mid, right, comparing, merging, sorted, line, depth) {
    steps.push({
      array:     [...arr],
      phase,
      left,
      mid,
      right,
      comparing: comparing ?? [],
      merging:   merging   ?? [],
      sorted:    sorted    ?? [],
      currentLine: line,
      depth,
    })
  }

  const sortedSet = new Set()

  function mergeSort(l, r, depth) {
    if (l >= r) {
      sortedSet.add(l)
      addStep('single', l, l, r, [], [l], [...sortedSet], 1, depth)
      return
    }

    const mid = Math.floor((l + r) / 2)

    // show the split
    addStep('split', l, mid, r, [], [], [...sortedSet], 2, depth)

    mergeSort(l, mid, depth + 1)
    mergeSort(mid + 1, r, depth + 1)

    // merge phase
    merge(l, mid, r, depth)
  }

  function merge(l, mid, r, depth) {
    const left  = arr.slice(l, mid + 1)
    const right = arr.slice(mid + 1, r + 1)
    let i = 0, j = 0, k = l

    while (i < left.length && j < right.length) {
      // comparing
      addStep('compare', l, mid, r,
        [l + i, mid + 1 + j], [],
        [...sortedSet], 6, depth)

      if (left[i] <= right[j]) {
        arr[k] = left[i++]
      } else {
        arr[k] = right[j++]
      }
      // place
      addStep('place', l, mid, r,
        [], [k],
        [...sortedSet], 7, depth)
      k++
    }

    while (i < left.length) {
      arr[k] = left[i++]
      addStep('place', l, mid, r, [], [k], [...sortedSet], 8, depth)
      k++
    }
    while (j < right.length) {
      arr[k] = right[j++]
      addStep('place', l, mid, r, [], [k], [...sortedSet], 8, depth)
      k++
    }

    // mark range as sorted
    for (let x = l; x <= r; x++) sortedSet.add(x)
    addStep('merged', l, mid, r, [], [], [...sortedSet], 9, depth)
  }

  mergeSort(0, n - 1, 0)

  // final done step
  addStep('done', 0, Math.floor(n / 2), n - 1, [], [], [...Array(n).keys()], 10, 0)

  return steps
}