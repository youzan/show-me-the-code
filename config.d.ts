// import { SemanticCOLORS } from 'semantic-ui-react';

type Config = {
  SOCKET_URL: string;
  HEARTBEAT_INTERVAL: number;
  PUBLIC_PATH: string;
  EXECUTORS: {
    [key: string]: string;
  };
  LANGUAGE: {
    LIST: string[];
    DISPLAY: {
      [key: string]: string;
    };
    COLOR: {
      [key: string]: string;
    };
  };
};

declare const config: Config;

export = config;
