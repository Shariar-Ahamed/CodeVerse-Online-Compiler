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
      python: "# Python 3 Starter Code\nimport sys\n\ndef fizzBuzz(n):\n    # Write your code here to print numbers from 1 to n\n    pass\n\nfor line in sys.stdin:\n    if not line.strip():\n        continue\n    n = int(line.strip())\n    fizzBuzz(n)\n",
      cpp: "// C++ Starter Code\n#include <iostream>\nusing namespace std; \n\nvoid fizzBuzz(int n) {\n    // Write your code here to print numbers from 1 to n\n    \n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        fizzBuzz(n);\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\n\nfunction fizzBuzz(n) {\n    // Write your code here to print numbers from 1 to n\n    \n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = parseInt(input, 10);\n    fizzBuzz(n);\n}\n",
      java: "// Java Starter Code\nimport java.util.Scanner;\n\npublic class Main {\n    public static void fizzBuzz(int n) {\n        // Write your code here to print numbers from 1 to n\n        \n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            fizzBuzz(n);\n        }\n    }\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\ndef isPalindrome(s):\n    # Write your code here. Return \"true\" or \"false\"\n    return \"false\"\n\nfor line in sys.stdin:\n    s = line.strip()\n    if not s:\n        continue\n    print(isPalindrome(s))\n",
      cpp: "// C++ Starter Code\n#include <iostream>\n#include <string>\nusing namespace std;\n\nstring isPalindrome(string s) {\n    // Write your code here. Return \"true\" or \"false\"\n    return \"false\";\n}\n\nint main() {\n    string s, temp = \"\";\n    while (cin >> s) {\n        temp += s;\n    }\n    cout << isPalindrome(temp) << endl;\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\n\nfunction isPalindrome(s) {\n    // Write your code here. Return \"true\" or \"false\"\n    return \"false\";\n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    console.log(isPalindrome(input));\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\ndef fib(n):\n    # Write your code here. Return the N-th Fibonacci number\n    return 0\n\nfor line in sys.stdin:\n    if not line.strip(): continue\n    print(fib(int(line.strip())))\n",
      cpp: "// C++ Starter Code\n#include <iostream>\nusing namespace std;\n\nlong long fib(int n) {\n    // Write your code here. Return the N-th Fibonacci number\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << fib(n) << endl;\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\n\nfunction fib(n) {\n    // Write your code here. Return the N-th Fibonacci number\n    return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    console.log(fib(parseInt(input, 10)));\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\ndef getSum(n, arr):\n    # Write your code here. Return the sum of the array\n    return 0\n\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    n = int(lines[0])\n    arr = list(map(int, lines[1].split()))\n    print(getSum(n, arr))\n",
      cpp: "// C++ Starter Code\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long getSum(int n, vector<int>& arr) {\n    // Write your code here. Return the sum of the array\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) {\n            cin >> arr[i];\n        }\n        cout << getSum(n, arr) << endl;\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\n\nfunction getSum(n, arr) {\n    // Write your code here. Return the sum of the array\n    return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const n = parseInt(input[0], 10);\n    const arr = input[1].split(/\\s+/).map(Number);\n    console.log(getSum(n, arr));\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\ndef factorial(n):\n    # Write your code here. Return N!\n    return 1\n\nfor line in sys.stdin:\n    if not line.strip(): continue\n    print(factorial(int(line.strip())))\n",
      cpp: "// C++ Starter Code\n#include <iostream>\nusing namespace std;\n\nlong long factorial(int n) {\n    // Write your code here. Return N!\n    return 1;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << factorial(n) << endl;\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\n\nfunction factorial(n) {\n    // Write your code here. Return N!\n    return 1;\n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    console.log(factorial(parseInt(input, 10)));\n}\n"
    }
  }
];
