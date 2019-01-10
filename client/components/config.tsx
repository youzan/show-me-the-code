import * as React from 'react';
import { useState, useCallback, useContext, useMemo } from 'react';
import { Dropdown, Button, Icon, Popup, DropdownProps } from 'semantic-ui-react';

import { FONT_SIZE } from '../constants';
import { Context } from '../context';
import { useSubscription } from '../utils';
import { LANGUAGE } from '../../config';

const LANGUAGE_OPTIONS = LANGUAGE.LIST.map(lang => ({
  value: lang,
  text: LANGUAGE.DISPLAY[lang],
}));
const FONT_OPTIONS = FONT_SIZE.map(value => ({ value, text: value }));

function LanguageConfig() {
  const { onLanguageChange, language$ } = useContext(Context);
  const language = useSubscription(language$, 'javascript');
  const changeLanguage = useCallback(
    (_e: React.SyntheticEvent<HTMLElement>, { value }: DropdownProps) => {
      onLanguageChange(value as string);
    },
    [onLanguageChange],
  );
  return (
    <Dropdown
      className="config-select"
      selection
      search
      options={LANGUAGE_OPTIONS}
      onChange={changeLanguage}
      value={language}
    />
  );
}

function FontSizeConfig() {
  const { fontSize$, onFontSizeChange } = useContext(Context);
  const fontSize = useSubscription(fontSize$, 14);
  const [keyword, setKeyword] = useState('');
  const onSearchChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement>, { searchQuery }: DropdownProps) => {
      if (searchQuery === '') {
        setKeyword(searchQuery);
      }
      const value = Number(searchQuery);
      if (value) {
        setKeyword('' + value);
      }
    },
    [setKeyword],
  );
  const changeFontSize = useCallback(
    (_e: React.SyntheticEvent<HTMLElement>, { value }: DropdownProps) => {
      onFontSizeChange(value as number);
    },
    [onFontSizeChange],
  );
  const options = useMemo(
    () => {
      if (!keyword) {
        return FONT_OPTIONS;
      }
      if (FONT_SIZE.includes(+keyword)) {
        return FONT_OPTIONS;
      }
      return [
        {
          text: keyword,
          value: keyword,
        },
      ];
    },
    [keyword],
  );
  return (
    <Dropdown
      className="config-select"
      selection
      search
      value={fontSize}
      onChange={changeFontSize}
      options={options}
      searchQuery={keyword}
      onSearchChange={onSearchChange}
    />
  );
}

export const Config = () => (
  <Popup
    trigger={
      <Button className="app-pop" basic inverted>
        <Icon name="options" />
      </Button>
    }
    on="click"
    position="bottom left"
    className="config"
  >
    <LanguageConfig />
    <FontSizeConfig />
  </Popup>
);

export default Config;
