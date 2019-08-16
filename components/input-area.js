const { textbox } = require('blessed');
const { BehaviorSubject } = require('rxjs');

exports.InputAreaComponent = class {

  get value() {
    return this.component.value;
  }

  set value(msg) {
    this.component.value = msg;
  }


  get events$() {
    return this._eventSubject.asObservable();
  }
  _eventSubject = new BehaviorSubject('init');

  component = textbox({
    right: 0,
    bottom: 0,
    height: 4,
    width: '70%',
    border: { type: 'line' },
    focusable: true,
    inputOnFocus: true,
    vi: false,
    keys: true,
    alwaysScroll: true,
  });

  /** @type {Subscription[]} */
  subs = [];

  constructor(channel$) {
    this.channel = null;
    this.component.on('submit', this.onMessageSubmit.bind(this));
    this.component.key('escape', _ => this._eventSubject.next('unfocus'));

    channel$.subscribe(this.onChannelChanged.bind(this));
  }

  onChannelChanged(channel) {
    if (channel == null) {
      return;
    }

    if (this.channel) {
      this.channel.savedMessage = this.value;
    }

    this.channel = channel;
    this.component.clearValue();
    this.value = channel.savedMessage || '';
  }

  onMessageSubmit(msg) {
    if (this.channel == null) {
      return;
    }

    this.channel.send(msg);
    this.component.clearValue();
    this._eventSubject.next('send');
  }

  focus() {
    this.component.focus();
  }
}
