import * as React from 'react';
import { FunctionComponent, useCallback } from 'react';
import { connect } from 'react-redux';
import { Icon, Button } from 'semantic-ui-react';
import * as copy from 'copy-to-clipboard';
import { uid } from '../utils';
import { ExecutionAction, ClearAction } from '../actions';
import { State } from '../reducer';

export type IToolbarProps = {
  onExecution?(): void;
  onClear?(): void;
  hostId: string | null;
};

const Toolbar: FunctionComponent<IToolbarProps> = ({ onExecution, onClear, hostId }) => {
  const onCopy = useCallback(
    () => {
      copy(hostId || '');
    },
    [hostId],
  );
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
      {hostId && <Button icon="copy" content={hostId} primary labelPosition="right" onClick={onCopy} />}
    </Button.Group>
  );
};

export default connect(
  (state: State) => ({
    hostId: state.hostId,
  }),
  {
    onExecution(): ExecutionAction {
      return {
        type: 'EXECUTION',
        id: uid(),
      };
    },
    onClear(): ClearAction {
      return {
        type: 'CLEAR_OUTPUT',
      };
    },
  },
)(Toolbar);
