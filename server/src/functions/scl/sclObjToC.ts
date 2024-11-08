import sclToObject from "./sclToObject";

interface SclObject {
  name: string;
  type:
    | "boolean"
    | "integer"
    | "character"
    | "long"
    | "float"
    | "double"
    | "string"
    | "array";
  arrayProps?: {
    type:
      | "boolean"
      | "integer"
      | "character"
      | "long"
      | "float"
      | "double"
      | "string";
    size: number;
  };
}

const dataTypeMap = {
  boolean: "bool",
  character: "char*",
  integer: "int",
  long: "long",
  float: "float",
  double: "double",
  string: "char*",
};

const variableFunctionMap = {
  boolean: "parse_int(ltrim(rtrim(readline()))) != 0",
  character: "*readline()",
  integer: "parse_int(ltrim(rtrim(readline())))",
  long: "parse_long(ltrim(rtrim(readline())))",
  float: "parse_float(ltrim(rtrim(readline())))",
  double: "parse_double(ltrim(rtrim(readline())))",
  string: "readline()",
};

const sclObjToC = (
  scl: string | SclObject[],
  type: "scl" | "sclObj",
  body?: string
) => {
  let parsedScl: SclObject[];
  if (type === "scl" && !Array.isArray(scl))
    parsedScl = sclToObject(scl).sclObject as SclObject[];
  else parsedScl = scl as SclObject[];

  const FINAL_BODY = parseBody(body);
  const FINAL_TAIL = parseTail(parsedScl);

  const aggregateString = [
    DEFAULT_HEAD,
    FINAL_BODY,
    FINAL_TAIL,
    DEFAULT_FUNCTIONS,
  ].join("\n");
  return aggregateString;
};

const parseBody = (body: string | undefined) => {
  if (!body) return "";
  return body.trim();
};

const parseTail = (parsedScl: SclObject[]) => {
  const finalMain: string[] = [];
  finalMain.push("int main() {");

  parsedScl.forEach((variable) => {
    if (variable.type !== "array") {
      const startDataType = dataTypeMap[variable.type];
      const name = variable.name;
      const endValue = variableFunctionMap[variable.type];

      const finalString = `${startDataType} ${name} = ${endValue};`;
      finalMain.push(finalString);
    } else {
      if (!variable.arrayProps?.type) return;
      const arrayLoop = parseArrayLoop(variable);
      finalMain.push(arrayLoop as string);
    }
  });

  finalMain.push(
    `int* result = execute(${parsedScl.map((scl) => scl.name).join(", ")});`
  );

  finalMain.push("return 0;");
  finalMain.push("}");

  return finalMain.join("\n");
};

const parseArrayLoop = (scl: SclObject) => {
  if (!scl.arrayProps) return;

  const tempArr = `char** ${scl.name}_temp = split_string(rtrim(readline()));`;

  const memoryAlloc = `${dataTypeMap[scl.arrayProps?.type]}* ${
    scl.name
  } = malloc(10 * sizeof(${dataTypeMap[scl.arrayProps?.type]}));`;

  let loopItemValue = "";

  switch (scl.arrayProps.type) {
    case "boolean":
      loopItemValue = `parse_int(*(${scl.name}_temp + i)) != 0`;
      break;
    case "character":
      loopItemValue = `**(${scl.name}_temp + i)`;
      break;
    case "integer":
      loopItemValue = `parse_int(*(${scl.name}_temp + i))`;
      break;
    case "long":
      loopItemValue = `parse_long(*(${scl.name}_temp + i))`;
      break;
    case "float":
      loopItemValue = `parse_float(*(${scl.name}_temp + i))`;
      break;
    case "double":
      loopItemValue = `parse_double(*(${scl.name}_temp + i))`;
      break;
    case "string":
      loopItemValue = `*(${scl.name}__temp + i)`;
      break;
  }

  const loopLine = ` for (int i = 0; i < ${scl.arrayProps?.size}; i++) {
    ${dataTypeMap[scl.arrayProps?.type]} ${scl.name}_item = ${loopItemValue};
    *(${scl.name} + i) = ${scl.name}_item;
    }`;

  const finalString = [tempArr, memoryAlloc, loopLine].join("\n");
  return finalString;
};

const DEFAULT_HEAD = `
#include <assert.h>
#include <ctype.h>
#include <limits.h>
#include <math.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* readline();
char* ltrim(char*);
char* rtrim(char*);
char** split_string(char*);

double parse_double(char*);
float parse_float(char*);
int parse_int(char*);
long parse_long(char*);
`;
const DEFAULT_FUNCTIONS = `
char* readline() {
    size_t alloc_length = 1024;
    size_t data_length = 0;

    char* data = malloc(alloc_length);

    while (true) {
        char* cursor = data + data_length;
        char* line = fgets(cursor, alloc_length - data_length, stdin);

        if (!line) {
            break;
        }

        data_length += strlen(cursor);

        if (data_length < alloc_length - 1 || data[data_length - 1] == '\\n') {
            break;
        }

        alloc_length <<= 1;

        data = realloc(data, alloc_length);

        if (!data) {
            data = '\\0';

            break;
        }
    }

    if (data[data_length - 1] == '\\n') {
        data[data_length - 1] = '\\0';

        data = realloc(data, data_length);

        if (!data) {
            data = '\\0';
        }
    } else {
        data = realloc(data, data_length + 1);

        if (!data) {
            data = '\\0';
        } else {
            data[data_length] = '\\0';
        }
    }

    return data;
}

char* ltrim(char* str) {
    if (!str) {
        return '\\0';
    }

    if (!*str) {
        return str;
    }

    while (*str != '\\0' && isspace(*str)) {
        str++;
    }

    return str;
}

char* rtrim(char* str) {
    if (!str) {
        return '\\0';
    }

    if (!*str) {
        return str;
    }

    char* end = str + strlen(str) - 1;

    while (end >= str && isspace(*end)) {
        end--;
    }

    *(end + 1) = '\\0';

    return str;
}

char** split_string(char* str) {
    char** splits = NULL;
    char* token = strtok(str, " ");

    int spaces = 0;

    while (token) {
        splits = realloc(splits, sizeof(char*) * ++spaces);

        if (!splits) {
            return splits;
        }

        splits[spaces - 1] = token;

        token = strtok(NULL, " ");
    }

    return splits;
}

double parse_double(char* str) {
    char* endptr;
    double value = strtod(str, &endptr);

    if (endptr == str || *endptr != '\\0') {
        exit(EXIT_FAILURE);
    }

    return value;
}

float parse_float(char* str) {
    char* endptr;
    float value = strtof(str, &endptr);

    if (endptr == str || *endptr != '\\0') {
        exit(EXIT_FAILURE);
    }

    return value;
}

int parse_int(char* str) {
    char* endptr;
    int value = strtol(str, &endptr, 10);

    if (endptr == str || *endptr != '\\0') {
        exit(EXIT_FAILURE);
    }

    return value;
}

long parse_long(char* str) {
    char* endptr;
    long value = strtol(str, &endptr, 10);

    if (endptr == str || *endptr != '\\0') {
        exit(EXIT_FAILURE);
    }

    return value;
}
`;

export default sclObjToC;
