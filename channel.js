const { BehaviorSubject } = require('rxjs');

module.exports.Channel = class {

  get messages$() {
    return this._messageSubject.asObservable();
  }
  _messageSubject = new BehaviorSubject([]);

  get people$() {
    return this._peopleSubject.asObservable();
  }
  _peopleSubject = new BehaviorSubject([])

  // [new, old]
  get label$() {
    return this._labelSubject.asObservable();
  }
  _labelSubject = new BehaviorSubject(null);

  set active(arg) {
    this._active = arg;
    if (arg == true) {
      this.clearUnreads();
    }
  }

  get active() {
    return this._active;
  }

  _active = false;


  savedMessage = '';
  unreads = 0;

  constructor({ name, id, send }) {
    this.id = id;
    this.name = name;
    this.send = send;
  }

  nextLabel() {
    let lbl = this.name;
    if (this.active != true) {
      let brackets = `(${this.unreads.toString()})`.padStart(8, ' ');
      lbl = `(${this.unreads}) ` + lbl;
    }

    let lastCall = this._labelSubject.value;
    let last = lastCall != null ? lastCall[0] : this.name;

    // [new, old]
    this._labelSubject.next([lbl, last])

  }

  addMessage(message) {
    if (this.active !== true) {
      this.unreads += 1;
    }

    this.nextLabel();
    this._messageSubject.next([... this._messageSubject.value, message])
  }

  addPerson(person) {
    this._peopleSubject.next([... this._peopleSubject.value, person]);
  }

  clearSaved() {
    this.savedMessage = '';
  }

  clearUnreads() {
    this.unreads = 0;
    this.nextLabel();
  }
}
