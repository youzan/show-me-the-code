function getSocketURL() {
  try {
    return `${window.location.origin.replace(/^http(s?):/, 'ws$1:')}/ws`;
  } catch (e) {
    return '';
  }
}

module.exports = {
  SOCKET_URL: getSocketURL(),
  HEARTBEAT_INTERVAL: 30000,
  PUBLIC_PATH: '/',
  EXECUTORS: {
    javascript: 'javascript.executor.js'
  }
};
