import * as React from 'react';
import { TransitionablePortal, Dimmer, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { State } from 'reducer';

type Props = {
  open: boolean;
};

const Loading: React.StatelessComponent<Props> = ({ open }) => (
  <TransitionablePortal open={open} transition={{ animation: 'fade' }}>
    <Dimmer active style={{ zIndex: 2000 }}>
      <Loader size="massive">Loading</Loader>
    </Dimmer>
  </TransitionablePortal>
);

export default connect((state: State) => ({
  open: !state.clientId,
}))(Loading);
