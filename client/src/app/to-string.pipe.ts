import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'toString',
})
export class ToStringPipe implements PipeTransform {
  transform(value: any) {
    return `${value}`;
  }
}
