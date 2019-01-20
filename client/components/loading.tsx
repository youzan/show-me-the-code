import * as React from 'react';
import { connect } from 'react-redux';
import { TransitionablePortal, Dimmer, Loader } from 'semantic-ui-react';

import { State } from '../reducer';
import { noop } from '../utils';

export interface ILoadingProps {
  open?: boolean;
}

const Loading: React.FunctionComponent<ILoadingProps> = ({ open }) => (
  <TransitionablePortal open={open} transition={{ animation: 'fade' }} onClose={noop}>
    <Dimmer active style={{ zIndex: 2000 }}>
      <Loader size="massive">Loading</Loader>
    </Dimmer>
  </TransitionablePortal>
);

const mapStateToProps = (state: State) => ({
  open: !state.clientId,
});

export default connect(mapStateToProps)(Loading);
