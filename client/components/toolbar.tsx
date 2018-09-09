import * as React from 'react';
import { Component } from 'react';
import { Icon, Button } from 'semantic-ui-react';
import * as uuid from 'uuid/v1';
import * as copy from 'copy-to-clipboard';

import { ExecutionAction, ClearAction } from '../actions';
import { connect } from 'react-redux';
import { State } from 'reducer';

export type Props = {
  onExecution?(): void;
  onClear?(): void;
  hostId: string | null;
};

class Toolbar extends Component<Props> {
  onCopy = (e: React.FormEvent) => {
    e.preventDefault();
    const { hostId } = this.props;
    hostId && copy(hostId);
  };

  render() {
    const { onExecution, onClear, hostId } = this.props;

    return (
      <Button.Group size="mini" className="toolbar">
        <Button color="green" onClick={onExecution}>
          <Icon name="play" />
        </Button>
        <Button color="orange">
          <Icon name="save" />
        </Button>
        <Button color="red" onClick={onClear}>
          <Icon name="close" />
        </Button>
        {hostId && <Button icon="copy" content={hostId} primary labelPosition="right" onClick={this.onCopy} />}
      </Button.Group>
    );
  }
}

export default connect(
  (state: State) => ({
    hostId: state.hostId,
  }),
  {
    onExecution(): ExecutionAction {
      return {
        type: 'EXECUTION',
        id: uuid(),
      };
    },
    onClear(): ClearAction {
      return {
        type: 'CLEAR_OUTPUT',
      };
    },
  },
)(Toolbar);
