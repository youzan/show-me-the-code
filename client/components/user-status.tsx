import * as React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Icon } from 'semantic-ui-react';

import { Client, State } from 'reducer';

type Props = {
  list: Map<string, Client>;
  hostName: string;
};

const UserStatus = ({ list, hostName }: Props) => (
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

const mapStateToProps = (state: State) => ({
  list: state.clients,
  hostName: state.hostName,
});

export default connect(mapStateToProps)(UserStatus);
