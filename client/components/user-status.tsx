import * as React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { IClient } from '../models';
import { State } from '../reducer';

type IUserStatusProps = {
  list: Map<string, IClient>;
  hostName: string;
};

const UserStatus: React.FunctionComponent<IUserStatusProps> = ({ list, hostName }) => {
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

const mapStateToProps = (state: State) => ({
  list: state.clients,
  hostName: state.hostName,
});

export default connect(mapStateToProps)(UserStatus);
