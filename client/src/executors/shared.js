function serialize(e) {
  if (e instanceof Error) {
    return e.message;
  }
  if (typeof e === 'symbol') {
    return e.toString();
  }
  try {
    return JSON.stringify(e);
  } catch (error) {
    return '' + e;
  }
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
