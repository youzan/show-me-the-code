import * as React from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';

import Config from './config';
import ExecPanel from './exec';

const Header = () => (
  <>
    <Segment inverted className="app-header app-header-left">
      <Config />
    </Segment>
    <Segment inverted className="app-header app-header-right">
      <ExecPanel />
    </Segment>
  </>
);

export default Header;
