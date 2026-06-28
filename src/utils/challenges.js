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
      python: "# Python 3 Starter Code\nimport sys\n\nfor line in sys.stdin:\n    if not line.strip():\n        continue\n    n = int(line.strip())\n    for i in range(1, n + 1):\n        if i % 3 == 0 and i % 5 == 0:\n            print('FizzBuzz')\n        elif i % 3 == 0:\n            print('Fizz')\n        elif i % 5 == 0:\n            print('Buzz')\n        else:\n            print(i)\n",
      cpp: "// C++ Starter Code\n#include <iostream>\nusing namespace std; \n\nint main() {\n    int n;\n    if (cin >> n) {\n        for (int i = 1; i <= n; i++) {\n            if (i % 3 == 0 && i % 5 == 0) {\n                cout << \"FizzBuzz\" << endl;\n            } else if (i % 3 == 0) {\n                cout << \"Fizz\" << endl;\n            } else if (i % 5 == 0) {\n                cout << \"Buzz\" << endl;\n            } else {\n                cout << i << endl;\n            }\n        }\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = parseInt(input, 10);\n    for (let i = 1; i <= n; i++) {\n        if (i % 3 === 0 && i % 5 === 0) {\n            console.log('FizzBuzz');\n        } else if (i % 3 === 0) {\n            console.log('Fizz');\n        } else if (i % 5 === 0) {\n            console.log('Buzz');\n        } else {\n            console.log(i);\n        }\n    }\n}\n",
      java: "// Java Starter Code\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            for (int i = 1; i <= n; i++) {\n                if (i % 3 == 0 && i % 5 == 0) {\n                    System.out.println(\"FizzBuzz\");\n                } else if (i % 3 == 0) {\n                    System.out.println(\"Fizz\");\n                } else if (i % 5 == 0) {\n                    System.out.println(\"Buzz\");\n                } else {\n                    System.out.println(i);\n                }\n            }\n        }\n    }\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\nfor line in sys.stdin:\n    s = line.strip().replace(' ', '').lower()\n    if not s:\n        continue\n    is_palindrome = s == s[::-1]\n    print('true' if is_palindrome else 'false')\n",
      cpp: "// C++ Starter Code\n#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s, temp = \"\";\n    while (cin >> s) {\n        temp += s;\n    }\n    string cleaned = \"\";\n    for (char c : temp) {\n        cleaned += tolower(c);\n    }\n    string reversed = cleaned;\n    reverse(reversed.begin(), reversed.end());\n    if (cleaned == reversed) {\n        cout << \"true\" << endl;\n    } else {\n        cout << \"false\" << endl;\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const cleaned = input.replace(/\\s+/g, '').toLowerCase();\n    const reversed = cleaned.split('').reverse().join('');\n    console.log(cleaned === reversed ? 'true' : 'false');\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\ndef fib(n):\n    if n <= 0: return 0\n    if n == 1: return 1\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\nfor line in sys.stdin:\n    if not line.strip(): continue\n    print(fib(int(line.strip())))\n",
      cpp: "// C++ Starter Code\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        if (n <= 0) {\n            cout << 0 << endl;\n        } else if (n == 1) {\n            cout << 1 << endl;\n        } else {\n            long long a = 0, b = 1, temp;\n            for (int i = 2; i <= n; i++) {\n                temp = a + b;\n                a = b;\n                b = temp;\n            }\n            cout << b << endl;\n        }\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = parseInt(input, 10);\n    if (n <= 0) {\n        console.log(0);\n    } else if (n === 1) {\n        console.log(1);\n    } else {\n        let a = 0, b = 1;\n        for (let i = 2; i <= n; i++) {\n            let temp = a + b;\n            a = b;\n            b = temp;\n        }\n        console.log(b);\n    }\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    n = int(lines[0])\n    arr = list(map(int, lines[1].split()))\n    print(sum(arr))\n",
      cpp: "// C++ Starter Code\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        long long sum = 0;\n        for (int i = 0; i < n; i++) {\n            int x;\n            cin >> x;\n            sum += x;\n        }\n        cout << sum << endl;\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const arr = input[1].split(/\\s+/).map(Number);\n    const sum = arr.reduce((acc, x) => acc + x, 0);\n    console.log(sum);\n}\n"
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
      python: "# Python 3 Starter Code\nimport sys\n\ndef fact(n):\n    if n <= 1: return 1\n    res = 1\n    for i in range(2, n + 1):\n        res *= i\n    return res\n\nfor line in sys.stdin:\n    if not line.strip(): continue\n    print(fact(int(line.strip())))\n",
      cpp: "// C++ Starter Code\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        long long res = 1;\n        for (int i = 2; i <= n; i++) {\n            res *= i;\n        }\n        cout << res << endl;\n    }\n    return 0;\n}\n",
      javascript: "// Node.js Starter Code\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = parseInt(input, 10);\n    let res = 1;\n    for (let i = 2; i <= n; i++) {\n        res *= i;\n    }\n    console.log(res);\n}\n"
    }
  }
];
