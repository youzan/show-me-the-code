export function post<R, T = unknown>(url: string, data?: T): Promise<R> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(json => {
      if (json.error) {
        throw json.error;
      } else {
        return json.response;
      }
    });
}
