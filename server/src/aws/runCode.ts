import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { TestCase } from "@shared-types/Problem";
import { SclObject } from "@shared-types/Scl";
const REGION = "ap-south-1";

const runCode = async (
  language: string,
  sclObject: SclObject[],
  code: string,
  testCases: TestCase[]
) => {
  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_LAMBDA_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_LAMBDA_SECRET_ACCESS_KEY!,
    },
  });

  const data = {
    testCases,
    sclObject,
    code,
  };

  const params = {
    FunctionName: `${language}-driver`,
    Payload: JSON.stringify(data),
  };

  try {
    const data = await lambdaClient.send(new InvokeCommand(params));
    if (data.FunctionError) {
      return { status: "ERROR", error: data.FunctionError };
    }
    if (data.Payload) {
      const d = JSON.parse(new TextDecoder().decode(data.Payload));
      return d;
    }

    return { status: "ERROR" };
  } catch (err) {
    return { status: "ERROR" };
  }
};

export { runCode };
