// This function doesn't sort instantly.
// It RECORDS every step so we can animate them later.

export function generateBubbleSortSteps(array) {
  const arr = [...array]
  const steps = []

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {

      // Record: we are COMPARING these two indices
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => arr.length - 1 - k),
        currentLine: 2  // pseudocode line
      })

      if (arr[j] > arr[j + 1]) {
        // Swap
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]

        // Record: we are SWAPPING these two indices
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => arr.length - 1 - k),
          currentLine: 3
        })
      }
    }
  }

  // Final step — everything sorted
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, k) => k),
    currentLine: -1
  })

  return steps
}