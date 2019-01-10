import * as React from 'react';
import { Map } from 'immutable';
import { Icon } from 'semantic-ui-react';
import { Observable } from 'rxjs';

import { useSubscription } from '../utils';
import { IClient } from '../models';

type Props = {
  list$: Observable<Map<string, IClient>>;
  hostName$: Observable<string>;
};

const UserStatus = ({ list$, hostName$ }: Props) => {
  const list = useSubscription(list$, Map());
  const hostName = useSubscription(hostName$, '');

  return (
    <div className="user-status">
      <div className="user-status-item">
        <Icon name="home" color="orange" size="small" />
        {hostName}
      </div>
      {list
        .valueSeq()
        .map(client => (
          <div key={client.id} className="user-status-item">
            <Icon name="circle" size="tiny" />
            {client.name}
          </div>
        ))
        .toArray()}
    </div>
  );
};

export default UserStatus;
