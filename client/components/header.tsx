import * as React from 'react';
import { Segment } from 'semantic-ui-react';

import Config from './config';
import Toolbar from './toolbar';

const Header = () => (
  <>
    <Segment inverted className="app-header app-header-left">
      <Config />
    </Segment>
    <Segment inverted className="app-header app-header-right">
      <Toolbar />
    </Segment>
  </>
);

export default Header;
