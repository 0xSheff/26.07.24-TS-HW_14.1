import { v4 as uuid } from 'uuid';

enum NoteStatuses {
  inProgress = 10,
  completed = 20
}

interface INote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: NoteStatuses;
  requiresConfirmation: boolean;
}

class TodoList {
  protected notes: INote[] = [];

  public get allNotes(): INote[] {
    return this.notes;
  }

  public get allNotesCount(): number {
    return this.notes.length;
  }

  public get inProgressNotesCount(): number {
    return this.notes.filter(note => note.status === NoteStatuses.inProgress).length;
  }

  public createNote(note: Partial<INote>): INote {
    this.validateNote(note);

    const newNote: INote = {
      id: uuid(),
      title: note.title!,
      content: note.content!,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: NoteStatuses.inProgress,
      requiresConfirmation: note.requiresConfirmation ?? false,
    };

    this.notes.push(newNote);
    return newNote;
  }

  public readNote(id: string): INote {
    return this.getNote(id);
  }

  // Update title, content, or status
  public updateNote(id: string, updatedNote: Partial<INote>): INote {
    const note = this.getNote(id);

    // Simplest logic for confirmation
    const confirmed = note.requiresConfirmation ? confirm('Are you sure about these changes?') : true;
    if (!confirmed) {
      // If not confirmed, return unchanged note
      return note;
    }

    Object.assign(note, {
      title: (updatedNote.title !== undefined && updatedNote.title.trim() !== "") ? updatedNote.title : note.title,
      content: (updatedNote.content !== undefined && updatedNote.content.trim() !== "") ? updatedNote.content : note.content,
      status: updatedNote.status ?? note.status,
      updatedAt: new Date()
    });

    return note;
  }

  public deleteNote(id: string): boolean {
    const index = this.notes.findIndex(note => note.id === id)

    if (index !== -1) {
      this.notes.splice(index, 1);

      return true;
    }

    return false;
  }

  protected getNote(id: string): INote {
    const note = this.notes.find(note => note.id === id);

    if (!note) {
      throw new Error('Note not found.')
    }

    return note;
  }

  protected validateNote(note: Partial<INote>): boolean {
    if (!note.title || note.title.trim() === '') {
      throw new Error('Title is required and cannot be empty.');
    }

    if (!note.content || note.content.trim() === '') {
      throw new Error('Content is required and cannot be empty.');
    }

    return true;
  }
}

class SearchableTodoList extends TodoList {
  public searchNotes(searchParams: { title?: string; content?: string }): INote[] {
    const { title, content } = searchParams;

    return this.notes.filter(note => {
      const matchesTitle = title ? note.title.toLowerCase().includes(title.toLowerCase()) : true;
      const matchesContent = content ? note.content.toLowerCase().includes(content.toLowerCase()) : true;

      return matchesTitle || matchesContent;
    });
  }
}

class SortableTodoList extends TodoList {
  public orderNotesBy(fieldName: string) {
    switch (fieldName) {
      case 'status':
        this.notes.sort((note1, note2) => note1.status - note2.status);
        break;
      case 'createdAt':
        this.notes.sort((note1, note2) => note1.createdAt.getTime() - note2.createdAt.getTime());
        break;
      default:
        throw new Error('Unknown field name to sort.');
    }

    return this.notes;
  }
}