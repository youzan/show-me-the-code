import * as React from 'react';
import { Component } from 'react';
import { Modal, Grid, Segment, Divider, Form, List, Label } from 'semantic-ui-react';

const StoredList = () => (
  <List divided selection>
    <List.Item>
      <Label color="yellow" horizontal>
        Fruit
      </Label>
      Kumquats
    </List.Item>
    <List.Item>
      <Label color="purple" horizontal>
        Candy
      </Label>
      Ice Cream
    </List.Item>
    <List.Item>
      <Label color="red" horizontal>
        Fruit
      </Label>
      Orange
    </List.Item>
    <List.Item>
      <Label horizontal>Dog</Label>
      Poodle
    </List.Item>
  </List>
);

export class IndexModal extends Component {
  render() {
    return (
      <Modal className="index-modal" size="large" open>
        <Modal.Content>
          <Form>
            <Form.Input label="Who are you ?" />
            <Form.Input label="Join ?" />
            <Form.Group>
              <Form.Button>Create</Form.Button>
              <Form.Button primary>Join</Form.Button>
            </Form.Group>
          </Form>
          <Divider vertical />
          <StoredList />
        </Modal.Content>
      </Modal>
    );
  }
}

export default IndexModal;
