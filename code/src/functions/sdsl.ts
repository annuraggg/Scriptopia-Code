import { LanguageGenerator, TypeMap } from "@shared-types/Sdsl";

const typeMap: TypeMap = {
  integer: {
    python: "int",
    javascript: "number",
    java: "int",
    cpp: "int",
    csharp: "int",
    php: "int",
    r: "integer",
    typescript: "number",
    swift: "Int",
    go: "int",
  },
  float: {
    python: "float",
    javascript: "number",
    java: "float",
    cpp: "float",
    csharp: "float",
    php: "float",
    r: "numeric",
    typescript: "number",
    swift: "Float",
    go: "float32",
  },
  double: {
    python: "float",
    javascript: "number",
    java: "double",
    cpp: "double",
    csharp: "double",
    php: "float",
    r: "numeric",
    typescript: "number",
    swift: "Double",
    go: "float64",
  },
  string: {
    python: "str",
    javascript: "string",
    java: "String",
    cpp: "std::string",
    csharp: "string",
    php: "string",
    r: "character",
    typescript: "string",
    swift: "String",
    go: "string",
  },
  boolean: {
    python: "bool",
    javascript: "boolean",
    java: "boolean",
    cpp: "bool",
    csharp: "bool",
    php: "bool",
    r: "logical",
    typescript: "boolean",
    swift: "Bool",
    go: "bool",
  },
  char: {
    python: "str",
    javascript: "string",
    java: "char",
    cpp: "char",
    csharp: "char",
    php: "string",
    r: "character",
    typescript: "string",
    swift: "Character",
    go: "rune",
  },
  long: {
    python: "int",
    javascript: "BigInt",
    java: "long",
    cpp: "long long",
    csharp: "long",
    php: "int",
    r: "integer",
    typescript: "bigint",
    swift: "Int64",
    go: "int64",
  },
  array: {
    python: "List",
    javascript: "Array",
    java: "ArrayList",
    cpp: "std::vector",
    csharp: "List",
    php: "array",
    r: "vector",
    typescript: "Array",
    swift: "Array",
    go: "slice",
  },
  map: {
    python: "Dict",
    javascript: "Object",
    java: "HashMap",
    cpp: "std::unordered_map",
    csharp: "Dictionary",
    php: "array",
    r: "list",
    typescript: "Record",
    swift: "Dictionary",
    go: "map",
  },
  set: {
    python: "Set",
    javascript: "Set",
    java: "HashSet",
    cpp: "std::unordered_set",
    csharp: "HashSet",
    php: "array",
    r: "set",
    typescript: "Set",
    swift: "Set",
    go: "map[Type]bool",
  },
  integerArray: {
    python: "List[int]",
    javascript: "number[]",
    java: "int[]",
    cpp: "vector<int>",
    csharp: "int[]",
    php: "array",
    r: "integer[]",
    typescript: "number[]",
    swift: "[Int]",
    go: "[]int",
  },
  floatArray: {
    python: "List[float]",
    javascript: "number[]",
    java: "float[]",
    cpp: "vector<float>",
    csharp: "float[]",
    php: "array",
    r: "numeric[]",
    typescript: "number[]",
    swift: "[Float]",
    go: "[]float32",
  },
  stringArray: {
    python: "List[str]",
    javascript: "string[]",
    java: "String[]",
    cpp: "vector<string>",
    csharp: "string[]",
    php: "array",
    r: "character[]",
    typescript: "string[]",
    swift: "[String]",
    go: "[]string",
  },
};

type SupportedLanguages = "python" | "javascript" | "java";

export interface ParsedSdsl {
  inputs: SdslInput[];
  returnType: string;
}

export interface GeneratorResult {
  success: boolean;
  code: string | null;
  error: string | null;
  language?: string;
  metadata?: {
    inputCount: number;
    hasArrayInputs: boolean;
    returnType: string;
    timestamp: number;
    generatedAt?: number;
  };
}

export type PrimitiveType =
  | "integer"
  | "float"
  | "double"
  | "string"
  | "boolean"
  | "char"
  | "long";

// Collection types supported by sdsl
export type CollectionType = "array" | "map" | "set";

export type BaseType = PrimitiveType | CollectionType;

export interface TypeConstraints {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowNull?: boolean;
  allowEmpty?: boolean;
  customValidation?: string;
}

export interface SdslInput {
  type: BaseType;
  name: string;
  elementType: string;
  size: number | null;
  dimensions?: number;
  constraints?: TypeConstraints;
  isOptional?: boolean;
  defaultValue?: any;
}

