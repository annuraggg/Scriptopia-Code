import { exec } from "child_process";
import chalk from "chalk";
import ora from "ora";

// test comment for empty commit...

const spinner = ora({
  text: "Checking for type errors...",
  color: "cyan",
  spinner: "monkey",
}).start();

exec("npx tsc --noEmit", (error, stdout, stderr) => {
  spinner.stop();

  if (error) {
    console.error(chalk.red.bold("Error occurred during type checking:"));
    console.error(chalk.red(stderr));

    if (stdout) {
      console.log(chalk.yellow("TypeScript output:"));
      process.stdout.write(stdout);
    }

    console.error(chalk.red.bold("TypeScript type checking failed."));
    process.exit(1);
  } else {
    console.log(chalk.green.bold("✔ No type errors found!"));
    process.exit(0);
  }
});
