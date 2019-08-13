import { Pipe, PipeTransform} from '@angular/core';

import { IUser } from '../models';

@Pipe({
  name: 'userClass'
})
export class UserClassNamePipe implements PipeTransform {
  transform(value: IUser): string {
    return `user-${value.slot}`;
  }
}

@Pipe({
  name: 'userLi'
})
export class UserListItemPipe implements PipeTransform {
  transform(value: IUser): string {
    return `user-${value.slot}-li`;
  }
}
