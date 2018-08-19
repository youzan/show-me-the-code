import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Dropdown, Button, Icon, Popup, DropdownProps, DropdownItemProps } from 'semantic-ui-react';

import { LANGUAGE } from '../../config';

import { State } from '../reducer';
import { FONT_SIZE } from '../constants';
import { ChangeLanguageAction, FontSizeChangeAction } from '../actions';

type ConfigProps = {
  language: string;
  fontSize: number;
  onLanguageChange(e: React.SyntheticEvent<HTMLElement>, data: DropdownProps): void;
  onFontSizeChange(e: React.SyntheticEvent<HTMLElement>, data: DropdownProps): void;
};

type ConfigState = {
  searchQuery: number | '';
};

const options = LANGUAGE.LIST.map(lang => ({
  value: lang,
  text: LANGUAGE.DISPLAY[lang],
}));

class Config extends Component<ConfigProps, ConfigState> {
  state: ConfigState = {
    searchQuery: '',
  };

  fontSizeList = FONT_SIZE.map(value => ({ value, text: value }));

  onSearchChange = (event: React.SyntheticEvent<HTMLElement>, { searchQuery }: DropdownProps) => {
    if (searchQuery === '') {
      this.setState({
        searchQuery,
      });
    }
    const value = Number(searchQuery);
    if (value) {
      this.setState({
        searchQuery: value,
      });
    }
  };

  getFontSizeOptions(): DropdownItemProps[] {
    const { searchQuery } = this.state;
    if (!searchQuery) {
      return this.fontSizeList;
    }
    if (FONT_SIZE.includes(searchQuery)) {
      return this.fontSizeList;
    }
    return [
      {
        text: searchQuery,
        value: searchQuery,
      },
    ];
  }

  render() {
    const { searchQuery } = this.state;
    const { onLanguageChange, language, fontSize, onFontSizeChange } = this.props;

    return (
      <Popup
        trigger={
          <Button className="app-pop" basic inverted>
            <Icon name="options" />
          </Button>
        }
        on="click"
        position="bottom left"
      >
        <Dropdown selection search options={options} onChange={onLanguageChange} value={language} />
        <Dropdown
          selection
          search
          value={fontSize}
          onChange={onFontSizeChange}
          options={this.getFontSizeOptions()}
          searchQuery={'' + searchQuery}
          onSearchChange={this.onSearchChange}
        />
      </Popup>
    );
  }
}

export default connect(
  (state: State) => ({
    language: state.language,
    fontSize: state.fontSize,
  }),
  {
    onLanguageChange(e: React.SyntheticEvent<HTMLElement>, data: DropdownProps): ChangeLanguageAction {
      return {
        type: 'LANGUAGE_CHANGE',
        language: data.value as string,
      };
    },
    onFontSizeChange(e: React.SyntheticEvent<HTMLElement>, data: DropdownProps): FontSizeChangeAction {
      return {
        type: 'FONT_SIZE_CHANGE',
        fontSize: data.value as number,
      };
    },
  },
)(Config);
