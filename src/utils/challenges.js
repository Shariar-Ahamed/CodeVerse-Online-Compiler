export const INITIAL_CHALLENGES = [
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    description: "Read a number N from standard input. Print numbers from 1 to N line by line. But for multiples of three, print 'Fizz' instead of the number, and for the multiples of five, print 'Buzz'. For numbers which are multiples of both three and five, print 'FizzBuzz'.",
    difficulty: "Easy",
    points: 50,
    testCases: [
      { input: "5", output: "1\n2\nFizz\n4\nBuzz", isHidden: false },
      { input: "15", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", isHidden: true },
      { input: "3", output: "1\n2\nFizz", isHidden: true }
    ],
    starterCode: {
      python: "# Python 3 Starter Code\n# Write your code here\n",
      cpp: "// C++ Starter Code\n// Write your code here\n",
      javascript: "// Node.js Starter Code\n// Write your code here\n",
      java: "// Java Starter Code\n// Write your code here\n"
    }
  },
  {
    id: "palindrome",
    title: "Palindrome Check",
    description: "Read a string from standard input. Print 'true' if the string is a palindrome (reads the same backward as forward, case-insensitive and ignoring spaces), otherwise print 'false'.",
    difficulty: "Easy",
    points: 70,
    testCases: [
      { input: "racecar", output: "true", isHidden: false },
      { input: "Hello", output: "false", isHidden: true },
      { input: "a man a plan a canal panama", output: "true", isHidden: true }
    ],
    starterCode: {
      python: "# Python 3 Starter Code\n# Write your code here\n",
      cpp: "// C++ Starter Code\n// Write your code here\n",
      javascript: "// Node.js Starter Code\n// Write your code here\n",
      java: "// Java Starter Code\n// Write your code here\n"
    }
  },
  {
    id: "fibonacci",
    title: "Fibonacci Number",
    description: "Read an integer N from standard input. Print the N-th Fibonacci number, where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1.",
    difficulty: "Easy",
    points: 80,
    testCases: [
      { input: "4", output: "3", isHidden: false },
      { input: "9", output: "34", isHidden: true },
      { input: "0", output: "0", isHidden: true }
    ],
    starterCode: {
      python: "# Python 3 Starter Code\n# Write your code here\n",
      cpp: "// C++ Starter Code\n// Write your code here\n",
      javascript: "// Node.js Starter Code\n// Write your code here\n",
      java: "// Java Starter Code\n// Write your code here\n"
    }
  },
  {
    id: "arraysum",
    title: "Sum of Array",
    description: "Read the input representing a list of numbers. The first line of input is the number of elements N. The second line contains N space-separated integers. Print the sum of these integers.",
    difficulty: "Easy",
    points: 60,
    testCases: [
      { input: "4\n1 2 3 4", output: "10", isHidden: false },
      { input: "5\n10 -2 3 0 5", output: "16", isHidden: true },
      { input: "1\n42", output: "42", isHidden: true }
    ],
    starterCode: {
      python: "# Python 3 Starter Code\n# Write your code here\n",
      cpp: "// C++ Starter Code\n// Write your code here\n",
      javascript: "// Node.js Starter Code\n// Write your code here\n",
      java: "// Java Starter Code\n// Write your code here\n"
    }
  },
  {
    id: "factorial",
    title: "Factorial",
    description: "Read an integer N from standard input. Print the factorial of N (N! = N * (N-1) * ... * 1). Note that 0! = 1.",
    difficulty: "Easy",
    points: 50,
    testCases: [
      { input: "5", output: "120", isHidden: false },
      { input: "3", output: "6", isHidden: true },
      { input: "0", output: "1", isHidden: true }
    ],
    starterCode: {
      python: "# Python 3 Starter Code\n# Write your code here\n",
      cpp: "// C++ Starter Code\n// Write your code here\n",
      javascript: "// Node.js Starter Code\n// Write your code here\n",
      java: "// Java Starter Code\n// Write your code here\n"
    }
  }
];
