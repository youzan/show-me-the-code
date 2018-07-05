import * as React from 'react';
import { StatelessComponent } from 'react';
import { Icon, Button } from 'semantic-ui-react';
import * as uuid from 'uuid/v1';

import { ExecutionAction, ClearAction } from '../actions';
import { connect } from 'react-redux';

export type Props = {
  onExecution?(): void;
  onClear?(): void;
};

export const ExecPanel: StatelessComponent<Props> = ({ onExecution, onClear }) => (
  <Button.Group size="mini" className="exec-panel">
    <Button color="green" onClick={onExecution}>
      <Icon name="play" />
    </Button>
    <Button color="orange">
      <Icon name="save" />
    </Button>
    <Button color="red" onClick={onClear}>
      <Icon name="close" />
    </Button>
  </Button.Group>
);

export default connect(
  () => ({}),
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
)(ExecPanel);
