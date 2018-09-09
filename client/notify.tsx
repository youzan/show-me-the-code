import * as React from 'react';
import { toast } from 'react-toastify';
import { Button } from 'semantic-ui-react';

export function confirmJoin(userName: string): Promise<void> {
  return new Promise((resolve: () => void, reject) => {
    toast(
      <div>
        <div>{`${userName} wants to join`}</div>
        <Button color="red" onClick={reject}>
          No
        </Button>
        <Button primary onClick={resolve}>
          Ok
        </Button>
      </div>,
      {
        onClose: reject,
      },
    );
  });
}
