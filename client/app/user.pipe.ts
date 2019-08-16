import { Pipe, PipeTransform} from '@angular/core';

import { IUser } from './connection.service';

@Pipe({
  name: 'userClass'
})
export class UserClassNamePipe implements PipeTransform {
  transform(value: IUser): string {
    return `user-${value.color}`;
  }
}

@Pipe({
  name: 'userLi'
})
export class UserListItemPipe implements PipeTransform {
  transform(value: IUser): string {
    return `user-${value.color}-li`;
  }
}
