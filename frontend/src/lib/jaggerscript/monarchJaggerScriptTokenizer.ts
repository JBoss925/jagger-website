export const monarchJaggerScriptTokenizer = {
  defaultToken: "invalid",
  tokenPostfix: ".j",

  keywords: [
    "break",
    "class",
    "constructor",
    "else",
    "extends",
    "false",
    "for",
    "func",
    "if",
    "elif",
    "instanceof",
    "new",
    "null",
    "return",
    "super",
    "true",
    "undefined",
    "while"
  ],

  typeKeywords: ["boolean", "number", "string", "undefined"],

  operators: ["<=", ">=", "==", "!=", "=>", "+", "-", "*", "/", "%", "="],

  console: ["console"],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,

  tokenizer: {
    root: [[/[{}]/, "delimiter.bracket"], { include: "common" }],

    common: [
      [
        /(([a-zA-Z_$])+)(?=[\(])/,
        {
          cases: {
            "@typeKeywords": "keyword",
            "@keywords": "keyword",
            "@console": "console",
            "@default": "funcName"
          }
        }
      ],
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@typeKeywords": "keyword",
            "@keywords": "keyword",
            "@console": "console",
            "@default": "identifier"
          }
        }
      ],
      [/[A-Z][\w$]*/, "type.identifier"],
      { include: "@whitespace" },
      [/[()\[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [
        /@symbols/,
        {
          cases: {
            "@operators": "operator",
            "@default": ""
          }
        }
      ],
      [/(@digits)[eE]([\-+]?(@digits))?/, "number.float"],
      [/(@digits)/, "number"],
      [/[;,.]/, "delimiter"],
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      [/"/, "string.invalid"],
      [/'/, "string", "@string_single"]
    ],

    whitespace: [
      [/[ \t\r\n]+/, ""],
      [/\/\*/, "comment", "@comment"],
      [/\/\/.*$/, "comment"]
    ],

    comment: [
      [/[^\/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[\/*]/, "comment"]
    ],

    string_single: [
      [/[^\\']+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/'/, "string", "@pop"]
    ],

    bracketCounting: [
      [/\{/, "delimiter.bracket", "@bracketCounting"],
      [/\}/, "delimiter.bracket", "@pop"],
      { include: "common" }
    ]
  }
};
