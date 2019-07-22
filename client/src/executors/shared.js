function serialize(e) {
  if (e instanceof Error) {
    return {
      type: 'error',
      message: e.message,
    };
  }
  if (typeof e === 'symbol') {
    return {
      type: 'symbol',
      text: e.toString(),
    };
  }
  if (e === null) {
    return {
      type: 'raw',
      value: e,
    };
  }
  if (typeof e === 'object') {
    try {
      return {
        type: 'json',
        value: JSON.stringify(e),
      };
    } catch (_) {
      return {
        type: 'text',
        value: `${e}`,
      };
    }
  }
  if (typeof e === 'function') {
    return {
      type: 'function',
      value: e.toString(),
    };
  }
  return {
    type: 'raw',
    value: e,
  };
}

export function stdout(...data) {
  postMessage({
    type: 'stdout',
    data: data.map(serialize),
  });
}

export function stderr(...data) {
  postMessage({
    type: 'stderr',
    data: data.map(serialize),
  });
}
