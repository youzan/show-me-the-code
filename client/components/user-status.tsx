import * as React from 'react';
import { useContext } from 'react';
import { Icon } from 'semantic-ui-react';
import { Observable } from 'rxjs';

import { useSubscription } from '../utils';
import { IClient } from '../models';
import { view } from 'react-easy-state';
import { Context } from '../context';

type Props = {
  hostName$: Observable<string>;
};

function* renderClients(list: Iterable<IClient>) {
  for (const client of list) {
    yield (
      <div key={client.id} className="user-status-item">
        <Icon name="circle" size="tiny" />
        {client.name}
      </div>
    );
  }
}

const ClientList = view(() => {
  const { clients } = useContext(Context);
  return <>{renderClients(clients.list.values())}</>;
});

const UserStatus = ({ hostName$ }: Props) => {
  const hostName = useSubscription(hostName$, '');

  return (
    <div className="user-status">
      <div className="user-status-item">
        <Icon name="home" color="orange" size="small" />
        {hostName}
      </div>
      <ClientList />
    </div>
  );
};

export default UserStatus;
