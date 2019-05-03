import { Component } from '@angular/core';
import { EditorService } from './editor.service';
import { ExecutionService } from './execution.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private readonly editorService: EditorService, private readonly executionService: ExecutionService) {}

  execute() {
    this.executionService.execute(this.editorService.language, this.editorService.getContent());
  }
}
