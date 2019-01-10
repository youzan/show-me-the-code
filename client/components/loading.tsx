import * as React from 'react';
import { useContext } from 'react';
import { TransitionablePortal, Dimmer, Loader } from 'semantic-ui-react';

import { Context } from '../context';
import { useSubscription } from '../utils';

function Loading() {
  const { loading$ } = useContext(Context);
  const loading = useSubscription(loading$, false);
  return (
    <TransitionablePortal open={loading} transition={{ animation: 'fade' }}>
      <Dimmer active style={{ zIndex: 2000 }}>
        <Loader size="massive">Loading</Loader>
      </Dimmer>
    </TransitionablePortal>
  );
}

export default Loading;