export interface ParsedSdsl {
  inputs: SdslInput[];
  returnType: string;
  returnArrayType: ArrayType | null;
  typeConstraints?: Record<string, TypeConstraints>;
  metadata?: {
    complexity?: string;
    memoryLimit?: number;
    timeLimit?: number;
    tags?: string[];
  };
}
export interface ParseResult {
  success: boolean;
  error: string | null;
  data: ParsedSdsl | null;
  metadata?: {
    inputCount: number;
    hasArrayInputs: boolean;
    returnType: string;
    isArrayReturn: boolean;
    timestamp: number;
    complexity?: string;
    memoryUsage?: string;
  };
  warnings?: string[];
}
interface ArrayType {
  baseType: string;
  dimensions: number;
}

function parseArrayType(type: string): ArrayType | null {
  const match = type.match(/^array<(.+)>$/);
  if (!match) return null;

  const baseType = match[1];
  const dimensions = (type.match(/\[\]/g) || []).length + 1;

  return { baseType, dimensions };
}

function parseSdsl(sdslCode: string): ParseResult {
  try {
    const lines = sdslCode
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const inputs: SdslInput[] = [];
    let returnType: string | null = null;
    let returnArrayType: ArrayType | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [type, ...rest] = line.split("->").map((part) => part.trim());

      if (!type || rest.length === 0) {
        return {
          success: false,
          error: `Invalid SDSL syntax at line ${i + 1}: ${line}`,
          data: null,
        };
      }

      const restLine = rest.join("->").trim(); // Join back for further processing

      if (restLine === "return") {
        if (returnType !== null) {
          return {
            success: false,
            error: `Multiple return types defined at line ${i + 1}`,
            data: null,
          };
        }

        // Handle array return types
        const arrayTypeInfo = parseArrayType(type);
        if (arrayTypeInfo) {
          returnArrayType = arrayTypeInfo;
          returnType = `${arrayTypeInfo.baseType}Array`;
        } else {
          returnType = type;
        }
      } else if (type.startsWith("array<")) {
        // Enhanced array syntax: array<integer> nums 5
        const arrayTypeInfo = parseArrayType(type);
        if (!arrayTypeInfo) {
          return {
            success: false,
            error: `Invalid array type at line ${i + 1}: ${line}`,
            data: null,
          };
        }

        const [name, size] = restLine.split(" ");
        inputs.push({
          type: "array",
          elementType: arrayTypeInfo.baseType,
          name,
          size: size ? parseInt(size) : null,
          dimensions: arrayTypeInfo.dimensions,
        });
      } else if (type === "map" || type === "set") {
        const [elementType, name] = restLine.split(" ");
        if (!elementType || !name) {
          return {
            success: false,
            error: `Invalid ${type} declaration at line ${i + 1}: ${line}`,
            data: null,
          };
        }
        inputs.push({
          type,
          elementType,
          name,
          size: null,
        });
      } else {
        const name = restLine;
        if (!Object.keys(typeMap).includes(type.trim())) {
          return {
            success: false,
            error: `Unknown type "${type}" at line ${i + 1}`,
            data: null,
          };
        }
        inputs.push({
          type: type as BaseType,
          name,
          elementType: "",
          size: null,
        });
      }
    }

    if (returnType === null) {
      return {
        success: false,
        error: "No return type specified in SDSL",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: {
        inputs,
        returnType,
        returnArrayType,
      },
      metadata: {
        inputCount: inputs.length,
        hasArrayInputs: inputs.some((input) => input.type === "array"),
        returnType,
        isArrayReturn: returnArrayType !== null,
        timestamp: Date.now(),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Unexpected error while parsing SDSL: ${error.message}`,
      data: null,
    };
  }
}

function generateCode(
  sdslCode: string,
  language: SupportedLanguages
): GeneratorResult {
  try {
    // First parse the sdsl
    const parseResult = parseSdsl(sdslCode);
    if (!parseResult.success || !parseResult.data) {
      return {
        success: false,
        code: null,
        error: parseResult.error,
        metadata: parseResult.metadata,
      };
    }

    const generators: Record<SupportedLanguages, LanguageGenerator> = {
      // @ts-expect-error - TS doesn't like the type of generators
      python: generatePython, // @ts-expect-error - TS doesn't like the type of generators
      javascript: generateJavaScript, // @ts-expect-error - TS doesn't like the type of generators
      java: generateJava,
    };

    const generator = generators[language];
    if (!generator) {
      return {
        success: false,
        code: null,
        error: `Unsupported language: ${language}`,
        language,
      };
    }

    // Generate the code
    const generatedCode = generator(
      parseResult.data.inputs,
      parseResult.data.returnType
    );

    if (!parseResult.metadata) {
      return {
        success: true,
        code: generatedCode,
        error: null,
        language,
      };
    }

    return {
      success: true,
      code: generatedCode,
      error: null,
      language,
      metadata: {
        ...parseResult.metadata,
        generatedAt: Date.now(),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      code: null,
      error: `Error generating code: ${error?.message}`,
      language,
    };
  }
}

function generatePython(
  inputs: SdslInput[],
  returnType: string,
  returnArrayType: ArrayType | null
) {
  const typeHints = inputs
    .map((input) => {
      if (input.type === "array") {
        const dimensions = input.dimensions || 1;
        const baseType = typeMap[input.elementType.trim()].python;
        return `${input.name}: ${`List[`.repeat(
          dimensions
        )}${baseType}${"]".repeat(dimensions)}`;
      } else if (input.type === "map") {
        return `${input.name}: Dict[${
          typeMap[input.elementType.trim()].python
        }, Any]`;
      } else if (input.type === "set") {
        return `${input.name}: Set[${
          typeMap[input.elementType.trim()].python
        }]`;
      }
      return `${input.name}: ${typeMap[input.type].python}`;
    })
    .join(", ");

  const returnTypeStr = returnArrayType
    ? `${`List[`.repeat(returnArrayType.dimensions)}${
        typeMap[returnArrayType.baseType].python
      }${"]".repeat(returnArrayType.dimensions)}`
    : typeMap[returnType].python;

  return `
  from typing import List, Dict, Set, Any
  
  def execute(${typeHints}) -> ${returnTypeStr}:
      # Your code here
      ${returnArrayType ? "return []" : "pass"}
  
  def main(input_data: List[str]) -> ${returnTypeStr}:
      # ... rest of the Python generator code ...
  `.trim();
}

function generateJavaScript(inputs: SdslInput[], returnType: string) {
  // Clean variable names by removing comments and trimming whitespace
  const cleanInputs = inputs.map((input) => ({
    ...input,
    name: input.name.split("//")[0].trim(),
  }));

  const paramList = cleanInputs.map((input) => input.name).join(", ");

  // Helper function to safely get JavaScript type
  function getJsDocType(input: SdslInput): string {
    if (input.type === "array") {
      if (input.elementType.startsWith("array")) {
        return "number[][]"; // Handle nested arrays
      } else if (input.elementType.startsWith("map")) {
        return "Object[]"; // Handle array of maps
      } else if (input.elementType.startsWith("set")) {
        return "Set[]"; // Handle array of sets
      }
      const baseType =
        typeMap[input.elementType.trim()]?.javascript || "unknown";
      return `${baseType}[]`;
    } else if (input.type === "map") {
      return "Object.<string, *>";
    } else if (input.type === "set") {
      return `Set.<${
        typeMap[input.elementType.trim()]?.javascript || "unknown"
      }>`;
    }
    return typeMap[input.type]?.javascript || "unknown";
  }

  // Helper function to get the appropriate conversion function
  function getConverter(type: string): string {
    const converters = {
      integer: "Number",
      float: "Number",
      double: "Number",
      string: "String",
      char: "String",
      boolean: "Boolean",
      long: "BigInt",
    }; // @ts-expect-error - TS doesn't like the type of converters
    return converters[type] || "String";
  }

  // Helper function to get array parser
  function getArrayParser(input: SdslInput, inputIndex: number): string {
    if (input.elementType.startsWith("array")) {
      return `inputData[${inputIndex}].split(';').map(subArr => subArr.split(',').map(Number))`; // Nested arrays
    } else if (input.elementType.startsWith("map")) {
      return `inputData[${inputIndex}].split(';').map(item => {
        const obj = {};
        item.split(',').forEach(pair => {
          const [key, value] = pair.split(':');
          obj[key] = value;
        });
        return obj;
      })`;
    } else if (input.elementType.startsWith("set")) {
      return `inputData[${inputIndex}].split(';').map(item => new Set(item.split(',')))`;
    }

    const parsers = {
      integer: "parseInt",
      float: "parseFloat",
      double: "parseFloat",
      string: "String",
      boolean: "x => x === 'true'",
      char: "String",
      long: "BigInt",
    };
    return `inputData[${inputIndex}].split(',').map(${
      // @ts-expect-error - TS doesn't like the type of parsers
      parsers[input.elementType] || "String"
    })`;
  }

  const typeComments = cleanInputs
    .map((input) => {
      return `* @param {${getJsDocType(input)}} ${input.name}`;
    })
    .join("\n ");

  // Helper function to get default return value
  function getDefaultReturn(type: string): string {
    const defaults = {
      integer: "return 0;",
      float: "return 0.0;",
      double: "return 0.0;",
      string: 'return "";',
      char: 'return "";',
      boolean: "return false;",
      long: "return 0n;",
      array: "return [];",
    }; // @ts-expect-error - TS doesn't like the type of defaults
    return defaults[type] || "return null;";
  }

  const jsReturnType = typeMap[returnType]?.javascript || "unknown";

  return `
/**
 ${typeComments}
 * @returns {${jsReturnType}}
 */

function execute(${paramList}) {
  // Your code here
  ${getDefaultReturn(returnType)}
}

/**
 * @param {string[]} inputData
 * @returns {${jsReturnType}}
 */

function main(inputData) {
  ${cleanInputs
    .map((input, index) => {
      if (input.type === "array") {
        return `const ${input.name} = ${getArrayParser(input, index)};`;
      } else if (input.type === "map") {
        return `const ${input.name} = Object.fromEntries(inputData[${index}].split(',').map(item => item.split(':')));`;
      } else if (input.type === "set") {
        return `const ${input.name} = new Set(inputData[${index}].split(','));`;
      }
      return `const ${input.name} = ${getConverter(
        input.type
      )}(inputData[${index}]);`;
    })
    .join("\n  ")}

  return execute(${paramList});
}`.trim();
}

function generateJava(inputs: SdslInput[], returnType: string) {
  const paramList = inputs
    .map((input) => {
      if (input.type === "array") {
        return `ArrayList<${typeMap[input.elementType.trim()].java}> ${
          input.name
        }`;
      } else if (input.type === "map") {
        return `HashMap<String, ${typeMap[input.elementType.trim()].java}> ${
          input.name
        }`;
      } else if (input.type === "set") {
        return `HashSet<${typeMap[input.elementType.trim()].java}> ${
          input.name
        }`;
      }
      return `${typeMap[input.type].java} ${input.name}`;
    })
    .join(", ");

  return `
  import java.util.*;
  
  public class Solution {
      public static ${typeMap[returnType].java} execute(${paramList}) {
          // Your code here
          return ${
            returnType === "boolean" ? "false" : "0"
          }; // Placeholder return
      }
  
      public static void main(String[] args) {
          Scanner scanner = new Scanner(System.in);
          ${inputs
            .map((input) => {
              if (input.type === "array") {
                return `ArrayList<${typeMap[input.elementType.trim()].java}> ${
                  input.name
                } = new ArrayList<>(Arrays.asList(scanner.nextLine().split(",")).stream().map(${
                  typeMap[input.elementType.trim()].java
                }::parse${
                  input.elementType.trim().charAt(0).toUpperCase() +
                  input.elementType.trim().slice(1)
                }).collect(Collectors.toList()));`;
              } else if (input.type === "map") {
                return `HashMap<String, ${
                  typeMap[input.elementType.trim()].java
                }> ${input.name} = new HashMap<>();
          for (String item : scanner.nextLine().split(",")) {
              String[] parts = item.split(":");
              ${input.name}.put(parts[0], ${
                  typeMap[input.elementType.trim()].java
                }.parse${
                  input.elementType.trim().charAt(0).toUpperCase() +
                  input.elementType.trim().slice(1)
                }(parts[1]));
          }`;
              } else if (input.type === "set") {
                return `HashSet<${typeMap[input.elementType.trim()].java}> ${
                  input.name
                } = new HashSet<>(Arrays.asList(scanner.nextLine().split(",")).stream().map(${
                  typeMap[input.elementType.trim()].java
                }::parse${
                  input.elementType.trim().charAt(0).toUpperCase() +
                  input.elementType.trim().slice(1)
                }).collect(Collectors.toSet()));`;
              }
              return `${typeMap[input.type].java} ${input.name} = scanner.next${
                input.type.charAt(0).toUpperCase() + input.type.slice(1)
              }();`;
            })
            .join("\n        ")}
  
          ${typeMap[returnType].java} result = execute(${inputs
    .map((input) => input.name)
    .join(", ")});
          System.out.println(result);
      }
  }
    `.trim();
}

const generateSdslCode = (sdsl: string, language: string) => {
  const result = generateCode(sdsl, language as SupportedLanguages);
  if (!result.success || !result.code) {
    return { error: result.error || "Error generating code" };
  }

  return { code: result.code };
};

// function: getInputs - returns in the format: { success: boolean, inputs: SdslInput[], error: string }
const getInputs = (sdsl: string) => {
  const result = parseSdsl(sdsl);
  if (!result.success || !result.data) {
    return {
      success: false,
      inputs: [],
      error: result.error || "Error parsing SDSL",
      length: 0,
    };
  }

  return {
    success: true,
    inputs: result.data.inputs,
    length: result.data.inputs.length,
  };
};

export {
  parseSdsl,
  generateCode,
  generatePython,
  generateJavaScript,
  generateJava,
  generateSdslCode,
  getInputs,
};
