import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

import { ISerializedNote, Note } from 'src/app/core/models/note/note.model';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
  standalone: false
})
export class NotesComponent {

  APP_STORAGE_KEY: string = 'weight-pacha-notes';

  sourceNotes: Note[];
  notes: Note[];
  selectedNote: Note | null;
  noteForm: FormGroup;

  submitted: boolean = false;

  dateTimeFormat: string;
  searchText: string;

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private serializerService: SerializerService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
    this.dateTimeFormat = this.translateService.instant('commons.dateFormats.dateTime');

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

  saveNote() {
    this.submitted = true;
    if (this.noteForm.valid && this.selectedNote) {
      Object.assign(this.selectedNote, this.noteForm.value);
      this.selectedNote.updatedAt = moment();
      
      const index = this.notes.findIndex(note => note.id === this.selectedNote?.id);
      if (index !== -1) {
        this.notes[index] = this.selectedNote;
      }

      this.submitted = false;

      this.saveNotes();
    }
  }

  deleteNote(event: Event, id: string) {
    event.stopImmediatePropagation();

    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        if (this.selectedNote?.id == id) {
          this.selectNote(null);
        }

        this.notes = this.notes.filter((note) => note.id != id);
        this.saveNotes();
      }
    });
  }

  search(searchText: string) {
    if (searchText?.trim()) {
      this.notes = this.sourceNotes.filter((note) => note.title?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    } else {
      this.notes = cloneDeep(this.sourceNotes);
    }
  }

  private initNoteForm() {
    this.submitted = false;

    this.noteForm = this.formBuilder.group({
      title: [this.selectedNote?.title, [Validators.required]],
      description: [this.selectedNote?.description]
    });
  }  
  
  private loadNotes() {
    this.sourceNotes = [];
    this.notes = [];
    
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let notes: Note[] = [];
      const notesJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      notesJSON.notes.forEach((noteJSON: ISerializedNote) => {
        let note = new Note();
        note.deserilizeFromSave(noteJSON);
        notes.push(note);
      });

      this.sourceNotes = notes;
      this.notes = cloneDeep(this.sourceNotes);
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { notes: this.sourceNotes });
    }
  }
  
  private saveNotes() {
    const serializedNotes = this.serializerService.serializeList(this.notes);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { notes: serializedNotes });
  }

}
