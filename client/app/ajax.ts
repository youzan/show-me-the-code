export async function post<R, T = unknown>(url: string, data?: T): Promise<R> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.error) {
    throw json.error;
  } else {
    return json.response;
  }
}
