const { BehaviorSubject } = require('rxjs');
const { debounceTime } = require('rxjs/operators');
const { list, text } = require('blessed');

exports.ChannelListComponent = class {

  get events$() {
    return this._eventSubject.asObservable();
  }
  _eventSubject = new BehaviorSubject({ event: 'init', data: null });

  _channels = [];

  _subs = [];

  // the current active channel
  _active = null;

  component = list({
    top: 'top',
    left: '0',
    height: '100%',
    width: '30%',
    border: { type: 'line' },
    focusable: true,
    clickable: true,
    keys: true,
    vi: false,
    items: [ ],
    style: {
      item: {
        hover: {
          bg: 'red'
        }
      },
      selected: {
        bg: 'grey',
        bold: true
      }
    }
  });

  constructor(channels$) {
    this.component.on('action', this.unfocus.bind(this));

    this.component.on('select item', this.onSelectChannel.bind(this));

    this.component.key('escape', this.unfocus.bind(this));
    this.component.key('k', _ => this.component.up());
    this.component.key('j', _ => this.component.down());
    this.component.key('i', _ => this.unfocus());

    channels$.subscribe(this.onChannelsUpdated.bind(this));
  }

  onChannelsUpdated(channels) {
    if (channels == null) {
      return;
    }

    for (let sub of this._subs) {
      if (sub == null) continue;
      sub.unsubscribe();
    }

    this._channels = channels;

    this.component.clearItems();
    for (let chn of channels) {
      this.component.pushItem(chn.name);
      this._subs.push(chn.label$.subscribe(this.updateLabel.bind(this)));
    }

    this.redraw();
  }

  updateLabel(labels) {
    if (labels == null) return;
    let [newLabel, oldLabel] = labels;

    this.component.setItem(oldLabel, newLabel);
    this.redraw();
  }

  onSelectChannel(err, index) {
    if (this._active) {
      this._active.active = false;
    }

    let data = this._channels[index];
    data.active = true;
    this.active = data;
    this._eventSubject.next({ event: 'change-channel', data })
  }

  focus() {
    this.component.focus();
  }

  unfocus() {
    this._eventSubject.next({ event: 'unfocus', data: null });
  }

  redraw() {
    this._eventSubject.next({ event: 'redraw', data: null });
  }
}
