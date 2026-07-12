import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { catchError, tap } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import moment from 'moment';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
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
export class NotesComponent implements OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly formBuilder = inject(FormBuilder);
  readonly localStorageService = inject(LocalStorageService);
  readonly router = inject(Router);
  readonly serializerService = inject(SerializerService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);

  sourceNotes: Note[];
  notes: Note[];
  selectedNote: Note | null;
  noteForm: FormGroup;

  createNoteSub: Subscription;
  deleteNoteSub: Subscription;
  loadNotesSub: Subscription;
  updateNoteSub: Subscription;

  editMode: boolean = false;
  isDeleteLoading: boolean = false;
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  dateTimeFormat: string;
  searchText: string;

  constructor() {
    this.dateTimeFormat = this.translateService.instant('commons.dateFormats.dateTime');

    this.loadNotes();
  }
  
  ngOnDestroy() {
    this.createNoteSub?.unsubscribe();
    this.deleteNoteSub?.unsubscribe();
    this.loadNotesSub?.unsubscribe();
    this.updateNoteSub?.unsubscribe();
  }

  addNote() {
    let note = new Note();
    note.petRecordId = this.authService.selectedPetRecordValue.id;
    this.selectNote(note, false);
  }

  selectNote(note: Note | null, editMode: boolean) {
    this.selectedNote = note;
    this.editMode = editMode;
    
    if (note) {
      this.initNoteForm();
    }
  }

  duplicateNote(note: Note) {
    let duplicatedNote = note.duplicate();
    this.sourceNotes.push(duplicatedNote);
    this.notes = cloneDeep(this.sourceNotes);

    this.selectNote(duplicatedNote, false);
  }

  saveNote() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.noteForm.valid && this.selectedNote) {
      Object.assign(this.selectedNote, this.noteForm.value);
      
      if (this.editMode) {
        this.updateNote();
      } else {
        this.createNote();
      }
    }
  }

  private createNote() {
    const serializeNote = this.selectedNote?.serializeForSave();
    this.createNoteSub = this.apiService.post(`/pet-record/${ this.authService.selectedPetRecordValue.id }/note`, serializeNote).pipe(
      tap(() => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.loadNotes();
      }),
      catchError((error) => {
        this.isLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.create'));
        console.error('Unable to create note', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  private updateNote() {
    const serializeNote = this.selectedNote?.serializeForSave();
    this.updateNoteSub = this.apiService.put(`/pet-record/${ this.authService.selectedPetRecordValue.id }/note/${ serializeNote?.id }`, serializeNote).pipe(
      tap(() => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.loadNotes();
      }),
      catchError((error) => {
        this.isLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.update'));
        console.error('Unable to update note', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  deleteNote(event: Event, nodeId: string) {
    event.stopImmediatePropagation();

    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed && nodeId) {
        this.deleteNoteSub = this.apiService.delete(`/pet-record/${this.authService.selectedPetRecordValue.id}/note/${nodeId}`).pipe(
          tap(() => {
            this.isSubmitted = false;
            this.isDeleteLoading = false;
            this.selectNote(null, false);
            this.loadNotes();
          }),
          catchError((error) => {
            this.isSubmitted = false;
            this.isDeleteLoading = false;

            this.toastService.showToast('error', this.translateService.instant('commons.toast.error.delete'));
            console.error('Unable to delete note', error);
            return throwError(() => error);
          }),
        ).subscribe();
      }
    });
  }

  search(searchText: string) {
    if (searchText?.trim()) {
      this.notes = this.sourceNotes.filter((note) => note.name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    } else {
      this.notes = cloneDeep(this.sourceNotes);
    }
  }

  private initNoteForm() {
    this.isSubmitted = false;

    this.noteForm = this.formBuilder.group({
      name: [this.selectedNote?.name, [Validators.required]],
      description: [this.selectedNote?.description]
    });
  }  
  
  private loadNotes() {
    this.sourceNotes = [];
    this.notes = [];
    
    this.loadNotesSub = this.apiService.get<ISerializedNote[]>(`/pet-record/${ this.authService.selectedPetRecordValue.id }/notes`).pipe(
      tap(async (serializedNotes: ISerializedNote[]) => {
        serializedNotes.forEach((serializedNote: ISerializedNote) => {
          let note = new Note();
          note.deserilizeFromSave(serializedNote);
          this.sourceNotes.push(note);
          this.notes = cloneDeep(this.sourceNotes);

          if (this.selectedNote && this.selectedNote.id) {
            this.selectNote(this.selectedNote, true);
          }
        });
      }),
      catchError((error) => {
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
        console.error('Unable to load notes', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

}
