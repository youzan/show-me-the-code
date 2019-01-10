export type IClient = {
  id: string;
  name: string;
  status: string;
};

export class Client extends Record<IClient>({
  id: '',
  name: '',
  status: '',
}) {}
