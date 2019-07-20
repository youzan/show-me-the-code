import { Component, ViewEncapsulation } from '@angular/core';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private readonly editorService: EditorService) {}

  execute() {}
}
