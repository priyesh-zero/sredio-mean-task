const CLIENT_ID_KEY = 'clientId';

export function getClientId(forceCreate: boolean = false): string {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!clientId && forceCreate) {
    clientId = Date.now().toString();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId ?? '';
}

export function clearClientId(): void {
  localStorage.removeItem(CLIENT_ID_KEY);
}
