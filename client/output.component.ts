import {Component, ViewEncapsulation} from "@angular/core";

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class OutputComponent {
  value = {
    hello: 1
  }
}
