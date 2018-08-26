import * as React from 'react';
import { PureComponent, StatelessComponent } from 'react';
import { OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import JSONTree from 'react-json-tree';
import cx from 'classnames';

import { State } from '../reducer';

type ItemProps = {
  data: any;
};

type LineProps = {
  data: any[];
};

type BlockProps = {
  data: any[][];
};

type OutputProps = {
  data: OrderedMap<string, any[][]>;
};

const THEME = {
  scheme: 'monokai',
  author: '',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

const OutputItem: StatelessComponent<ItemProps> = ({ data }) => {
  function labelRenderer([name, _parent]: [string, string]): JSX.Element {
    if (name === 'root') {
      return <span>{data.constructor.name || 'Object'}</span>;
    }
    return <span>{`${name}:`}</span>;
  }

  const type = typeof data;
  switch (type) {
    case 'boolean':
    case 'number':
    case 'string':
      return <div className={cx('output-item', type)}>{'' + data}</div>;
    case 'undefined':
      return <div className={cx('output-item', type)}>undefined</div>;
    case 'object':
      if (data === null) {
        return <div className={cx('output-item', 'null')}>null</div>;
      } else if (data instanceof Error) {
        return <div className={cx('output-item', 'error')}>{data.message}</div>;
      }
      return <JSONTree data={data} theme={THEME} invertTheme={false} labelRenderer={labelRenderer} />;
    case 'symbol':
      return <div className={cx('output-item', type)}>{data.toString()}</div>;
    default:
      return <div>{'' + data}</div>;
  }
};

class OutputLine extends PureComponent<LineProps> {
  render() {
    const { data } = this.props;

    return (
      <div className="output-line">
        {data.map((data, index) => (
          <OutputItem key={index} data={data} />
        ))}
      </div>
    );
  }
}

class OutputBlock extends PureComponent<BlockProps> {
  render() {
    const { data } = this.props;

    return (
      <div className="output-block">
        {data.map((data, index) => (
          <OutputLine key={index} data={data} />
        ))}
      </div>
    );
  }
}

const Output: StatelessComponent<OutputProps> = ({ data }) => (
  <div className="output">
    {(data as any).reduce(
      (array: React.ReactNode[], block: any[][], key: string) => {
        array.push(<OutputBlock key={key} data={block} />);
        return array;
      },
      [] as React.ReactNode[],
    )}
  </div>
);

export default connect((state: State) => ({
  data: state.output,
}))(Output);
