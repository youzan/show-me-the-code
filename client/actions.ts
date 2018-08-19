export type ChangeLanguageAction = {
  type: 'LANGUAGE_CHANGE';
  language: string;
};

export type LanguageDidChangeAction = {
  type: 'LANGUAGE_DID_CHANGE';
  language: string;
};

export type FontSizeChangeAction = {
  type: 'FONT_SIZE_CHANGE';
  fontSize: number;
};

export type ExecutionAction = {
  type: 'EXECUTION';
  id: string;
};

export type ExecutionOutputAction = {
  type: 'EXECUTUON_OUTPUT';
  id: string;
  data: any[];
};

export type SaveAxtion = {
  type: 'SAVE';
};

export type SaveSuccessAction = {
  type: 'SAVE_SUCCESS';
};

export type ClearAction = {
  type: 'CLEAR_OUTPUT';
};

export type ConnectedAction = {
  type: 'CONNECTED';
  id: string;
};

export type StopExecutionAction = {
  type: 'STOP_EXECUTION';
};

export type CreateAction = {
  type: 'CREATE';
};
