import * as React from 'react';
import { memo } from 'react';
import { view } from 'react-easy-state';
import JSONTree from 'react-json-tree';
import cx from 'classnames';

type ItemProps = {
  data: unknown;
};

type LineProps = {
  data: unknown[];
};

type BlockProps = {
  data: unknown[][];
};

type OutputProps = {
  data: Map<string, unknown[][]>;
}

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

const OutputItem = memo<ItemProps>(({ data }) => {
  function labelRenderer([name, _parent]: [string, string]): JSX.Element {
    if (name === 'root' && typeof data === 'object') {
      if (data !== null) {
        return <span>{data.constructor.name || 'Object'}</span>;
      }
      return <span>null</span>;
    }
    return <span>{`${name}:`}</span>;
  }

  switch (typeof data) {
    case 'boolean':
    case 'number':
    case 'string':
      return <div className={cx('output-item', 'string')}>{'' + data}</div>;
    case 'undefined':
      return <div className={cx('output-item', 'undefined')}>undefined</div>;
    case 'object':
      if (data === null) {
        return <div className={cx('output-item', 'null')}>null</div>;
      } else if (data instanceof Error) {
        return <div className={cx('output-item', 'error')}>{data.message}</div>;
      }
      return <JSONTree data={data} theme={THEME} invertTheme={false} labelRenderer={labelRenderer} />;
    case 'symbol':
      return <div className={cx('output-item', 'symbol')}>{data.toString()}</div>;
    default:
      return <div>{'' + data}</div>;
  }
});

const OutputLine = view<React.FunctionComponent<LineProps>>(({ data }) => (
  <div className="output-line">
    {data.map((data, index) => (
      <OutputItem key={index} data={data} />
    ))}
  </div>
));
OutputLine.displayName = 'OutputLine';

const OutputBlock = view<React.FunctionComponent<BlockProps>>(({ data }) => (
  <div className="output-block">
    {data.map((data, index) => (
      <OutputLine key={index} data={data} />
    ))}
  </div>
));
OutputBlock.displayName = 'OutputBlock';

const Output = view<React.FunctionComponent<OutputProps>>(({ data }) => (
  <div className="output">
    {(data as any).reduce(
      (array: React.ReactNode[], block: unknown[][], key: string) => {
        array.push(<OutputBlock key={key} data={block} />);
        return array;
      },
      [] as React.ReactNode[],
    )}
  </div>
));
Output.displayName = 'Output';

export default Output;
