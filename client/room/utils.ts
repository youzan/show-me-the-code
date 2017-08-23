/// <reference types="monaco-editor" />

export function adaptSelectionTOISelection(selection: monaco.Selection): monaco.ISelection {
  return {
    selectionStartLineNumber: selection.selectionStartLineNumber,
    selectionStartColumn: selection.selectionStartColumn,
    positionLineNumber: selection.positionLineNumber,
    positionColumn: selection.positionColumn
  }
}
