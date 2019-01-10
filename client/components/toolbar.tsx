import * as React from 'react';
import { FunctionComponent, useContext, useCallback } from 'react';
import { Icon, Button } from 'semantic-ui-react';
import * as copy from 'copy-to-clipboard';
import { Context } from '../context';
import { useSubscription } from '../utils';

export type Props = {
  onExecution?(): void;
  onClear?(): void;
};

function HostId() {
  const { hostId$ } = useContext(Context);
  const hostId = useSubscription(hostId$, null);
  const onCopy = useCallback(
    () => {
      copy(hostId || '');
    },
    [hostId],
  );
  if (!hostId) {
    return null;
  }
  return <Button icon="copy" content={hostId} primary labelPosition="right" onClick={onCopy} />;
}

const Toolbar: FunctionComponent<Props> = ({ onExecution, onClear }) => (
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
    <HostId />
  </Button.Group>
);

export default Toolbar;
