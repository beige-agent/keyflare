import chalk from "chalk";

export const bold = chalk.bold;
export const dim = chalk.dim;
export const green = chalk.green;
export const red = chalk.red;
export const yellow = chalk.yellow;
export const cyan = chalk.cyan;

export function log(msg: string) {
  console.log(msg);
}

export function success(msg: string) {
  console.log(chalk.green("✓ " + msg));
}

export function warn(msg: string) {
  console.warn(chalk.yellow("⚠ " + msg));
}

export function error(msg: string) {
  console.error(chalk.red("✗ " + msg));
}
