import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

import { ISerializedNote, Note } from 'src/app/core/models/note/note.model';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
  standalone: false
})
export class NotesComponent {

  APP_STORAGE_KEY: string;

  sourceNotes: Note[];
  notes: Note[];
  selectedNote: Note | null;
  noteForm: FormGroup;

  searchText: string;

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private translateService: TranslateService
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-notes';

    this.loadNotes();
  }

  addNote() {
    let note = new Note();
    this.sourceNotes.push(note);
    this.notes = cloneDeep(this.sourceNotes);
    
    this.selectNote(note);
  }

  selectNote(note: Note | null) {
    this.selectedNote = note;
    
    if (note) {
      this.initNoteForm();
    }
  }

  duplicateNote(note: Note) {
    let duplicatedNote = note.duplicate();
    this.sourceNotes.push(duplicatedNote);
    this.notes = cloneDeep(this.sourceNotes);

    this.selectNote(duplicatedNote);
  }

  saveChanges() {
    if (this.noteForm.valid && this.selectedNote) {
      Object.assign(this.selectedNote, this.noteForm.value);
      this.selectedNote.updatedAt = moment();
      this.saveNotes();
    }
  }

  deleteNote(event: Event, id: string) {
    event.stopImmediatePropagation();

    if (this.selectedNote?.id == id) {
      this.selectNote(null);
    }

    this.notes = this.notes.filter((note) => note.id != id);
    this.saveNotes();
  }

  search(searchText: string) {
    if (searchText?.trim()) {
      this.notes = this.sourceNotes.filter((note) => note.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    } else {
      this.notes = cloneDeep(this.sourceNotes);
    }
  }

  private initNoteForm() {
    this.noteForm = this.formBuilder.group({
      title: [this.selectedNote?.title, [Validators.required]],
      description: [this.selectedNote?.description]
    });
  }  
  
  private loadNotes() {
    this.sourceNotes = [];
    this.notes = [];
    
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let notesJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      notesJSON.notes.forEach((noteJSON: ISerializedNote) => {
        let note = new Note();
        note.deserilizeFromSave(noteJSON);
        this.sourceNotes.push(note);
      });

      this.notes = cloneDeep(this.sourceNotes);
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { notes: this.sourceNotes });
    }
  }
  
  private saveNotes() {
    let serializedNotes: ISerializedNote[] = [];
    this.notes.forEach(note => {
      serializedNotes.push(note.serializeForSave());
    });

    this.localStorageService.setItem(this.APP_STORAGE_KEY, { notes: this.notes });
  }

}
