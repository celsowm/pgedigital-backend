#!/usr/bin/env node

const { spawn, exec } = require("child_process");
const net = require("net");
const readline = require("readline");

const PORT = parseInt(process.env.PORT, 10) || 3001;
const PORT_CHECK_HOSTS = ["0.0.0.0", "::"];
const PORT_LISTEN_SKIP_ERROR_CODES = new Set(["EADDRNOTAVAIL", "EAFNOSUPPORT", "EINVAL", "ENODEV"]);

main().catch(error => {
  console.error("Startup failed:", error);
  process.exit(1);
});

async function main() {
  console.log("Ensuring build is up to date...");
  await runBuild();

  await ensurePortReady(PORT);

  console.log(`Starting server on port ${PORT}...`);
  const { code, signal } = await startServer();

  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exitCode = code ?? 0;
  }
}

function runBuild() {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : "npm";
  const args = isWindows ? ["/C", "npm", "run", "build"] : ["run", "build"];
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      windowsHide: true
    });

    child.on("exit", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

async function ensurePortReady(port) {
  console.log(`Checking port ${port} availability...`);
  const free = await isPortFree(port);
  if (free) {
    console.log(`Port ${port} is free.`);
    return;
  }

  console.warn(`Port ${port} is already in use.`);
  const pid = await findProcessUsingPort(port);
  if (!pid) {
    throw new Error(`Cannot determine PID using port ${port}.`);
  }

  const shouldKill = await askToKillPort(pid, port);
  if (!shouldKill) {
    throw new Error(`Port ${port} remains in use. Free it and retry.`);
  }

  await killProcess(pid);
  await delay(250);
  const freeAfterKill = await isPortFree(port);
  if (!freeAfterKill) {
    throw new Error(`Port ${port} is still in use after killing PID ${pid}.`);
  }

  console.log(`Port ${port} freed.`);
}

function isPortFree(port) {
  return checkHostsSequentially(port, PORT_CHECK_HOSTS);
}

async function checkHostsSequentially(port, hosts) {
  for (const host of hosts) {
    const busy = await checkPortOnHost(port, host);
    if (busy) {
      return false;
    }
  }

  return true;
}

function checkPortOnHost(port, host) {

  return new Promise((resolve, reject) => {
    const server = net.createServer();

    const cleanup = () => {
      server.removeListener("error", onError);
      server.removeListener("listening", onListening);
    };

    const onError = error => {
      cleanup();
      if (error.code === "EADDRINUSE") {
        return resolve(true);
      }

      if (PORT_LISTEN_SKIP_ERROR_CODES.has(error.code)) {
        return resolve(false);
      }

      reject(error);
    };

    const onListening = () => {
      cleanup();
      server.close(() => resolve(false));
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

function findProcessUsingPort(port) {
  const platform = process.platform;
  const command = getPortLookupCommand(port, platform);

  return new Promise(resolve => {
    exec(command, { windowsHide: true }, (error, stdout) => {
      if (error && platform === "win32" && !stdout) {
        return resolve(null);
      }

      if (!stdout) {
        return resolve(null);
      }

      const pid = platform === "win32" ? parseWindowsNetstat(stdout) : parseUnixLsof(stdout);
      resolve(pid);
    });
  });
}

function getPortLookupCommand(port, platform) {
  if (platform === "win32") {
    return `netstat -ano | findstr :${port}`;
  }

  return `lsof -n -iTCP:${port} -sTCP:LISTEN -Fp`;
}

function parseWindowsNetstat(output) {
  const lines = output.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    const pid = Number.parseInt(lastPart, 10);
    if (Number.isInteger(pid)) {
      return pid;
    }
  }

  return null;
}

function parseUnixLsof(output) {
  const match = output.match(/p(\d+)/);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  return null;
}

function askToKillPort(pid, port) {
  if (!process.stdin.isTTY) {
    console.warn(`Cannot prompt to kill PID ${pid} because stdin is not a TTY.`);
    return Promise.resolve(false);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = `Port ${port} is used by PID ${pid}. Kill it? [y/N] `;
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase().startsWith("y"));
    });
  });
}

function killProcess(pid) {
  const platform = process.platform;
  const command = platform === "win32" ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;

  return new Promise((resolve, reject) => {
    exec(command, { windowsHide: true }, error => {
      if (error) {
        return reject(error);
      }

      resolve();
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startServer() {
  return new Promise((resolve, reject) => {
    const nodeExecutable = process.execPath;
    const child = spawn(nodeExecutable, ["dist/index.js"], {
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => resolve({ code, signal }));
  });
}
