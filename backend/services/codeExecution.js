const axios = require("axios");

const JUDGE0_BASE_URL = process.env.SANDBOX_BASE_URL || "https://ce.judge0.com";
const JUDGE0_API_KEY = process.env.SANDBOX_API_KEY || "";

const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

async function executeCode({ language, sourceCode, stdin }) {
  const languageId = languageMap[language];
  if (!languageId) {
    return {
      stdout: null,
      stderr: null,
      status: "Error",
      error: `Unsupported language: ${language}`,
      time: null,
      memory: null,
    };
  }

  const headers = {};
  if (JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = JUDGE0_API_KEY;
  }

  const response = await axios.post(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: sourceCode || "",
      language_id: languageId,
      stdin: stdin || "",
    },
    { headers }
  );

  const data = response.data;
  return {
    stdout: data.stdout,
    stderr: data.stderr || data.compile_output || null,
    status: data.status?.description || "Unknown",
    time: data.time || null,
    memory: data.memory || null,
    error: null,
  };
}

module.exports = { executeCode, languageMap };
