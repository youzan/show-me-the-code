function getSocketURL() {
  try {
    return `${window.location.origin.replace(/^http(s?):/, 'ws$1:')}/ws`;
  } catch (e) {
    return '';
  }
}

function getExecutors() {
  try {
    return require('./executors.assets');
  } catch (error) {
    return {
      javascript: 'javascript.executor.js',
    };
  }
}

module.exports = {
  SOCKET_URL: getSocketURL(),
  HEARTBEAT_INTERVAL: 30000,
  PUBLIC_PATH: '/static/',
  EXECUTORS: getExecutors(),
  LANGUAGE: {
    LIST: [
      'typescript',
      'javascript',
      'rust',
      'c',
      'cpp',
      'csharp',
      'css',
      'fsharp',
      'go',
      'html',
      'java',
      'json',
      'less',
      'lua',
      'objective-c',
      'php',
      'plaintext',
      'powershell',
      'python',
      'ruby',
      'scss',
      'sql',
      'swift',
      'vb',
    ],
    DISPLAY: {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      rust: 'Rust',
      c: 'C',
      cpp: 'C++',
      csharp: 'C#',
      go: 'Go',
      html: 'HTML',
      java: 'Java',
      less: 'Less',
      lua: 'Lua',
      'objective-c': 'Objective C',
      php: 'PHP',
      plaintext: 'Plain Text',
      powershell: 'PowerShell',
      python: 'Python',
      ruby: 'Ruby',
      scss: 'SCSS',
      sql: 'SQL',
      swift: 'Swift',
      vb: 'Visual Basic',
    },
    COLOR: {
      javascript: 'yellow',
      typescript: 'blue',
      rust: 'brown',
    },
  },
};
